import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!["IN_TRANSIT", "DELIVERED"].includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const request = await prisma.transportRequest.findUnique({
      where: { id: params.id },
      include: { bids: { where: { transporterId: session.user.id, status: "ACCEPTED" } } },
    });

    if (!request || request.bids.length === 0) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await prisma.transportRequest.update({
      where: { id: params.id },
      data: { status },
    });

    // Create notification for client
    const notifData =
      status === "IN_TRANSIT"
        ? { title: "الناقل في الطريق 🚚", body: `${request.fromCity} ← ${request.toCity}`, type: "in_transit" }
        : { title: "تم تسليم بضاعتك ✅", body: `${request.fromCity} ← ${request.toCity}`, type: "delivered" };

    await prisma.notification.create({
      data: {
        userId: request.clientId,
        ...notifData,
        requestId: request.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[orders status]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
