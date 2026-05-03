-- Service categories: livreur (delivery), frodeur (taxi), transporteur (goods)
-- A transporter can offer one or more of these.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isLivreur"      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isFrodeur"      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isTransporteur" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vehicleColor"   TEXT;

-- Tag every request with its service category. Defaults to TRANSPORTEUR
-- so existing rows behave exactly as before.
ALTER TABLE "transport_requests"
  ADD COLUMN IF NOT EXISTS "serviceCategory" TEXT NOT NULL DEFAULT 'TRANSPORTEUR';

-- For frodeur (taxi) requests we don't have a real "weight" — make it optional.
ALTER TABLE "transport_requests" ALTER COLUMN "weight"    DROP NOT NULL;
ALTER TABLE "transport_requests" ALTER COLUMN "goodsType" DROP NOT NULL;
