import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const exists = await prisma.transportRequest.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { requestId: id } }),
      prisma.locationTrack.deleteMany({ where: { requestId: id } }),
      prisma.rating.deleteMany({ where: { requestId: id } }),
      prisma.bid.deleteMany({ where: { requestId: id } }),
      prisma.transportRequest.update({ where: { id }, data: { acceptedBidId: null } }),
      prisma.transportRequest.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/orders DELETE]", error);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
