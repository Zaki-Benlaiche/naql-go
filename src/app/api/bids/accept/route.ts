import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { bidId, requestId } = await req.json();

    const request = await prisma.transportRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.clientId !== session.user.id || request.status !== "OPEN") {
      return NextResponse.json({ error: "غير مصرح أو الطلب مغلق" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.transportRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED", acceptedBidId: bidId },
      }),
      prisma.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      }),
      prisma.bid.updateMany({
        where: { requestId, id: { not: bidId } },
        data: { status: "REJECTED" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
