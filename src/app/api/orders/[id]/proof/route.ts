import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBase64, deleteBlobUrl } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { proof } = await req.json();
    if (!proof || typeof proof !== "string") {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }

    if (proof.length > 2_000_000) {
      return NextResponse.json({ error: "الصورة كبيرة جداً (الحد الأقصى 1.5 ميجا)" }, { status: 413 });
    }

    // Authorize: bid winner OR direct INTRA assignee.
    const request = await prisma.transportRequest.findUnique({
      where: { id },
      include: { bids: { where: { transporterId: session.user.id, status: "ACCEPTED" } } },
    });

    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const hasBid   = request.bids.length > 0;
    const isDirect = request.assignedTransporterId === session.user.id && request.transportType === "INTRA";
    if (!hasBid && !isDirect) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (request.status !== "DELIVERED") {
      return NextResponse.json({ error: "يجب تحديد الطلب كـ مُسلَّم أولاً" }, { status: 400 });
    }

    // Upload to Vercel Blob (falls back to inline data URL if BLOB token missing).
    const url = await uploadBase64(`proofs/${id}.jpg`, proof);

    // If we're replacing an existing blob, clean it up.
    if (request.proofOfDelivery && request.proofOfDelivery !== url) {
      deleteBlobUrl(request.proofOfDelivery).catch(() => {});
    }

    await prisma.transportRequest.update({
      where: { id },
      data: { proofOfDelivery: url },
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[orders proof]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
