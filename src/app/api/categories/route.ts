import { json, route } from "../../../lib/api";
import { listCategories } from "../../../lib/catalog";

/** GET /api/categories — for nav + filter chips. */
export const GET = route(async () => json(await listCategories()));
