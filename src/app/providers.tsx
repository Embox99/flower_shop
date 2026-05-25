"use client";
import { SessionProvider } from "next-auth/react";
import CartBoot from "../hooks/CartBoot";

/** Top-level client providers (wraps NextAuth session + cart bootstrap). */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartBoot />
      {children}
    </SessionProvider>
  );
}
