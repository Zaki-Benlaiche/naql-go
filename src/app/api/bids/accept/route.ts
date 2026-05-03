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
      select: { id: true, clientId: true, status: true, fromCity: true, toCity: true },
    });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.clientId !== session.user.id) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    if (request.status !== "OPEN") return NextResponse.json({ error: "الطلب مغلق بالفعل" }, { status: 400 });

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      select: { id: true, requestId: true, price: true, transporterId: true },
    });
    if (!bid || bid.requestId !== requestId) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    // Raw SQL — NeonHTTP doesn't support implicit transactions that
    // Prisma's high-level update can trigger when touching a unique relation
    // (acceptedBidId) on a model with many reverse relations.
    await prisma.$executeRaw`UPDATE bids SET status='ACCEPTED' WHERE id=${bidId}`;
    await prisma.$executeRaw`
      UPDATE transport_requests
         SET status='ACCEPTED', "acceptedBidId"=${bidId}
       WHERE id=${requestId}
    `;
    await prisma.$executeRaw`
      UPDATE bids SET status='REJECTED'
       WHERE "requestId"=${requestId} AND id<>${bidId}
    `;

    // Notification (single insert — safe). Best-effort.
    try {
      await prisma.notification.create({
        data: {
          userId: bid.transporterId,
          title: "🎉 تم قبول عرضك!",
          body: `${request.fromCity} ← ${request.toCity} — ${bid.price.toLocaleString()} دج`,
          type: "bid_accepted",
          requestId,
        },
      });
    } catch (e) { console.error("[bids/accept notification]", e); }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[bids/accept]", error);
    const msg = error instanceof Error ? error.message : "خطأ في الخادم";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
