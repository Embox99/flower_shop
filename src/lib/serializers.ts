/**
 * Public JSON shapes shared across route handlers.
 * Lives outside app/api because Next only allows HTTP-method exports from route files.
 */

/** Public product shape used by the storefront. Hides cost, internal notes etc. */
export function toPublicProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortDesc: p.shortDesc,
    longDesc: p.longDesc,
    badge: p.badge,
    price: p.basePrice,
    comparePrice: p.comparePrice,
    currency: p.currency,
    palette: p.palette || [],
    height: p.height,
    vase: p.vase,
    category: p.category ? { slug: p.category.slug, name: p.category.name } : null,
    images: (p.images || []).map((i: any) => ({ id: i.id, url: i.url, alt: i.alt, isPrimary: i.isPrimary })),
    stems: p.stems,
    inStock: (p.totalStock ?? 0) > 0 || true, // default true for placeholder catalog
  };
}

export function serializeOrder(o: any) {
  return {
    id: o.id, code: o.code, status: o.status, paymentStatus: o.paymentStatus,
    subtotal: o.subtotal, deliveryFee: o.deliveryFee, total: o.total, currency: o.currency,
    deliveryWindow: o.deliveryWindow, deliveryDate: o.deliveryDate,
    recipientName: o.recipientName, recipientPhone: o.recipientPhone,
    addressLine1: o.addressLine1, addressLine2: o.addressLine2, city: o.city, zip: o.zip, country: o.country,
    giftMessage: o.giftMessage,
    items: (o.items || []).map((it: any) => ({
      id: it.id, productId: it.productId, productName: it.productName,
      variantLabel: it.variantLabel, qty: it.qty, unitPrice: it.unitPrice, total: it.total,
    })),
    events: (o.events || []).map((e: any) => ({
      kind: e.kind, message: e.message, createdAt: e.createdAt,
    })),
    createdAt: o.createdAt,
  };
}
