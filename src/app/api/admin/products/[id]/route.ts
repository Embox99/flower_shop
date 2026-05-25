import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { requireStaff } from "../../../../../lib/auth-helpers";

/** GET /api/admin/products/[id] — full product with variants + images + stems. */
export const GET = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      stems:    { orderBy: { id: "asc" } },
    },
  });
  if (!product) return bad("Product not found", 404);
  return json({ product });
});

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  sku:  z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  shortDesc: z.string().nullable().optional(),
  longDesc:  z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.number().int().min(0).optional(),
  comparePrice: z.number().int().min(0).nullable().optional(),
  cost: z.number().int().min(0).nullable().optional(),
  palette: z.array(z.string()).optional(),
  height: z.string().nullable().optional(),
  vase:   z.string().nullable().optional(),
  status: z.enum(["ACTIVE","DRAFT","ARCHIVED"]).optional(),
  leadTime: z.enum(["SAME_DAY","NEXT_DAY","TWO_DAYS","CUSTOM"]).optional(),
  subPolicy: z.enum(["SAME_PALETTE","CALL_FIRST","NO_SUBSTITUTE"]).optional(),
});

/** PATCH /api/admin/products/[id] — partial update. */
export const PATCH = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await params;
  const data = await readBody(req, updateSchema);
  const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) return bad("Product not found", 404);

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: { ...data, palette: data.palette as any },
  });
  return json({ product });
});

/** DELETE /api/admin/products/[id] — soft-archive by default; ?hard=1 to fully delete. */
export const DELETE = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await params;
  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";
  const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) return bad("Product not found", 404);

  if (hard) {
    await prisma.product.delete({ where: { id: existing.id } });
  } else {
    await prisma.product.update({ where: { id: existing.id }, data: { status: "ARCHIVED" } });
  }
  return json({ ok: true });
});
