import { prisma } from "../../../lib/prisma";
import { json, route } from "../../../lib/api";

/** GET /api/categories — for nav + filter chips. */
export const GET = route(async () => {
  const items = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return json({
    items: items.map((c) => ({
      id: c.id, slug: c.slug, name: c.name, subtitle: c.subtitle,
      hue: c.hue, image: c.image, productCount: c._count.products,
    })),
  });
});
