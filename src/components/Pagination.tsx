"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({
  page,
  hasPrev,
  hasNext,
}: {
  page: number; // 1-based
  hasPrev: boolean;
  hasNext: boolean;
}) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const go = (n: number) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-4 font-mono text-xs">
      <button
        className="px-4 py-2 rounded-full border border-[var(--fs-line)] disabled:opacity-40"
        onClick={() => go(page - 1)}
        disabled={!hasPrev}
      >
        ← Prev
      </button>
      <span className="px-3 text-ink-mute">page {page}</span>
      <button
        className="px-4 py-2 rounded-full border border-[var(--fs-line)] disabled:opacity-40"
        onClick={() => go(page + 1)}
        disabled={!hasNext}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
