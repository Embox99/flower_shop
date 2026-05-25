"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const flow = ["NEW", "TYING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderActions({
  id, status, paymentStatus,
}: {
  id: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const patch = async (body: any) => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Could not update");
      return;
    }
    start(() => router.refresh());
  };

  const nextIdx = flow.indexOf(status);
  const nextStatus = nextIdx >= 0 && nextIdx < flow.length - 1 ? flow[nextIdx + 1] : null;

  return (
    <div className="ad-card" style={{ padding: "12px 18px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {nextStatus && (
        <button className="ad-btn ad-btn--dark" disabled={busy || pending} onClick={() => patch({ status: nextStatus })}>
          → Move to {nextStatus.replace(/_/g, " ").toLowerCase()}
        </button>
      )}
      {paymentStatus !== "PAID" && (
        <button className="ad-btn" disabled={busy || pending} onClick={() => patch({ paymentStatus: "PAID" })}>
          Mark as paid
        </button>
      )}
      {paymentStatus === "PAID" && status !== "DELIVERED" && (
        <button className="ad-btn ad-btn--danger" disabled={busy || pending}
          onClick={() => { if (confirm("Refund and cancel this order?")) patch({ status: "CANCELED", paymentStatus: "REFUNDED" }); }}>
          Refund & cancel
        </button>
      )}
      <div style={{ flex: 1, display: "flex", gap: 6 }}>
        <input
          className="ad-input"
          placeholder="Add an internal note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="ad-btn ad-btn--sm" disabled={!note || busy || pending}
          onClick={() => { patch({ note }); setNote(""); }}>
          Post
        </button>
      </div>
    </div>
  );
}
