/**
 * Redis client singleton (ioredis) — used for rate limiting and, later, caching.
 *
 * If REDIS_URL is not configured the client is `null` and callers should treat
 * Redis as unavailable (rate limiting fails open — see rate-limit.ts). The
 * singleton pattern mirrors prisma.ts to avoid piling up connections on
 * hot-reload during dev.
 */
import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisGlobal: Redis | null | undefined;
}

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = new Redis(url, {
    // Don't crash the process on transient Redis outages — rate limiting is
    // best-effort and fails open.
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  client.on("error", (err) => {
    console.warn("[redis] connection error:", err.message);
  });
  return client;
}

export const redis: Redis | null =
  global.redisGlobal ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.redisGlobal = redis;
}
