import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { json, route, bad, readBody, HttpError } from "../../../lib/api";
import { getOrCreateCart, priceCart } from "../../../lib/cart";
import { enforceRateLimit } from "../../../lib/rate-limit";
import { cookies } from "next/headers";

const schema = z.object({
  recipientName: z.string().min(1, "Required"),
  recipientPhone: z.string().min(4),
  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  zip: z.string().optional(),
  country: z.string().default("IL"),

  deliveryWindow: z.string().min(1),
  deliveryDate: z.string().datetime().optional(),

  giftMessage: z.string().max(160).optional(),

  // Optional — capture an email for guest checkout. If signed in we use the
  // session email instead.
  email: z.string().email().optional(),
  name:  z.string().optional(),
});

/** Order code generator: FS-XXXXX, retry on collision. */
async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = "FS-" + Math.floor(20000 + Math.random() * 80000);
    const hit = await prisma.order.findUnique({ where: { code } });
    if (!hit) return code;
  }
  // Fall back to timestamp-ish suffix.
  return "FS-" + Date.now().toString().slice(-6);
}

/**
 * POST /api/checkout
 *
 * Converts the current cart into an Order, clears the cart cookie, and returns
 * the order code so the storefront can redirect to /success/[code].
 *
 * Payment is mocked: the order goes in as PENDING and the admin marks it PAID.
 */
export const POST = route(async (req: Request) => {
  // Throttle checkout to curb order flooding / card-testing-style abuse.
  await enforceRateLimit(req, "checkout", { limit: 10, windowSec: 60 });

  const data = await readBody(req, schema);
  const cart = await getOrCreateCart();
  const priced = await priceCart(cart.id);
  if (priced.lines.length === 0) return bad("Cart is empty", 400);

  const session = await auth();
  let userId = session?.user?.id || null;

  // Guest checkout: if no session but they gave an email, create a (or reuse) customer record.
  if (!userId && data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    const u = existing ?? (await prisma.user.create({
      data: { email: data.email.toLowerCase(), name: data.name || null },
    }));
    userId = u.id;
  }

  const code = await uniqueCode();

  // Everything below is atomic: stock is decremented, the order is created, and
  // the cart is emptied as one unit. If stock runs out mid-flight the whole
  // transaction rolls back and nothing is persisted.
  const order = await prisma.$transaction(async (tx) => {
    // ── Decrement stock with an atomic guard ──────────────────────────────
    // Only variant lines track stock (stockQty lives on ProductVariant). The
    // `stockQty: { gte: qty }` filter makes the check-and-decrement a single
    // race-free statement: if another concurrent checkout already took the
    // last units, updateMany affects 0 rows and we abort.
    for (const l of priced.lines) {
      if (!l.variantId) continue; // no variant → no tracked inventory
      const res = await tx.productVariant.updateMany({
        where: { id: l.variantId, stockQty: { gte: l.qty } },
        data: { stockQty: { decrement: l.qty } },
      });
      if (res.count === 0) {
        throw new HttpError(`"${l.productName}" is out of stock`, 409);
      }
    }

    const created = await tx.order.create({
      data: {
        code,
        userId,
        subtotal: priced.subtotal,
        deliveryFee: priced.deliveryFee,
        total: priced.total,
        currency: priced.currency,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        zip: data.zip,
        country: data.country,
        deliveryWindow: data.deliveryWindow,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        giftMessage: data.giftMessage,
        items: {
          create: priced.lines.map((l) => ({
            productId: l.productId!,
            variantId: l.variantId || null,
            productName: l.productName,
            variantLabel: l.variantLabel,
            unitPrice: l.unitPrice,
            qty: l.qty,
            total: l.total,
          })),
        },
        events: {
          create: [{ kind: "PLACED", message: "Order placed via storefront." }],
        },
      },
      include: { items: true },
    });

    // Clear the cart items inside the transaction so a successful order always
    // leaves an empty cart (and a failed one leaves the cart intact for retry).
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  // Cookie mutation must happen outside the DB transaction.
  if (!session) {
    const store = await cookies();
    store.delete("fs_cart");
    // Anon cart record stays (debugging / re-attribution); not user-visible.
  }

  return json({ code: order.code, id: order.id, total: order.total });
});
