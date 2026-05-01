import type { NextConfig } from "next";

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

export default nextConfig;
