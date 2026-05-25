"use client";
import React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function ListToolbar({
  count,
  cats,
}: {
  count: number | string;
  cats: { slug: string; name: string }[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const active = params.get("cat") || "all";
  const sort = params.get("sort") || "";

  const setCat = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug === "all") next.delete("cat");
    else next.set("cat", slug);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setSort = (v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set("sort", v);
    else next.delete("sort");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <section className="fs-list-toolbar">
      <button type="button" className="fs-toolbar-btn">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h14M5 10h10M7 14h6" />
        </svg>
        Filters
      </button>
      <div className="fs-toolbar-cats">
        <button
          className={"fs-chip" + (active === "all" ? " fs-chip--on" : "")}
          onClick={() => setCat("all")}
        >
          All
        </button>
        {cats.map((c) => (
          <button
            key={c.slug}
            className={"fs-chip" + (active === c.slug ? " fs-chip--on" : "")}
            onClick={() => setCat(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="fs-toolbar-right">
        <span className="fs-toolbar-count">{count} pieces</span>
        <label className="fs-toolbar-sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Featured</option>
            <option value="asc price">Price · low</option>
            <option value="desc price">Price · high</option>
          </select>
        </label>
      </div>
    </section>
  );
}
