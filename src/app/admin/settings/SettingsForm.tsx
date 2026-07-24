"use client";
/**
 * Editable shop settings — opening hours + same-day delivery windows.
 * Saves through PATCH /api/admin/settings, then refreshes the RSC tree.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

type Day = { open?: string; close?: string; on: boolean };
type Hours = Record<string, Day>;
type Delivery = { sameDayCutoff: string; lastSlot: string; windows: string[]; feeCents?: number };

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function SettingsForm({
  initialHours,
  initialDelivery,
}: {
  initialHours: Hours;
  initialDelivery: Delivery;
}) {
  const router = useRouter();
  const [hours, setHours] = useState<Hours>(() =>
    Object.fromEntries(DAYS.map((d) => [d, { open: "", close: "", on: false, ...initialHours[d] }]))
  );
  const [delivery, setDelivery] = useState<Delivery>({
    sameDayCutoff: initialDelivery.sameDayCutoff || "12:00",
    lastSlot: initialDelivery.lastSlot || "18:00",
    windows: initialDelivery.windows || [],
    feeCents: initialDelivery.feeCents,
  });
  const [newWindow, setNewWindow] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function setDay(day: string, patch: Partial<Day>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hours, delivery }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setMsg({ kind: "ok", text: "Saved." });
      router.refresh();
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="ad-form-section">
        <h3>Opening hours</h3>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr auto", gap: 10, alignItems: "center" }}>
          {DAYS.map((day) => (
            <div key={day} style={{ display: "contents" }}>
              <span style={{ fontSize: 13, textTransform: "capitalize" }}>{day}</span>
              <input
                className="ad-input"
                value={hours[day].open || ""}
                placeholder="08:00"
                disabled={!hours[day].on}
                onChange={(e) => setDay(day, { open: e.target.value })}
              />
              <input
                className="ad-input"
                value={hours[day].close || ""}
                placeholder="19:00"
                disabled={!hours[day].on}
                onChange={(e) => setDay(day, { close: e.target.value })}
              />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ad-ink-mute)" }}>
                <input
                  type="checkbox"
                  checked={hours[day].on}
                  onChange={(e) => setDay(day, { on: e.target.checked })}
                />{" "}
                open
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="ad-form-section">
        <h3>Same-day delivery</h3>
        <div className="ad-form-row-2">
          <div className="ad-form-row" style={{ marginBottom: 0 }}>
            <label>Order before</label>
            <input
              className="ad-input"
              value={delivery.sameDayCutoff}
              onChange={(e) => setDelivery((d) => ({ ...d, sameDayCutoff: e.target.value }))}
            />
          </div>
          <div className="ad-form-row" style={{ marginBottom: 0 }}>
            <label>Last slot</label>
            <input
              className="ad-input"
              value={delivery.lastSlot}
              onChange={(e) => setDelivery((d) => ({ ...d, lastSlot: e.target.value }))}
            />
          </div>
        </div>

        <div className="ad-form-row" style={{ marginTop: 14 }}>
          <label>Delivery fee (cents)</label>
          <input
            className="ad-input"
            type="number"
            min={0}
            value={delivery.feeCents ?? ""}
            placeholder="600"
            onChange={(e) =>
              setDelivery((d) => ({ ...d, feeCents: e.target.value === "" ? undefined : Number(e.target.value) }))
            }
          />
        </div>

        <div className="ad-form-row" style={{ marginTop: 14 }}>
          <label>Delivery windows</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {delivery.windows.map((s, i) => (
              <span key={i} className="ad-pill ad-pill--ready" style={{ padding: "5px 10px", fontSize: 11, display: "inline-flex", gap: 6, alignItems: "center" }}>
                {s}
                <button
                  type="button"
                  aria-label={`Remove ${s}`}
                  onClick={() => setDelivery((d) => ({ ...d, windows: d.windows.filter((_, j) => j !== i) }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 13, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className="ad-input"
              style={{ width: 120 }}
              placeholder="Add window…"
              value={newWindow}
              onChange={(e) => setNewWindow(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = newWindow.trim();
                  if (v) setDelivery((d) => ({ ...d, windows: [...d.windows, v] }));
                  setNewWindow("");
                }
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
        <button className="ad-btn ad-btn--dark" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {msg && (
          <span style={{ fontSize: 13, color: msg.kind === "ok" ? "var(--ad-ok)" : "var(--ad-warn)" }}>
            {msg.text}
          </span>
        )}
      </div>
    </>
  );
}
