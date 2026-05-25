import React from "react";

const messages = [
  "Free same-day delivery in Tel Aviv on orders over $50",
  "Spring market this Saturday — Florentin, 9 to 1",
  "Letterbox flowers now ship UK-wide",
];

export default function Banner() {
  const all = [...messages, ...messages];
  return (
    <div className="fs-banner">
      <div className="fs-banner-track">
        {all.map((m, i) => (
          <span key={i} className="fs-banner-item">
            <span className="fs-banner-dot" />
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
