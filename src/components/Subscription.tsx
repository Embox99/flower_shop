import React from "react";

export default function Subscription() {
  return (
    <section className="fs-sub">
      <div className="fs-sub-marks" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>❀</span>
        ))}
      </div>
      <span className="fs-section-eyebrow">A flower subscription</span>
      <h2 className="fs-sub-title">Every fortnight, a fresh face on the kitchen table.</h2>
      <p>
        We pick what&apos;s most beautiful that morning. Skip a week, change a date, cancel any
        time. From $42.
      </p>
      <div className="fs-sub-actions">
        <button className="fs-btn fs-btn--dark">Start a subscription</button>
        <button className="fs-btn fs-btn--ghost">How it works →</button>
      </div>
    </section>
  );
}
