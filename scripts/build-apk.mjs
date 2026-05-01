// Build the Capacitor APK frontend bundle (cross-platform).
// 1. Temporarily moves src/app/api and src/middleware.ts out of the way
//    so Next.js can do a pure static export.
// 2. Builds Next.js as a static export (output: "export")
// 3. Syncs the result into android/app/src/main/assets/public
// 4. Restores the moved files.
//
// After this script run:
//   cd android && ./gradlew assembleDebug
import { spawnSync } from "node:child_process";
import { rmSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const env = {
  ...process.env,
  BUILD_TARGET: "capacitor",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://naql-go.vercel.app",
};

const movements = [
  { from: join(ROOT, "src/app/api"),         to: join(ROOT, "src/_app_api_off") },
  { from: join(ROOT, "src/middleware.ts"),   to: join(ROOT, "src/_middleware_off.ts") },
];

function move(pair) {
  if (existsSync(pair.from) && !existsSync(pair.to)) {
    renameSync(pair.from, pair.to);
  }
}
function unmove(pair) {
  if (existsSync(pair.to) && !existsSync(pair.from)) {
    renameSync(pair.to, pair.from);
  }
}

function restoreAll() {
  for (const m of movements) unmove(m);
}

process.on("SIGINT",  () => { restoreAll(); process.exit(130); });
process.on("SIGTERM", () => { restoreAll(); process.exit(143); });
process.on("uncaughtException", (err) => { restoreAll(); throw err; });

function run(cmd, args) {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: true });
  if (r.status !== 0) {
    restoreAll();
    process.exit(r.status ?? 1);
  }
}

console.log("\n▶ NEXT_PUBLIC_API_URL =", env.NEXT_PUBLIC_API_URL);

// Clean previous build artefacts
if (existsSync("out"))   rmSync("out",   { recursive: true, force: true });
if (existsSync(".next")) rmSync(".next", { recursive: true, force: true });

console.log("▶ Hiding API routes and middleware (static export)...");
for (const m of movements) move(m);

try {
  run("npx", ["next", "build"]);
  run("npx", ["cap", "sync", "android"]);
} finally {
  console.log("\n▶ Restoring API routes and middleware...");
  restoreAll();
}

console.log("\n✅ Frontend bundled inside android/app/src/main/assets/public/");
console.log("   Now run:  cd android && ./gradlew assembleDebug");
console.log("   APK will be at: android/app/build/outputs/apk/debug/app-debug.apk\n");
