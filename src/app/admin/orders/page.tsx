import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import StatusPill from "../../../components/admin/StatusPill";
import OrdersToolbar from "./OrdersToolbar";
import ClickableRow from "../../../components/admin/ClickableRow";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status || "all";
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const limit = 50;

  const where: any = {};
  if (status !== "all") where.status = status;
  if (q)
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { recipientName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];

  const [orders, total, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const byStatus = Object.fromEntries(
    counts.map((c: any) => [c.status, c._count]),
  );
  byStatus.all =
    orders.length > 0
      ? total
      : Object.values(byStatus).reduce((s: any, n: any) => s + n, 0);

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">Commerce</span>
          <h1 className="ad-h1">Orders</h1>
          <p className="ad-h1-sub">
            {total} matching · use ⌘K to jump to one by code
          </p>
        </div>
      </div>

      <OrdersToolbar counts={byStatus as any} />

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Window · City</th>
              <th>Status</th>
              <th>Payment</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th style={{ textAlign: "right" }}>Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--ad-ink-mute)",
                  }}
                >
                  No orders here.
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <ClickableRow key={o.id} href={`/admin/orders/${o.code}`}>
                  <td>
                    <span className="ad-table-id">{o.code}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {o.recipientName || o.user?.name || "Guest"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ad-ink-mute)" }}>
                      {o.user?.email || "no account"}
                    </div>
                  </td>
                  <td>
                    {o._count.items} item{o._count.items === 1 ? "" : "s"}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--ad-bg-soft)",
                      }}
                    >
                      {o.deliveryWindow || "—"}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--ad-ink-mute)",
                        fontSize: 12,
                      }}
                    >
                      {o.city || ""}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={o.status} />
                  </td>
                  <td>
                    <StatusPill status={o.paymentStatus} />
                  </td>
                  <td className="ad-table-money">{fmt(o.total)}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "var(--ad-ink-mute)",
                      fontSize: 12,
                    }}
                  >
                    {new Date(o.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
