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

    const request = await prisma.transportRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== "OPEN") {
      return NextResponse.json({ error: "الطلب غير متاح" }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        requestId,
        transporterId: session.user.id,
        price: parseFloat(price),
        estimatedTime,
        note: note || null,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("[bids POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
