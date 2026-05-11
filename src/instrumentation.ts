// Next.js calls this once per runtime to set up cross-runtime instrumentation.
// We use it to wire Sentry into both the Node and Edge runtimes.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captures unhandled errors that bubble up from React Server Components.
// captureRequestError ships as part of @sentry/nextjs 8+.
export const onRequestError = Sentry.captureRequestError;
