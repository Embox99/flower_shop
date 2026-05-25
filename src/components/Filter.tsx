"use client";
import React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const colorChips = [
  { id: "white", c: "#ffffff", label: "Whites" },
  { id: "blush", c: "#f5b8c4", label: "Blush" },
  { id: "warm",  c: "#e8a04a", label: "Warm" },
  { id: "deep",  c: "#7a2330", label: "Deep" },
  { id: "green", c: "#7a8a5a", label: "Greens" },
  { id: "lilac", c: "#c8b2e8", label: "Lilac" },
];

const stemRanges = [
  "8 – 14 (posy)",
  "16 – 24 (everyday)",
  "26 – 36 (statement)",
  "40 + (event)",
];

const Filter = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const activeColor = params.get("color");
  const max = params.get("max") || "300";

  return (
    <aside className="fs-filters">
      <div className="fs-filter-group">
        <h5>Colour</h5>
        <div className="fs-color-chips">
          {colorChips.map((cc) => (
            <button
              key={cc.id}
              type="button"
              className={"fs-color-chip" + (activeColor === cc.id ? " fs-color-chip--on" : "")}
              onClick={() => update("color", activeColor === cc.id ? null : cc.id)}
            >
              <span style={{ background: cc.c }} />
              {cc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fs-filter-group">
        <h5>Price</h5>
        <input
          type="range"
          min="20"
          max="300"
          step="5"
          defaultValue={max}
          onChange={(e) => update("max", e.target.value)}
        />
        <div className="fs-filter-range">
          <span>$20</span>
          <span>up to ${max}</span>
        </div>
      </div>

      <div className="fs-filter-group">
        <h5>Stems</h5>
        {stemRanges.map((s, i) => (
          <label key={i} className="fs-checkbox">
            <input type="checkbox" />
            <span>{s}</span>
          </label>
        ))}
      </div>

      <div className="fs-filter-group">
        <h5>Delivery</h5>
        <label className="fs-checkbox">
          <input type="checkbox" defaultChecked /> <span>Today (Tel Aviv)</span>
        </label>
        <label className="fs-checkbox">
          <input type="checkbox" /> <span>Tomorrow</span>
        </label>
        <label className="fs-checkbox">
          <input type="checkbox" /> <span>Pick a date</span>
        </label>
      </div>

      <button
        className="fs-link-btn"
        type="button"
        onClick={() => router.replace(pathname, { scroll: false })}
      >
        Clear all filters
      </button>
    </aside>
  );
};

export default Filter;
