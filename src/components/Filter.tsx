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
  { id: "posy",      label: "8 – 14 (posy)" },
  { id: "everyday",  label: "16 – 24 (everyday)" },
  { id: "statement", label: "26 – 36 (statement)" },
  { id: "event",     label: "40 + (event)" },
];

const deliverOptions = [
  { id: "today",    label: "Today (Tel Aviv)" },
  { id: "tomorrow", label: "Tomorrow" },
];

const Filter = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    next.delete("page"); // any filter change returns to page 1
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const activeColor = params.get("color");
  const activeStems = params.get("stems");
  const activeDeliver = params.get("deliver");
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
        {stemRanges.map((s) => (
          <label key={s.id} className="fs-checkbox">
            <input
              type="checkbox"
              checked={activeStems === s.id}
              onChange={() => update("stems", activeStems === s.id ? null : s.id)}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>

      <div className="fs-filter-group">
        <h5>Delivery</h5>
        {deliverOptions.map((d) => (
          <label key={d.id} className="fs-checkbox">
            <input
              type="checkbox"
              checked={activeDeliver === d.id}
              onChange={() => update("deliver", activeDeliver === d.id ? null : d.id)}
            />
            <span>{d.label}</span>
          </label>
        ))}
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
