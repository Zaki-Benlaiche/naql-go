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

    const { requestId, score, comment } = await req.json();
    if (!requestId || !score || score < 1 || score > 5) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    // Verify the request belongs to this client and is DELIVERED
    const request = await prisma.transportRequest.findUnique({
      where: { id: requestId },
      include: { acceptedBid: { select: { transporterId: true } } },
    });

    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.clientId !== session.user.id) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    if (request.status !== "DELIVERED") return NextResponse.json({ error: "الطلب لم يُسلَّم بعد" }, { status: 400 });

    const transporterId = request.acceptedBid?.transporterId;
    if (!transporterId) return NextResponse.json({ error: "لا يوجد ناقل" }, { status: 400 });

    // Create rating (unique per request)
    const rating = await prisma.rating.create({
      data: {
        requestId,
        clientId: session.user.id,
        transporterId,
        score: Math.round(score),
        comment: comment?.trim() || null,
      },
    });

    // Update transporter's cached average
    const stats = await prisma.rating.aggregate({
      where: { transporterId },
      _avg: { score: true },
      _count: { score: true },
    });

    await prisma.user.update({
      where: { id: transporterId },
      data: {
        avgRating: stats._avg.score ?? 0,
        totalRatings: stats._count.score,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error: unknown) {
    // Unique constraint = already rated
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "لقد قيّمت هذا الطلب مسبقاً" }, { status: 409 });
    }
    console.error("[ratings POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
