import { z } from "zod";
import { json, route, readBody } from "../../../lib/api";
import { requireStaff } from "../../../lib/auth-helpers";
import { createSignedUploadUrl } from "../../../lib/upload";

const schema = z.object({
  contentType: z.string().regex(/^image\/(png|jpe?g|webp|gif)$/, "Only images allowed"),
  prefix: z.string().regex(/^[a-z0-9\-\/]+$/i).optional(),
});

/**
 * POST /api/admin/upload-url
 * → { uploadUrl, publicUrl }
 *
 * Browser PUTs the file directly to uploadUrl with the same content-type;
 * publicUrl is what to store on the product record.
 */
export const POST = route(async (req: Request) => {
  await requireStaff();
  const { contentType, prefix } = await readBody(req, schema);
  const out = await createSignedUploadUrl({ contentType, prefix: prefix || "products" });
  return json(out);
});
