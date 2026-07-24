import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const EVENT_LABEL: Record<string, string> = {
  PLACED: "Order placed",
  PAID: "Payment received",
  ACCEPTED: "Accepted by the studio",
  TYING: "Being tied",
  READY: "Ready — awaiting the van",
  OUT: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
  REFUNDED: "Refunded",
  NOTE: "Update",
};

export default async function CustomerOrderDetail({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/account/orders/${code}`);

  const order = await prisma.order.findFirst({
    where: { code, userId: session.user.id },
    include: {
      items: true,
      // Customers never see internal staff notes.
      events: {
        where: { kind: { not: "NOTE" } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order) notFound();

  return (
    <main className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
      <Link href="/account/orders" className="fs-link-btn">← Your orders</Link>

      <div className="flex justify-between items-baseline mt-4 mb-8 flex-wrap gap-2">
        <div>
          <div className="font-mono text-xs text-ink-mute">{order.code}</div>
          <h1 className="font-serif text-4xl mt-1" style={{ letterSpacing: "-0.02em" }}>
            {order.recipientName || "Your bouquet"}
          </h1>
        </div>
        <div className="text-right">
          <div className="font-serif" style={{ fontSize: 26 }}>{fmt(order.total)}</div>
          <div className="text-xs text-ink-mute mt-1">
            {order.status.toLowerCase().replace(/_/g, " ")}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-6">
          <div className="text-xs text-ink-mute uppercase tracking-wider font-mono mb-2">Delivery</div>
          <div className="text-sm">{order.deliveryWindow || "—"}</div>
          {order.deliveryDate && (
            <div className="text-sm text-ink-soft mt-1">
              {new Date(order.deliveryDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          )}
          {(order.addressLine1 || order.city) && (
            <div className="text-sm text-ink-soft mt-2">
              {[order.addressLine1, order.addressLine2, order.city, order.zip].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-6">
          <div className="text-xs text-ink-mute uppercase tracking-wider font-mono mb-2">Payment</div>
          <div className="text-sm">{order.paymentStatus.toLowerCase()}</div>
          {order.giftMessage && (
            <>
              <div className="text-xs text-ink-mute uppercase tracking-wider font-mono mt-4 mb-2">Gift note</div>
              <div className="text-sm text-ink-soft italic">“{order.giftMessage}”</div>
            </>
          )}
        </div>
      </div>

      <h2 className="font-serif text-2xl mb-4">Items</h2>
      <ul className="flex flex-col gap-2 mb-8">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between items-baseline bg-bg-card border border-[var(--fs-line-soft)] rounded-xl px-5 py-4">
            <div>
              <div className="font-serif text-lg">{it.productName}</div>
              <div className="text-xs text-ink-mute mt-1">
                {it.qty} × {fmt(it.unitPrice)}{it.variantLabel ? ` · ${it.variantLabel}` : ""}
              </div>
            </div>
            <div className="font-mono">{fmt(it.total)}</div>
          </li>
        ))}
      </ul>

      <div className="border-t border-[var(--fs-line-soft)] pt-4 mb-12 text-sm">
        <div className="flex justify-between py-1"><span className="text-ink-mute">Subtotal</span><span className="font-mono">{fmt(order.subtotal)}</span></div>
        <div className="flex justify-between py-1"><span className="text-ink-mute">Delivery</span><span className="font-mono">{order.deliveryFee ? fmt(order.deliveryFee) : "Free"}</span></div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between py-1"><span className="text-ink-mute">Discount</span><span className="font-mono">−{fmt(order.discountTotal)}</span></div>
        )}
        <div className="flex justify-between py-2 border-t border-[var(--fs-line-soft)] mt-1 font-serif" style={{ fontSize: 18 }}>
          <span>Total</span><span>{fmt(order.total)}</span>
        </div>
      </div>

      {order.events.length > 0 && (
        <>
          <h2 className="font-serif text-2xl mb-4">Timeline</h2>
          <ol className="flex flex-col gap-3">
            {order.events.map((e) => (
              <li key={e.id} className="flex items-baseline gap-3">
                <span className="w-2 h-2 rounded-full bg-ink shrink-0" style={{ transform: "translateY(-2px)" }} />
                <div className="flex justify-between w-full">
                  <span className="text-sm">{EVENT_LABEL[e.kind] || e.kind}{e.message ? ` — ${e.message}` : ""}</span>
                  <span className="text-xs text-ink-mute font-mono shrink-0 ml-3">
                    {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
}
