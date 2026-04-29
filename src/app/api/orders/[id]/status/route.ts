import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { status } = await req.json();

    const request = await prisma.transportRequest.findUnique({
      where: { id },
      include: { bids: { where: { transporterId: session.user.id, status: "ACCEPTED" } } },
    });

    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const hasBid = request.bids.length > 0;
    const isDirect = request.assignedTransporterId === session.user.id && request.transportType === "INTRA";

    if (!hasBid && !isDirect) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Direct INTRA: can accept (OPEN→ACCEPTED), start trip (ACCEPTED→IN_TRANSIT), deliver (IN_TRANSIT→DELIVERED)
    // Bid-based: can start trip or deliver
    const allowedStatuses = isDirect
      ? ["ACCEPTED", "IN_TRANSIT", "DELIVERED"]
      : ["IN_TRANSIT", "DELIVERED"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    await prisma.transportRequest.update({
      where: { id },
      data: { status },
    });

    // Notify client
    let notifData: { title: string; body: string; type: string } | null = null;
    if (status === "ACCEPTED") {
      notifData = { title: "✅ تم قبول طلبك", body: `${request.fromCity} — ${request.toCity}`, type: "bid_accepted" };
    } else if (status === "IN_TRANSIT") {
      notifData = { title: "الناقل في الطريق 🚚", body: `${request.fromCity} — ${request.toCity}`, type: "in_transit" };
    } else if (status === "DELIVERED") {
      notifData = { title: "تم تسليم بضاعتك ✅", body: `${request.fromCity} — ${request.toCity}`, type: "delivered" };
    }

    if (notifData) {
      try {
        await prisma.notification.create({
          data: { userId: request.clientId, ...notifData, requestId: request.id },
        });
      } catch (e) { console.error("[status notif]", e); }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[orders status]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
