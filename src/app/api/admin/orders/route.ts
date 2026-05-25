import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { json, route, readBody, readPaging } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";
import { serializeOrder } from "../../orders/route";

/**
 * GET /api/admin/orders
 *   ?status=NEW|TYING|READY|OUT_FOR_DELIVERY|DELIVERED|CANCELED|all
 *   ?q=<code or customer>
 *   ?from=&to=  (ISO dates)
 */
export const GET = route(async (req: Request) => {
  await requireStaff();
  const url = new URL(req.url);
  const { skip, limit, page } = readPaging(url, { page: 1, limit: 50 });

  const status = url.searchParams.get("status") || "all";
  const q = url.searchParams.get("q");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: any = {};
  if (status !== "all") where.status = status;
  if (q) where.OR = [
    { code: { contains: q, mode: "insensitive" } },
    { recipientName: { contains: q, mode: "insensitive" } },
    { user: { email: { contains: q, mode: "insensitive" } } },
    { user: { name: { contains: q, mode: "insensitive" } } },
  ];
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return json({
    items: items.map((o: any) => ({
      ...serializeOrder(o),
      customer: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null,
    })),
    total, page, limit,
  });
});

// ── KPIs for the admin dashboard ────────────────────────────────────────────
const summarySchema = z.object({}).strict();
