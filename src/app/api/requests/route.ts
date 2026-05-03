import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    if (session.user.role === "CLIENT") {
      const requests = await prisma.transportRequest.findMany({
        where: { clientId: session.user.id, ...(status ? { status } : {}) },
        include: {
          bids: { include: { transporter: { select: { name: true, phone: true } } } },
          rating: { select: { score: true } },
          assignedTransporter: { select: { name: true, phone: true, avgRating: true, vehicleType: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    }

    if (session.user.role === "TRANSPORTER") {
      // Filter INTER (bidding) feed by services this transporter offers
      const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isLivreur: true, isFrodeur: true, isTransporteur: true },
      });
      const myServices: string[] = [];
      if (me?.isLivreur)      myServices.push("LIVREUR");
      if (me?.isFrodeur)      myServices.push("FRODEUR");
      if (me?.isTransporteur) myServices.push("TRANSPORTEUR");

      const interRequests = await prisma.transportRequest.findMany({
        where: {
          status: "OPEN",
          transportType: "INTER",
          assignedTransporterId: null,
          ...(myServices.length > 0 ? { serviceCategory: { in: myServices } } : {}),
        },
        include: {
          client: { select: { name: true, phone: true } },
          bids: { where: { transporterId: session.user.id } },
        },
        orderBy: { createdAt: "desc" },
      });

      // INTRA direct requests assigned to this transporter
      const directRequests = await prisma.transportRequest.findMany({
        where: { assignedTransporterId: session.user.id, status: { in: ["OPEN", "ACCEPTED", "IN_TRANSIT"] } },
        include: {
          client: { select: { name: true, phone: true } },
          bids: { where: { transporterId: session.user.id } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Merge, de-duplicate by id
      const seen = new Set<string>();
      const merged = [...directRequests, ...interRequests].filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      return NextResponse.json(merged);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("[requests GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fromCity, toCity, fromAddress, toAddress,
      goodsType, vehicleType, size, weight, description,
      estimatedPrice, scheduledAt, discountPercent, finalPrice,
      fromLat, fromLng, toLat, toLng,
      transportType, assignedTransporterId,
      serviceCategory,
    } = body;

    const cat = (serviceCategory as string | undefined)?.toUpperCase() || "TRANSPORTEUR";

    const request = await prisma.transportRequest.create({
      data: {
        clientId: session.user.id,
        fromCity, toCity,
        fromAddress: fromAddress || "",
        toAddress:   toAddress   || "",
        // For taxi (FRODEUR) goodsType / weight aren't relevant.
        goodsType:   cat === "FRODEUR" ? null : (goodsType || null),
        vehicleType: vehicleType || "any",
        size:        size        || "medium",
        weight:      cat === "FRODEUR" || !weight ? null : parseFloat(weight),
        description: description || null,
        estimatedPrice:  estimatedPrice  ? parseFloat(estimatedPrice)  : null,
        scheduledAt:     scheduledAt     ? new Date(scheduledAt)       : null,
        discountPercent: discountPercent ? parseInt(discountPercent)   : null,
        finalPrice:      finalPrice      ? parseFloat(finalPrice)      : null,
        fromLat: fromLat ? parseFloat(fromLat) : null,
        fromLng: fromLng ? parseFloat(fromLng) : null,
        toLat:   toLat   ? parseFloat(toLat)   : null,
        toLng:   toLng   ? parseFloat(toLng)   : null,
        transportType:         transportType         || "INTER",
        assignedTransporterId: assignedTransporterId || null,
        serviceCategory:       cat,
      },
    });

    // Notify assigned transporter for INTRA requests
    if (assignedTransporterId) {
      try {
        const client = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
        await prisma.notification.create({
          data: {
            userId: assignedTransporterId,
            title: "📦 طلب نقل مباشر جديد",
            body: `${fromCity} — طلب من ${client?.name ?? "عميل"}`,
            type: "direct_request",
            requestId: request.id,
          },
        });
      } catch (e) { console.error("[notification direct]", e); }
    }

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("[requests POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
