-- Commission settlement ledger: one row per (transporter, billing month)
-- once the owed amount crosses the minimum payment threshold.
--
-- The row is the source of truth for "did the driver settle month X?".
-- Anything < MIN_PAYMENT is carried forward implicitly (we just don't
-- create the row until the threshold is reached).

CREATE TABLE IF NOT EXISTS "commission_payments" (
  "id"              TEXT PRIMARY KEY,
  "transporterId"   TEXT NOT NULL,
  "periodMonth"     INT  NOT NULL,
  "periodYear"      INT  NOT NULL,
  "amount"          DOUBLE PRECISION NOT NULL,

  "status"          TEXT NOT NULL DEFAULT 'PENDING_PROOF',

  "proofUrl"        TEXT,
  "transactionRef" TEXT,
  "submittedAt"    TIMESTAMP(3),

  "reviewedAt"     TIMESTAMP(3),
  "reviewedById"   TEXT,
  "rejectionReason" TEXT,
  "paidAt"         TIMESTAMP(3),

  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "commission_payments_transporter_fkey"
    FOREIGN KEY ("transporterId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "commission_payments_period_unique"
  ON "commission_payments"("transporterId", "periodYear", "periodMonth");

-- Admin queue: "rows needing review".
CREATE INDEX IF NOT EXISTS "commission_payments_status_period"
  ON "commission_payments"("status", "periodYear", "periodMonth");

-- Transporter dashboard: "my payments".
CREATE INDEX IF NOT EXISTS "commission_payments_transporter_status"
  ON "commission_payments"("transporterId", "status");
