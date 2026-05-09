// Realtime publish helpers — sit on top of Upstash Redis (REST PUBLISH).
//
// Pattern: API routes call publish() after a mutation, the socket server
// has SUBSCRIBE'd to the same channel and fans the event out to the
// targeted Socket.IO rooms.
//
// We piggy-back on the same Upstash database used by the cache layer, so
// there's nothing extra to provision — and PUBLISH from REST works fine
// even though SUBSCRIBE doesn't (the socket server uses the TLS protocol).
//
// Fail-safe: if Upstash isn't configured, publish() silently no-ops. The
// app keeps working through its existing polling (until polling is fully
// removed in step 2.4).

import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { _redis = null; return null; }
  _redis = new Redis({ url, token });
  return _redis;
}

const CHANNEL = "naqlgo:events";

/**
 * Publish an event to one or more Socket.IO rooms.
 * Fire-and-forget: never throws to the caller, never blocks the response.
 *
 * @param rooms  Room names — "user:<id>" for private fanout, "req:<id>" for
 *               request-scoped fanout (chat / GPS / status).
 * @param event  Event name on the client (e.g. "chat:message", "notification:new").
 * @param data   JSON-serializable payload.
 */
export function publish(rooms: string | string[], event: string, data: unknown): void {
  const r = getRedis();
  if (!r) return;
  const list = Array.isArray(rooms) ? rooms : [rooms];
  if (list.length === 0) return;

  // We don't await — the API response shouldn't wait on a fanout that the
  // client doesn't care about acknowledging. Errors go to the log.
  void r.publish(CHANNEL, JSON.stringify({ rooms: list, event, data }))
    .catch((e) => console.error("[realtime.publish]", event, e));
}

/** Convenience wrappers — keep the room-name strings centralized. */
export const room = {
  user: (id: string) => `user:${id}`,
  req:  (id: string) => `req:${id}`,
};

export const events = {
  // server → client
  notificationNew:  "notification:new",
  requestsUpdated:  "requests:updated",
  requestStatus:    "request:status",
  bidNew:           "bid:new",
  bidAccepted:      "bid:accepted",
  chatMessage:      "chat:message",
  locationUpdate:   "location:update",
} as const;
