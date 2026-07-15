/**
 * Fixed-window rate limiting backed by Redis.
 *
 * Each unique key gets a counter that resets every `windowSec`. The first hit
 * in a window sets the TTL; subsequent hits just increment. This is simple and
 * race-safe enough for abuse prevention (login spam, checkout flooding).
 *
 * Fails OPEN: if Redis isn't configured or is unreachable, requests are allowed.
 * Availability of the storefront matters more than perfect enforcement.
 */
import { redis } from "./redis";
import { HttpError, clientIp } from "./api";

export interface RateLimitResult {
  ok: boolean;
  /** Requests left in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the window resets. */
  resetSec: number;
}

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

export async function rateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): Promise<RateLimitResult> {
  // No Redis → fail open.
  if (!redis) return { ok: true, remaining: limit, resetSec: 0 };

  const redisKey = `rl:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      // First request in this window — start the expiry clock.
      await redis.expire(redisKey, windowSec);
    }
    const ttl = await redis.ttl(redisKey);
    const resetSec = ttl > 0 ? ttl : windowSec;
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      resetSec,
    };
  } catch (err) {
    // Redis hiccup — don't block real customers.
    console.warn("[rate-limit] redis error, allowing request:", (err as Error).message);
    return { ok: true, remaining: limit, resetSec: 0 };
  }
}

/**
 * Enforce a rate limit for a request, throwing HttpError(429) when exceeded.
 * `name` namespaces the limit (e.g. "checkout", "cart-add") so different
 * endpoints don't share a budget. Keyed by client IP.
 */
export async function enforceRateLimit(
  req: Request,
  name: string,
  opts: RateLimitOptions
): Promise<void> {
  const ip = clientIp(req);
  const { ok, resetSec } = await rateLimit(`${name}:${ip}`, opts);
  if (!ok) {
    throw new HttpError(
      `Too many requests. Please try again in ${resetSec}s.`,
      429
    );
  }
}
