-- KYC manual: gate transporters behind admin approval.
--
-- Behaviour:
--   * New TRANSPORTER signups land with isApproved=false → no online toggle,
--     no bids, no direct-request reception until an admin acts.
--   * Existing rows (clients, admins, transporters already operating) are
--     backfilled to isApproved=true so the pilot doesn't lock anyone out.
--   * Admin actions stamp kycReviewedAt — used to filter the "needs review"
--     queue cleanly (kycReviewedAt IS NULL).

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isApproved"      BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "kycReviewedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Grandfather every existing user. Anyone created BEFORE this migration ran
-- has already been operating; we mark them reviewed-and-approved at the
-- moment of migration so the admin queue starts empty.
UPDATE "users"
   SET "isApproved"    = true,
       "kycReviewedAt" = CURRENT_TIMESTAMP
 WHERE "isApproved" = false;

-- Hot path: admin queue is "show me pending transporters".
CREATE INDEX IF NOT EXISTS "idx_users_kyc_pending"
  ON "users"("kycReviewedAt", role)
  WHERE "kycReviewedAt" IS NULL AND role = 'TRANSPORTER';
