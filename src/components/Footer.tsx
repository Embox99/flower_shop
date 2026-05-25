import React from "react";
import Link from "next/link";
import FlowerShopMark from "./FlowerShopMark";

export default function Footer() {
  return (
    <footer className="fs-foot">
      <div className="fs-foot-top">
        <div className="fs-foot-brand">
          <FlowerShopMark size={36} />
          <p className="fs-foot-blurb">
            A small flower shop in Florentin, Tel Aviv.
            <br />
            Cut at first light, delivered the same afternoon.
          </p>
          <div className="fs-foot-hours">
            <div>
              <span>Mon – Fri</span>
              <span>8 — 19</span>
            </div>
            <div>
              <span>Saturday</span>
              <span>9 — 14</span>
            </div>
            <div>
              <span>Sunday</span>
              <span>closed</span>
            </div>
          </div>
        </div>

        <div className="fs-foot-cols">
          <div>
            <h4>Shop</h4>
            <Link href="/list?cat=bouquets">Bouquets</Link>
            <Link href="/list?cat=potted-plants-and-orchids">Potted plants</Link>
            <Link href="/list?cat=weddings">Weddings</Link>
            <Link href="/list?cat=letterbox">Letterbox</Link>
          </div>
          <div>
            <h4>Studio</h4>
            <a href="#">Our growers</a>
            <a href="#">Workshops</a>
            <a href="#">Subscriptions</a>
            <a href="#">Journal</a>
          </div>
          <div>
            <h4>Care</h4>
            <a href="#">Delivery</a>
            <a href="#">Substitution policy</a>
            <a href="#">Care guides</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="fs-foot-news">
          <h4>The Letter</h4>
          <p>
            One short note a month — what&apos;s blooming, what&apos;s worth driving across town for.
          </p>
          <form className="fs-foot-form" action="#">
            <input type="email" placeholder="you@flowerlover.com" />
            <button type="submit">Subscribe</button>
          </form>
          <div className="fs-foot-pay">
            <span>visa</span>
            <span>mc</span>
            <span>amex</span>
            <span>apple&nbsp;pay</span>
          </div>
        </div>
      </div>
      <div className="fs-foot-bottom">
        <span>© 2026 Flower Shop. Made with stems and sunlight.</span>
        <span>Florentin 22 · Tel Aviv</span>
        <span>EN · USD</span>
      </div>
    </footer>
  );
}
