import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, listProducts } from "../../lib/product-api";
import ProductImages from "../../components/ProductImages";
import CustomizeProducts from "../../components/CustomizeProducts";
import ProductCard from "../../components/ProductCard";
import Skeleton from "../../components/Skeleton";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };
  const description = product.shortDesc || `${product.name}, hand-tied in Tel Aviv.`;
  const image = (product.images.find((i) => i.isPrimary) || product.images[0])?.url;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
  };
}

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Product structured data for rich results in search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc || undefined,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="fs-product">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="fs-product-crumbs">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/list">Shop</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <div className="fs-product-grid">
        <ProductImages
          items={product.images.map((i) => ({ _id: i.id, image: { url: i.url } }))}
          badge={product.badge || undefined}
          name={product.name}
        />
        <CustomizeProducts product={product} />
      </div>

      <section className="fs-section">
        <div className="fs-section-head">
          <div>
            <span className="fs-section-eyebrow">Looks like</span>
            <h2 className="fs-section-title">Other things in flower this week.</h2>
          </div>
        </div>
        <Suspense fallback={<Skeleton />}>
          <RelatedProducts category={product.category?.slug} exclude={product.id} />
        </Suspense>
      </section>
    </main>
  );
};

async function RelatedProducts({ category, exclude }: { category?: string; exclude: string }) {
  const data = await listProducts({ category, limit: 5 });
  const items = data.items.filter((p) => p.id !== exclude).slice(0, 4);
  return (
    <div className="fs-grid">
      {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

export default page;
