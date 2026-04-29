-- Phase 4: intra-wilaya transport + transporter profile

-- Transporter: operating wilaya and vehicle type
ALTER TABLE "users" ADD COLUMN "wilaya"      TEXT;
ALTER TABLE "users" ADD COLUMN "vehicleType" TEXT;

-- TransportRequest: type (INTER | INTRA) + direct assignment
ALTER TABLE "transport_requests" ADD COLUMN "transportType"         TEXT NOT NULL DEFAULT 'INTER';
ALTER TABLE "transport_requests" ADD COLUMN "assignedTransporterId" TEXT;

ALTER TABLE "transport_requests"
  ADD CONSTRAINT "transport_requests_assignedTransporterId_fkey"
  FOREIGN KEY ("assignedTransporterId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
