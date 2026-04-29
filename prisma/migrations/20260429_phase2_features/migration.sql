-- Phase 2: scheduled orders, coupons, admin role support

-- TransportRequest: scheduled date + coupon fields
ALTER TABLE "transport_requests" ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "transport_requests" ADD COLUMN "discountPercent" INTEGER;
ALTER TABLE "transport_requests" ADD COLUMN "finalPrice" DOUBLE PRECISION;

-- User: isActive flag for admin ban/unban
ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Coupon table
CREATE TABLE "coupons" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "maxUses" INTEGER NOT NULL DEFAULT 100,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");

-- CouponUse table
CREATE TABLE "coupon_uses" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coupon_uses_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_couponId_userId_key" UNIQUE ("couponId", "userId");
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed a sample coupon for testing
INSERT INTO "coupons" ("id", "code", "discountPercent", "maxUses", "usedCount", "active")
VALUES ('coupon_welcome', 'NAQL10', 10, 1000, 0, true);
