import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { orders: true, subscriptions: true } },
      orders: {
        orderBy: { createdAt: "desc" }, take: 5,
        select: { id: true, code: true, total: true, status: true, createdAt: true, recipientName: true },
      },
    },
  });
  if (!user) redirect("/login");

  return (
    <main className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
      <span className="fs-section-eyebrow">Account</span>
      <h1 className="font-serif text-4xl mt-2 mb-8" style={{ letterSpacing: "-0.02em" }}>
        Hello, {user.name?.split(" ")[0] || user.email.split("@")[0]}.
      </h1>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-6">
          <div className="text-xs text-ink-mute uppercase tracking-wider font-mono">Email</div>
          <div className="text-lg mt-1">{user.email}</div>
        </div>
        <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-6">
          <div className="text-xs text-ink-mute uppercase tracking-wider font-mono">Orders / subscriptions</div>
          <div className="text-lg mt-1 font-serif" style={{ fontSize: 24 }}>
            {user._count.orders} · {user._count.subscriptions}
          </div>
        </div>
      </div>

      <h2 className="font-serif text-2xl mb-4">Recent orders</h2>
      {user.orders.length === 0 ? (
        <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-12 text-center">
          <p className="text-ink-mute mb-6">No orders yet.</p>
          <Link href="/list" className="fs-btn fs-btn--dark">Find a bouquet →</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {user.orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.code}`} className="flex justify-between items-center bg-bg-card border border-[var(--fs-line-soft)] rounded-xl px-5 py-4 hover:border-ink transition">
                <div>
                  <div className="font-mono text-xs text-ink-mute">{o.code}</div>
                  <div className="font-serif text-lg mt-1">{o.recipientName || "Bouquet"}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{fmt(o.total)}</div>
                  <div className="text-xs text-ink-mute mt-1">{o.status.toLowerCase().replace(/_/g, " ")}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
