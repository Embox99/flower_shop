"use client";
import React, { useEffect } from "react";
import { useCartStore } from "./useCartStore";

/**
 * Mount once at the top of the layout — kicks off /api/cart on first load.
 * Replaces the Wix-context wiring.
 */
export default function CartBoot() {
  const fetchCart = useCartStore((s) => s.fetchCart);
  useEffect(() => { fetchCart(); }, [fetchCart]);
  return null;
}
