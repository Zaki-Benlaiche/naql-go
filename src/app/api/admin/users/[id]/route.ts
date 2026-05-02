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

    // Block delete if user is mid-flight on any active order.
    const activeStatuses = ["ACCEPTED", "IN_TRANSIT"];
    const blockingAsClient = await prisma.transportRequest.count({
      where: { clientId: id, status: { in: activeStatuses } },
    });
    const blockingAsTransporter = await prisma.bid.count({
      where: { transporterId: id, acceptedRequest: { status: { in: activeStatuses } } },
    });
    if (blockingAsClient + blockingAsTransporter > 0) {
      return NextResponse.json({
        error: "لا يمكن الحذف: لدى المستخدم طلبات نشطة. أنهِها أو ألغها أولاً.",
      }, { status: 409 });
    }

    // Sequential cascade — NeonHTTP adapter doesn't support array $transaction,
    // so we walk the dependency graph by hand and delete leaves first.

    // 1. Independent leaf relations
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.couponUse.deleteMany({ where: { userId: id } });
    await prisma.document.deleteMany({ where: { transporterId: id } });
    await prisma.vehicle.deleteMany({ where: { transporterId: id } });
    await prisma.rating.deleteMany({
      where: { OR: [{ clientId: id }, { transporterId: id }] },
    });

    // 2. Bids the user (transporter) placed on OTHER people's requests.
    //    If any of those bids is the acceptedBid of a request, we must
    //    unset acceptedBidId on that request first to drop the FK.
    const myBids = await prisma.bid.findMany({
      where: { transporterId: id },
      select: { id: true },
    });
    const myBidIds = myBids.map(b => b.id);
    if (myBidIds.length > 0) {
      await prisma.transportRequest.updateMany({
        where: { acceptedBidId: { in: myBidIds } },
        data: { acceptedBidId: null },
      });
      await prisma.bid.deleteMany({ where: { id: { in: myBidIds } } });
    }

    // 3. Requests this user (client) created — wipe their entire subtree.
    const myReqs = await prisma.transportRequest.findMany({
      where: { clientId: id },
      select: { id: true },
    });
    const reqIds = myReqs.map(r => r.id);
    if (reqIds.length > 0) {
      await prisma.message.deleteMany({ where: { requestId: { in: reqIds } } });
      await prisma.locationTrack.deleteMany({ where: { requestId: { in: reqIds } } });
      // Drop any rating still attached.
      await prisma.rating.deleteMany({ where: { requestId: { in: reqIds } } });
      // Detach acceptedBid before deleting bids so the unique relation drops.
      await prisma.transportRequest.updateMany({
        where: { id: { in: reqIds } },
        data: { acceptedBidId: null },
      });
      await prisma.bid.deleteMany({ where: { requestId: { in: reqIds } } });
      await prisma.transportRequest.deleteMany({ where: { id: { in: reqIds } } });
    }

    // 4. Detach this user from any direct (INTRA) requests where they
    //    were the chosen transporter — keep the requests, drop the link.
    await prisma.transportRequest.updateMany({
      where: { assignedTransporterId: id },
      data: { assignedTransporterId: null },
    });

    // 5. Finally, the user.
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users DELETE]", error);
    const msg = error instanceof Error ? error.message : "خطأ في الحذف";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
