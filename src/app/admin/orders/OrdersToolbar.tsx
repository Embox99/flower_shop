"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function OrdersToolbar({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") || "all";

  const setStatus = (s: string) => {
    const next = new URLSearchParams(params);
    if (s === "all") next.delete("status"); else next.set("status", s);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };
  const setQ = (q: string) => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };

  const tabs: [string, string][] = [
    ["all", "All"], ["NEW", "New"], ["TYING", "Tying"], ["READY", "Ready"],
    ["OUT_FOR_DELIVERY", "Out"], ["DELIVERED", "Delivered"], ["CANCELED", "Canceled"],
  ];

  return (
    <div className="ad-toolbar">
      <div className="ad-tabs">
        {tabs.map(([k, label]) => (
          <button key={k}
            className={"ad-tab" + (status === k ? " ad-tab--on" : "")}
            onClick={() => setStatus(k)}>
            {label} <span className="ad-tab-count">{counts[k] || 0}</span>
          </button>
        ))}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
        <input
          className="ad-input"
          placeholder="Search code / customer…"
          defaultValue={params.get("q") || ""}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
    </div>
  );
}
