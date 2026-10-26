import React, { Suspense } from "react";
import Link from "next/link";
import { listCategories, listProducts } from "../../lib/product-api";
import Filter from "../../components/Filter";
import ListToolbar from "../../components/ListToolbar";
import ProductList, { listQuery } from "../../components/ProductList";
import Skeleton from "../../components/Skeleton";
import BouquetIllustration from "../../components/BouquetIllustration";

const ListPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) => {
  const sp = await searchParams;
  const catSlug = sp.cat;
  // Both reads hit the cached catalogue; the count query is the same one
  // ProductList runs below, so it's served from cache there.
  const [{ items: allCats }, { total }] = await Promise.all([
    listCategories(),
    listProducts(listQuery(catSlug, sp)),
  ]);
  const cat = allCats.find((c) => c.slug === catSlug);
  const hue = cat?.hue || "#e8d9c4";

  const navCats = allCats
    .filter((c) => c.slug)
    .slice(0, 6)
    .map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <main className="fs-list">
      <section
        className="fs-list-banner"
        style={{ background: `linear-gradient(120deg, ${hue}, #efe2c7)` }}
      >
        <div className="fs-list-banner-text">
          <span className="fs-section-eyebrow">{sp.q ? "Search" : catSlug ? "Category" : "Shop"}</span>
          <h1 className="fs-list-title">{sp.q ? `“${sp.q}”` : cat?.name || "Everything in flower"}</h1>
          <p>{sp.q ? "Here's what we found." : cat?.subtitle || "Hand-tied this morning. Delivered this afternoon."}</p>
          <div className="fs-list-crumbs">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Shop</span>
            {cat && (<><span>›</span><span>{cat.name}</span></>)}
          </div>
        </div>
        <div className="fs-list-banner-img">
          <BouquetIllustration
            palette={[hue, "#3d2f24", "#7a8a5a", "#ffffff"]}
            seed={123}
          />
        </div>
      </section>

      <ListToolbar count={total} cats={navCats} />

      <div className="fs-list-body">
        <Filter />
        <Suspense key={JSON.stringify(sp)} fallback={<Skeleton />}>
          <ProductList category={catSlug} searchParams={sp} />
        </Suspense>
      </div>
    </main>
  );
};

export default ListPage;
