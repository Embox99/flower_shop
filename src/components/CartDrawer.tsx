"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../hooks/useCartStore";
import { useUIStore } from "../hooks/useUIStore";
import BouquetIllustration from "./BouquetIllustration";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default function CartDrawer() {
  const lines     = useCartStore((s) => s.lines);
  const subtotal  = useCartStore((s) => s.subtotal);
  const counter   = useCartStore((s) => s.counter);
  const loading   = useCartStore((s) => s.loading);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove    = useCartStore((s) => s.remove);

  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);

  if (!open) return null;

  return (
    <div className="fs-drawer-scrim" onClick={() => setOpen(false)}>
      <aside className="fs-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="fs-drawer-head">
          <h3>Your basket <span>({counter})</span></h3>
          <button className="fs-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="fs-drawer-empty">
            <BouquetIllustration
              palette={["#e8c8b9", "#cdd9bd", "#efe2c7", "#f5b8c4"]}
              className="fs-drawer-empty-img"
            />
            <p>Your basket is quiet.</p>
            <Link href="/list" className="fs-btn" onClick={() => setOpen(false)}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="fs-drawer-list">
              {lines.map((it) => (
                <div className="fs-drawer-item" key={it.id}>
                  <div className="fs-drawer-item-img" style={{ background: "var(--fs-bg-soft)" }}>
                    <BouquetIllustration palette={it.palette} seed={it.productId.charCodeAt(0)} />
                  </div>
                  <div className="fs-drawer-item-body">
                    <div className="fs-drawer-item-row">
                      <span className="fs-drawer-item-name">{it.productName}</span>
                      <span className="fs-drawer-item-price">{fmt(it.total)}</span>
                    </div>
                    <div className="fs-drawer-item-meta">
                      {it.variantLabel || "Standard"}{it.addVase ? " · with vase" : ""}
                    </div>
                    <div className="fs-drawer-item-foot">
                      <div className="fs-qty">
                        <button onClick={() => updateQty(it.id, Math.max(0, it.qty - 1))} aria-label="Decrease">−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => updateQty(it.id, it.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className="fs-link-btn" onClick={() => remove(it.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="fs-drawer-foot">
              <div className="fs-drawer-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="fs-drawer-row fs-drawer-row--muted"><span>Delivery</span><span>Calculated next</span></div>
              <Link
                href="/checkout"
                className="fs-btn fs-btn--dark fs-btn--block"
                onClick={() => setOpen(false)}
                aria-disabled={loading}
              >
                Continue to checkout →
              </Link>
              <button className="fs-link-btn fs-drawer-keepshopping" onClick={() => setOpen(false)}>
                Keep shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
