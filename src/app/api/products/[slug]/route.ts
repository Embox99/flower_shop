import { prisma } from "../../../../lib/prisma";
import { json, route, bad } from "../../../../lib/api";
import { toPublicProduct } from "../route";

/**
 * GET /api/products/[slug] — full product detail incl. variants + stems.
 */
export const GET = route(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      stems:    { orderBy: { id: "asc" } },
    },
  });
  if (!product) return bad("Product not found", 404);

  return json({
    ...toPublicProduct(product),
    longDesc: product.longDesc,
    variants: product.variants.map((v) => ({
      id: v.id, label: v.label, sku: v.sku, stems: v.stems,
      priceDelta: v.priceDelta, inStock: v.stockQty > 0,
    })),
    composition: product.stems.map((s) => ({ name: s.name, qty: s.qty, swatchHex: s.swatchHex })),
  });
});
