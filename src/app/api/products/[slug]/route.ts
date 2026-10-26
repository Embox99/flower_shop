import { json, route, bad } from "../../../../lib/api";
import { getProductBySlug } from "../../../../lib/catalog";

/**
 * GET /api/products/[slug] — full product detail incl. variants + stems.
 */
export const GET = route(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return bad("Product not found", 404);
  return json(product);
});
