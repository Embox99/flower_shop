/**
 * Shared API helpers: JSON responses, request validation via Zod, error wrappers.
 */
import { z, ZodError, ZodSchema } from "zod";
import { AuthError } from "./auth-helpers";

/**
 * Generic HTTP error carrying a status code. Thrown from anywhere inside a
 * `route()`-wrapped handler and turned into clean JSON (e.g. 409 out-of-stock,
 * 429 rate-limited).
 */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function json<T>(data: T, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

export function bad(message: string, status = 400, extra: any = {}) {
  return json({ error: message, ...extra }, { status });
}

/** Wraps a route handler so thrown errors return clean JSON. */
export function route<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (e: any) {
      if (e instanceof AuthError)  return bad(e.message, e.status);
      if (e instanceof HttpError)  return bad(e.message, e.status);
      if (e instanceof ZodError)   return bad("Invalid input", 422, { details: e.flatten() });
      console.error("API error:", e);
      return bad("Internal server error", 500);
    }
  }) as T;
}

/** Validate a JSON body against a Zod schema. */
export async function readBody<S extends ZodSchema>(req: Request, schema: S): Promise<z.output<S>> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}

/**
 * Pick the client address out of an X-Forwarded-For chain.
 *
 * Each proxy *appends* the address it received the request from, so only the
 * last `hops` entries were written by infrastructure we control. Anything to
 * their left came from the client and can be forged — taking the first entry
 * would let anyone dodge rate limits by sending a fresh fake IP each time.
 */
export function ipFromForwardedFor(header: string, hops: number): string | null {
  const chain = header.split(",").map((s) => s.trim()).filter(Boolean);
  if (hops < 1 || chain.length === 0) return null;
  return chain[Math.max(0, chain.length - hops)] ?? null;
}

/**
 * Client IP for rate limiting. TRUSTED_PROXY_HOPS is the number of proxies
 * in front of the app (default 1: Vercel, a single nginx, …); set it to 0
 * when the app is exposed directly so proxy headers are ignored.
 */
export function clientIp(req: Request): string {
  const parsed = parseInt(process.env.TRUSTED_PROXY_HOPS ?? "", 10);
  const hops = Number.isFinite(parsed) ? parsed : 1;
  if (hops < 1) return "unknown";
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? ipFromForwardedFor(fwd, hops) : null;
  return ip || req.headers.get("x-real-ip") || "unknown";
}

/** Read paged query params: ?page=1&limit=20 */
export function readPaging(url: URL, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || String(defaults.page)));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || String(defaults.limit))));
  return { page, limit, skip: (page - 1) * limit };
}
