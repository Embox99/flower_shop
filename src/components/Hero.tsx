import React from "react";
import Link from "next/link";
import BouquetIllustration from "./BouquetIllustration";

/**
 * Editorial hero with illustrated bouquet, supporting stats, and a small
 * "in the window today" card. Replaces the old generic slider.
 */
export default function Hero() {
  const heroPalette = ["#f5b8c4", "#f7d76b", "#a8c98a", "#e8a4a4"];
  return (
    <section className="fs-hero">
      <div className="fs-hero-cream">
        <span className="fs-hero-eyebrow">
          <span className="fs-eye-line" /> Cut at first light · Tel Aviv · est. 2019
        </span>
        <h1 className="fs-hero-title">
          Flowers,
          <br />
          <em>quietly&nbsp;arranged</em>
          <br />
          for an ordinary&nbsp;Tuesday.
        </h1>
        <p className="fs-hero-lead">
          We are a small studio in Florentin. Every morning we drive to our growers in the
          Galilee, choose what looks happiest that day, and tie it up by hand. Same-afternoon
          delivery across the city.
        </p>
        <div className="fs-hero-actions">
          <Link href="/list" className="fs-btn fs-btn--dark">
            Shop today&apos;s flowers
          </Link>
          <Link href="/list?cat=weddings" className="fs-btn fs-btn--ghost">
            Plan a wedding →
          </Link>
        </div>

        <div className="fs-hero-meta">
          <div>
            <b>4.9</b>
            <span>★★★★★ · 1,240 reviews</span>
          </div>
          <div>
            <b>By 11am</b>
            <span>Order before noon, in vase by 5</span>
          </div>
          <div>
            <b>7-day</b>
            <span>Freshness guarantee</span>
          </div>
        </div>
      </div>

      <div className="fs-hero-image">
        <div
          className="fs-hero-image-frame"
          style={{
            background: `radial-gradient(120% 80% at 50% 30%, ${heroPalette[0]}55, ${heroPalette[2]}33 60%, transparent)`,
          }}
        >
          <BouquetIllustration palette={heroPalette} seed={9} className="fs-hero-bouquet" />
          <div className="fs-hero-card">
            <div className="fs-hero-card-row">
              <span className="fs-hero-card-label">In the window today</span>
              <span className="fs-hero-card-price">$64</span>
            </div>
            <h4>Midsummer Meadow</h4>
            <p>
              A wild armful of pinks, ochres and chamomile, gathered as if from a sun-warm field.
            </p>
            <Link href="/midsummer-meadow" className="fs-link-btn">
              See the bouquet →
            </Link>
          </div>
          <div className="fs-hero-stamp" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <defs>
                <path
                  id="fs-stamp-circle"
                  d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                />
              </defs>
              <text fill="currentColor" fontSize="9" letterSpacing="2">
                <textPath href="#fs-stamp-circle">
                  · Hand-tied in Tel Aviv · Hand-tied in Tel Aviv ·
                </textPath>
              </text>
              <g transform="translate(50,50)" stroke="currentColor" strokeWidth="0.8" fill="none">
                <circle r="20" />
                <path d="M0 -14 Q 6 -2, 0 14 Q -6 -2, 0 -14 Z" fill="currentColor" fillOpacity="0.15" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
