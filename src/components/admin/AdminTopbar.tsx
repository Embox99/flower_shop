"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type Order = { id: string; code: string; status: string; total: number; currency: string; recipientName: string };
type Product = { id: string; slug: string; name: string; sku: string; basePrice: number; currency: string };
type Customer = { id: string; name: string | null; email: string };

const fmt = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);

export default function AdminTopbar({ user }: { user: Session["user"] }) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ orders: Order[]; products: Product[]; customers: Customer[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        setResults(await res.json());
      } catch {
        setResults({ orders: [], products: [], customers: [] });
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ⌘K / Ctrl+K focuses the search box from anywhere in the admin.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes the results dropdown.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const hasResults = !!results && (results.orders.length || results.products.length || results.customers.length);
  const showPanel = open && query.trim().length >= 2;

  return (
    <header className="ad-topbar">
      <div ref={wrapRef} className="ad-search-wrap">
        <div className="ad-search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/>
          </svg>
          <input
            ref={inputRef}
            placeholder="Search orders, products, customers…"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { close(); inputRef.current?.blur(); } }}
            className="ad-search-input"
          />
          <span className="ad-search-kbd">⌘K</span>
        </div>

        {showPanel && (
          <div className="ad-search-panel">
            {searching && <div className="ad-search-empty">Searching…</div>}
            {!searching && !hasResults && <div className="ad-search-empty">No matches for “{query.trim()}”.</div>}
            {!searching && results && (
              <>
                {results.orders.length > 0 && (
                  <div className="ad-search-group">
                    <div className="ad-search-group-title">Orders</div>
                    {results.orders.map((o) => (
                      <Link key={o.id} href={`/admin/orders/${o.code}`} className="ad-search-item" onClick={close}>
                        <span className="ad-table-id">{o.code}</span>
                        <span className="ad-search-item-main">{o.recipientName}</span>
                        <span className="ad-search-item-sub">{fmt(o.total, o.currency)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {results.products.length > 0 && (
                  <div className="ad-search-group">
                    <div className="ad-search-group-title">Products</div>
                    {results.products.map((p) => (
                      <Link key={p.id} href={`/admin/products/${p.slug}`} className="ad-search-item" onClick={close}>
                        <span className="ad-table-id">{p.sku}</span>
                        <span className="ad-search-item-main">{p.name}</span>
                        <span className="ad-search-item-sub">{fmt(p.basePrice, p.currency)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {results.customers.length > 0 && (
                  <div className="ad-search-group">
                    <div className="ad-search-group-title">Customers</div>
                    {results.customers.map((c) => (
                      <Link key={c.id} href="/admin/customers" className="ad-search-item" onClick={close}>
                        <span className="ad-search-item-main">{c.name || "—"}</span>
                        <span className="ad-search-item-sub">{c.email}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-end",
        fontFamily: "var(--font-mono), monospace", fontSize: 10,
        letterSpacing: "0.08em", color: "var(--ad-ink-mute)",
        textTransform: "uppercase", lineHeight: 1.3,
      }}>
        <span>{date}</span>
        <b style={{ color: "var(--ad-ink)", fontWeight: 500 }}>{time} · Florentin shop</b>
      </div>
      <button className="ad-btn ad-btn--sm" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </button>
    </header>
  );
}
