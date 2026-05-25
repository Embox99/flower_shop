import React from "react";

/** A botanical-flavoured loading placeholder. */
export default function Skeleton() {
  return (
    <div className="fs-grid mt-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="fs-card animate-pulse">
          <div className="fs-card-img" style={{ background: "var(--fs-bg-soft)" }} />
          <div className="fs-card-foot">
            <div className="h-5 w-1/2 bg-[var(--fs-bg-soft)] rounded" />
            <div className="h-3 w-3/4 bg-[var(--fs-bg-soft)] rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
