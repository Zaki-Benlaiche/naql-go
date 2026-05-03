import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns online transporters filtered by wilaya, service category, and optional vehicleType.
// Service: LIVREUR (delivery) | FRODEUR (taxi) | TRANSPORTEUR (goods)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const wilaya      = searchParams.get("wilaya");
    const vehicleType = searchParams.get("vehicleType");
    const service     = searchParams.get("service"); // LIVREUR | FRODEUR | TRANSPORTEUR

    if (!wilaya) return NextResponse.json({ error: "الولاية مطلوبة" }, { status: 400 });

    const serviceFilter =
      service === "LIVREUR"      ? { isLivreur: true } :
      service === "FRODEUR"      ? { isFrodeur: true } :
      service === "TRANSPORTEUR" ? { isTransporteur: true } :
      {};

    const transporters = await prisma.user.findMany({
      where: {
        role: "TRANSPORTER",
        isActive: true,
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

    return NextResponse.json(transporters);
  } catch (error) {
    console.error("[transporters GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
