import { prisma } from "../../../../lib/prisma";
import { json, route } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";

/** GET /api/admin/search?q=… — quick-jump across orders, products, customers. */
export const GET = route(async (req: Request) => {
  await requireStaff();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return json({ orders: [], products: [], customers: [] });

  const [orders, products, customers] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { recipientName: { contains: q, mode: "insensitive" } },
          { recipientPhone: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, code: true, status: true, total: true, currency: true, recipientName: true },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, slug: true, name: true, sku: true, basePrice: true, currency: true },
    }),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true },
    }),
  ]);

  return json({ orders, products, customers });
});
