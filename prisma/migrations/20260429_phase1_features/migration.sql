-- Phase 1 features: ratings, proof of delivery, size, estimated price, online status

-- User: online status + rating stats
ALTER TABLE "users" ADD COLUMN "isOnline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "avgRating" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- TransportRequest: size, estimatedPrice, proof
ALTER TABLE "transport_requests" ADD COLUMN "size" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "transport_requests" ADD COLUMN "estimatedPrice" DOUBLE PRECISION;
ALTER TABLE "transport_requests" ADD COLUMN "proofOfDelivery" TEXT;

-- Rating table
CREATE TABLE "ratings" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "transporterId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_requestId_key" UNIQUE ("requestId");
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "transport_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
