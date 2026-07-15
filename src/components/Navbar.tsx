"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowerShopMark from "./FlowerShopMark";
import NavIcons from "./NavIcons";

type SearchHit = {
  slug: string;
  name: string;
  price: number;
  images: { url: string; isPrimary: boolean }[];
};

const fmtPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

const navLinks = [
  { slug: "bouquets", title: "Bouquets" },
  { slug: "potted-plants-and-orchids", title: "Plants" },
  { slug: "weddings", title: "Weddings" },
  { slug: "letterbox", title: "Letterbox" },
  { slug: "gifts-and-sweets", title: "Gifts" },
];

export default function Navbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();
        setResults(data.items || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  const goToResults = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/list?q=${encodeURIComponent(q)}`);
    closeSearch();
  };

  return (
    <header className="fs-nav">
      <div className="fs-nav-inner">
        <button
          className="fs-icon-btn fs-nav-burger lg:hidden"
          onClick={() => setMobileNav(true)}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>

        <Link href="/" className="fs-logo">
          <FlowerShopMark size={32} />
          <span className="fs-logo-word">Flower&nbsp;Shop</span>
        </Link>

        <nav className="fs-nav-links hidden lg:flex">
          {navLinks.map((n) => (
            <Link key={n.slug} href={`/list?cat=${n.slug}`}>
              {n.title}
            </Link>
          ))}
        </nav>

        <div className="fs-nav-actions">
          <button
            className="fs-icon-btn hidden lg:inline-flex"
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
          </button>
          <NavIcons />
        </div>
      </div>

      {searchOpen && (
        <div className="fs-search-wrap">
          <div className="fs-search">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
            <input
              autoFocus
              placeholder="Search peonies, dried, letterbox…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
                if (e.key === "Enter") goToResults();
              }}
            />
            <button className="fs-search-hint" onClick={closeSearch}>
              esc
            </button>
          </div>

          {query.trim().length >= 2 && (
            <div className="fs-search-results">
              {searching && <div className="fs-search-empty">Searching…</div>}
              {!searching && results.length === 0 && (
                <div className="fs-search-empty">No matches for “{query.trim()}”.</div>
              )}
              {!searching && results.map((p) => {
                const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                return (
                  <Link key={p.slug} href={`/${p.slug}`} className="fs-search-result" onClick={closeSearch}>
                    <span className="fs-search-result-thumb">
                      {img?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt="" />
                      ) : null}
                    </span>
                    <span className="fs-search-result-name">{p.name}</span>
                    <span className="fs-search-result-price">{fmtPrice(p.price)}</span>
                  </Link>
                );
              })}
              {!searching && results.length > 0 && (
                <button className="fs-search-viewall" onClick={goToResults}>
                  See all results for “{query.trim()}”
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {mobileNav && (
        <div className="fs-mobile-nav" onClick={() => setMobileNav(false)}>
          <div className="fs-mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="fs-mobile-nav-head">
              <FlowerShopMark size={28} />
              <button className="fs-icon-btn" onClick={() => setMobileNav(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            {navLinks.map((n) => (
              <Link
                key={n.slug}
                href={`/list?cat=${n.slug}`}
                onClick={() => setMobileNav(false)}
              >
                {n.title}
              </Link>
            ))}
            <div className="fs-mobile-nav-foot">
              <span>Tel Aviv · Florentin 22</span>
              <span>+972 3 555 7777</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
