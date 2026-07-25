import { prisma } from "../../../lib/prisma";
import { json, route, readPaging } from "../../../lib/api";
import { toPublicProduct } from "../../../lib/serializers";
import { paletteMatchesColor } from "../../../lib/color";

/**
 * GET /api/products
 *   ?category=<slug>   filter by category slug
 *   ?status=ACTIVE     defaults to ACTIVE
 *   ?q=<query>         starts-with name search
 *   ?min=&max=         price range (cents)
 *   ?color=<family>    palette colour family (white|blush|warm|deep|green|lilac)
 *   ?stems=<range>     posy|everyday|statement|event
 *   ?deliver=<speed>   today|tomorrow
 *   ?sort=price-asc|price-desc|bestseller|newest
 *   ?page=&limit=
 */

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

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const { skip, limit, page } = readPaging(url, { page: 1, limit: 12 });

  const status = (url.searchParams.get("status") || "ACTIVE").toUpperCase() as any;
  const categorySlug = url.searchParams.get("category");
  const q = url.searchParams.get("q") || "";
  const min = parseInt(url.searchParams.get("min") || "0");
  const max = parseInt(url.searchParams.get("max") || "999999999");
  const sort = url.searchParams.get("sort") || "newest";
  const color = url.searchParams.get("color");
  const stems = url.searchParams.get("stems");
  const deliver = url.searchParams.get("deliver");

  const where: any = {
    status: status === "ALL" ? undefined : status,
    basePrice: { gte: min, lte: max },
  };
  if (q) where.name = { startsWith: q, mode: "insensitive" };
  if (categorySlug) where.category = { slug: categorySlug };
  if (stems && STEM_RANGES[stems]) where.variants = { some: { stems: STEM_RANGES[stems] } };
  if (deliver && DELIVER_LEAD[deliver]) where.leadTime = DELIVER_LEAD[deliver];

  const orderBy: any =
    sort === "price-asc"  ? { basePrice: "asc" }  :
    sort === "price-desc" ? { basePrice: "desc" } :
    sort === "bestseller" ? { totalSold: "desc" } :
                            { createdAt: "desc" };

  // Colour lives in a JSON palette column, so it can't be filtered in SQL.
  // When a colour is requested we pull the matching set and paginate in memory
  // (the catalogue is small); otherwise we page in the database.
  if (color) {
    const all = await prisma.product.findMany({ where, orderBy, include: listInclude });
    const filtered = all.filter((p) => paletteMatchesColor(p.palette, color));
    const items = filtered.slice(skip, skip + limit);
    return json({
      items: items.map(toPublicProduct),
      total: filtered.length, page, limit,
      hasMore: skip + items.length < filtered.length,
    });
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: listInclude }),
    prisma.product.count({ where }),
  ]);

  return json({
    items: items.map(toPublicProduct),
    total, page, limit, hasMore: skip + items.length < total,
  });
});
