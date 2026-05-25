"use client";
import React from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

export default function AdminTopbar({ user }: { user: Session["user"] }) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <header className="ad-topbar">
      <div style={{
        flex: 1, maxWidth: 420,
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 12px",
        background: "var(--ad-bg-card)",
        border: "1px solid var(--ad-line)", borderRadius: 8,
        color: "var(--ad-ink-mute)",
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/>
        </svg>
        <input
          placeholder="Search orders, products, customers…"
          style={{ flex: 1, border: "none", background: "transparent", color: "var(--ad-ink)", outline: "none" }}
        />
        <span style={{
          fontFamily: "var(--font-mono), monospace", fontSize: 10,
          padding: "2px 5px", border: "1px solid var(--ad-line)",
          borderRadius: 4, color: "var(--ad-ink-mute)",
        }}>⌘K</span>
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
