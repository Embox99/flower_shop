"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "../../../../components/admin/StatusPill";

type Category = { id: string; name: string; slug: string };
type Product = any;

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const isNew = !product;

  const [form, setForm] = useState({
    slug: product?.slug || "",
    sku: product?.sku || "",
    name: product?.name || "",
    shortDesc: product?.shortDesc || "",
    longDesc: product?.longDesc || "",
    badge: product?.badge || "",
    categoryId: product?.categoryId || (categories[0]?.id ?? ""),
    basePrice: ((product?.basePrice ?? 0) / 100).toFixed(2),
    comparePrice: product?.comparePrice ? (product.comparePrice / 100).toFixed(2) : "",
    palette: (product?.palette as string[] | undefined)?.join(",") || "#e8c8b9,#f7d76b,#9bb38a,#f5b8c4",
    height: product?.height || "",
    vase:   product?.vase || "",
    status: product?.status || "DRAFT",
  });
  const set = (k: keyof typeof form) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true); setError("");
    const body = {
      ...form,
      basePrice: Math.round(parseFloat(form.basePrice || "0") * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : null,
      palette: form.palette.split(",").map(s => s.trim()).filter(Boolean),
    };
    const res = await fetch(
      isNew ? "/api/admin/products" : `/api/admin/products/${product.id}`,
      { method: isNew ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body) }
    );
    setSaving(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setError(e.error || "Save failed");
      return;
    }
    if (isNew) {
      const data = await res.json();
      router.push(`/admin/products/${data.product.slug || data.product.id}`);
    } else {
      router.refresh();
    }
  };

  const remove = async () => {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    setSaving(true);
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
  };

  return (
    <>
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">{isNew ? "New" : "Editing"}</span>
          <h1 className="ad-h1">{form.name || "Untitled product"}</h1>
          {!isNew && <p className="ad-h1-sub">SKU <b>{form.sku}</b> · /{form.slug}</p>}
        </div>
        <div className="ad-actions">
          <StatusPill status={form.status} />
          {!isNew && <button className="ad-btn ad-btn--danger" onClick={remove} disabled={saving}>Archive</button>}
          <button className="ad-btn ad-btn--dark" onClick={save} disabled={saving}>
            {saving ? "Saving…" : (isNew ? "Create" : "Save changes")}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fde9e6", color: "#8a3520", border: "1px solid #f0c6c0", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div>
          <div className="ad-form-section">
            <h3>Basics</h3>
            <div className="ad-form-row">
              <label>Display name</label>
              <input value={form.name} onChange={set("name")} placeholder="Midsummer Meadow" />
            </div>
            <div className="ad-form-row-2">
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Slug</label>
                <input value={form.slug} onChange={set("slug")} placeholder="midsummer-meadow" />
              </div>
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>SKU</label>
                <input value={form.sku} onChange={set("sku")} placeholder="MM-STD-001" />
              </div>
            </div>
            <div className="ad-form-row">
              <label>Short description</label>
              <textarea rows={2} value={form.shortDesc} onChange={set("shortDesc")} />
            </div>
            <div className="ad-form-row">
              <label>Long description</label>
              <textarea rows={4} value={form.longDesc} onChange={set("longDesc")} />
            </div>
            <div className="ad-form-row-2">
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Category</label>
                <select value={form.categoryId} onChange={set("categoryId")}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Badge</label>
                <select value={form.badge} onChange={set("badge")}>
                  <option value="">—</option>
                  <option>Bestseller</option><option>New</option><option>Limited</option><option>Pair</option>
                </select>
              </div>
            </div>
            <div className="ad-form-row">
              <label>Palette (comma-separated hex)</label>
              <input value={form.palette} onChange={set("palette")} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {form.palette.split(",").map((s, i) => (
                  <span key={i} style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: s.trim(), border: "1px solid var(--ad-line)",
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="ad-form-section">
            <h3>Pricing & status</h3>
            <div className="ad-form-row">
              <label>Status</label>
              <select value={form.status} onChange={set("status")}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="ad-form-row-2">
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Price (USD)</label>
                <input type="number" step="0.01" value={form.basePrice} onChange={set("basePrice")} />
              </div>
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Compare-at</label>
                <input type="number" step="0.01" value={form.comparePrice} onChange={set("comparePrice")} placeholder="—"/>
              </div>
            </div>
            <div className="ad-form-row-2">
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Height</label>
                <input value={form.height} onChange={set("height")} placeholder="42 cm" />
              </div>
              <div className="ad-form-row" style={{ marginBottom: 0 }}>
                <label>Vase</label>
                <input value={form.vase} onChange={set("vase")} placeholder="Wide-mouth" />
              </div>
            </div>
          </div>

          {product?.variants?.length > 0 && (
            <div className="ad-form-section">
              <h3>Variants ({product.variants.length})</h3>
              <table className="ad-table" style={{ fontSize: 12 }}>
                <thead><tr><th>Label</th><th>SKU</th><th>Stems</th><th>Δ price</th><th>Stock</th></tr></thead>
                <tbody>
                  {product.variants.map((v: any) => (
                    <tr key={v.id}>
                      <td>{v.label}</td>
                      <td><span className="ad-table-id">{v.sku}</span></td>
                      <td>{v.stems || "—"}</td>
                      <td style={{ fontFamily: "var(--font-mono), monospace" }}>
                        {v.priceDelta === 0 ? "—" : v.priceDelta > 0 ? `+$${(v.priceDelta/100).toFixed(0)}` : `−$${(-v.priceDelta/100).toFixed(0)}`}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono), monospace" }}>{v.stockQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: "var(--ad-ink-mute)", marginTop: 8 }}>
                Per-variant editing UI to be wired in the next pass.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
