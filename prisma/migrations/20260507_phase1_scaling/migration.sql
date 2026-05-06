-- Phase 1 scaling migration:
--  1. Explicit deliveredAt column (replaces fragile updatedAt-as-deliveredAt).
--  2. Backfill deliveredAt for already-delivered orders so admin earnings stays correct.
--  3. Hot-path indexes that the v2.2.0 perf migration didn't cover.

-- 1. New column
ALTER TABLE "transport_requests"
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);

-- 2. Backfill from updatedAt for rows already in DELIVERED state.
UPDATE "transport_requests"
   SET "deliveredAt" = "updatedAt"
 WHERE status = 'DELIVERED' AND "deliveredAt" IS NULL;

-- 3. Indexes
-- Earnings query: bids WHERE status='ACCEPTED' AND request.status='DELIVERED'
CREATE INDEX IF NOT EXISTS idx_bids_accepted
  ON bids(status, "createdAt" DESC)
  WHERE status = 'ACCEPTED';

-- Delivered orders by date (admin earnings, monthly breakdown)
CREATE INDEX IF NOT EXISTS idx_req_delivered_at
  ON transport_requests("deliveredAt" DESC)
  WHERE status = 'DELIVERED';

-- Chat polling — messages by request, newest first
CREATE INDEX IF NOT EXISTS idx_msg_request_created
  ON messages("requestId", "createdAt" ASC);

-- Location reads (client polls every 3s while in-transit)
CREATE INDEX IF NOT EXISTS idx_loc_updated
  ON location_tracks("updatedAt" DESC);

-- Notifications cleanup cron (delete read + older than 30d)
CREATE INDEX IF NOT EXISTS idx_notif_read_created
  ON notifications(read, "createdAt")
  WHERE read = true;
