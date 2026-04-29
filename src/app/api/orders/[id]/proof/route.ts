import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { proof } = await req.json();
    if (!proof || typeof proof !== "string") {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }

    // Limit size to ~1.5MB base64
    if (proof.length > 2_000_000) {
      return NextResponse.json({ error: "الصورة كبيرة جداً (الحد الأقصى 1.5 ميجا)" }, { status: 413 });
    }

    // Verify transporter owns this order
    const request = await prisma.transportRequest.findUnique({
      where: { id: params.id },
      include: { bids: { where: { transporterId: session.user.id, status: "ACCEPTED" } } },
    });

    if (!request || request.bids.length === 0) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (request.status !== "DELIVERED") {
      return NextResponse.json({ error: "يجب تحديد الطلب كـ مُسلَّم أولاً" }, { status: 400 });
    }

    await prisma.transportRequest.update({
      where: { id: params.id },
      data: { proofOfDelivery: proof },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[orders proof]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
