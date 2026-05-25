import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { requireStaff } from "../../lib/auth-helpers";
import StatusPill from "../../components/admin/StatusPill";
import ClickableRow from "../../components/admin/ClickableRow";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AdminDashboard() {
  const staff = await requireStaff();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayRevenue,
    todayCount,
    statusGroups,
    activeSubs,
    avg,
    recent,
    lowStock,
    activity,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _avg: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.productVariant.findMany({
      where: { stockQty: { lte: 6 } },
      orderBy: { stockQty: "asc" },
      take: 5,
      include: {
        product: { select: { name: true, slug: true, palette: true } },
      },
    }),
    prisma.orderEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        order: { select: { code: true, recipientName: true, total: true } },
        actor: { select: { name: true, email: true } },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    statusGroups.map((s: any) => [s.status, s._count]),
  );

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <h1 className="ad-h1">
            Good morning, <em>{staff.name?.split(" ")[0] || "florist"}</em>.
          </h1>
          <p className="ad-h1-sub">
            {statusCounts.NEW || 0} new orders, {statusCounts.TYING || 0} being
            tied, {statusCounts.READY || 0} ready for the van.
          </p>
        </div>
        <div className="ad-actions">
          <Link href="/admin/deliveries" className="ad-btn ad-btn--dark">
            Open delivery board →
          </Link>
        </div>
      </div>

      <div className="ad-kpis">
        <div className="ad-kpi">
          <div className="ad-kpi-label">Today's revenue</div>
          <div className="ad-kpi-value">
            {fmt(todayRevenue._sum.total || 0)}
          </div>
          <div className="ad-kpi-foot">
            across {todayCount} order{todayCount === 1 ? "" : "s"}
          </div>
        </div>
        <div className="ad-kpi">
          <div className="ad-kpi-label">Orders to fulfil</div>
          <div className="ad-kpi-value">
            {(statusCounts.NEW || 0) +
              (statusCounts.TYING || 0) +
              (statusCounts.READY || 0)}
          </div>
          <div className="ad-kpi-foot">
            <b style={{ color: "var(--ad-warn)" }}>
              {statusCounts.NEW || 0} new
            </b>{" "}
            · {statusCounts.TYING || 0} tying · {statusCounts.READY || 0} ready
          </div>
        </div>
        <div className="ad-kpi">
          <div className="ad-kpi-label">Active subscriptions</div>
          <div className="ad-kpi-value">{activeSubs}</div>
          <div className="ad-kpi-foot">monthly + fortnightly + weekly</div>
        </div>
        <div className="ad-kpi">
          <div className="ad-kpi-label">Avg. order value</div>
          <div className="ad-kpi-value">
            {fmt(Math.round(avg._avg.total || 0))}
          </div>
          <div className="ad-kpi-foot">across all paid orders</div>
        </div>
      </div>

      <div className="ad-grid-2">
        <div className="ad-card">
          <div className="ad-card-head">
            <h3>Orders today</h3>
            <Link href="/admin/orders" className="ad-link-btn">
              All orders →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--ad-ink-mute)",
              }}
            >
              No orders today yet — the kettle is on.
            </div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Window</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <ClickableRow key={o.id} href={`/admin/orders/${o.code}`}>
                    <td>
                      <span className="ad-table-id">{o.code}</span>
                    </td>
                    <td>
                      {o.recipientName ||
                        o.user?.name ||
                        o.user?.email ||
                        "Guest"}
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
                    </td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                    <td className="ad-table-money">{fmt(o.total)}</td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="ad-card">
          <div className="ad-card-head">
            <h3>Activity</h3>
          </div>
          {activity.length === 0 ? (
            <div
              style={{ padding: 24, color: "var(--ad-ink-mute)", fontSize: 13 }}
            >
              Nothing yet.
            </div>
          ) : (
            <div>
              {activity.map((e: any) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom: "1px solid var(--ad-line-soft)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      marginTop: 6,
                      flexShrink: 0,
                      background:
                        e.kind === "PAID" || e.kind === "DELIVERED"
                          ? "var(--ad-sage)"
                          : e.kind === "PLACED"
                            ? "var(--ad-accent)"
                            : "var(--ad-tan)",
                    }}
                  />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div>
                      <b>{e.kind}</b>
                      {" — "}
                      <b style={{ fontWeight: 500 }}>{e.order?.code}</b>{" "}
                      {e.order?.recipientName && (
                        <span style={{ color: "var(--ad-ink-soft)" }}>
                          for {e.order.recipientName}
                        </span>
                      )}
                      {e.message && (
                        <span style={{ color: "var(--ad-ink-soft)" }}>
                          {" "}
                          — {e.message}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 11,
                        color: "var(--ad-ink-mute)",
                        marginTop: 2,
                      }}
                    >
                      {new Date(e.createdAt).toLocaleString()}
                      {e.actor && ` · ${e.actor.name || e.actor.email}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ad-card" style={{ marginTop: 16 }}>
        <div className="ad-card-head">
          <h3>Stock alerts</h3>
          <Link href="/admin/products" className="ad-link-btn">
            Manage inventory →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <div
            style={{ padding: 24, color: "var(--ad-ink-mute)", fontSize: 13 }}
          >
            Everything is well-stocked.
          </div>
        ) : (
          <div>
            {lowStock.map((v) => (
              <div
                key={v.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--ad-line-soft)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--ad-bg-soft)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {v.product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ad-ink-mute)",
                      marginTop: 2,
                    }}
                  >
                    {v.label} variant · SKU {v.sku}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontSize: 22,
                    fontWeight: 500,
                    color: v.stockQty <= 3 ? "var(--ad-warn)" : "var(--ad-ink)",
                  }}
                >
                  {v.stockQty}
                </div>
                <StatusPill status={v.stockQty === 0 ? "draft" : "ready"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
