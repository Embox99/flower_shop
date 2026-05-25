import Link from "next/link";
import Image from "next/image";
import BouquetIllustration from "./BouquetIllustration";
import { listCategories } from "../lib/product-api";

const FALLBACK_HUE = "#e8d9c4";

export default async function CategoryList() {
  const { items } = await listCategories();
  return (
    <section className="fs-section">
      <div className="fs-section-head">
        <div>
          <span className="fs-section-eyebrow">Browse</span>
          <h2 className="fs-section-title">Pick a mood.</h2>
        </div>
        <Link href="/list" className="fs-link-btn">See everything →</Link>
      </div>
      <div className="fs-cats">
        {items.slice(0, 6).map((c, i) => {
          const hue = c.hue || FALLBACK_HUE;
          return (
            <Link key={c.id} href={`/list?cat=${c.slug}`} className="fs-cat">
              <div className="fs-cat-img" style={{ background: hue }}>
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill sizes="16vw" className="object-cover" />
                ) : (
                  <BouquetIllustration palette={[hue, "#3d2f24", "#7a8a5a", "#ffffff"]} seed={i + 11} />
                )}
                <span className="fs-cat-count">{c.productCount}</span>
              </div>
              <div className="fs-cat-foot">
                <h4>{c.name}</h4>
                <p>{c.subtitle || "Hand-tied this morning"}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
