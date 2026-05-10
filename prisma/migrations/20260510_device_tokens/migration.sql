-- Push notification: register a device's FCM token per user. A single user
-- can have several rows (phone + tablet + web), and a single token can move
-- between users on the same phone (uninstall/reinstall) — we just upsert.

CREATE TABLE IF NOT EXISTS "device_tokens" (
  "id"         TEXT PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "token"      TEXT NOT NULL,
  "platform"   TEXT NOT NULL DEFAULT 'android',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "device_tokens_userId_token_key"
  ON "device_tokens"("userId", "token");

CREATE INDEX IF NOT EXISTS "device_tokens_userId_idx"
  ON "device_tokens"("userId");
