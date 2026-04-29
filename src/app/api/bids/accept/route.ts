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

    // Verify request belongs to this client and is still OPEN
    const request = await prisma.transportRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    if (request.clientId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    if (request.status !== "OPEN") {
      return NextResponse.json({ error: "الطلب مغلق بالفعل" }, { status: 400 });
    }

    // Verify bid exists and belongs to this request
    const bid = await prisma.bid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    // Run sequentially (Neon HTTP adapter compatible)
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });

    await prisma.transportRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", acceptedBidId: bidId },
    });

    // Reject remaining bids
    await prisma.bid.updateMany({
      where: { requestId, id: { not: bidId } },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[bids/accept]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
