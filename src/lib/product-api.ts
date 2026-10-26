/**
 * Storefront types + server-side fetchers.
 * Client components may `import type` from here; the fetchers lazy-load the
 * Prisma-backed data layer so it never ends up in a client bundle.
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

/**
 * Server-side fetchers. These read the catalogue straight from the shared data
 * layer (lib/catalog) — no HTTP round-trip to our own API.
 */
export async function listProducts(params: Record<string, string | number | undefined> = {}) {
  const { queryProducts, productQueryFromParams } = await import("./catalog");
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") qs.set(k, String(v));
  return queryProducts(productQueryFromParams(qs));
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const { getProductBySlug } = await import("./catalog");
  return getProductBySlug(slug);
}

export async function listCategories(): Promise<{ items: Category[] }> {
  const { listCategories: list } = await import("./catalog");
  return list();
}
