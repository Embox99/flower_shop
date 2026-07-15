"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Image = { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number };

export default function ImagesEditor({ productId, images }: { productId: string; images: Image[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const signRes = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: file.type, prefix: `products/${productId}` }),
      });
      if (!signRes.ok) throw new Error((await signRes.json().catch(() => ({}))).error || "Could not sign upload");
      const { uploadUrl, publicUrl } = await signRes.json();

      const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      const attachRes = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
      });
      if (!attachRes.ok) throw new Error((await attachRes.json().catch(() => ({}))).error || "Could not save image");

      router.refresh();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const setPrimary = async (imageId: string) => {
    setBusyId(imageId);
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    setBusyId(null);
    router.refresh();
  };

  const remove = async (imageId: string) => {
    if (!confirm("Remove this photo?")) return;
    setBusyId(imageId);
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div>
      {error && (
        <div style={{ background: "#fde9e6", color: "#8a3520", border: "1px solid #f0c6c0", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: 12 }}>
          {error}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10, marginBottom: 12 }}>
        {images.map((img) => (
          <div key={img.id} style={{ position: "relative", border: "1px solid var(--ad-line)", borderRadius: 8, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt || ""} style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }} />
            {img.isPrimary && (
              <span style={{
                position: "absolute", top: 4, left: 4, fontSize: 9, fontWeight: 600,
                background: "var(--ad-ink)", color: "var(--ad-bg-card)", padding: "2px 6px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                Primary
              </span>
            )}
            <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--ad-bg-card)" }}>
              {!img.isPrimary && (
                <button
                  className="ad-btn ad-btn--sm"
                  style={{ flex: 1, padding: "3px 6px", fontSize: 10 }}
                  disabled={busyId === img.id}
                  onClick={() => setPrimary(img.id)}
                >
                  Set primary
                </button>
              )}
              <button
                className="ad-btn ad-btn--sm ad-btn--danger"
                style={{ padding: "3px 6px", fontSize: 10 }}
                disabled={busyId === img.id}
                onClick={() => remove(img.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
      <button
        type="button"
        className="ad-btn ad-btn--sm"
        disabled={uploading}
        onClick={() => fileInput.current?.click()}
      >
        {uploading ? "Uploading…" : "Add photo"}
      </button>
    </div>
  );
}
