import React from "react";

const labels: Record<string, [string, string]> = {
  NEW:              ["new",       "ad-pill--new"],
  TYING:            ["tying",     "ad-pill--tying"],
  READY:            ["ready",     "ad-pill--ready"],
  OUT_FOR_DELIVERY: ["out",       "ad-pill--out"],
  DELIVERED:        ["delivered", "ad-pill--done"],
  CANCELED:         ["canceled",  "ad-pill--canceled"],

  ACTIVE:           ["active",    "ad-pill--ready"],
  PAUSED:           ["paused",    "ad-pill--draft"],
  DRAFT:            ["draft",     "ad-pill--draft"],
  ARCHIVED:         ["archived",  "ad-pill--draft"],

  PAID:             ["paid",      "ad-pill--paid"],
  PENDING:          ["pending",   "ad-pill--new"],
  REFUNDED:         ["refunded",  "ad-pill--canceled"],
};

export default function StatusPill({ status }: { status: string }) {
  const [text, cls] = labels[status] || [status.toLowerCase(), ""];
  return <span className={"ad-pill " + cls}>{text.replace(/_/g, " ")}</span>;
}
