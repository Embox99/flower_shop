import { z } from "zod";
import { prisma } from "../../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../../lib/api";
import { requireStaff } from "../../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
});

/** POST /api/admin/products/[id]/images — attach an uploaded image to the product. */
export const POST = route(async (req: Request, { params }: Params) => {
  await requireStaff();
  const { id } = await params;
  const data = await readBody(req, createSchema);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return bad("Product not found", 404);

  const count = await prisma.productImage.count({ where: { productId: id } });
  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: data.url,
      alt: data.alt,
      sortOrder: count,
      isPrimary: count === 0,
    },
  });
  return json({ image }, { status: 201 });
});
