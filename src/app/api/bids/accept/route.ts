import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { bidId, requestId } = await req.json();
    if (!bidId || !requestId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const request = await prisma.transportRequest.findUnique({
      where: { id: requestId },
      include: { client: { select: { name: true } } },
    });

    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.clientId !== session.user.id) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    if (request.status !== "OPEN") return NextResponse.json({ error: "الطلب مغلق بالفعل" }, { status: 400 });

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { transporter: { select: { id: true, name: true } } },
    });
    if (!bid || bid.requestId !== requestId) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    // Update bid → ACCEPTED
    await prisma.bid.update({ where: { id: bidId }, data: { status: "ACCEPTED" } });

    // Update request → ACCEPTED + acceptedBidId
    await prisma.transportRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", acceptedBidId: bidId },
    });

    // Reject other bids
    await prisma.bid.updateMany({
      where: { requestId, id: { not: bidId } },
      data: { status: "REJECTED" },
    });

    // Notify the transporter whose bid was accepted
    await prisma.notification.create({
      data: {
        userId: bid.transporter.id,
        title: "🎉 تم قبول عرضك!",
        body: `${request.fromCity} ← ${request.toCity} — ${bid.price.toLocaleString()} دج`,
        type: "bid_accepted",
        requestId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[bids/accept]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
