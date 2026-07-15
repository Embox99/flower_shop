import { z } from "zod";
import { json, route, readBody } from "../../../../lib/api";
import { requireStaff } from "../../../../lib/auth-helpers";
import { createSignedUploadUrl } from "../../../../lib/upload";

const schema = z.object({
  contentType: z.string().regex(/^image\/(png|jpe?g|webp|avif|gif)$/i, "Images only"),
  prefix: z
    .string()
    .regex(/^[a-z0-9/_-]{1,60}$/i, "Invalid prefix")
    .optional(),
});

/**
 * POST /api/admin/upload-url — signed S3 PUT URL for product photography.
 * The browser PUTs the file straight to storage; only publicUrl is persisted.
 */
export const POST = route(async (req: Request) => {
  await requireStaff();
  const data = await readBody(req, schema);
  const result = await createSignedUploadUrl({
    contentType: data.contentType,
    prefix: data.prefix || "products",
  });
  return json(result);
});
