import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { json, route, readBody, readPaging } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";

/** GET /api/admin/products */
export const GET = route(async (req: Request) => {
  await requireStaff();
  const url = new URL(req.url);
  const { skip, limit, page } = readPaging(url, { page: 1, limit: 50 });
  const status = url.searchParams.get("status") || "all";
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");

  const where: any = {};
  if (status !== "all") where.status = status;
  if (category) where.category = { slug: category };
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { sku:  { contains: q, mode: "insensitive" } },
  ];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: { updatedAt: "desc" }, skip, take: limit,
      include: { category: true, _count: { select: { variants: true, orderItems: true } } },
    }),
    prisma.product.count({ where }),
  ]);
  return json({ items, total, page, limit });
});

const createSchema = z.object({
  slug: z.string().min(1),
  sku:  z.string().min(1),
  name: z.string().min(1),
  shortDesc: z.string().optional(),
  longDesc:  z.string().optional(),
  badge: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.number().int().min(0),
  comparePrice: z.number().int().min(0).nullable().optional(),
  palette: z.array(z.string()).default([]),
  height: z.string().optional(),
  vase:   z.string().optional(),
  status: z.enum(["ACTIVE","DRAFT","ARCHIVED"]).default("DRAFT"),
});

/** POST /api/admin/products — create a new product. */
export const POST = route(async (req: Request) => {
  await requireStaff();
  const data = await readBody(req, createSchema);
  const product = await prisma.product.create({
    // zod's inferred type degrades under non-strict TS (all fields optional),
    // so Prisma's create union can't be satisfied without a cast.
    data: { ...data, categoryId: data.categoryId ?? null } as any,
  });
  return json({ product }, { status: 201 });
});
