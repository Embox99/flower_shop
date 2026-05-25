import { prisma } from "../../../../lib/prisma";
import { json, route, readPaging } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";

/**
 * GET /api/admin/customers — paged list with aggregate lifetime value & order count.
 */
export const GET = route(async (req: Request) => {
  await requireStaff();
  const url = new URL(req.url);
  const { skip, limit, page } = readPaging(url, { page: 1, limit: 50 });
  const q = url.searchParams.get("q");
  const segment = url.searchParams.get("segment") || "all";

  const where: any = { role: "CUSTOMER" };
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
  ];

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      include: {
        _count: { select: { orders: true, subscriptions: true } },
        orders: { select: { total: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items = users.map((u) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    joined: u.createdAt,
    orderCount: u._count.orders,
    subscriptionCount: u._count.subscriptions,
    lifetimeValue: u.orders.reduce((s, o) => s + o.total, 0),
  }));

  // Optional VIP segment filter applied after aggregation.
  const filtered = segment === "vip"
    ? items.filter(i => i.lifetimeValue >= 100000)
    : items;

  return json({ items: filtered, total, page, limit });
});
