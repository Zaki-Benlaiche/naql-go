import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { isActive } = await req.json();
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[admin/users PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "لا يمكن حذف حساب مدير" }, { status: 400 });
    }

    // Block delete if user has in-progress orders that would lose track of money/cargo.
    const activeStatuses = ["ACCEPTED", "IN_TRANSIT"];
    const blockingAsClient = await prisma.transportRequest.count({
      where: { clientId: id, status: { in: activeStatuses } },
    });
    const blockingAsTransporter = await prisma.bid.count({
      where: { transporterId: id, acceptedRequest: { status: { in: activeStatuses } } },
    });
    if (blockingAsClient + blockingAsTransporter > 0) {
      return NextResponse.json({
        error: "لا يمكن الحذف: لدى المستخدم طلبات نشطة (مقبولة أو في الطريق). أنهِها أو ألغها أولاً.",
      }, { status: 409 });
    }

    // Cascade delete inside one transaction so we never leave orphans.
    const myRequestIds = await prisma.transportRequest.findMany({
      where: { clientId: id },
      select: { id: true },
    });
    const reqIds = myRequestIds.map(r => r.id);

    await prisma.$transaction([
      // Notifications
      prisma.notification.deleteMany({ where: { userId: id } }),
      // Coupon uses
      prisma.couponUse.deleteMany({ where: { userId: id } }),
      // Documents (transporter)
      prisma.document.deleteMany({ where: { transporterId: id } }),
      // Vehicles (transporter)
      prisma.vehicle.deleteMany({ where: { transporterId: id } }),
      // Ratings given/received
      prisma.rating.deleteMany({ where: { OR: [{ clientId: id }, { transporterId: id }] } }),
      // Bids placed by this user (transporter)
      prisma.bid.deleteMany({ where: { transporterId: id } }),
      // Detach the user from any direct (INTRA) requests where they were the chosen transporter
      prisma.transportRequest.updateMany({
        where: { assignedTransporterId: id },
        data: { assignedTransporterId: null },
      }),
      // For requests this user (client) created:
      //   delete their messages, location tracks, bids, then the requests themselves.
      ...(reqIds.length > 0 ? [
        prisma.message.deleteMany({ where: { requestId: { in: reqIds } } }),
        prisma.locationTrack.deleteMany({ where: { requestId: { in: reqIds } } }),
        prisma.bid.deleteMany({ where: { requestId: { in: reqIds } } }),
        prisma.transportRequest.updateMany({
          where: { id: { in: reqIds } },
          data: { acceptedBidId: null },
        }),
        prisma.transportRequest.deleteMany({ where: { id: { in: reqIds } } }),
      ] : []),
      // Finally, the user
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users DELETE]", error);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
