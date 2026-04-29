-- Phase 3: chat, GPS tracking, driver documents, map coordinates

-- TransportRequest: coordinates for map picker
ALTER TABLE "transport_requests" ADD COLUMN "fromLat" DOUBLE PRECISION;
ALTER TABLE "transport_requests" ADD COLUMN "fromLng" DOUBLE PRECISION;
ALTER TABLE "transport_requests" ADD COLUMN "toLat"   DOUBLE PRECISION;
ALTER TABLE "transport_requests" ADD COLUMN "toLng"   DOUBLE PRECISION;

-- Messages (chat)
CREATE TABLE "messages" (
  "id"         TEXT NOT NULL,
  "requestId"  TEXT NOT NULL,
  "senderId"   TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "text"       TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "messages" ADD CONSTRAINT "messages_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "transport_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Location tracking
CREATE TABLE "location_tracks" (
  "requestId" TEXT NOT NULL,
  "lat"       DOUBLE PRECISION NOT NULL,
  "lng"       DOUBLE PRECISION NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "location_tracks_pkey" PRIMARY KEY ("requestId")
);
ALTER TABLE "location_tracks" ADD CONSTRAINT "location_tracks_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "transport_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Driver documents
CREATE TABLE "documents" (
  "id"            TEXT NOT NULL,
  "transporterId" TEXT NOT NULL,
  "type"          TEXT NOT NULL,
  "fileData"      TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "documents" ADD CONSTRAINT "documents_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
