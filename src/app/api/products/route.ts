import { prisma } from "../../../lib/prisma";
import { json, route, readPaging } from "../../../lib/api";
import { toPublicProduct } from "../../../lib/serializers";

/**
 * GET /api/products
 *   ?category=<slug>   filter by category slug
 *   ?status=ACTIVE     defaults to ACTIVE
 *   ?q=<query>         starts-with name search
 *   ?min=&max=         price range (cents)
 *   ?sort=price-asc|price-desc|newest
 *   ?page=&limit=
 */
export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const { skip, limit, page } = readPaging(url, { page: 1, limit: 12 });

  const status = (url.searchParams.get("status") || "ACTIVE").toUpperCase() as any;
  const categorySlug = url.searchParams.get("category");
  const q = url.searchParams.get("q") || "";
  const min = parseInt(url.searchParams.get("min") || "0");
  const max = parseInt(url.searchParams.get("max") || "999999999");
  const sort = url.searchParams.get("sort") || "newest";

  const where: any = {
    status: status === "ALL" ? undefined : status,
    basePrice: { gte: min, lte: max },
  };
  if (q) where.name = { startsWith: q, mode: "insensitive" };
  if (categorySlug) where.category = { slug: categorySlug };

  const orderBy: any =
    sort === "price-asc"  ? { basePrice: "asc" }  :
    sort === "price-desc" ? { basePrice: "desc" } :
    sort === "bestseller" ? { totalSold: "desc" } :
                            { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.count({ where }),
  ]);

  return json({
    items: items.map(toPublicProduct),
    total, page, limit, hasMore: skip + items.length < total,
  });
});
