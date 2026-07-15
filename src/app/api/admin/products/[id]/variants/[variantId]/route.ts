import { z } from "zod";
import { prisma } from "../../../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../../../lib/api";
import { requireStaff } from "../../../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string; variantId: string }> };

const patchSchema = z.object({
  label:      z.string().min(1).optional(),
  stems:      z.number().int().min(0).nullable().optional(),
  priceDelta: z.number().int().optional(),
  stockQty:   z.number().int().min(0).optional(),
});

/** PATCH /api/admin/products/[id]/variants/[variantId] — restock / reprice a variant. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  await requireStaff();
  const { id, variantId } = await params;
  const data = await readBody(req, patchSchema);

  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId: id } });
  if (!variant) return bad("Variant not found", 404);

  const updated = await prisma.productVariant.update({
    where: { id: variant.id },
    data,
  });
  return json({ variant: updated });
});
