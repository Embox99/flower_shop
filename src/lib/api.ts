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
 * Best-effort client IP for rate limiting. Reads the proxy headers a typical
 * deployment (Vercel, nginx, Cloudflare) sets; falls back to "unknown".
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Read paged query params: ?page=1&limit=20 */
export function readPaging(url: URL, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || String(defaults.page)));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || String(defaults.limit))));
  return { page, limit, skip: (page - 1) * limit };
}
