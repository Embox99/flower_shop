"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FlowerShopMark from "../../components/FlowerShopMark";
import BouquetIllustration from "../../components/BouquetIllustration";

type Mode = "magic" | "staff";

/** Friendly copy for the error codes NextAuth appends as ?error=… */
const AUTH_ERRORS: Record<string, string> = {
  EmailSignin: "We couldn't send the sign-in email. Please try again in a moment.",
  Verification: "That sign-in link has expired or was already used. Request a fresh one below.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Use the one you signed up with.",
  AccessDenied: "You don't have access to that page.",
  SessionRequired: "Please sign in to continue.",
  CredentialsSignin: "Invalid email or password.",
};

/** Only follow same-site relative callbacks, never an arbitrary URL. */
function safeCallback(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const wantsStudio = callbackUrl.startsWith("/admin");

  const [mode, setMode] = useState<Mode>(wantsStudio ? "staff" : "magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const code = params.get("error");
    return code ? AUTH_ERRORS[code] || "Sign-in failed. Please try again." : "";
  });
  const [sentTo, setSentTo] = useState<string | null>(
    params.get("check-email") === "1" ? "" : null
  );

  const switchMode = (m: Mode) => { setMode(m); setError(""); };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("email", { email, callbackUrl, redirect: false });
    setLoading(false);
    if (res?.error) setError(AUTH_ERRORS[res.error] || res.error);
    else setSentTo(email);
  };

  const handleStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("staff-credentials", { email, password, callbackUrl, redirect: false });
    if (res?.error) {
      setLoading(false);
      setError(AUTH_ERRORS.CredentialsSignin);
    } else if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <main className="fs-auth">
      <div className="fs-auth-card">
        <aside className="fs-auth-art" aria-hidden="true">
          <BouquetIllustration
            palette={["#f5b8c4", "#f7d76b", "#a8c98a", "#e8a4a4"]}
            seed={21}
            className="fs-auth-bouquet"
          />
          <div className="fs-auth-art-copy">
            <span className="fs-section-eyebrow">Your account</span>
            <p>Track every bouquet from our bench to their door.</p>
            <ul>
              <li>Live order tracking</li>
              <li>Saved delivery addresses</li>
              <li>One-tap checkout</li>
            </ul>
          </div>
        </aside>

        <section className="fs-auth-body">
          <Link href="/" className="fs-auth-brand">
            <FlowerShopMark size={28} />
            <span>Flower Shop</span>
          </Link>

          {sentTo !== null ? (
            <div className="fs-auth-sent" role="status">
              <div className="fs-auth-sent-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <h1 className="fs-auth-title">Check your inbox</h1>
              <p className="fs-auth-lead">
                We sent a sign-in link{sentTo ? <> to <b>{sentTo}</b></> : null}. It&apos;s good for
                30 minutes. You can close this tab.
              </p>
              <button type="button" className="fs-link-btn" onClick={() => setSentTo(null)}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="fs-auth-switch" role="tablist" aria-label="Sign-in type">
                <button
                  type="button" role="tab" aria-selected={mode === "magic"}
                  className={mode === "magic" ? "fs-auth-switch--on" : ""}
                  onClick={() => switchMode("magic")}
                >
                  Customer
                </button>
                <button
                  type="button" role="tab" aria-selected={mode === "staff"}
                  className={mode === "staff" ? "fs-auth-switch--on" : ""}
                  onClick={() => switchMode("staff")}
                >
                  Studio team
                </button>
              </div>

              <h1 className="fs-auth-title">
                {mode === "magic" ? "Welcome back" : "Studio sign-in"}
              </h1>
              <p className="fs-auth-lead">
                {mode === "magic"
                  ? "We'll email you a one-tap sign-in link. No password to remember."
                  : "For staff and owners. Use your studio email and password."}
              </p>

              {error && <div className="fs-auth-alert" role="alert">{error}</div>}

              {mode === "magic" ? (
                <form className="fs-auth-form" onSubmit={handleMagic}>
                  <label className="fs-auth-field">
                    <span>Email</span>
                    <input
                      type="email" name="email" required autoComplete="email" inputMode="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <button type="submit" disabled={loading} className="fs-btn fs-btn--dark fs-btn--block">
                    {loading ? "Sending…" : "Email me a sign-in link"}
                  </button>
                  {googleEnabled && (
                    <>
                      <div className="fs-auth-or"><span>or</span></div>
                      <button
                        type="button" className="fs-btn fs-btn--ghost fs-btn--block"
                        onClick={() => signIn("google", { callbackUrl })}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
                          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
                          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.4a12 12 0 0 0 0 10.9l4-3.1Z" />
                          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
                        </svg>
                        Continue with Google
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <form className="fs-auth-form" onSubmit={handleStaff}>
                  <label className="fs-auth-field">
                    <span>Email</span>
                    <input
                      type="email" name="email" required autoComplete="username" inputMode="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <label className="fs-auth-field">
                    <span>Password</span>
                    <input
                      type="password" name="password" required autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <button type="submit" disabled={loading} className="fs-btn fs-btn--dark fs-btn--block">
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              )}
            </>
          )}

          <p className="fs-auth-foot">
            Just browsing? <Link href="/list">Continue as a guest →</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
