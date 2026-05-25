import React from "react";

const items = [
  "❀ Peony season — May to early July",
  "✿ Subscriptions from $42 / month",
  "❁ Letterbox flowers, posted UK-wide",
  "✾ Saturday market, Florentin",
  "❀ Workshops every other Thursday",
  "✿ Free delivery over $50",
];

export default function Ticker() {
  return (
    <section className="fs-ticker">
      <div className="fs-ticker-track">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="fs-ticker-item">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
