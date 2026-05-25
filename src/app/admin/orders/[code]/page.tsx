import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import StatusPill from "../../../../components/admin/StatusPill";
import OrderActions from "./OrderActions";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: code }, { code }] },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true, email: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="ad-page">
      <Link href="/admin/orders" className="ad-link-btn" style={{ marginBottom: 14, display: "inline-block" }}>
        ← Back to orders
      </Link>

      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">
            {new Date(order.createdAt).toLocaleString("en-GB")} · {order.city || "—"}
          </span>
          <h1 className="ad-h1">Order <em>{order.code}</em></h1>
          <p className="ad-h1-sub">
            for <b>{order.recipientName || order.user?.name || "Guest"}</b>
            {order.user?.email && <> · {order.user.email}</>}
          </p>
        </div>
        <div className="ad-actions" style={{ gap: 6 }}>
          <StatusPill status={order.status} />
          <StatusPill status={order.paymentStatus} />
        </div>
      </div>

      <OrderActions
        id={order.id} status={order.status}
        paymentStatus={order.paymentStatus}
      />

      <div className="ad-detail-grid" style={{ marginTop: 16 }}>
        <div>
          <div className="ad-card" style={{ marginBottom: 14 }}>
            <div className="ad-card-head"><h3>Bouquet</h3></div>
            {order.items.map((it: any) => (
              <div key={it.id} style={{ display: "flex", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--ad-line-soft)" }}>
                <div style={{
                  width: 56, height: 72, borderRadius: 8,
                  background: "var(--ad-bg-soft)", flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-serif), serif", fontSize: 17, fontWeight: 500 }}>{it.productName}</div>
                  <div style={{ fontSize: 12, color: "var(--ad-ink-mute)" }}>{it.variantLabel || "Standard"}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono), monospace", color: "var(--ad-ink-soft)" }}>×{it.qty}</div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 500, minWidth: 70, textAlign: "right" }}>{fmt(it.total)}</div>
              </div>
            ))}
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--ad-line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--ad-ink-soft)" }}>Subtotal</span>
                <span style={{ fontFamily: "var(--font-mono), monospace" }}>{fmt(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                <span style={{ color: "var(--ad-ink-soft)" }}>Delivery</span>
                <span style={{ fontFamily: "var(--font-mono), monospace" }}>{fmt(order.deliveryFee)}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                paddingTop: 10, marginTop: 8, borderTop: "1px solid var(--ad-line)",
                fontFamily: "var(--font-serif), serif", fontWeight: 500, fontSize: 22,
              }}>
                <span>Total</span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 18 }}>{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {order.giftMessage && (
            <div style={{
              background: "linear-gradient(135deg, #fff8e8, #fdf2db)",
              border: "1px solid #e8d5a8", borderRadius: 10,
              padding: "14px 18px", marginBottom: 14,
              fontFamily: "var(--font-serif), serif", fontSize: 17, fontStyle: "italic",
            }}>
              "{order.giftMessage}"
            </div>
          )}

          <div className="ad-card">
            <div className="ad-card-head"><h3>Timeline</h3></div>
            <div>
              {order.events.map((e: any) => (
                <div key={e.id} style={{
                  display: "flex", gap: 14, padding: "12px 18px",
                  borderBottom: "1px solid var(--ad-line-soft)",
                }}>
                  <div style={{ width: 8 }}>
                    <span style={{
                      display: "block", width: 8, height: 8, borderRadius: "50%",
                      background: "var(--ad-sage)", marginTop: 6,
                    }}/>
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div><b>{e.kind}</b>{e.message && <> — <span style={{ color: "var(--ad-ink-soft)" }}>{e.message}</span></>}</div>
                    <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--ad-ink-mute)", marginTop: 2 }}>
                      {new Date(e.createdAt).toLocaleString()}
                      {e.actor && ` · ${e.actor.name || e.actor.email}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="ad-info">
            <div className="ad-info-head"><h4>Delivery</h4></div>
            <div className="ad-info-body">
              <div className="ad-info-row"><span>Recipient</span><span>{order.recipientName || "—"}</span></div>
              <div className="ad-info-row"><span>Phone</span><span>{order.recipientPhone || "—"}</span></div>
              <div className="ad-info-row"><span>Address</span><span style={{ maxWidth: 200, textAlign: "right" }}>{order.addressLine1}{order.addressLine2 && <><br/>{order.addressLine2}</>}<br/>{order.city}{order.zip && ` · ${order.zip}`}</span></div>
              <div className="ad-info-row"><span>Window</span><span>{order.deliveryWindow}</span></div>
            </div>
          </div>

          <div className="ad-info">
            <div className="ad-info-head"><h4>Customer</h4></div>
            <div className="ad-info-body">
              <div className="ad-info-row"><span>Name</span><span>{order.user?.name || "Guest"}</span></div>
              <div className="ad-info-row"><span>Email</span><span>{order.user?.email || "—"}</span></div>
              <div className="ad-info-row"><span>Phone</span><span>{order.user?.phone || order.recipientPhone || "—"}</span></div>
            </div>
          </div>

          <div className="ad-info">
            <div className="ad-info-head"><h4>Payment</h4></div>
            <div className="ad-info-body">
              <div className="ad-info-row"><span>Status</span><span><StatusPill status={order.paymentStatus} /></span></div>
              <div className="ad-info-row"><span>Captured</span><span style={{ fontFamily: "var(--font-mono), monospace" }}>{order.paymentStatus === "PAID" ? fmt(order.total) : "—"}</span></div>
              <div className="ad-info-row"><span>Ref</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11 }}>{order.paymentRef || "mock"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
