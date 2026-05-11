// Sentry server-side init — loaded by Next.js on every serverless function.
// DSN is optional: if SENTRY_DSN is unset, init() is a no-op and the app
// keeps working without monitoring.
import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Sample only 10% of transactions — keeps us inside the free 5k/month
    // quota at pilot volume while still surfacing slow endpoints.
    tracesSampleRate: 0.1,
    // Capture every unhandled exception (no sampling).
    sampleRate: 1.0,
    environment: process.env.VERCEL_ENV ?? "development",
    // Drop noisy errors that don't indicate a real bug.
    ignoreErrors: [
      "AbortError",
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],
  });
}
