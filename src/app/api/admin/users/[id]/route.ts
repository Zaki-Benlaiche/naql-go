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
    const blockingAsClient = await prisma.transportRequest.count({
      where: { clientId: id, status: { in: ["ACCEPTED", "IN_TRANSIT"] } },
    });
    // Active bids the user holds: count accepted requests whose acceptedBid belongs to this transporter.
    const myAcceptedBidIds = await prisma.bid.findMany({
      where: { transporterId: id },
      select: { id: true },
    });
    const myBidIdList = myAcceptedBidIds.map(b => b.id);
    const blockingAsTransporter = myBidIdList.length === 0 ? 0 : await prisma.transportRequest.count({
      where: {
        acceptedBidId: { in: myBidIdList },
        status: { in: ["ACCEPTED", "IN_TRANSIT"] },
      },
    });

    if (blockingAsClient + blockingAsTransporter > 0) {
      return NextResponse.json({
        error: "لا يمكن الحذف: لدى المستخدم طلبات نشطة. أنهِها أو ألغها أولاً.",
      }, { status: 409 });
    }

    // ── Cascade delete via raw SQL ──
    // Each $executeRaw is a single statement: NeonHTTP friendly (no implicit
    // transaction wrapping that Prisma's high-level delete() can trigger
    // on a model with many reverse relations).

    // 1) Leaf relations
    await prisma.$executeRaw`DELETE FROM notifications WHERE "userId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM coupon_uses  WHERE "userId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM documents    WHERE "transporterId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM vehicles     WHERE "transporterId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM ratings      WHERE "clientId" = ${id} OR "transporterId" = ${id}`;

    // 2) Bids placed by this transporter on OTHER people's requests.
    //    Detach acceptedBidId on any request pointing at one of those bids first.
    await prisma.$executeRaw`
      UPDATE transport_requests
         SET "acceptedBidId" = NULL
       WHERE "acceptedBidId" IN (SELECT id FROM bids WHERE "transporterId" = ${id})
    `;
    await prisma.$executeRaw`DELETE FROM bids WHERE "transporterId" = ${id}`;

    // 3) Wipe the entire subtree of every request this user (client) owns.
    await prisma.$executeRaw`
      DELETE FROM messages
       WHERE "requestId" IN (SELECT id FROM transport_requests WHERE "clientId" = ${id})
    `;
    await prisma.$executeRaw`
      DELETE FROM location_tracks
       WHERE "requestId" IN (SELECT id FROM transport_requests WHERE "clientId" = ${id})
    `;
    await prisma.$executeRaw`
      DELETE FROM ratings
       WHERE "requestId" IN (SELECT id FROM transport_requests WHERE "clientId" = ${id})
    `;
    await prisma.$executeRaw`
      UPDATE transport_requests SET "acceptedBidId" = NULL WHERE "clientId" = ${id}
    `;
    await prisma.$executeRaw`
      DELETE FROM bids
       WHERE "requestId" IN (SELECT id FROM transport_requests WHERE "clientId" = ${id})
    `;
    await prisma.$executeRaw`DELETE FROM transport_requests WHERE "clientId" = ${id}`;

    // 4) Detach as the chosen transporter on direct (INTRA) requests.
    await prisma.$executeRaw`
      UPDATE transport_requests SET "assignedTransporterId" = NULL WHERE "assignedTransporterId" = ${id}
    `;

    // 5) Finally, the user.
    await prisma.$executeRaw`DELETE FROM users WHERE id = ${id}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users DELETE]", error);
    const msg = error instanceof Error ? error.message : "خطأ في الحذف";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
