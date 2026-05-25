import { Suspense } from "react";
import Hero from "../components/Hero";
import Ticker from "../components/Ticker";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import Editorial from "../components/Editorial";
import Subscription from "../components/Subscription";
import Testimonials from "../components/Testimonials";
import Skeleton from "../components/Skeleton";
import Link from "next/link";

export default function Home() {
  return (
    <main className="fs-home">
      <Hero />
      <Ticker />

      <Suspense fallback={<Skeleton />}>
        <CategoryList />
      </Suspense>

      <section className="fs-section fs-section--cream">
        <div className="fs-section-head">
          <div>
            <span className="fs-section-eyebrow">In the studio this week</span>
            <h2 className="fs-section-title">What&apos;s blooming.</h2>
          </div>
          <Link href="/list" className="fs-link-btn">All of it →</Link>
        </div>
        <Suspense fallback={<Skeleton />}>
          <ProductList limit={6} />
        </Suspense>
      </section>

      <Editorial />
      <Subscription />
      <Testimonials />
    </main>
  );
}
