// Sentry client init — runs in the browser (and inside the Capacitor WebView).
// Public DSN is fine to expose (Sentry's design accepts client-side DSNs).
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Don't trace every nav — pilot volume + 5k/month quota.
    tracesSampleRate: 0.05,
    sampleRate: 1.0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    // Replay on errors only — drops bandwidth vs. always-on.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Network request failed",
      "Failed to fetch",
      "Load failed",
    ],
  });
}
