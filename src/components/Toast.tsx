"use client";
import React from "react";
import { useUIStore } from "../hooks/useUIStore";

export default function Toast() {
  const toast = useUIStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="fs-toast" key={toast.ts}>
      <span className="fs-toast-dot" /> {toast.msg}
    </div>
  );
}
