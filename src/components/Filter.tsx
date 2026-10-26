"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useUIStore } from "../hooks/useUIStore";

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

const PRICE_MAX = "300";

/**
 * Catalogue filters. A sidebar on desktop; below 900px the same panel becomes
 * a bottom sheet opened from the toolbar's "Filters" button.
 */
const Filter = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const open = useUIStore((s) => s.filtersOpen);
  const setOpen = useUIStore((s) => s.setFiltersOpen);

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

  // The slider updates its label live but only navigates once dragging pauses,
  // instead of re-rendering the catalogue on every pixel.
  const urlMax = params.get("max") || PRICE_MAX;
  const [max, setMax] = useState(urlMax);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setMax(urlMax), [urlMax]);
  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);
  const onPrice = (v: string) => {
    setMax(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => update("max", v === PRICE_MAX ? null : v), 350);
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("fs-scroll-lock");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("fs-scroll-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <>
      {open && <div className="fs-filters-scrim" onClick={() => setOpen(false)} />}
      <aside
        id="fs-filters"
        className={"fs-filters" + (open ? " fs-filters--open" : "")}
        aria-label="Filters"
      >
        <div className="fs-filters-head">
          <h4>Filters</h4>
          <button className="fs-icon-btn" onClick={() => setOpen(false)} aria-label="Close filters">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="fs-filter-group">
          <h5>Colour</h5>
          <div className="fs-color-chips">
            {colorChips.map((cc) => (
              <button
                key={cc.id}
                type="button"
                aria-pressed={activeColor === cc.id}
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
            max={PRICE_MAX}
            step="5"
            value={max}
            aria-label="Maximum price"
            onChange={(e) => onPrice(e.target.value)}
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
        <button
          type="button"
          className="fs-btn fs-btn--dark fs-btn--block fs-filters-apply"
          onClick={() => setOpen(false)}
        >
          Show results
        </button>
      </aside>
    </>
  );
};

export default Filter;
