import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function CustomerOrders() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <main className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
      <Link href="/account" className="fs-link-btn">← Account</Link>
      <h1 className="font-serif text-4xl mt-4 mb-8" style={{ letterSpacing: "-0.02em" }}>Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-ink-mute">No orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id} className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-6">
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <div className="font-mono text-xs text-ink-mute">{o.code}</div>
                  <div className="font-serif text-xl mt-1">{o.recipientName || "Bouquet"}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{fmt(o.total)}</div>
                  <div className="text-xs text-ink-mute mt-1">{new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-sm text-ink-soft border-t border-[var(--fs-line-soft)] pt-3">
                <span className="text-ink-mute">Status</span> · {o.status.toLowerCase().replace(/_/g, " ")} ·
                <span className="text-ink-mute"> Delivery</span> · {o.deliveryWindow || "—"}
              </div>
              {o.items.length > 0 && (
                <ul className="mt-3 text-sm text-ink-soft">
                  {o.items.map((it) => (
                    <li key={it.id}>{it.qty} × {it.productName} <span className="text-ink-mute">— {it.variantLabel || "Standard"}</span></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
