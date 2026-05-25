"use client";
import React from "react";
import { useRouter } from "next/navigation";

/**
 * A table row that navigates on click — usable inside server components.
 * Server components can't pass `onClick` directly, so this client wrapper
 * sits inside any otherwise-server table.
 */
export default function ClickableRow({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <tr className={className} onClick={() => router.push(href)} style={{ cursor: "pointer" }}>
      {children}
    </tr>
  );
}