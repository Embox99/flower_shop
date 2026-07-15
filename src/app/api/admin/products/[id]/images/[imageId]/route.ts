import { z } from "zod";
import { prisma } from "../../../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../../../lib/api";
import { requireStaff } from "../../../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string; imageId: string }> };

const patchSchema = z.object({
  isPrimary: z.literal(true).optional(),
  alt: z.string().max(200).nullable().optional(),
});

/** PATCH /api/admin/products/[id]/images/[imageId] — set as primary and/or update alt text. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  await requireStaff();
  const { id, imageId } = await params;
  const data = await readBody(req, patchSchema);

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) return bad("Image not found", 404);

  await prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } });
    }
    await tx.productImage.update({
      where: { id: imageId },
      data: {
        ...(data.isPrimary ? { isPrimary: true } : {}),
        ...(data.alt !== undefined ? { alt: data.alt } : {}),
      },
    });
  });

  return json({ ok: true });
});

/** DELETE /api/admin/products/[id]/images/[imageId] — remove the image, promote a new primary if needed. */
export const DELETE = route(async (_req: Request, { params }: Params) => {
  await requireStaff();
  const { id, imageId } = await params;

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) return bad("Image not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: "asc" },
      });
      if (next) await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  });

  return json({ ok: true });
});
