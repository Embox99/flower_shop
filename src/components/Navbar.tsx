"use client";
import React, { useState } from "react";
import Link from "next/link";
import FlowerShopMark from "./FlowerShopMark";
import NavIcons from "./NavIcons";

const navLinks = [
  { slug: "bouquets", title: "Bouquets" },
  { slug: "potted-plants-and-orchids", title: "Plants" },
  { slug: "weddings", title: "Weddings" },
  { slug: "letterbox", title: "Letterbox" },
  { slug: "gifts-and-sweets", title: "Gifts" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

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
            onClick={() => setSearchOpen((s) => !s)}
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
        <div className="fs-search">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" />
          </svg>
          <input autoFocus placeholder="Search peonies, dried, letterbox…" />
          <button className="fs-search-hint" onClick={() => setSearchOpen(false)}>
            esc
          </button>
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
