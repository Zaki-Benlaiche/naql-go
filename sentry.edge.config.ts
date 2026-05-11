// Sentry edge runtime init — for middleware and edge functions.
// Same DSN as server; Sentry tags transactions with their runtime.
import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    sampleRate: 1.0,
    environment: process.env.VERCEL_ENV ?? "development",
  });
}
