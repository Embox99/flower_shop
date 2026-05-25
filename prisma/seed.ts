/**
 * Seed the database with a starter catalog + an owner account.
 * Run with: `npm run db:seed`
 *
 * Idempotent — re-running is safe.
 */
import { PrismaClient, Role, ProductStatus, OrderStatus, PaymentStatus, OrderEventKind, SubscriptionCadence, SubscriptionStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// Generate the order code used in the admin: FS-XXXXX
function code() {
  return "FS-" + Math.floor(20000 + Math.random() * 9999);
}

async function main() {
  console.log("→ seeding…");

  // 1. Owner account ----------------------------------------------------------
  const ownerEmail = process.env.OWNER_EMAIL || "owner@flower-shop.local";
  const ownerPassword = process.env.OWNER_PASSWORD || "studio";
  const passwordHash = await argon2.hash(ownerPassword);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: Role.OWNER, passwordHash, emailVerified: new Date() },
    create: {
      email: ownerEmail,
      name: "Naama Levi",
      role: Role.OWNER,
      passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log(`  owner: ${owner.email} (password: ${ownerPassword})`);

  // 2. Categories -------------------------------------------------------------
  const catData = [
    { slug: "bouquets",     name: "Bouquets",      subtitle: "Hand-tied & seasonal",       hue: "#e8c8b9", sortOrder: 1 },
    { slug: "plants",       name: "Potted plants", subtitle: "For windowsills & desks",    hue: "#cdd9bd", sortOrder: 2 },
    { slug: "weddings",     name: "Weddings",      subtitle: "Bridal & ceremony",          hue: "#f0d4d4", sortOrder: 3 },
    { slug: "gifts",        name: "Gifts & sweets",subtitle: "Pair a bouquet with treats", hue: "#efe2c7", sortOrder: 4 },
    { slug: "dried",        name: "Dried & forever",subtitle: "Lasts the season",          hue: "#dcc7b0", sortOrder: 5 },
    { slug: "letterbox",    name: "Letterbox",     subtitle: "Posted through the door",    hue: "#e6dcef", sortOrder: 6 },
  ];
  const cats: Record<string, string> = {};
  for (const c of catData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    cats[c.slug] = cat.id;
  }
  console.log(`  ${catData.length} categories`);

  // 3. Products ---------------------------------------------------------------
  const products = [
    { slug: "midsummer-meadow", name: "Midsummer Meadow", sku: "MM-STD-001", category: "bouquets",  price: 6400, palette: ["#f5b8c4","#f7d76b","#a8c98a","#e8a4a4"], badge: "Bestseller",
      short: "A wild armful of pinks, ochres and chamomile, gathered as if from a sun-warm field.",
      long:  "Cut at first light from our Galilee partner growers — David Austin garden roses, scabiosa, ammi majus, billy buttons and bursts of feverfew.",
      stems: 28, height: "42 cm", vase: "Wide-mouth",
      stemComp: [["Garden rose · David Austin",6,"#f5b8c4"],["Scabiosa",5,"#7a8a5a"],["Ammi majus",4,"#ffffff"],["Billy buttons",3,"#f7d76b"],["Feverfew",3,"#ffffff"],["Eucalyptus",1,"#9bb38a"]] },
    { slug: "white-linen", name: "White Linen", sku: "WL-STD-002", category: "bouquets",  price: 5800, palette: ["#ffffff","#f4ead8","#9bb38a","#e7d9c0"], badge: "New",
      short: "Cream peonies, lisianthus and silver eucalyptus — the colour of a Sunday morning.",
      long:  "Our most-requested bridal palette, also wonderful for housewarmings and hellos.",
      stems: 22, height: "38 cm", vase: "Tall" },
    { slug: "burgundy-hour", name: "Burgundy Hour", sku: "BH-STD-003", category: "bouquets",  price: 7200, palette: ["#7a2330","#c84d5a","#e8a4a4","#3a4a2e"],
      short: "Deep dahlias, cosmos and copper beech for the long evenings.",
      long:  "An autumn-leaning arrangement that reads like velvet curtains at dusk.",
      stems: 24, height: "44 cm", vase: "Wide" },
    { slug: "rosemary-grove", name: "Rosemary Grove", sku: "RG-POT-004", category: "plants",    price: 4900, palette: ["#5a7a4a","#3a4a2e","#c4cfae","#e8d9c4"],
      short: "Potted rosemary in hand-thrown stoneware. A kitchen companion.",
      long:  "Mature rosemary, ~30cm tall, in a glazed terracotta pot from our partner studio in Hebron.",
      height: "30 cm", vase: "8\" pot" },
    { slug: "first-light-orchid", name: "First Light Orchid", sku: "FL-POT-005", category: "plants", price: 8800, palette: ["#f5d5d5","#ffffff","#7a8a6a","#3d2f24"], badge: "Limited",
      short: "Phalaenopsis in soft pink. Quiet and architectural.",
      long:  "Twin-spike phalaenopsis, expected bloom 8–12 weeks. Includes a moss-lined ceramic pot.",
      height: "55 cm", vase: "Ceramic" },
    { slug: "ceremony-cloud", name: "Ceremony Cloud", sku: "CC-WED-006", category: "weddings",  price: 24000, palette: ["#ffffff","#f4ead8","#e8c8b9","#cdd9bd"],
      short: "Bridal bouquet — ivory, blush, soft sage. Trailing ribbons.",
      long:  "Custom-built to your dress and venue. Includes a complimentary buttonhole.",
      stems: 36, height: "48 cm", vase: "Hand-held" },
    { slug: "sunday-letterbox", name: "Sunday Letterbox", sku: "SL-LTR-007", category: "letterbox", price: 3200, palette: ["#f5b8c4","#f7d76b","#cdd9bd","#e6dcef"],
      short: "Posted through the door, in flower for a week.",
      long:  "Compact-stemmed flowers shipped in bud, packed in a recyclable letterbox-friendly carton.",
      stems: 14, height: "26 cm", vase: "Any small vase" },
    { slug: "everlasting-honey", name: "Everlasting Honey", sku: "EH-DRY-008", category: "dried",    price: 4200, palette: ["#d8a96a","#efe2c7","#a98456","#3d2f24"],
      short: "Dried palm, pampas and bunny tails. Honey-toned and lasts a year.",
      long:  "No water needed. Keep out of direct sun to preserve colour.",
      stems: 18, height: "50 cm", vase: "Slim" },
    { slug: "second-breakfast", name: "Second Breakfast", sku: "SB-GFT-009", category: "gifts",    price: 5400, palette: ["#e8c8b9","#f7d76b","#3d2f24","#9bb38a"], badge: "Pair",
      short: "Posy + a tin of Earl Grey + honeycomb. A morning in a box.",
      long:  "Pairs a small posy with our partner roastery's tea and a slab of local honeycomb.",
      stems: 12, height: "24 cm", vase: "Included" },
  ];

  for (const p of products) {
    const stems = p.stems ?? 20;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, sku: p.sku, shortDesc: p.short, longDesc: p.long, badge: p.badge,
        basePrice: p.price, palette: p.palette as any, height: p.height, vase: p.vase,
        categoryId: cats[p.category],
      },
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        shortDesc: p.short,
        longDesc: p.long,
        badge: p.badge,
        status: ProductStatus.ACTIVE,
        basePrice: p.price,
        palette: p.palette as any,
        height: p.height,
        vase: p.vase,
        categoryId: cats[p.category],
      },
    });

    // Variants
    const variantData = [
      { label: "Posy",     sku: `${p.sku}-S`, stems: Math.round(stems * 0.6), priceDelta: -1200, stockQty: 6, sortOrder: 0 },
      { label: "Standard", sku: p.sku,         stems,                          priceDelta: 0,     stockQty: 4, sortOrder: 1 },
      { label: "Generous", sku: `${p.sku}-L`, stems: Math.round(stems * 1.4), priceDelta: 1800,  stockQty: 2, sortOrder: 2 },
    ];
    for (const v of variantData) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: v,
        create: { ...v, productId: product.id },
      });
    }

    // Stem composition
    if (p.stemComp) {
      await prisma.stemComponent.deleteMany({ where: { productId: product.id } });
      for (const [name, qty, hex] of p.stemComp) {
        await prisma.stemComponent.create({
          data: { productId: product.id, name: name as string, qty: qty as number, swatchHex: hex as string },
        });
      }
    }
  }
  console.log(`  ${products.length} products`);

  // 4. A few customers ---------------------------------------------------------
  const customerData = [
    { email: "maya.r@gmail.com",     name: "Maya Rosenberg" },
    { email: "daniel@singer.co",      name: "Daniel Singer" },
    { email: "tal@tal.is",            name: "Tal Friedman" },
    { email: "anna.c@gmail.com",      name: "Anna Cohen" },
  ];
  const customers = [];
  for (const c of customerData) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name },
      create: { email: c.email, name: c.name, role: Role.CUSTOMER, emailVerified: new Date() },
    });
    customers.push(u);
  }
  console.log(`  ${customers.length} customers`);

  // 5. A handful of demo orders so the admin doesn't open empty ---------------
  const allProducts = await prisma.product.findMany({ include: { variants: true } });
  const statusFlow: [OrderStatus, PaymentStatus, string][] = [
    [OrderStatus.NEW,                PaymentStatus.PAID,    "12 – 3pm"],
    [OrderStatus.TYING,              PaymentStatus.PAID,    "10 – 12pm"],
    [OrderStatus.READY,              PaymentStatus.PAID,    "Pick up"],
    [OrderStatus.OUT_FOR_DELIVERY,   PaymentStatus.PAID,    "9 – 11am"],
    [OrderStatus.DELIVERED,          PaymentStatus.PAID,    "Letterbox"],
  ];
  for (let i = 0; i < statusFlow.length; i++) {
    const [status, pay, window] = statusFlow[i];
    const customer = customers[i % customers.length];
    const p = allProducts[i % allProducts.length];
    const variant = p.variants.find((v) => v.label === "Standard")!;
    const unit = p.basePrice + variant.priceDelta;
    const total = unit + 600;
    const order = await prisma.order.create({
      data: {
        code: code(),
        userId: customer.id,
        status, paymentStatus: pay,
        subtotal: unit, deliveryFee: 600, total,
        deliveryWindow: window, city: "Tel Aviv",
        recipientName: customer.name,
        recipientPhone: "+972 50 555 8472",
        addressLine1: "Ben Yehuda 42, Apt 4",
        items: {
          create: {
            productId: p.id, variantId: variant.id,
            productName: p.name, variantLabel: variant.label,
            unitPrice: unit, qty: 1, total: unit,
          },
        },
        events: { create: [{ kind: OrderEventKind.PLACED, message: "Order placed via storefront." }] },
      },
    });
    if (pay === PaymentStatus.PAID) {
      await prisma.orderEvent.create({ data: { orderId: order.id, kind: OrderEventKind.PAID, message: "Payment captured (mocked)" } });
    }
  }
  console.log(`  ${statusFlow.length} demo orders`);

  // 6. A couple of demo subscriptions -----------------------------------------
  await prisma.subscription.create({ data: { userId: customers[0].id, cadence: SubscriptionCadence.FORTNIGHTLY, value: 4200, status: SubscriptionStatus.ACTIVE, deliveredCount: 9, totalCycles: 24, nextDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4) } });
  await prisma.subscription.create({ data: { userId: customers[2].id, cadence: SubscriptionCadence.WEEKLY,      value: 3200, status: SubscriptionStatus.ACTIVE, deliveredCount: 41, totalCycles: 48, nextDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) } });
  console.log(`  2 subscriptions`);

  // 7. Shop settings ----------------------------------------------------------
  await prisma.setting.upsert({
    where: { key: "shop.hours" }, update: {}, create: {
      key: "shop.hours",
      value: {
        mon: { open: "08:00", close: "19:00", on: true },
        tue: { open: "08:00", close: "19:00", on: true },
        wed: { open: "08:00", close: "19:00", on: true },
        thu: { open: "08:00", close: "19:00", on: true },
        fri: { open: "08:00", close: "19:00", on: true },
        sat: { open: "09:00", close: "14:00", on: true },
        sun: { on: false },
      } as any,
    },
  });
  await prisma.setting.upsert({
    where: { key: "shop.delivery" }, update: {}, create: {
      key: "shop.delivery",
      value: {
        sameDayCutoff: "12:00",
        lastSlot: "18:00",
        windows: ["9 – 12", "12 – 3", "3 – 6", "Pick up"],
        feeCents: 600,
      } as any,
    },
  });
  console.log("  settings");

  console.log("✓ seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
