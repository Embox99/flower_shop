"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import BouquetIllustration from "./BouquetIllustration";
import { useCartStore } from "../hooks/useCartStore";
import { useUIStore } from "../hooks/useUIStore";
import type { ProductSummary } from "../lib/product-api";

type Props = {
  product: ProductSummary;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: Props) {
  const p = product;
  const [hovered, setHovered] = React.useState(false);
  const add = useCartStore((s) => s.add);
  const showToast = useUIStore((s) => s.showToast);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await add({ productId: p.id, qty: 1 });
      showToast(`Added ${p.name} to your basket`);
      setCartOpen(true);
    } catch (err: any) {
      showToast(err?.message || "Could not add to basket");
    }
  };

  const primary = p.images?.find((i) => i.isPrimary) || p.images?.[0];
  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <article
      className="fs-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/${p.slug}`} className="fs-card-img-btn">
        <div
          className="fs-card-img"
          style={{
            background: `linear-gradient(${135 + index * 15}deg, ${p.palette[0]}55, ${p.palette[1]}55, ${p.palette[2]}33)`,
          }}
        >
          {primary?.url ? (
            <Image src={primary.url} alt={p.name} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
          ) : (
            <BouquetIllustration
              palette={p.palette}
              seed={index + 5}
              className={"fs-card-bouquet" + (hovered ? " fs-card-bouquet--hover" : "")}
            />
          )}
          {p.badge && <span className="fs-card-badge">{p.badge}</span>}
          {p.comparePrice && p.comparePrice > p.price && (
            <span className="fs-card-sale">
              −{Math.round((1 - p.price / p.comparePrice) * 100)}%
            </span>
          )}
          <button className="fs-card-quick" onClick={handleQuickAdd}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h12l-1.2 8.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6L4 6Z" />
              <path d="M7 6V4.5a3 3 0 0 1 6 0V6" />
            </svg>
            Quick add
          </button>
        </div>
      </Link>
      <div className="fs-card-foot">
        <div className="fs-card-row">
          <Link href={`/${p.slug}`}>
            <h4>{p.name}</h4>
          </Link>
          <div className="fs-card-price">
            {p.comparePrice && p.comparePrice > p.price && (
              <span className="fs-card-price-old">{fmt(p.comparePrice)}</span>
            )}
            <span>{fmt(p.price)}</span>
          </div>
        </div>
        {p.shortDesc && <p className="fs-card-desc">{p.shortDesc}</p>}
        <div className="fs-card-meta">
          <div className="fs-card-swatches">
            {p.palette.slice(0, 4).map((c, i) => (
              <span key={i} style={{ background: c }} />
            ))}
          </div>
          <span className="fs-card-meta-text">
            {p.height || "Hand-tied"} · {p.vase || "Wrap & ribbon"}
          </span>
        </div>
      </div>
    </article>
  );
}
