import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "../../lib/product-api";
import ProductImages from "../../components/ProductImages";
import CustomizeProducts from "../../components/CustomizeProducts";
import ProductCard from "../../components/ProductCard";
import Skeleton from "../../components/Skeleton";

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <main className="fs-product">
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
