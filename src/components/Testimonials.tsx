import React from "react";

const quotes = [
  { q: "I sent these to my mother and she called me crying. The good kind.", w: "Maya R., Jerusalem" },
  { q: "Arrived in better shape than the bouquet I drove home from a market.", w: "Daniel S., London" },
  { q: "We did our wedding with them. They knew the dress better than my sister.", w: "Lior & Tom" },
];

export default function Testimonials() {
  return (
    <section className="fs-quotes">
      {quotes.map((t, i) => (
        <figure className="fs-quote" key={i}>
          <svg className="fs-quote-mark" viewBox="0 0 40 40" aria-hidden="true">
            <text
              x="0"
              y="34"
              style={{ font: "600 48px 'Cormorant Garamond', serif" }}
              fill="currentColor"
            >
              &ldquo;
            </text>
          </svg>
          <blockquote>{t.q}</blockquote>
          <figcaption>— {t.w}</figcaption>
        </figure>
      ))}
    </section>
  );
}
