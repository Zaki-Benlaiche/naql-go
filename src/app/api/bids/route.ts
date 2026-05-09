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
    const priceNum = parseFloat(price);
    if (!requestId || !Number.isFinite(priceNum) || priceNum <= 0 || !estimatedTime) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // Run all 3 read queries in parallel — was 3 sequential round-trips before.
    // Use slim `select` so we ship ~50 bytes instead of full rows.
    const [request, existingBid, transporter] = await Promise.all([
      prisma.transportRequest.findUnique({
        where: { id: requestId },
        select: { clientId: true, status: true, fromCity: true, toCity: true },
      }),
      prisma.bid.findUnique({
        where: { requestId_transporterId: { requestId, transporterId: session.user.id } },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      }),
    ]);

    if (!request || request.status !== "OPEN") {
      return NextResponse.json({ error: "الطلب غير متاح" }, { status: 400 });
    }
    if (existingBid) {
      return NextResponse.json({ error: "لقد أرسلت عرضاً على هذا الطلب مسبقاً" }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        requestId,
        transporterId: session.user.id,
        price: priceNum,
        estimatedTime,
        note: note || null,
      },
    });

    // Notify the client (non-fatal, fire-and-forget shape)
    try {
      await prisma.notification.create({
        data: {
          userId: request.clientId,
          title: "💰 عرض جديد على طلبك",
          body: `${request.fromCity} ← ${request.toCity} — ${priceNum.toLocaleString()} دج من ${transporter?.name ?? "ناقل"}`,
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
