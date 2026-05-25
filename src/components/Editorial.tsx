import React from "react";
import BouquetIllustration from "./BouquetIllustration";

export default function Editorial() {
  return (
    <section className="fs-edit">
      <div
        className="fs-edit-img"
        style={{ background: "linear-gradient(135deg, #efe2c7, #e8c8b9)" }}
      >
        <BouquetIllustration
          palette={["#7a2330", "#c84d5a", "#e8a4a4", "#3a4a2e"]}
          seed={42}
          className="fs-edit-bouquet"
        />
        <div className="fs-edit-tag">Field notes · No. 14</div>
      </div>
      <div className="fs-edit-body">
        <span className="fs-section-eyebrow">A Sunday letter</span>
        <h2 className="fs-edit-title">
          On standing&nbsp;flowers in&nbsp;the&nbsp;hallway,
          <br />
          because you&nbsp;walk past&nbsp;them most.
        </h2>
        <p>
          We get asked all the time where flowers should live. Not the dining table — you sit
          there twice a day. Put them where you walk past them seven, eight times. The hallway.
          The desk. The space at the top of the stairs.
        </p>
        <p>Small bouquets, often, beat big bouquets, sometimes.</p>
        <button className="fs-link-btn">Read the journal →</button>
      </div>
    </section>
  );
}
