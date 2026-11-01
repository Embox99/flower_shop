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
import { unitPrice, deliveryFees, type DeliveryOption } from "./pricing";

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

  const anon = await prisma.cart.findUnique({ where: { token }, include: { items: { include: { variant: true } } } });
  // Stale cookie pointing at nothing — drop it so it doesn't linger.
  if (!anon) { store.delete(CART_COOKIE); return; }
  // Already the user's own cart; just retire the anon cookie.
  if (anon.userId === userId) { store.delete(CART_COOKIE); return; }

  // Destination: the user's existing cart, or a fresh one.
  const userCart =
    (await prisma.cart.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } })) ??
    (await prisma.cart.create({ data: { userId } }));

  for (const item of anon.items) {
    // Never carry over a line whose variant belongs to a different product.
    if (item.variant && item.variant.productId !== item.productId) continue;
    // Fold matching lines together instead of duplicating them.
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
        addVase: item.addVase,
      },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + item.qty },
      });
    } else {
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
  }

  await prisma.cart.delete({ where: { id: anon.id } });
  store.delete(CART_COOKIE);
}

/**
 * Delivery pricing, read from the owner-editable `shop.delivery` setting.
 * Falls back to a $6 same-day fee if unset; per-method fees come from lib/pricing.
 */
async function deliveryConfig() {
  const row = await prisma.setting.findUnique({ where: { key: "shop.delivery" } });
  const v = (row?.value as any) || {};
  return {
    feeCents: typeof v.feeCents === "number" ? v.feeCents : 600,
    freeOverCents: typeof v.freeOverCents === "number" ? v.freeOverCents : null,
  };
}

/**
 * Compute totals from a cart's line items. Single source of pricing truth — never
 * trust the client.
 */
export async function priceCart(cartId: string, delivery: DeliveryOption = "today") {
  const all = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true, variant: true },
  });
  // A line pointing at another product's variant is corrupt (it would price
  // and decrement stock against the wrong item) — drop it.
  const corrupt = all.filter((it) => it.variant && it.variant.productId !== it.productId);
  if (corrupt.length) await prisma.cartItem.deleteMany({ where: { id: { in: corrupt.map((it) => it.id) } } });
  const items = all.filter((it) => !corrupt.includes(it));

  let subtotal = 0;
  const lines = items.map((it) => {
    const unit = unitPrice(it.product, it.variant, it.addVase);
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
  const deliveryOptions = deliveryFees(subtotal, await deliveryConfig());
  const deliveryFee = deliveryOptions[delivery];
  const total = subtotal + deliveryFee;
  return { lines, subtotal, delivery, deliveryFee, deliveryOptions, total, currency: "USD" };
}
