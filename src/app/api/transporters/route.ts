import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, cacheKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

// Returns online transporters filtered by wilaya, service category, and optional vehicleType.
// Service: LIVREUR (delivery) | FRODEUR (taxi) | TRANSPORTEUR (goods)
//
// Cached for 30 s in Redis — driver online/offline transitions don't need
// per-second freshness, and this endpoint is hit on every client search.
// Falls through to DB transparently when Redis isn't configured.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const wilaya      = searchParams.get("wilaya");
    const vehicleType = searchParams.get("vehicleType");
    const service     = searchParams.get("service"); // LIVREUR | FRODEUR | TRANSPORTEUR

    if (!wilaya) return NextResponse.json({ error: "الولاية مطلوبة" }, { status: 400 });

    const transporters = await redis.cached(
      cacheKey.transporters(wilaya, service ?? "any", vehicleType ?? undefined),
      30,
      async () => {
        const serviceFilter =
          service === "LIVREUR"      ? { isLivreur: true } :
          service === "FRODEUR"      ? { isFrodeur: true } :
          service === "TRANSPORTEUR" ? { isTransporteur: true } :
          {};

        return prisma.user.findMany({
          where: {
            role: "TRANSPORTER",
            isActive: true,
            isApproved: true,
            isOnline: true,
            wilaya,
            ...serviceFilter,
            ...(vehicleType ? { vehicleType } : {}),
          },
          select: {
            id: true,
            name: true,
            phone: true,
            wilaya: true,
            vehicleType: true,
            vehicleColor: true,
            isLivreur: true,
            isFrodeur: true,
            isTransporteur: true,
            avgRating: true,
            totalRatings: true,
            isOnline: true,
          },
          orderBy: [{ avgRating: "desc" }, { totalRatings: "desc" }],
        });
      },
    );

    return NextResponse.json(transporters);
  } catch (error) {
    console.error("[transporters GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
