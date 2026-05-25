"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../hooks/useCartStore";
import BouquetIllustration from "../../components/BouquetIllustration";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const total = useCartStore((s) => s.total);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery] = useState("today");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "", name: "", phone: "",
    recipient: "",
    addressLine1: "", addressLine2: "", city: "Tel Aviv", zip: "",
    giftMessage: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (lines.length === 0) {
    return (
      <main className="fs-checkout fs-checkout--empty">
        <BouquetIllustration palette={["#e8c8b9","#cdd9bd","#efe2c7","#f5b8c4"]} className="fs-empty-img" />
        <h2 className="font-serif text-4xl">Your basket is empty.</h2>
        <button className="fs-btn fs-btn--dark" onClick={() => router.push("/list")}>Find a bouquet</button>
      </main>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipient || form.name,
          recipientPhone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          zip: form.zip || undefined,
          country: "IL",
          deliveryWindow: deliveryLabel(delivery),
          giftMessage: form.giftMessage || undefined,
          email: form.email || undefined,
          name: form.name || undefined,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Could not place order");
      }
      const data = await res.json();
      await clear();
      router.push(`/success?code=${encodeURIComponent(data.code)}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="fs-checkout">
      <div className="fs-checkout-head">
        <h1>Checkout</h1>
        <ol className="fs-steps">
          {["Delivery", "Details", "Review"].map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            return (
              <li key={n} className={"fs-step" + (step === n ? " fs-step--on" : "") + (step > n ? " fs-step--done" : "")}>
                <span className="fs-step-num">{step > n ? "✓" : n}</span>
                <span className="fs-step-label">{label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="fs-checkout-body">
        <div className="fs-checkout-form">
          {step === 1 && (
            <section className="fs-form-section">
              <h3>When and how</h3>
              <div className="fs-deliv-options">
                {[
                  { id: "today",     t: "Today",            s: "Tel Aviv · before 6pm",       p: "$6" },
                  { id: "tomorrow",  t: "Tomorrow morning", s: "Choose 9–12 or 12–3",         p: "$4" },
                  { id: "date",      t: "Pick a date",      s: "Up to 30 days out",           p: "$4" },
                  { id: "letterbox", t: "Letterbox",        s: "2–3 days, UK & EU",           p: "free" },
                  { id: "pickup",    t: "Pick up at the shop", s: "Florentin 22 · today after 4pm", p: "free" },
                ].map((d) => (
                  <label key={d.id} className={"fs-deliv-opt" + (delivery === d.id ? " fs-deliv-opt--on" : "")}>
                    <input type="radio" name="deliv" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                    <div>
                      <div className="fs-deliv-opt-row"><b>{d.t}</b><span>{d.p}</span></div>
                      <span>{d.s}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button className="fs-btn fs-btn--dark fs-btn--block" onClick={() => setStep(2)}>
                Continue to details →
              </button>
            </section>
          )}

          {step === 2 && (
            <section className="fs-form-section">
              <h3>Who&apos;s it from, and to</h3>
              <div className="fs-form-grid">
                <label><span>Your email</span><input value={form.email} onChange={set("email")} placeholder="for the receipt" /></label>
                <label><span>Your name</span><input value={form.name} onChange={set("name")} placeholder="Anna" /></label>
                <label><span>Phone</span><input value={form.phone} onChange={set("phone")} placeholder="+972…" /></label>
                <label><span>Recipient</span><input value={form.recipient} onChange={set("recipient")} placeholder="Same as me / their name" /></label>
                <label className="fs-form-grid-wide"><span>Delivery address</span><input value={form.addressLine1} onChange={set("addressLine1")} placeholder="Street and number" /></label>
                <label><span>Apt / floor</span><input value={form.addressLine2} onChange={set("addressLine2")} /></label>
                <label><span>City</span><input value={form.city} onChange={set("city")} /></label>
                <label className="fs-form-grid-wide"><span>Card message <em>(handwritten in fountain pen)</em></span>
                  <textarea rows={3} maxLength={160} value={form.giftMessage} onChange={set("giftMessage")} />
                </label>
              </div>
              <div className="fs-form-actions">
                <button className="fs-btn fs-btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="fs-btn fs-btn--dark" onClick={() => setStep(3)}>Review order →</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="fs-form-section">
              <h3>Final look</h3>
              <p style={{ color: "var(--fs-ink-mute)", fontSize: 14, marginTop: -8 }}>
                Payment is handled by the studio after they accept your order — you&apos;ll get a link by email.
              </p>
              <div className="fs-form-grid">
                <label><span>From</span><div className="border border-[var(--fs-line)] rounded-xl px-4 py-3 bg-bg-card">{form.name || "—"}<br/><small className="text-ink-mute">{form.email}</small></div></label>
                <label><span>To</span><div className="border border-[var(--fs-line)] rounded-xl px-4 py-3 bg-bg-card">{form.recipient || form.name || "—"}<br/><small className="text-ink-mute">{form.addressLine1}, {form.city}</small></div></label>
                <label><span>Delivery</span><div className="border border-[var(--fs-line)] rounded-xl px-4 py-3 bg-bg-card">{deliveryLabel(delivery)}</div></label>
                {form.giftMessage && (
                  <label className="fs-form-grid-wide"><span>Card</span>
                    <div className="border border-[var(--fs-line)] rounded-xl px-4 py-3 bg-bg-card font-serif italic">"{form.giftMessage}"</div>
                  </label>
                )}
              </div>
              {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
              <div className="fs-form-actions">
                <button className="fs-btn fs-btn--ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="fs-btn fs-btn--dark" onClick={submit} disabled={submitting}>
                  {submitting ? "Placing…" : `Place order · ${fmt(total)}`}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="fs-checkout-summary">
          <h4>Your basket</h4>
          <div className="fs-summary-list">
            {lines.map((c) => (
              <div className="fs-summary-item" key={c.id}>
                <div className="fs-summary-img" style={{ background: `linear-gradient(135deg, ${c.palette[0]}33, ${c.palette[1]}33)` }}>
                  <BouquetIllustration palette={c.palette} seed={c.id.charCodeAt(0)} />
                  <span className="fs-summary-qty">{c.qty}</span>
                </div>
                <div className="fs-summary-body">
                  <div className="fs-summary-row"><b>{c.productName}</b><span>{fmt(c.total)}</span></div>
                  <span className="fs-summary-meta">{c.variantLabel || "Standard"}{c.addVase ? " · vase" : ""}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="fs-summary-totals">
            <div><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div><span>Delivery</span><span>{deliveryFee ? fmt(deliveryFee) : "free"}</span></div>
            <div className="fs-summary-grand"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          <p className="fs-summary-trust">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 10l3 3 7-7"/><circle cx="10" cy="10" r="9"/></svg>
            Freshness guaranteed for 7 days, on us.
          </p>
        </aside>
      </div>
    </main>
  );
}

function deliveryLabel(id: string) {
  return ({
    today: "Today · before 6pm",
    tomorrow: "Tomorrow morning",
    date: "Pick a date",
    letterbox: "Letterbox · 2–3 days",
    pickup: "Pick up at the shop",
  } as Record<string, string>)[id] || id;
}
