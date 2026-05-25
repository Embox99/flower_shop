import { prisma } from "../../../lib/prisma";
import StatusPill from "../../../components/admin/StatusPill";
import Link from "next/link";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

const COLUMNS: { key: "NEW"|"TYING"|"READY"|"OUT_FOR_DELIVERY"; label: string; dot: string }[] = [
  { key: "NEW",              label: "New",                  dot: "var(--ad-tan)" },
  { key: "TYING",            label: "Tying",                dot: "var(--ad-accent)" },
  { key: "READY",            label: "Ready · awaiting van", dot: "var(--ad-sage)" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery",     dot: "var(--ad-ok)" },
];

export default async function AdminDeliveries() {
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfToday } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const grouped: Record<string, typeof orders> = {
    NEW: [], TYING: [], READY: [], OUT_FOR_DELIVERY: [],
  };
  for (const o of orders) {
    if (grouped[o.status]) grouped[o.status].push(o);
  }

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
          <h1 className="ad-h1">Today on the bench</h1>
          <p className="ad-h1-sub">Each card is a real order — click to open it and move it through the flow.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, alignItems: "flex-start" }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{
            background: "var(--ad-bg-card)", border: "1px solid var(--ad-line)",
            borderRadius: 10, padding: 14, minHeight: 320,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 8px", borderBottom: "1px solid var(--ad-line-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }} />
                {col.label}
              </div>
              <span style={{
                fontFamily: "var(--font-mono), monospace", fontSize: 10,
                background: "var(--ad-bg-soft)", color: "var(--ad-ink-mute)",
                padding: "2px 7px", borderRadius: 999,
              }}>{grouped[col.key].length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {grouped[col.key].length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ad-ink-mute)", padding: 12, textAlign: "center" }}>—</div>
              ) : grouped[col.key].map((o: any) => (
                <Link key={o.id} href={`/admin/orders/${o.code}`} style={{
                  display: "block",
                  background: "var(--ad-bg-card)",
                  border: "1px solid var(--ad-line)",
                  borderRadius: 8, padding: "10px 12px",
                  textDecoration: "none", color: "inherit",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--ad-ink-mute)" }}>{o.code}</span>
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "var(--ad-bg-soft)" }}>
                      {o.deliveryWindow || "—"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{o.recipientName || o.user?.name || "Guest"}</div>
                  <div style={{ fontSize: 11, color: "var(--ad-ink-mute)" }}>
                    {o.city || ""} · <span style={{ fontFamily: "var(--font-mono), monospace" }}>{fmt(o.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
