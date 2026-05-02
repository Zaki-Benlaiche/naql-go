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

    const exists = await prisma.transportRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    // Sequential cascade (NeonHTTP doesn't support array $transaction).
    await prisma.message.deleteMany({ where: { requestId: id } });
    await prisma.locationTrack.deleteMany({ where: { requestId: id } });
    await prisma.rating.deleteMany({ where: { requestId: id } });
    // Drop the acceptedBid FK before bids so the unique relation releases.
    await prisma.transportRequest.update({
      where: { id },
      data: { acceptedBidId: null },
    });
    await prisma.bid.deleteMany({ where: { requestId: id } });
    await prisma.transportRequest.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/orders DELETE]", error);
    const msg = error instanceof Error ? error.message : "خطأ في الحذف";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
