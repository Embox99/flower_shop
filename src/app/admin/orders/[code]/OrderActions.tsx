"use client";
/**
 * Order controls: advance the fulfilment status, mark payment, cancel, add notes.
 * All mutations go through PATCH /api/admin/orders/[id], then refresh the RSC tree.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_STEP: Record<string, { to: string; label: string }> = {
  NEW: { to: "TYING", label: "Start tying" },
  TYING: { to: "READY", label: "Mark ready" },
  READY: { to: "OUT_FOR_DELIVERY", label: "Send out" },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: "Mark delivered" },
};

function usePatch(orderId: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      router.refresh();
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { patch, busy, error };
}

export default function OrderActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const { patch, busy, error } = usePatch(orderId);
  const next = NEXT_STEP[status];
  const open = status !== "DELIVERED" && status !== "CANCELED";

  return (
    <div className="ad-actions">
      {error && (
        <span style={{ color: "var(--ad-warn)", fontSize: 12 }}>{error}</span>
      )}
      {paymentStatus === "PENDING" && (
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => patch({ paymentStatus: "PAID" })}
        >
          Mark paid
        </button>
      )}
      {paymentStatus === "PAID" && status === "CANCELED" && (
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => patch({ paymentStatus: "REFUNDED" })}
        >
          Refund
        </button>
      )}
      {open && next && (
        <button
          className="ad-btn ad-btn--dark"
          disabled={busy}
          onClick={() => patch({ status: next.to })}
        >
          {next.label}
        </button>
      )}
      {open && (
        <button
          className="ad-btn ad-btn--danger"
          disabled={busy}
          onClick={() => {
            if (confirm("Cancel this order? Tracked stock goes back on the shelf.")) {
              patch({ status: "CANCELED" });
            }
          }}
        >
          Cancel order
        </button>
      )}
    </div>
  );
}

export function NoteForm({ orderId }: { orderId: string }) {
  const { patch, busy, error } = usePatch(orderId);
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        if (await patch({ note: note.trim() })) setNote("");
      }}
      style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
    >
      <input
        className="ad-input"
        style={{ flex: 1 }}
        placeholder="Internal note — visible to staff only"
        value={note}
        maxLength={500}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="ad-btn ad-btn--sm" disabled={busy || !note.trim()}>
        Add note
      </button>
      {error && (
        <span style={{ color: "var(--ad-warn)", fontSize: 12 }}>{error}</span>
      )}
    </form>
  );
}
