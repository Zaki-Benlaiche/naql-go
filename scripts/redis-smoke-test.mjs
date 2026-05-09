// Quick connectivity + round-trip test for the Upstash Redis cache layer.
// Run: node scripts/redis-smoke-test.mjs
import "dotenv/config";
import { Redis } from "@upstash/redis";

const url   = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("❌ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env");
  process.exit(1);
}

const redis = new Redis({ url, token });

const KEY = "naqlgo:smoketest";
const value = { ts: Date.now(), msg: "hello from naqlgo phase 1" };

console.log("→ Endpoint:", url);
console.log("→ Writing test value with TTL 60 s...");

const t0 = Date.now();
await redis.set(KEY, value, { ex: 60 });
const t1 = Date.now();

const got = await redis.get(KEY);
const t2 = Date.now();

console.log("✅ SET round-trip:", t1 - t0, "ms");
console.log("✅ GET round-trip:", t2 - t1, "ms");
console.log("✅ Value matches:  ", JSON.stringify(got) === JSON.stringify(value));

await redis.del(KEY);
console.log("✅ Cleanup done.");
console.log("\n🎉 Redis cache layer is live and reachable.");
