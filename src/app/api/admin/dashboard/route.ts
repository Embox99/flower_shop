import { prisma } from "../../../../lib/prisma";
import { json, route } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";

/**
 * GET /api/admin/dashboard — KPIs + activity feed for the admin home.
 */
export const GET = route(async () => {
  await requireStaff();

  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const startOf7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOf14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    revenueToday, revenuePrev,
    statusCounts,
    activeSubs,
    avgOrder,
    activity,
    lowStock,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday }, paymentStatus: "PAID" },
      _sum: { total: true }, _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOf14d, lt: startOfToday }, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: startOf7d } },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _avg: { total: true } }),
    prisma.orderEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        order:  { select: { code: true, recipientName: true, total: true } },
        actor:  { select: { name: true, email: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: { stockQty: { lte: 6 } },
      orderBy: { stockQty: "asc" },
      take: 6,
      include: { product: { select: { name: true, slug: true, palette: true } } },
    }),
  ]);

  return json({
    revenue: {
      today: revenueToday._sum.total || 0,
      prevAvg: Math.round((revenuePrev._sum.total || 0) / 14),
      ordersToday: revenueToday._count,
    },
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
    activeSubs,
    averageOrderValue: Math.round(avgOrder._avg.total || 0),
    lowStock: lowStock.map((v) => ({
      productName: v.product.name,
      productSlug: v.product.slug,
      variantLabel: v.label,
      qty: v.stockQty,
      palette: v.product.palette,
    })),
    activity: activity.map((e) => ({
      kind: e.kind, message: e.message,
      orderCode: e.order?.code, recipient: e.order?.recipientName, total: e.order?.total,
      actor: e.actor?.name || e.actor?.email || "system",
      createdAt: e.createdAt,
    })),
  });
});
