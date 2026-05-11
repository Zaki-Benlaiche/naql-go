import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  reactCompiler: true,

  ...(isCapacitor
    ? {
        // ── Static export for Capacitor APK ──
        output: "export",
        images: { unoptimized: true },
        trailingSlash: true,
        // Skip type errors in pages we can't statically render
        typescript: { ignoreBuildErrors: false },
      }
    : {
        // ── Vercel SSR build ──
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Frame-Options", value: "ALLOWALL" },
                {
                  key: "Content-Security-Policy",
                  value:
                    "frame-ancestors 'self' https://*.vercel.app capacitor: https://localhost https://*.naqlgo.com;",
                },
              ],
            },
          ];
        },
      }),
};

// Wrap with Sentry only for the Vercel build. We skip the wrapper for the
// Capacitor static export — the source-map upload step needs an auth token
// that the local APK build doesn't need to set.
export default isCapacitor
  ? nextConfig
  : withSentryConfig(nextConfig, {
      // Silent unless SENTRY_AUTH_TOKEN is configured. The DSN alone is
      // enough to capture errors; source-map upload is a nice-to-have.
      silent: !process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Hide source maps from the public bundle.
      sourcemaps: { disable: false },
      // Keep build output clean — disable Vercel cron telemetry probe.
      disableLogger: true,
    });
