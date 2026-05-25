/**
 * Maps a Wix product object into a clean shape consumed by our display
 * components. Falls back to safe defaults so the UI never crashes if a
 * field is missing.
 */
export type DisplayProduct = {
  id: string;
  slug: string;
  name: string;
  short: string;
  long: string;
  price: number;
  oldPrice?: number;
  currency: string;
  palette: string[];
  badge?: string;
  stems?: number | null;
  height: string;
  vase: string;
  category?: string;
  inStock: boolean;
  imageUrl?: string;
  gallery?: { id: string; url: string }[];
  care: string[];
  raw?: any;
};

const DEFAULT_PALETTE = ["#e8c8b9", "#f7d76b", "#9bb38a", "#f5b8c4"];

function stripHtml(s?: string): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function fromWixProduct(p: any): DisplayProduct {
  if (!p) {
    return {
      id: "missing",
      slug: "missing",
      name: "Untitled bouquet",
      short: "",
      long: "",
      price: 0,
      currency: "USD",
      palette: DEFAULT_PALETTE,
      height: "—",
      vase: "—",
      inStock: false,
      care: [],
    };
  }
  const short =
    stripHtml(
      p.additionalInfoSections?.find((s: any) => s.title === "shortDesc")?.description
    ) || stripHtml(p.description);

  const gallery: { id: string; url: string }[] =
    (p.media?.items || []).map((it: any, i: number) => ({
      id: String(it._id || i),
      url: it.image?.url || "",
    })) || [];

  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    short,
    long: stripHtml(p.description),
    price: p.priceData?.discountedPrice || p.priceData?.price || 0,
    oldPrice:
      p.priceData?.discountedPrice && p.priceData?.discountedPrice !== p.priceData?.price
        ? p.priceData?.price
        : undefined,
    currency: p.priceData?.currency || "USD",
    palette: DEFAULT_PALETTE,
    badge: p.ribbon || undefined,
    stems: null,
    height: "—",
    vase: "—",
    category: p.collectionIds?.[0],
    inStock: p.stock?.inStock !== false,
    imageUrl: p.media?.mainMedia?.image?.url,
    gallery,
    care: [
      "Trim 2cm at an angle",
      "Cool, indirect light",
      "Change water every 2 days",
    ],
    raw: p,
  };
}
