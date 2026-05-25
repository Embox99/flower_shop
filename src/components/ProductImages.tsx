"use client";
import React, { useState } from "react";
import Image from "next/image";
import BouquetIllustration from "./BouquetIllustration";

type Item = { _id?: string; image?: { url?: string } };

const fallbackPalette = ["#f5b8c4", "#f7d76b", "#a8c98a", "#e8a4a4"];

export default function ProductImages({
  items,
  badge,
  name,
}: {
  items?: Item[];
  badge?: string;
  name?: string;
}) {
  const list = items?.filter((i) => i?.image?.url) || [];
  const [index, setIndex] = useState(0);
  const main = list[index];

  return (
    <div className="fs-product-images">
      <div
        className="fs-product-image-main"
        style={{
          background: `linear-gradient(135deg, ${fallbackPalette[0]}55, ${fallbackPalette[1]}33, ${fallbackPalette[2]}55)`,
        }}
      >
        {badge && <span className="fs-product-badge">{badge}</span>}
        {main?.image?.url ? (
          <Image
            src={main.image.url}
            alt={name || ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <BouquetIllustration
            palette={fallbackPalette}
            seed={index * 7 + 1}
            className="fs-product-bouquet"
          />
        )}
        <div className="fs-product-stamp">
          <span>cut</span>
          <b>05.05</b>
          <span>tel aviv</span>
        </div>
      </div>
      {list.length > 1 && (
        <div className="fs-product-thumbs">
          {list.slice(0, 4).map((it, i) => (
            <button
              key={it._id || i}
              className={"fs-product-thumb" + (index === i ? " fs-product-thumb--on" : "")}
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
            >
              {it.image?.url ? (
                <Image
                  src={it.image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <BouquetIllustration palette={fallbackPalette} seed={i * 7 + 1} />
              )}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 && (
        <div className="fs-product-thumbs">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              className={"fs-product-thumb" + (index === i ? " fs-product-thumb--on" : "")}
              onClick={() => setIndex(i)}
              style={{
                background: `linear-gradient(${i * 80}deg, ${fallbackPalette[0]}33, ${fallbackPalette[(i + 1) % fallbackPalette.length]}33)`,
              }}
            >
              <BouquetIllustration palette={fallbackPalette} seed={i * 7 + 1} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
