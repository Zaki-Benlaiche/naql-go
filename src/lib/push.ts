// FCM HTTP v1 sender.
//
// Why this file (vs firebase-admin):
//  - firebase-admin adds ~10 MB to the bundle and cold-starts slowly on Vercel.
//  - We only need one thing: POST to FCM with an OAuth2 access token.
//  - JWT signing uses `jsonwebtoken` (already a dep). Access token is cached
//    in Upstash Redis for 50 min (FCM tokens live 60 min).
//
// Required env vars (Vercel):
//   FCM_PROJECT_ID
//   FCM_CLIENT_EMAIL
//   FCM_PRIVATE_KEY   (paste the full -----BEGIN PRIVATE KEY-----... block.
//                      Vercel preserves newlines; if you ever switch to a
//                      provider that doesn't, escape \n in the value.)
//
// If any of those are missing, send() silently no-ops — the app still runs.

import jwt from "jsonwebtoken";
import { redis } from "./redis";
import { prisma } from "./prisma";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

function getConfig() {
  const projectId    = process.env.FCM_PROJECT_ID;
  const clientEmail  = process.env.FCM_CLIENT_EMAIL;
  // Vercel keeps real newlines; local .env often uses \n escapes. Handle both.
  const privateKey   = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

const ACCESS_TOKEN_KEY = "fcm:access_token";

async function getAccessToken(): Promise<string | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  // Try cache first — saves an OAuth round-trip per request.
  const cached = await redis.get<string>(ACCESS_TOKEN_KEY);
  if (cached) return cached;

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: cfg.clientEmail,
      scope: FCM_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    cfg.privateKey,
    { algorithm: "RS256" },
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    console.error("[push] oauth failed", res.status, await res.text());
    return null;
  }
  const { access_token } = (await res.json()) as { access_token: string };
  // Cache slightly below the 1-hour lifetime so we never use an expired one.
  await redis.set(ACCESS_TOKEN_KEY, access_token, 50 * 60);
  return access_token;
}

export type PushPayload = {
  title: string;
  body: string;
  // Anything in `data` is delivered as strings to the client app and used to
  // route the user when they tap the notification (e.g. open a specific
  // request). Keep keys short — FCM caps payload at 4 KB.
  data?: Record<string, string>;
};

async function sendToToken(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  payload: PushPayload,
): Promise<{ ok: boolean; invalid: boolean }> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: { title: payload.title, body: payload.body },
          data: payload.data,
          android: {
            priority: "HIGH",
            notification: {
              // Wake the device + buzz so a driver in pocket actually hears it.
              channel_id: "naqlgo_orders",
              default_sound: true,
              default_vibrate_timings: true,
            },
          },
        },
      }),
    },
  );

  if (res.ok) return { ok: true, invalid: false };

  // 404 UNREGISTERED / 400 INVALID_ARGUMENT on token = the device unsubscribed
  // or reinstalled the app. We delete it so future sends don't waste a call.
  const text = await res.text();
  const invalid =
    res.status === 404 ||
    /UNREGISTERED|INVALID_ARGUMENT.*registration token/i.test(text);
  if (!invalid) console.error("[push] send failed", res.status, text);
  return { ok: false, invalid };
}

/**
 * Send a push notification to every device registered to a user.
 * Fire-and-forget from the caller's perspective: errors are logged, never
 * thrown, and an unreachable FCM doesn't slow down the API response.
 *
 * Returns the number of successfully delivered messages.
 */
export async function pushToUser(userId: string, payload: PushPayload): Promise<number> {
  try {
    const cfg = getConfig();
    if (!cfg) return 0;

    const tokens = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });
    if (tokens.length === 0) return 0;

    const accessToken = await getAccessToken();
    if (!accessToken) return 0;

    const results = await Promise.all(
      tokens.map((t) => sendToToken(accessToken, cfg.projectId, t.token, payload)),
    );

    // Clean up dead tokens. Best-effort; OK if it fails.
    const dead = tokens.filter((_, i) => results[i].invalid).map((t) => t.token);
    if (dead.length > 0) {
      void prisma.deviceToken
        .deleteMany({ where: { userId, token: { in: dead } } })
        .catch((e) => console.error("[push] cleanup", e));
    }

    return results.filter((r) => r.ok).length;
  } catch (e) {
    console.error("[pushToUser]", userId, e);
    return 0;
  }
}

/** Fire-and-forget wrapper — never awaits, never throws. Use from API routes
 *  that shouldn't slow down for FCM latency. */
export function pushToUserAsync(userId: string, payload: PushPayload): void {
  void pushToUser(userId, payload).catch((e) =>
    console.error("[pushToUserAsync]", e),
  );
}
