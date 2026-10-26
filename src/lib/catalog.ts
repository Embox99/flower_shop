/**
 * Storefront catalogue queries — the single data layer shared by the public
 * API routes and server components.
 *
 * Server components call these directly instead of fetching our own
 * /api/* over HTTP: no extra network hop, no dependency on APP_URL being
 * reachable, and results are cached across requests via the "catalog" tag.
 * Anything that changes products, stock or categories must call
 * `invalidateCatalog()`.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "./prisma";
import { toPublicProduct } from "./serializers";
import { paletteMatchesColor } from "./color";
import type { Category, ProductDetail, ProductSummary } from "./product-api";

export const CATALOG_TAG = "catalog";
const REVALIDATE_SEC = 300;

export function invalidateCatalog() {
  revalidateTag(CATALOG_TAG);
}

const STEM_RANGES: Record<string, { gte: number; lte: number }> = {
  posy: { gte: 8, lte: 14 },
  everyday: { gte: 16, lte: 24 },
  statement: { gte: 26, lte: 36 },
  event: { gte: 40, lte: 100000 },
};

const DELIVER_LEAD: Record<string, string> = {
  today: "SAME_DAY",
  tomorrow: "NEXT_DAY",
};

const listInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { select: { stockQty: true } },
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: string;
  color?: string;
  stems?: string;
  deliver?: string;
};

export type ProductPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

async function _queryProducts(query: ProductQuery): Promise<ProductPage> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 12));
  const skip = (page - 1) * limit;
  // The storefront only ever sees live products; drafts and archived items
  // are admin-only (see /api/admin/products).
  const where: any = {
    status: "ACTIVE",
    basePrice: { gte: query.min || 0, lte: query.max || 999999999 },
  };
  if (query.q) where.name = { contains: query.q, mode: "insensitive" };
  if (query.category) where.category = { slug: query.category };
  if (query.stems && STEM_RANGES[query.stems]) where.variants = { some: { stems: STEM_RANGES[query.stems] } };
  if (query.deliver && DELIVER_LEAD[query.deliver]) where.leadTime = DELIVER_LEAD[query.deliver];

  const sort = query.sort || "newest";
  const orderBy: any =
    sort === "price-asc"  ? { basePrice: "asc" }  :
    sort === "price-desc" ? { basePrice: "desc" } :
    sort === "bestseller" ? { totalSold: "desc" } :
                            { createdAt: "desc" };

  // Colour lives in a JSON palette column, so it can't be filtered in SQL.
  // When a colour is requested we pull the matching set and paginate in memory
  // (the catalogue is small); otherwise we page in the database.
  if (query.color) {
    const all = await prisma.product.findMany({ where, orderBy, include: listInclude });
    const filtered = all.filter((p) => paletteMatchesColor(p.palette, query.color!));
    const items = filtered.slice(skip, skip + limit);
    return {
      items: items.map(toPublicProduct) as ProductSummary[],
      total: filtered.length, page, limit,
      hasMore: skip + items.length < filtered.length,
    };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: listInclude }),
    prisma.product.count({ where }),
  ]);
  return {
    items: items.map(toPublicProduct) as ProductSummary[],
    total, page, limit,
    hasMore: skip + items.length < total,
  };
}

async function _getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      stems:    { orderBy: { id: "asc" } },
    },
  });
  if (!product || product.status === "DRAFT") return null;
  return {
    ...(toPublicProduct(product) as ProductSummary),
    longDesc: product.longDesc,
    variants: product.variants.map((v) => ({
      id: v.id, label: v.label, sku: v.sku, stems: v.stems,
      priceDelta: v.priceDelta, inStock: v.stockQty > 0,
    })),
    composition: product.stems.map((s) => ({ name: s.name, qty: s.qty, swatchHex: s.swatchHex })),
  };
}

async function _listCategories(): Promise<{ items: Category[] }> {
  const items = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
  return {
    items: items.map((c) => ({
      id: c.id, slug: c.slug, name: c.name, subtitle: c.subtitle,
      hue: c.hue, image: c.image, productCount: c._count.products,
    })),
  };
}

const cacheOpts = { tags: [CATALOG_TAG], revalidate: REVALIDATE_SEC };

export const queryProducts = unstable_cache(_queryProducts, ["catalog:products"], cacheOpts);
export const getProductBySlug = unstable_cache(_getProductBySlug, ["catalog:product"], cacheOpts);
export const listCategories = unstable_cache(_listCategories, ["catalog:categories"], cacheOpts);

/** Parse the public /api/products query string into a ProductQuery. */
export function productQueryFromParams(sp: URLSearchParams): ProductQuery {
  const int = (k: string) => {
    const n = parseInt(sp.get(k) || "");
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    page: int("page"),
    limit: int("limit"),
    category: sp.get("category") || undefined,
    q: sp.get("q") || undefined,
    min: int("min"),
    max: int("max"),
    sort: sp.get("sort") || undefined,
    color: sp.get("color") || undefined,
    stems: sp.get("stems") || undefined,
    deliver: sp.get("deliver") || undefined,
  };
}
