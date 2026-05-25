"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FlowerShopMark from "../../components/FlowerShopMark";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const checkEmail = params.get("check-email") === "1";

  const [mode, setMode] = useState<"magic" | "staff">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(checkEmail ? "Check your inbox for a magic link." : "");

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const res = await signIn("email", { email, callbackUrl, redirect: false });
    setLoading(false);
    if (res?.error) setError(res.error);
    else setMessage("Magic link sent. Check your inbox.");
  };

  const handleStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const res = await signIn("staff-credentials", { email, password, callbackUrl, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else if (res?.ok) router.push(callbackUrl);
  };

  const handleGoogle = () => signIn("google", { callbackUrl });

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-bg-card border border-[var(--fs-line-soft)] rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <FlowerShopMark size={28} />
          <span className="font-serif text-xl text-ink">Flower Shop</span>
        </div>
        <h1 className="font-serif text-3xl text-ink mt-4" style={{ letterSpacing: "-0.02em" }}>
          {mode === "magic" ? "Welcome back" : "Studio sign-in"}
        </h1>
        <p className="text-sm text-ink-mute mt-2 mb-8">
          {mode === "magic"
            ? "We'll email you a one-tap sign-in link — no password to remember."
            : "Staff and owners only. Use your studio email and password."}
        </p>

        {mode === "magic" ? (
          <form className="flex flex-col gap-4" onSubmit={handleMagic}>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-ink-mute uppercase tracking-wider">Email</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="border border-[var(--fs-line)] bg-bg-card px-4 py-3 rounded-xl text-base outline-none focus:border-ink"
                placeholder="you@flowerlover.com"
              />
            </label>
            <button type="submit" disabled={loading} className="fs-btn fs-btn--dark fs-btn--block disabled:opacity-60">
              {loading ? "Sending…" : "Email me a sign-in link"}
            </button>
            <div className="flex items-center gap-3 text-xs text-ink-mute font-mono tracking-widest uppercase my-1">
              <span className="flex-1 h-px bg-[var(--fs-line)]" /> or <span className="flex-1 h-px bg-[var(--fs-line)]" />
            </div>
            <button type="button" onClick={handleGoogle} className="fs-btn">
              Continue with Google
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleStaff}>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-ink-mute uppercase tracking-wider">Email</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="border border-[var(--fs-line)] bg-bg-card px-4 py-3 rounded-xl text-base outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-ink-mute uppercase tracking-wider">Password</span>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="border border-[var(--fs-line)] bg-bg-card px-4 py-3 rounded-xl text-base outline-none focus:border-ink"
              />
            </label>
            <button type="submit" disabled={loading} className="fs-btn fs-btn--dark fs-btn--block disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">{error}</div>}
        {message && <div className="text-sm text-[var(--fs-accent-2)] bg-[#f4f1ec] border border-[var(--fs-line-soft)] rounded-xl px-4 py-3 mt-4">{message}</div>}

        <div className="mt-8 pt-6 border-t border-[var(--fs-line-soft)] flex justify-between items-center text-sm">
          <button className="fs-link-btn" onClick={() => setMode(mode === "magic" ? "staff" : "magic")}>
            {mode === "magic" ? "Studio sign-in →" : "← Customer sign-in"}
          </button>
          <Link href="/" className="text-xs text-ink-mute hover:text-ink">
            Continue as guest
          </Link>
        </div>
      </div>
    </main>
  );
}
