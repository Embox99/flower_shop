import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { json, route, bad, readBody } from "../../../lib/api";
import { getOrCreateCart, priceCart, mergeAnonCartIntoUserCart } from "../../../lib/cart";
import { enforceRateLimit } from "../../../lib/rate-limit";
import { lineProblem } from "../../../lib/pricing";
import { auth } from "../../../lib/auth";

/** GET /api/cart — current cart with line totals. */
export const GET = route(async () => {
  // On the first authenticated load, fold any anonymous cookie cart into the
  // user's cart so items added before signing in aren't lost.
  const session = await auth();
  if (session?.user?.id) await mergeAnonCartIntoUserCart(session.user.id);

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

  // Validate product exists and the variant belongs to it.
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.status !== "ACTIVE") return bad("Product unavailable", 404);
  const variant = data.variantId
    ? await prisma.productVariant.findUnique({ where: { id: data.variantId } })
    : null;
  if (data.variantId && !variant) return bad("Variant unavailable", 404);

  // Merge if same product+variant already in cart.
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId || null,
      addVase: data.addVase,
    },
  });

  // Check stock against the line's total, not just this increment.
  const problem = lineProblem(product, variant, (existing?.qty ?? 0) + data.qty);
  if (problem === "unavailable") return bad("Variant unavailable", 404);
  if (problem) return bad(`"${product.name}" is out of stock`, 409);

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
