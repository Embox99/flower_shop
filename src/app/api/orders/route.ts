import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { json, route, bad, readPaging } from "../../../lib/api";
import { serializeOrder } from "../../../lib/serializers";

/**
 * GET /api/orders — list the signed-in user's orders.
 * GET /api/orders?code=FS-12345 — fetch one (own order only).
 */
export const GET = route(async (req: Request) => {
  const session = await auth();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Anonymous code lookup: only allow if the order has no userId (true guest).
  if (code) {
    const order = await prisma.order.findUnique({
      where: { code },
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) return bad("Order not found", 404);
    if (order.userId && order.userId !== session?.user?.id) {
      return bad("Forbidden", 403);
    }
    return json({ order: serializeOrder(order) });
  }

  if (!session?.user?.id) return bad("Sign in to view orders", 401);

  const { skip, limit, page } = readPaging(url);
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip, take: limit,
      include: { items: true },
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);
  return json({
    items: items.map(serializeOrder),
    total, page, limit,
  });
});

