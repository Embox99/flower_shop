"use client";
/**
 * Cart store — talks to our own /api/cart, replaces the Wix one.
 *
 * The server is the source of truth for prices. The store mirrors the latest
 * server response and exposes optimistic helpers.
 */
import { create } from "zustand";

export type CartLine = {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  productSlug: string;
  variantLabel?: string;
  qty: number;
  unitPrice: number; // cents
  total: number;
  palette: string[];
  addVase: boolean;
  giftMessage?: string;
};

export type CartState = {
  cartId: string | null;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  counter: number;
  loading: boolean;

  fetchCart: () => Promise<void>;
  add: (input: { productId: string; variantId?: string | null; qty?: number; addVase?: boolean; giftMessage?: string }) => Promise<void>;
  updateQty: (lineId: string, qty: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
};

async function fetchJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function apply(set: any, data: any) {
  set({
    cartId: data.cartId,
    lines: data.lines,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    total: data.total,
    currency: data.currency,
    counter: data.lines.reduce((s: number, l: CartLine) => s + l.qty, 0),
    loading: false,
  });
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null, lines: [], subtotal: 0, deliveryFee: 0, total: 0, currency: "USD",
  counter: 0, loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try { apply(set, await fetchJSON("/api/cart")); }
    catch { set({ loading: false }); }
  },

  add: async (input) => {
    set({ loading: true });
    apply(set, await fetchJSON("/api/cart", { method: "POST", body: JSON.stringify(input) }));
  },

  updateQty: async (lineId, qty) => {
    set({ loading: true });
    apply(set, await fetchJSON(`/api/cart/items/${lineId}`, {
      method: "PATCH", body: JSON.stringify({ qty }),
    }));
  },

  remove: async (lineId) => {
    set({ loading: true });
    apply(set, await fetchJSON(`/api/cart/items/${lineId}`, { method: "DELETE" }));
  },

  clear: async () => {
    set({ loading: true });
    apply(set, await fetchJSON("/api/cart", { method: "DELETE" }));
  },
}));
