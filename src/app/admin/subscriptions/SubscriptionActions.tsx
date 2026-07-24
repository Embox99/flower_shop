"use client";
/**
 * Row actions for a subscription: pause, resume, cancel.
 * Mutations go through PATCH /api/admin/subscriptions/[id], then refresh.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(next: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "CANCELED") {
    return <span style={{ fontSize: 11, color: "var(--ad-ink-mute)" }}>—</span>;
  }

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
      {error && <span style={{ color: "var(--ad-warn)", fontSize: 11 }}>{error}</span>}
      {status === "ACTIVE" && (
        <button className="ad-btn ad-btn--sm" disabled={busy} onClick={() => patch("PAUSED")}>
          Pause
        </button>
      )}
      {status === "PAUSED" && (
        <button className="ad-btn ad-btn--sm" disabled={busy} onClick={() => patch("ACTIVE")}>
          Resume
        </button>
      )}
      <button
        className="ad-btn ad-btn--sm ad-btn--danger"
        disabled={busy}
        onClick={() => {
          if (confirm("Cancel this subscription? This can't be undone.")) patch("CANCELED");
        }}
      >
        Cancel
      </button>
    </div>
  );
}
