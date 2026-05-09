import { Redis } from "@upstash/redis";

// Lazy singleton — only constructs the client if env vars are present.
// If Redis is not configured (e.g. local dev without Upstash), every helper
// gracefully no-ops and the caller falls back to the source query.
let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    const r = getRedis();
    if (!r) return null;
    try { return (await r.get<T>(key)) ?? null; }
    catch (e) { console.error("[redis.get]", key, e); return null; }
  },

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
      if (ttlSec) await r.set(key, value, { ex: ttlSec });
      else        await r.set(key, value);
    } catch (e) { console.error("[redis.set]", key, e); }
  },

  async del(...keys: string[]): Promise<void> {
    const r = getRedis();
    if (!r || keys.length === 0) return;
    try { await r.del(...keys); }
    catch (e) { console.error("[redis.del]", keys, e); }
  },

  async incr(key: string, ttlSec?: number): Promise<number> {
    const r = getRedis();
    if (!r) return 0;
    try {
      const v = await r.incr(key);
      if (ttlSec && v === 1) await r.expire(key, ttlSec);
      return v;
    } catch (e) { console.error("[redis.incr]", key, e); return 0; }
  },

  /** Cache wrapper: tries Redis first, falls back to fn() on miss/no-redis. */
  async cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
    const val = await fn();
    // fire-and-forget — don't block the response on cache write
    void this.set(key, val, ttlSec);
    return val;
  },

  /** Invalidate a group of keys by exact match (Upstash REST has no SCAN). */
  async invalidate(...keys: string[]): Promise<void> {
    await this.del(...keys);
  },
};

/** Build deterministic cache keys. */
export const cacheKey = {
  transporters:   (wilaya: string, service: string, vehicleType?: string) =>
    `transporters:${wilaya}:${service ?? "any"}:${vehicleType ?? "any"}`,
  adminStats:     () => "admin:stats:v1",
  unreadCount:    (userId: string) => `notif:unread:${userId}`,
};
