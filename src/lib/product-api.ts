/**
 * Server-side fetchers + types for our own API.
 * These are import-free (no `'use client'`) so server components can call them.
 */

export type ProductSummary = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  badge?: string | null;
  price: number;
  comparePrice?: number | null;
  currency: string;
  palette: string[];
  height?: string | null;
  vase?: string | null;
  category?: { slug: string; name: string } | null;
  images: { id: string; url: string; alt?: string | null; isPrimary: boolean }[];
  inStock: boolean;
};

export type ProductDetail = ProductSummary & {
  variants: { id: string; label: string; sku: string; stems?: number | null; priceDelta: number; inStock: boolean }[];
  composition: { name: string; qty: number; swatchHex?: string | null }[];
};

export type Category = {
  id: string; slug: string; name: string; subtitle?: string | null;
  hue?: string | null; image?: string | null; productCount: number;
};

const base = process.env.APP_URL || "http://localhost:3000";

export async function listProducts(params: Record<string, string | number | undefined> = {}): Promise<{ items: ProductSummary[]; total: number; page: number; limit: number; hasMore: boolean; }> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") qs.set(k, String(v));
  const res = await fetch(`${base}/api/products?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json();
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${base}/api/products/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load product: ${res.status}`);
  return res.json();
}

export async function listCategories(): Promise<{ items: Category[] }> {
  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load categories: ${res.status}`);
  return res.json();
}
