import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Allow the Capacitor WebView to load the site
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
};

export default nextConfig;
