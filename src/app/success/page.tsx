import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import BouquetIllustration from "../../components/BouquetIllustration";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

async function fetchOrder(code: string) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/orders?code=${encodeURIComponent(code)}`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") || "" },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const data = code ? await fetchOrder(code) : null;
  const order = data?.order;

  return (
    <main className="fs-success">
      <div className="fs-success-art">
        <BouquetIllustration
          palette={["#e8c8b9","#f7d76b","#9bb38a","#f5b8c4"]}
          className="fs-success-img"
        />
      </div>
      <span className="fs-section-eyebrow">Order {order?.code || "received"}</span>
      <h1>Off they go.</h1>
      <p>
        We&apos;re tying it now. Look out for a photo of your bouquet before it leaves the
        shop — we send one to every customer.
      </p>

      {order && (
        <div className="fs-success-meta">
          <div><b>Delivery</b><span>{order.deliveryWindow}</span></div>
          <div><b>Recipient</b><span>{order.recipientName || "You"}</span></div>
          <div><b>Total</b><span>{fmt(order.total)}</span></div>
        </div>
      )}

      <div className="fs-success-actions">
        <Link href="/" className="fs-btn fs-btn--dark">Back to the shop</Link>
        <Link href={`/account/orders`} className="fs-btn fs-btn--ghost">Track this order →</Link>
      </div>
    </main>
  );
}
