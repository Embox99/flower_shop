/**
 * Pure pricing and sellability rules, kept free of Prisma / Next imports so
 * they can be unit-tested directly. `lib/cart` and the cart/checkout routes
 * are the only callers.
 */

export const VASE_CENTS = 1400;

type ProductLike = { id: string; status: string; basePrice: number };
type VariantLike = { id: string; productId: string; priceDelta: number; stockQty: number };

/**
 * Why a cart line can't be sold, or null if it can: the product must be live
 * and have `qty` in stock. Stock lives on variants only, so a line must name
 * a variant of *this* product: a variant id taken
 * from another product would otherwise price (and decrement stock) against
 * the wrong item.
 */
export function lineProblem(
  product: ProductLike | null | undefined,
  variant: VariantLike | null | undefined,
  qty = 1,
): string | null {
  if (!product || product.status !== "ACTIVE") return "unavailable";
  // Stock is tracked per variant; a product without one has nothing to sell.
  if (!variant) return "out of stock";
  if (variant.productId !== product.id) return "unavailable";
  if (variant.stockQty < qty) return "out of stock";
  return null;
}

export function unitPrice(product: ProductLike, variant: VariantLike | null | undefined, addVase: boolean) {
  const delta = variant && variant.productId === product.id ? variant.priceDelta : 0;
  return product.basePrice + delta + (addVase ? VASE_CENTS : 0);
}

/** Delivery methods offered at checkout. */
export const DELIVERY_OPTIONS = ["today", "tomorrow", "date", "letterbox", "pickup"] as const;
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number];

export type DeliveryConfig = { feeCents: number; freeOverCents: number | null };

/** Scheduled (next-day or later) courier runs cost less than same-day. */
const SCHEDULED_FEE_CENTS = 400;

/**
 * Fee for one delivery method. Same-day uses the owner-configured fee,
 * scheduled runs are capped at the scheduled rate, letterbox and pickup are
 * free, and the free-delivery threshold zeroes everything.
 */
export function deliveryFee(option: DeliveryOption, subtotal: number, cfg: DeliveryConfig) {
  if (subtotal <= 0) return 0;
  if (cfg.freeOverCents != null && subtotal >= cfg.freeOverCents) return 0;
  switch (option) {
    case "today":     return cfg.feeCents;
    case "tomorrow":
    case "date":      return Math.min(cfg.feeCents, SCHEDULED_FEE_CENTS);
    case "letterbox":
    case "pickup":    return 0;
  }
}

export function deliveryFees(subtotal: number, cfg: DeliveryConfig) {
  return Object.fromEntries(
    DELIVERY_OPTIONS.map((o) => [o, deliveryFee(o, subtotal, cfg)]),
  ) as Record<DeliveryOption, number>;
}
