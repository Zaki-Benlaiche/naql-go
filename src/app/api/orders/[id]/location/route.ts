import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Transporter updates their GPS location (INTER bid-based OR INTRA direct)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "إحداثيات غير صالحة" }, { status: 400 });
    }

    const request = await prisma.transportRequest.findUnique({
      where: { id },
      include: { bids: { where: { transporterId: session.user.id, status: "ACCEPTED" } } },
    });

    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const hasBid    = request.bids.length > 0;
    const isDirect  = request.assignedTransporterId === session.user.id;

    if (!hasBid && !isDirect) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await prisma.locationTrack.upsert({
      where:  { requestId: id },
      create: { requestId: id, lat, lng },
      update: { lat, lng },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[location PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Client (or assigned transporter) reads current location
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const request = await prisma.transportRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const isClient      = request.clientId === session.user.id;
    const isAssigned    = request.assignedTransporterId === session.user.id;

    if (!isClient && !isAssigned) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const loc = await prisma.locationTrack.findUnique({ where: { requestId: id } });
    if (!loc) return NextResponse.json(null);

    return NextResponse.json({ lat: loc.lat, lng: loc.lng, updatedAt: loc.updatedAt });
  } catch (error) {
    console.error("[location GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
