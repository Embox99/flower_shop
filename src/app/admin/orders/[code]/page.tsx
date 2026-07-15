import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import StatusPill from "../../../../components/admin/StatusPill";
import OrderActions, { NoteForm } from "./OrderActions";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const when = (d: Date) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const order = await prisma.order.findUnique({
    where: { code: decodeURIComponent(code) },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      events: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      },
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">
            <Link href="/admin/orders">Orders</Link> / detail
          </span>
          <h1 className="ad-h1">
            {order.code}{" "}
            <StatusPill status={order.status} />{" "}
            <StatusPill status={order.paymentStatus} />
          </h1>
          <p className="ad-h1-sub">
            Placed {when(order.createdAt)} ·{" "}
            {order.user?.email || "guest checkout"}
          </p>
        </div>
        <OrderActions
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <div className="ad-detail-grid">
        <div>
          <div className="ad-table-wrap" style={{ marginBottom: 14 }}>
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Variant</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} style={{ cursor: "default" }}>
                    <td>
                      {it.product?.slug ? (
                        <Link href={`/${it.product.slug}`} style={{ fontWeight: 500 }}>
                          {it.productName}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 500 }}>{it.productName}</span>
                      )}
                    </td>
                    <td>{it.variantLabel || "—"}</td>
                    <td style={{ textAlign: "right" }}>{it.qty}</td>
                    <td className="ad-table-money">{fmt(it.unitPrice)}</td>
                    <td className="ad-table-money">{fmt(it.total)}</td>
                  </tr>
                ))}
                <tr style={{ cursor: "default" }}>
                  <td colSpan={4} style={{ textAlign: "right", color: "var(--ad-ink-mute)" }}>
                    Subtotal
                  </td>
                  <td className="ad-table-money">{fmt(order.subtotal)}</td>
                </tr>
                <tr style={{ cursor: "default" }}>
                  <td colSpan={4} style={{ textAlign: "right", color: "var(--ad-ink-mute)" }}>
                    Delivery
                  </td>
                  <td className="ad-table-money">{fmt(order.deliveryFee)}</td>
                </tr>
                <tr style={{ cursor: "default" }}>
                  <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
                    Total
                  </td>
                  <td className="ad-table-money" style={{ fontWeight: 600 }}>
                    {fmt(order.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ad-form-section">
            <h3>Timeline</h3>
            <NoteForm orderId={order.id} />
            <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
              {order.events.map((ev) => (
                <li
                  key={ev.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--ad-line-soft)",
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11,
                      color: "var(--ad-ink-mute)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {when(ev.createdAt)}
                  </span>
                  <StatusPill status={ev.kind} />
                  <span style={{ flex: 1 }}>{ev.message || ""}</span>
                  <span style={{ color: "var(--ad-ink-mute)", fontSize: 11 }}>
                    {ev.actor?.name || ev.actor?.email || "system"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="ad-form-section">
            <h3>Delivery</h3>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 500 }}>{order.recipientName || "—"}</div>
              <div>{order.recipientPhone || ""}</div>
              <div style={{ marginTop: 8 }}>
                {order.addressLine1}
                {order.addressLine2 ? <>, {order.addressLine2}</> : null}
              </div>
              <div>
                {order.city} {order.zip || ""} · {order.country || ""}
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "var(--ad-bg-soft)",
                  }}
                >
                  {order.deliveryWindow || "—"}
                </span>
                {order.deliveryDate && (
                  <span style={{ marginLeft: 8, color: "var(--ad-ink-mute)" }}>
                    {new Date(order.deliveryDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="ad-form-section">
            <h3>Customer</h3>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 500 }}>
                {order.user?.name || "Guest"}
              </div>
              <div>{order.user?.email || "no account"}</div>
              <div>{order.user?.phone || ""}</div>
            </div>
          </div>

          {order.giftMessage && (
            <div className="ad-form-section">
              <h3>Gift message</h3>
              <p style={{ fontSize: 13, fontStyle: "italic", margin: 0 }}>
                “{order.giftMessage}”
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
