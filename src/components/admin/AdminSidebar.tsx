"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FlowerShopMark from "../FlowerShopMark";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useUIStore } from "../../hooks/useUIStore";

const items = [
  { href: "/admin",            label: "Dashboard",  icon: "dashboard" },
  { href: "/admin/orders",     label: "Orders",     icon: "orders"    },
  { href: "/admin/deliveries", label: "Today's deliveries", icon: "deliveries" },
  { section: "Catalog" },
  { href: "/admin/products",   label: "Products",   icon: "products"  },
  { section: "Commerce" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "subs" },
  { href: "/admin/customers",  label: "Customers",  icon: "customers" },
  { section: "Analyse" },
  { href: "/admin/settings",   label: "Settings",   icon: "settings", ownerOnly: true },
] as const;

const ICONS: Record<string, React.ReactNode> = {
  dashboard:  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="8" rx="1"/><rect x="11" y="3" width="6" height="4" rx="1"/><rect x="3" y="13" width="6" height="4" rx="1"/><rect x="11" y="9" width="6" height="8" rx="1"/></svg>,
  orders:     <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h12l-1 9a2 2 0 0 1-2 1.8H7a2 2 0 0 1-2-1.8L4 6Z"/><path d="M7 6V4.5a3 3 0 0 1 6 0V6"/></svg>,
  deliveries: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7h10v8H2zM12 10h4l2 2v3h-6"/><circle cx="6" cy="16" r="1.5"/><circle cx="14" cy="16" r="1.5"/></svg>,
  products:   <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7l7-4 7 4v6l-7 4-7-4V7Z"/><path d="M3 7l7 4 7-4M10 11v6"/></svg>,
  customers:  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="7" r="3"/><path d="M3 17a7 7 0 0 1 14 0"/></svg>,
  subs:       <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10a7 7 0 0 1 12-5l1 1"/><path d="M16 4v3h-3"/><path d="M17 10a7 7 0 0 1-12 5l-1-1"/><path d="M4 16v-3h3"/></svg>,
  settings:   <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4 4l1.5 1.5M14.5 14.5L16 16M4 16l1.5-1.5M14.5 5.5L16 4"/></svg>,
};

export default function AdminSidebar({ user }: { user: Session["user"] }) {
  const path = usePathname();
  const isActive = (href: string) => href === "/admin" ? path === "/admin" : path.startsWith(href);
  const initials = (user.name || user.email).split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const open = useUIStore((s) => s.adminNavOpen);
  const setOpen = useUIStore((s) => s.setAdminNavOpen);

  // On small screens the sidebar is a drawer: close it after navigating,
  // and on Escape while open.
  useEffect(() => { setOpen(false); }, [path, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
    {open && <div className="ad-sidebar-scrim" onClick={() => setOpen(false)} />}
    <aside id="ad-sidebar" className={"ad-sidebar" + (open ? " ad-sidebar--open" : "")}>
      <div className="ad-sidebar-brand">
        <FlowerShopMark size={28} color="#f4ead8" />
        <span className="ad-sidebar-brand-word">Flower Shop</span>
        <span className="ad-sidebar-brand-sub">studio</span>
      </div>
      <nav className="ad-nav">
        {items.map((it, i) => {
          if ("section" in it) return <div key={i} className="ad-nav-section">{it.section}</div>;
          if ("ownerOnly" in it && it.ownerOnly && user.role !== "OWNER") return null;
          return (
            <Link key={it.href} href={it.href} className={"ad-nav-item" + (isActive(it.href) ? " ad-nav-item--on" : "")}>
              {ICONS[it.icon]}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/" className="ad-nav-item ad-nav-store">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 3h6v6M17 3l-8 8M14 12v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/></svg>
        <span>View storefront</span>
      </Link>
      <div className="ad-sidebar-user">
        <div className="ad-sidebar-user-avatar">{initials}</div>
        <div className="ad-sidebar-user-text">
          <div className="ad-sidebar-user-name">{user.name || user.email}</div>
          <div className="ad-sidebar-user-role">{user.role.toLowerCase()}</div>
        </div>
        <button className="ad-sidebar-signout" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" title="Sign out">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 4H4v12h4M13 6l4 4-4 4M17 10H8"/></svg>
        </button>
      </div>
    </aside>
    </>
  );
}
