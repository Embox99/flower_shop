import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { json, route, bad, readBody } from "../../../lib/api";
import { getOrCreateCart, priceCart } from "../../../lib/cart";
import { enforceRateLimit } from "../../../lib/rate-limit";

/** GET /api/cart — current cart with line totals. */
export const GET = route(async () => {
  const cart = await getOrCreateCart();
  const priced = await priceCart(cart.id);
  return json({ cartId: cart.id, ...priced });
});

const addSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable().optional(),
  qty: z.number().int().min(1).max(20).default(1),
  addVase: z.boolean().default(false),
  giftMessage: z.string().max(160).optional(),
});

/** POST /api/cart — add a line item. */
export const POST = route(async (req: Request) => {
  await enforceRateLimit(req, "cart-add", { limit: 60, windowSec: 60 });

  const data = await readBody(req, addSchema);
  const cart = await getOrCreateCart();

  // Validate product exists.
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.status !== "ACTIVE") return bad("Product unavailable", 404);

  // Merge if same product+variant already in cart.
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId || null,
      addVase: data.addVase,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { qty: existing.qty + data.qty, giftMessage: data.giftMessage ?? existing.giftMessage },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
        qty: data.qty,
        addVase: data.addVase,
        giftMessage: data.giftMessage,
      },
    });
  }
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

  const priced = await priceCart(cart.id);
  return json({ cartId: cart.id, ...priced });
});

/** DELETE /api/cart — empty the cart. */
export const DELETE = route(async () => {
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const priced = await priceCart(cart.id);
  return json({ cartId: cart.id, ...priced });
});
