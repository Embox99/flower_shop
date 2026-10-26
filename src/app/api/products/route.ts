import { json, route } from "../../../lib/api";
import { queryProducts, productQueryFromParams } from "../../../lib/catalog";

/**
 * GET /api/products — live (ACTIVE) products only.
 *   ?category=<slug>   filter by category slug
 *   ?q=<query>         case-insensitive name search
 *   ?min=&max=         price range (cents)
 *   ?color=<family>    palette colour family (white|blush|warm|deep|green|lilac)
 *   ?stems=<range>     posy|everyday|statement|event
 *   ?deliver=<speed>   today|tomorrow
 *   ?sort=price-asc|price-desc|bestseller|newest
 *   ?page=&limit=
 */
export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  return json(await queryProducts(productQueryFromParams(url.searchParams)));
});
