"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  label: string;
  sku: string;
  stems: number | null;
  priceDelta: number;
  stockQty: number;
};

function Row({ productId, variant }: { productId: string; variant: Variant }) {
  const router = useRouter();
  const [stockQty, setStockQty] = useState(String(variant.stockQty));
  const [priceDelta, setPriceDelta] = useState((variant.priceDelta / 100).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    Number(stockQty) !== variant.stockQty ||
    Math.round(parseFloat(priceDelta || "0") * 100) !== variant.priceDelta;

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stockQty: Math.max(0, Math.round(Number(stockQty) || 0)),
        priceDelta: Math.round(parseFloat(priceDelta || "0") * 100),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setError(e.error || "Save failed");
      return;
    }
    router.refresh();
  };

  return (
    <tr>
      <td>{variant.label}</td>
      <td><span className="ad-table-id">{variant.sku}</span></td>
      <td>{variant.stems || "—"}</td>
      <td>
        <input
          className="ad-input"
          style={{ width: 80, padding: "5px 8px", fontFamily: "var(--font-mono), monospace" }}
          type="number" step="0.01"
          value={priceDelta}
          onChange={(e) => setPriceDelta(e.target.value)}
        />
      </td>
      <td>
        <input
          className="ad-input"
          style={{ width: 64, padding: "5px 8px", fontFamily: "var(--font-mono), monospace" }}
          type="number" min={0} step={1}
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
        />
      </td>
      <td>
        <button
          className="ad-btn ad-btn--sm"
          disabled={!dirty || saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {error && <span style={{ color: "var(--ad-warn)", fontSize: 11, marginLeft: 8 }}>{error}</span>}
      </td>
    </tr>
  );
}

export default function VariantsEditor({ productId, variants }: { productId: string; variants: Variant[] }) {
  return (
    <table className="ad-table" style={{ fontSize: 12 }}>
      <thead>
        <tr>
          <th>Label</th><th>SKU</th><th>Stems</th><th>Δ price</th><th>Stock</th><th></th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => <Row key={v.id} productId={productId} variant={v} />)}
      </tbody>
    </table>
  );
}
