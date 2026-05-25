/**
 * Shared API helpers: JSON responses, request validation via Zod, error wrappers.
 */
import { ZodError, ZodSchema } from "zod";
import { AuthError } from "./auth-helpers";

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
      if (e instanceof ZodError)   return bad("Invalid input", 422, { details: e.flatten() });
      console.error("API error:", e);
      return bad("Internal server error", 500);
    }
  }) as T;
}

/** Validate a JSON body against a Zod schema. */
export async function readBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}

/** Read paged query params: ?page=1&limit=20 */
export function readPaging(url: URL, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || String(defaults.page)));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || String(defaults.limit))));
  return { page, limit, skip: (page - 1) * limit };
}
