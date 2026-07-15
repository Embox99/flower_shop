"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Could not subscribe");
      }
      setStatus("done");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Could not subscribe");
    }
  };

  if (status === "done") {
    return <p className="fs-foot-form-done">You&apos;re on the list — welcome in.</p>;
  }

  return (
    <form className="fs-foot-form" onSubmit={submit}>
      <input
        type="email"
        required
        placeholder="you@flowerlover.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "…" : "Subscribe"}
      </button>
      {status === "error" && <span className="fs-foot-form-error">{error}</span>}
    </form>
  );
}
