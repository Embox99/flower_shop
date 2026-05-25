"use client";
import { create } from "zustand";

type Toast = { msg: string; ts: number } | null;

type UIState = {
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  toast: Toast;
  showToast: (msg: string) => void;
  clearToast: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  toast: null,
  showToast: (msg) => {
    const ts = Date.now();
    set({ toast: { msg, ts } });
    setTimeout(() => {
      set((s) => (s.toast?.ts === ts ? { toast: null } : s));
    }, 2200);
  },
  clearToast: () => set({ toast: null }),
}));
