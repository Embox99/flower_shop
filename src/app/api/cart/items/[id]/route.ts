import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { getOrCreateCart, priceCart } from "../../../../../lib/cart";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  qty: z.number().int().min(0).max(20).optional(),
  addVase: z.boolean().optional(),
  giftMessage: z.string().max(160).nullable().optional(),
});

/** PATCH /api/cart/items/[id] — update qty / vase / message. qty=0 removes the line. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  const { id } = await params;
  const data = await readBody(req, patchSchema);
  const cart = await getOrCreateCart();

  // Ownership check: the line must belong to the requester's cart.
  const item = await prisma.cartItem.findFirst({ where: { id, cartId: cart.id } });
  if (!item) return bad("Cart item not found", 404);

  if (data.qty === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: {
        ...(data.qty !== undefined ? { qty: data.qty } : {}),
        ...(data.addVase !== undefined ? { addVase: data.addVase } : {}),
        ...(data.giftMessage !== undefined ? { giftMessage: data.giftMessage } : {}),
      },
    });
  }
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

  const priced = await priceCart(cart.id);
  return json({ cartId: cart.id, ...priced });
});

/** DELETE /api/cart/items/[id] — remove the line. */
export const DELETE = route(async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const cart = await getOrCreateCart();

  const item = await prisma.cartItem.findFirst({ where: { id, cartId: cart.id } });
  if (!item) return bad("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id: item.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

  const priced = await priceCart(cart.id);
  return json({ cartId: cart.id, ...priced });
});
