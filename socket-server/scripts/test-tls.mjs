// Quick TLS connection + pub/sub round-trip test for the socket-server
// Redis subscriber. Verifies that REDIS_URL is reachable and that PUBLISH
// from another client (e.g. Vercel via REST) reaches the SUBSCRIBE side.
//
// Run from socket-server/:  node scripts/test-tls.mjs
import "dotenv/config";
import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url) { console.error("❌ REDIS_URL missing in .env"); process.exit(1); }

console.log("→ connecting to:", url.replace(/:[^@]+@/, ":****@"));

const sub = new Redis(url, { lazyConnect: true });
const pub = new Redis(url, { lazyConnect: true });

await Promise.all([sub.connect(), pub.connect()]);
console.log("✅ TLS connection established");

const CHANNEL = "naqlgo:events";

await sub.subscribe(CHANNEL);
console.log("✅ subscribed to", CHANNEL);

const got = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("timeout")), 5000);
  sub.on("message", (ch, msg) => { clearTimeout(timer); resolve({ ch, msg }); });
});

const payload = JSON.stringify({ rooms: ["test"], event: "ping", data: { t: Date.now() } });
await pub.publish(CHANNEL, payload);
console.log("→ published:", payload);

const { ch, msg } = await got;
console.log("✅ received on", ch, ":", msg);

await Promise.all([sub.quit(), pub.quit()]);
console.log("\n🎉 pub/sub round-trip works — REDIS_URL is good for Render.");
