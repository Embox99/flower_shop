"use client";
/**
 * Customer address book — list, add, edit, delete, and pick a default.
 * All mutations hit /api/account/addresses and then refresh the RSC tree.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Address = {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  zip?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

type FormState = {
  label: string; line1: string; line2: string;
  city: string; zip: string; phone: string; isDefault: boolean;
};

const EMPTY: FormState = { label: "", line1: "", line2: "", city: "", zip: "", phone: "", isDefault: false };

function toForm(a: Address): FormState {
  return {
    label: a.label || "", line1: a.line1, line2: a.line2 || "",
    city: a.city, zip: a.zip || "", phone: a.phone || "", isDefault: a.isDefault,
  };
}

export default function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === "isDefault" ? e.target.checked : e.target.value }));

  function openNew() { setForm(EMPTY); setError(null); setEditing("new"); }
  function openEdit(a: Address) { setForm(toForm(a)); setError(null); setEditing(a.id); }
  function cancel() { setEditing(null); setError(null); }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const body = {
        label: form.label || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        zip: form.zip || undefined,
        phone: form.phone || undefined,
        isDefault: form.isDefault,
      };
      const url = editing === "new" ? "/api/account/addresses" : `/api/account/addresses/${editing}`;
      const res = await fetch(url, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setEditing(null);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function mutate(id: string, method: "PATCH" | "DELETE", body?: any) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
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

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      {addresses.length === 0 && editing !== "new" && (
        <p className="text-ink-mute">No saved addresses yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id}>{renderForm()}</li>
          ) : (
            <li key={a.id} className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-5 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif text-lg">{a.label || "Address"}</span>
                  {a.isDefault && <span className="text-[10px] uppercase tracking-wider font-mono bg-ink text-bg px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <div className="text-sm text-ink-soft">
                  {[a.line1, a.line2, a.city, a.zip].filter(Boolean).join(", ")}
                </div>
                {a.phone && <div className="text-sm text-ink-mute mt-1">{a.phone}</div>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {!a.isDefault && (
                  <button className="fs-link-btn" disabled={busy} onClick={() => mutate(a.id, "PATCH", { isDefault: true })}>
                    Make default
                  </button>
                )}
                <button className="fs-link-btn" disabled={busy} onClick={() => openEdit(a)}>Edit</button>
                <button
                  className="fs-link-btn text-red-700"
                  disabled={busy}
                  onClick={() => { if (confirm("Delete this address?")) mutate(a.id, "DELETE"); }}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {editing === "new" ? (
        renderForm()
      ) : (
        <button className="fs-btn fs-btn--ghost self-start" onClick={openNew} disabled={busy}>
          + Add address
        </button>
      )}
    </div>
  );

  function renderForm() {
    return (
      <div className="bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-5">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm"><span className="text-ink-mute">Label</span>
            <input className="fs-input" value={form.label} onChange={set("label")} placeholder="Home, Mum…" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="text-ink-mute">Phone</span>
            <input className="fs-input" value={form.phone} onChange={set("phone")} placeholder="+972…" /></label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2"><span className="text-ink-mute">Street and number</span>
            <input className="fs-input" value={form.line1} onChange={set("line1")} /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="text-ink-mute">Apt / floor</span>
            <input className="fs-input" value={form.line2} onChange={set("line2")} /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="text-ink-mute">City</span>
            <input className="fs-input" value={form.city} onChange={set("city")} /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="text-ink-mute">Zip</span>
            <input className="fs-input" value={form.zip} onChange={set("zip")} /></label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} />
            <span>Default delivery address</span>
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="fs-btn fs-btn--dark" disabled={busy || !form.line1 || !form.city} onClick={save}>
            {busy ? "Saving…" : "Save address"}
          </button>
          <button className="fs-btn fs-btn--ghost" disabled={busy} onClick={cancel}>Cancel</button>
        </div>
      </div>
    );
  }
}
