"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "../hooks/useCartStore";
import { useUIStore } from "../hooks/useUIStore";

export default function NavIcons() {
  const router = useRouter();
  const { data: session } = useSession();
  const counter = useCartStore((s) => s.counter);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleProfile = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setProfileOpen((s) => !s);
  };

  return (
    <>
      <button className="fs-icon-btn hidden lg:inline-flex" aria-label="Account" onClick={handleProfile}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="7" r="3.2" />
          <path d="M3.5 17a6.5 6.5 0 0 1 13 0" />
        </svg>
      </button>
      {profileOpen && session && (
        <div className="absolute right-12 top-14 z-30 bg-bg-card border border-[var(--fs-line)] rounded-lg shadow-lg p-3 text-sm flex flex-col gap-2 min-w-[180px]">
          <div className="text-xs text-ink-mute pb-2 mb-1 border-b border-[var(--fs-line-soft)]">
            Signed in as <b className="text-ink">{session.user.email}</b>
          </div>
          <button className="text-left" onClick={() => { setProfileOpen(false); router.push("/account"); }}>
            Account
          </button>
          <button className="text-left" onClick={() => { setProfileOpen(false); router.push("/account/orders"); }}>
            Orders
          </button>
          {(session.user.role === "STAFF" || session.user.role === "OWNER") && (
            <button className="text-left text-accent" onClick={() => { setProfileOpen(false); router.push("/admin"); }}>
              Open admin →
            </button>
          )}
          <button className="text-left text-ink-mute" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      )}
      <button className="fs-icon-btn fs-cart-btn" onClick={() => setCartOpen(true)} aria-label="Basket">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h12l-1.2 8.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6L4 6Z" />
          <path d="M7 6V4.5a3 3 0 0 1 6 0V6" />
        </svg>
        {counter > 0 && <span className="fs-cart-badge">{counter}</span>}
      </button>
    </>
  );
}
