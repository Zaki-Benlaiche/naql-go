import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const request = await prisma.transportRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (request.clientId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (!["OPEN", "CANCELLED"].includes(request.status)) {
      return NextResponse.json({ error: "لا يمكن حذف طلب قيد التنفيذ" }, { status: 400 });
    }

    // Delete child records first (Neon HTTP adapter — no transactions)
    await prisma.bid.deleteMany({ where: { requestId: id } });
    await prisma.message.deleteMany({ where: { requestId: id } });
    await prisma.notification.deleteMany({ where: { requestId: id } });
    await prisma.locationTrack.deleteMany({ where: { requestId: id } });

    await prisma.transportRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[requests DELETE]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } });

    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (request.clientId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (request.status !== "OPEN") {
      return NextResponse.json({ error: "لا يمكن إلغاء هذا الطلب" }, { status: 400 });
    }

    const updated = await prisma.transportRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[requests PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
