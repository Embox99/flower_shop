import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

// Rendered per request so builds don't need a database.
export const dynamic = "force-dynamic";

const base = process.env.APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/list`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${base}/list?cat=${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8,
    })),
  ];
}
