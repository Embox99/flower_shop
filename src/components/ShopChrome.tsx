"use client";
import React from "react";
import { usePathname } from "next/navigation";

/**
 * Wraps pages in the storefront chrome (banner, nav, footer, basket drawer).
 * The admin has its own shell, so under /admin only the page itself renders.
 * The chrome pieces arrive as props so server components (the footer) stay
 * server-rendered.
 */
export default function ShopChrome({
  top,
  bottom,
  children,
}: {
  top: React.ReactNode;
  bottom: React.ReactNode;
  children: React.ReactNode;
}) {
  const isAdmin = usePathname()?.startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <a href="#main" className="fs-skip-link">Skip to content</a>
      {top}
      <div id="main">{children}</div>
      {bottom}
    </>
  );
}
