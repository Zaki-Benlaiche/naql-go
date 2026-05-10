import { redis } from "./redis";
import type { NextRequest } from "next/server";

// Redis-backed sliding-window-ish rate limiter.
// If Redis is not configured, every check is allowed (fail-open) so local dev
// without Upstash still works.

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSec: number;
};

export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const key = `rl:${bucket}:${identifier}`;
  const count = await redis.incr(key, windowSec);
  // count === 0 means Redis is not configured — fail-open.
  if (count === 0) {
    return { allowed: true, count: 0, limit, retryAfterSec: 0 };
  }
  return {
    allowed: count <= limit,
    count,
    limit,
    retryAfterSec: count > limit ? windowSec : 0,
  };
}

// Best-effort IP extraction. Vercel sets x-forwarded-for; the first entry is
// the original client. Falls back to a generic bucket so misconfigured proxies
// don't bypass the limiter entirely.
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}
