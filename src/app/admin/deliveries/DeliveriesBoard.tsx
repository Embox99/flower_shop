"use client";
/**
 * Today's fulfilment board. Cards drag between columns; dropping one PATCHes the
 * order's status via /api/admin/orders/[id]. Optimistic move, reverts on error.
 * Clicking a card (without dragging) opens the order.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

type Status = "NEW" | "TYING" | "READY" | "OUT_FOR_DELIVERY";

export type BoardOrder = {
  id: string;
  code: string;
  status: Status;
  deliveryWindow: string | null;
  recipientName: string | null;
  city: string | null;
  total: number;
};

const COLUMNS: { key: Status; label: string; dot: string }[] = [
  { key: "NEW", label: "New", dot: "var(--ad-tan)" },
  { key: "TYING", label: "Tying", dot: "var(--ad-accent)" },
  { key: "READY", label: "Ready · awaiting van", dot: "var(--ad-sage)" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", dot: "var(--ad-ok)" },
];

function group(orders: BoardOrder[]): Record<Status, BoardOrder[]> {
  const g: Record<Status, BoardOrder[]> = { NEW: [], TYING: [], READY: [], OUT_FOR_DELIVERY: [] };
  for (const o of orders) if (g[o.status]) g[o.status].push(o);
  return g;
}

export default function DeliveriesBoard({ orders }: { orders: BoardOrder[] }) {
  const router = useRouter();
  const [board, setBoard] = useState<Record<Status, BoardOrder[]>>(() => group(orders));
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(id: string, to: Status) {
    const from = (Object.keys(board) as Status[]).find((k) => board[k].some((o) => o.id === id));
    if (!from || from === to) return;

    const card = board[from].find((o) => o.id === id)!;
    const prev = board;
    // Optimistic move.
    setBoard((b) => ({
      ...b,
      [from]: b[from].filter((o) => o.id !== id),
      [to]: [{ ...card, status: to }, ...b[to]],
    }));
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e: any) {
      setBoard(prev); // revert
      setError(`Couldn't move ${card.code}: ${e.message}`);
    }
  }

  return (
    <>
      {error && (
        <div style={{ color: "var(--ad-warn)", fontSize: 13, marginBottom: 10 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, alignItems: "flex-start" }}>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setOver(col.key); }}
            onDragLeave={() => setOver((o) => (o === col.key ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              if (dragId) move(dragId, col.key);
              setDragId(null);
            }}
            style={{
              background: "var(--ad-bg-card)",
              border: over === col.key ? "1px solid var(--ad-accent)" : "1px solid var(--ad-line)",
              borderRadius: 10, padding: 14, minHeight: 320,
              transition: "border-color 0.12s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 8px", borderBottom: "1px solid var(--ad-line-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }} />
                {col.label}
              </div>
              <span style={{
                fontFamily: "var(--font-mono), monospace", fontSize: 10,
                background: "var(--ad-bg-soft)", color: "var(--ad-ink-mute)",
                padding: "2px 7px", borderRadius: 999,
              }}>{board[col.key].length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {board[col.key].length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ad-ink-mute)", padding: 12, textAlign: "center" }}>—</div>
              ) : board[col.key].map((o) => (
                <div
                  key={o.id}
                  draggable
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => { setDragId(null); setOver(null); }}
                  onClick={() => router.push(`/admin/orders/${o.code}`)}
                  style={{
                    background: "var(--ad-bg-card)",
                    border: "1px solid var(--ad-line)",
                    borderRadius: 8, padding: "10px 12px",
                    color: "inherit", cursor: "grab",
                    opacity: dragId === o.id ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--ad-ink-mute)" }}>{o.code}</span>
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "var(--ad-bg-soft)" }}>
                      {o.deliveryWindow || "—"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{o.recipientName || "Guest"}</div>
                  <div style={{ fontSize: 11, color: "var(--ad-ink-mute)" }}>
                    {o.city || ""} · <span style={{ fontFamily: "var(--font-mono), monospace" }}>{fmt(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
