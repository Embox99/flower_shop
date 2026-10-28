/**
 * Pure pricing and sellability rules, kept free of Prisma / Next imports so
 * they can be unit-tested directly. `lib/cart` and the cart/checkout routes
 * are the only callers.
 */

export const VASE_CENTS = 1400;

type ProductLike = { id: string; status: string; basePrice: number };
type VariantLike = { id: string; productId: string; priceDelta: number; stockQty: number };

/**
 * Why a cart line can't be sold, or null if it can. Stock lives on variants
 * only, so a line must name a variant of *this* product: a variant id taken
 * from another product would otherwise price (and decrement stock) against
 * the wrong item.
 */
export function lineProblem(
  product: ProductLike | null | undefined,
  variant: VariantLike | null | undefined,
): string | null {
  if (!product) return "unavailable";
  if (variant && variant.productId !== product.id) return "unavailable";
  return null;
}

export function unitPrice(product: ProductLike, variant: VariantLike | null | undefined, addVase: boolean) {
  const delta = variant && variant.productId === product.id ? variant.priceDelta : 0;
  return product.basePrice + delta + (addVase ? VASE_CENTS : 0);
}
