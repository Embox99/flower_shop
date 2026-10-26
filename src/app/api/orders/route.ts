import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { json, route, bad, readPaging } from "../../../lib/api";
import { serializeOrder } from "../../../lib/serializers";
import { findViewableOrder } from "../../../lib/orders";
import { enforceRateLimit } from "../../../lib/rate-limit";

/**
 * GET /api/orders — list the signed-in user's orders.
 * GET /api/orders?code=FS-12345 — fetch one (own order only).
 */
export const GET = route(async (req: Request) => {
  const session = await auth();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Code lookup: own orders, or ones placed from this browser. Unknown and
  // foreign codes both 404 so codes can't be probed for existence.
  if (code) {
    await enforceRateLimit(req, "order-lookup", { limit: 30, windowSec: 60 });
    const order = await findViewableOrder(code);
    if (!order) return bad("Order not found", 404);
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

