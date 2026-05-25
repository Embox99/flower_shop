import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { getOrCreateCart, priceCart } from "../../../../../lib/cart";

const patchSchema = z.object({
  qty: z.number().int().min(0).max(20).optional(),
  addVase: z.boolean().optional(),
  giftMessage: z.string().max(160).nullable().optional(),
});

/** PATCH /api/cart/items/[id] — update qty (qty=0 removes), addons. */
export const PATCH = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await readBody(req, patchSchema);
  const cart = await getOrCreateCart();
  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.cartId !== cart.id) return bad("Line item not found", 404);

  if (data.qty === 0) {
    await prisma.cartItem.delete({ where: { id } });
  } else {
    await prisma.cartItem.update({
      where: { id },
      data: {
        qty: data.qty ?? item.qty,
        addVase: data.addVase ?? item.addVase,
        giftMessage: data.giftMessage === null ? null : (data.giftMessage ?? item.giftMessage),
      },
    });
  }
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return json({ cartId: cart.id, ...(await priceCart(cart.id)) });
});

/** DELETE /api/cart/items/[id] — remove a line item. */
export const DELETE = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const cart = await getOrCreateCart();
  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.cartId !== cart.id) return bad("Line item not found", 404);
  await prisma.cartItem.delete({ where: { id } });
  return json({ cartId: cart.id, ...(await priceCart(cart.id)) });
});
