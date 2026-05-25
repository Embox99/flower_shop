"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../hooks/useCartStore";
import { useUIStore } from "../hooks/useUIStore";
import type { ProductDetail } from "../lib/product-api";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default function CustomizeProducts({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const loading = useCartStore((s) => s.loading);
  const showToast = useUIStore((s) => s.showToast);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const variants = product.variants?.length ? product.variants : [
    { id: "", label: "Standard", sku: product.sku, stems: null, priceDelta: 0, inStock: true },
  ];
  const defaultVariant = variants.find((v) => v.label === "Standard") || variants[0];

  const [variantId, setVariantId] = useState<string>(defaultVariant.id);
  const [vase, setVase] = useState(false);
  const [card, setCard] = useState("");
  const [tab, setTab] = useState<"description" | "care" | "delivery">("description");

  const variant = variants.find((v) => v.id === variantId) || defaultVariant;
  const total = product.price + (variant.priceDelta || 0) + (vase ? 1400 : 0);

  const handleAdd = async () => {
    try {
      await add({
        productId: product.id,
        variantId: variant.id || null,
        qty: 1,
        addVase: vase,
        giftMessage: card || undefined,
      });
      showToast(`Added ${product.name} to your basket`);
      setCartOpen(true);
    } catch (err: any) {
      showToast(err?.message || "Could not add to basket");
    }
  };

  return (
    <div className="fs-product-buy">
      <span className="fs-section-eyebrow">
        {product.badge || product.category?.name || "In flower this week"}
      </span>
      <h1 className="fs-product-title">{product.name}</h1>
      <div className="fs-product-rating">
        <span>★★★★★</span>
        <span>4.9 · 218 reviews</span>
        <span>·</span>
        <span>Cut at 05:40 today</span>
      </div>
      {product.shortDesc && <p className="fs-product-lede">{product.shortDesc}</p>}

      <div className="fs-product-price">
        <span className="fs-product-price-now">{fmt(total)}</span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="fs-product-price-old">{fmt(product.comparePrice)}</span>
        )}
        <span className="fs-product-price-meta">incl. wrap & ribbon</span>
      </div>

      <div className="fs-product-section">
        <div className="fs-product-section-head">
          <h5>Size</h5>
          {variant.stems && <span>{variant.stems} stems</span>}
        </div>
        <div className="fs-size-row">
          {variants.map((v) => (
            <button
              key={v.id || v.sku}
              type="button"
              className={"fs-size-btn" + (variantId === v.id ? " fs-size-btn--on" : "")}
              onClick={() => setVariantId(v.id)}
              disabled={!v.inStock}
            >
              <span className="fs-size-btn-label">{v.label}</span>
              {v.stems && <span className="fs-size-btn-meta">{v.stems} stems</span>}
              <span className="fs-size-btn-delta">
                {v.priceDelta === 0 ? "—" : v.priceDelta > 0 ? `+${fmt(v.priceDelta)}` : `−${fmt(-v.priceDelta)}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="fs-product-section">
        <h5>Add a vase?</h5>
        <div className="fs-toggle-row">
          <button type="button" className={"fs-toggle" + (!vase ? " fs-toggle--on" : "")} onClick={() => setVase(false)}>
            <span>No vase</span><span>—</span>
          </button>
          <button type="button" className={"fs-toggle" + (vase ? " fs-toggle--on" : "")} onClick={() => setVase(true)}>
            <span>Stoneware vase</span><span>+$14</span>
          </button>
        </div>
      </div>

      <div className="fs-product-section">
        <h5>Hand-written card <em>(free)</em></h5>
        <textarea
          className="fs-textarea"
          rows={3}
          maxLength={140}
          placeholder="Optional. We'll write it in fountain pen."
          value={card}
          onChange={(e) => setCard(e.target.value)}
        />
        <span className="fs-product-counter">{card.length}/140</span>
      </div>

      <div className="fs-product-section fs-product-section--inline">
        <div className="fs-product-deliver">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7h11l3 3v4h-2" /><circle cx="6" cy="15" r="2" /><circle cx="14" cy="15" r="2" />
          </svg>
          Order in <b>2h 14m</b> for delivery <b>today</b>
        </div>
        <div className="fs-product-pickup">Pick up Florentin · ready in 90 minutes</div>
      </div>

      <div className="fs-product-cta">
        <button type="button" className="fs-btn fs-btn--dark fs-btn--block" onClick={handleAdd} disabled={loading}>
          {loading ? "Adding…" : `Add to basket · ${fmt(total)}`}
        </button>
        <button type="button" className="fs-icon-btn fs-icon-btn--lg" aria-label="Save">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 17s-6-3.6-6-8.2A3.8 3.8 0 0 1 10 5a3.8 3.8 0 0 1 6 3.8c0 4.6-6 8.2-6 8.2Z" />
          </svg>
        </button>
      </div>

      <div className="fs-product-tabs">
        {[
          { id: "description", label: "Description" },
          { id: "care",        label: "Care" },
          { id: "delivery",    label: "Delivery" },
        ].map((t) => (
          <button key={t.id} type="button"
            className={"fs-tab" + (tab === t.id ? " fs-tab--on" : "")}
            onClick={() => setTab(t.id as any)}>{t.label}</button>
        ))}
      </div>
      <div className="fs-product-tab-body">
        {tab === "description" && <p>{product.longDesc || product.shortDesc}</p>}
        {tab === "care" && (
          <ul className="fs-care-list">
            <li>Trim 2cm at an angle</li>
            <li>Cool, indirect light</li>
            <li>Change water every 2 days</li>
            <li>Strip leaves below the waterline</li>
          </ul>
        )}
        {tab === "delivery" && (
          <div className="fs-delivery-grid">
            <div><b>Tel Aviv</b><span>Same day if ordered before noon</span></div>
            <div><b>Israel</b><span>Next-day everywhere</span></div>
            <div><b>Letterbox</b><span>2-3 days, UK & EU</span></div>
            <div><b>Wedding</b><span>By appointment, hand-delivered</span></div>
          </div>
        )}
      </div>

      {product.composition?.length > 0 && (
        <div className="fs-product-section" style={{ marginTop: 8 }}>
          <h5>What&apos;s in this bouquet</h5>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {product.composition.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "6px 12px", background: "var(--fs-bg-soft)",
                borderRadius: 8, fontSize: 13,
              }}>
                <span style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: s.swatchHex || "var(--fs-accent)",
                  border: "1px solid var(--fs-line)",
                }}/>
                <span style={{ flex: 1 }}>{s.name}</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>×{s.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
