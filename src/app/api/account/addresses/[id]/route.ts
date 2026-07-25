import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { requireUser } from "../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  label: z.string().max(40).optional(),
  line1: z.string().min(1).max(120).optional(),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(80).optional(),
  zip: z.string().max(20).optional(),
  country: z.string().max(2).optional(),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean().optional(),
});

async function owned(userId: string, id: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  return address && address.userId === userId ? address : null;
}

/** PATCH /api/account/addresses/[id] — edit an address or make it the default. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const existing = await owned(user.id, id);
  if (!existing) return bad("Address not found", 404);

  const data = await readBody(req, patchSchema);

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id }, data });
  });
  return json({ address });
});

/** DELETE /api/account/addresses/[id] */
export const DELETE = route(async (_req: Request, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const existing = await owned(user.id, id);
  if (!existing) return bad("Address not found", 404);

  await prisma.address.delete({ where: { id } });

  // If we removed the default, promote another address so one is always default.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { id: "asc" },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return json({ ok: true });
});
