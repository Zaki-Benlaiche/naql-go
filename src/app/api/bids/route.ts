import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { requestId, price, estimatedTime, note } = await req.json();

    const request = await prisma.transportRequest.findUnique({
      where: { id: requestId },
      include: { client: { select: { id: true } } },
    });
    if (!request || request.status !== "OPEN") {
      return NextResponse.json({ error: "الطلب غير متاح" }, { status: 400 });
    }

    // Check for duplicate bid
    const existingBid = await prisma.bid.findUnique({
      where: { requestId_transporterId: { requestId, transporterId: session.user.id } },
    });
    if (existingBid) {
      return NextResponse.json({ error: "لقد أرسلت عرضاً على هذا الطلب مسبقاً" }, { status: 400 });
    }

    const transporter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const bid = await prisma.bid.create({
      data: {
        requestId,
        transporterId: session.user.id,
        price: parseFloat(price),
        estimatedTime,
        note: note || null,
      },
    });

    // Notify the client (non-fatal)
    try {
      await prisma.notification.create({
        data: {
          userId: request.client.id,
          title: "💰 عرض جديد على طلبك",
          body: `${request.fromCity} ← ${request.toCity} — ${parseFloat(price).toLocaleString()} دج من ${transporter?.name ?? "ناقل"}`,
          type: "new_bid",
          requestId,
        },
      });
    } catch (notifErr) {
      console.error("[bids notification]", notifErr);
    }

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("[bids POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
