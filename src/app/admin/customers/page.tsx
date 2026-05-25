import { prisma } from "../../../lib/prisma";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AdminCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true, subscriptions: true } },
      orders: { select: { total: true } },
    },
  });

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">Commerce</span>
          <h1 className="ad-h1">Customers</h1>
          <p className="ad-h1-sub">{customers.length} accounts</p>
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr>
            <th>Customer</th><th>Phone</th><th>Joined</th>
            <th style={{ textAlign: "right" }}>Orders</th>
            <th style={{ textAlign: "right" }}>Lifetime value</th>
            <th style={{ textAlign: "right" }}>Subscriptions</th>
          </tr></thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--ad-ink-mute)" }}>No customers yet.</td></tr>
            ) : customers.map((c) => {
              const ltv = c.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--ad-ink-mute)" }}>{c.email}</div>
                  </td>
                  <td>{c.phone || "—"}</td>
                  <td style={{ color: "var(--ad-ink-mute)", fontSize: 12 }}>
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono), monospace" }}>{c._count.orders}</td>
                  <td className="ad-table-money">{fmt(ltv)}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono), monospace" }}>{c._count.subscriptions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
