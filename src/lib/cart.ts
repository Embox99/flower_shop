/**
 * Cart cookie helpers — for anonymous carts.
 *
 * We don't trust the client with prices; we just stash a cart-id token in an
 * httpOnly cookie. The server resolves the cart by token.
 */
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { auth } from "./auth";

const CART_COOKIE = "fs_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function newToken() {
  return randomBytes(20).toString("base64url");
}

/**
 * Return the active cart for the current request. If the user is signed in,
 * we use (or create) the user's cart. Otherwise we look up by cookie token,
 * creating one on demand.
 */
export async function getOrCreateCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId } });
  }

  const store = await cookies();
  let token = store.get(CART_COOKIE)?.value;

  if (token) {
    const cart = await prisma.cart.findUnique({ where: { token } });
    if (cart) return cart;
  }

  token = newToken();
  const cart = await prisma.cart.create({ data: { token } });
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE,
    path: "/",
  });
  return cart;
}

/**
 * When a user signs in, fold their anonymous cookie cart into their user cart.
 * Call this from a sign-in callback or once on the first authenticated page load.
 */
export async function mergeAnonCartIntoUserCart(userId: string) {
  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  if (!token) return;
  const anon = await prisma.cart.findUnique({ where: { token }, include: { items: true } });
  if (!anon || anon.items.length === 0) return;

  const userCart = await prisma.cart.upsert({
    where: { id: anon.userId === userId ? anon.id : "__never__" },
    update: {},
    create: { userId },
  });

  for (const item of anon.items) {
    await prisma.cartItem.create({
      data: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
        qty: item.qty,
        addVase: item.addVase,
        giftMessage: item.giftMessage,
      },
    });
  }
  await prisma.cart.delete({ where: { id: anon.id } });
  store.delete(CART_COOKIE);
}

/**
 * Compute totals from a cart's line items. Single source of pricing truth — never
 * trust the client.
 */
export async function priceCart(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true, variant: true },
  });
  let subtotal = 0;
  const lines = items.map((it) => {
    const base = it.product.basePrice;
    const delta = it.variant?.priceDelta ?? 0;
    const vase = it.addVase ? 1400 : 0;
    const unit = base + delta + vase;
    const total = unit * it.qty;
    subtotal += total;
    return {
      id: it.id,
      productId: it.productId,
      variantId: it.variantId,
      productName: it.product.name,
      productSlug: it.product.slug,
      variantLabel: it.variant?.label,
      qty: it.qty,
      unitPrice: unit,
      total,
      palette: (it.product.palette as any) ?? [],
      addVase: it.addVase,
      giftMessage: it.giftMessage,
    };
  });
  const deliveryFee = subtotal > 0 ? 600 : 0;
  const total = subtotal + deliveryFee;
  return { lines, subtotal, deliveryFee, total, currency: "USD" };
}
