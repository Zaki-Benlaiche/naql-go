import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, phone: true,
        wilaya: true, vehicleType: true, vehicleColor: true,
        isLivreur: true, isFrodeur: true, isTransporteur: true,
        avgRating: true, totalRatings: true, isOnline: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[profile GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { wilaya, vehicleType, vehicleColor, isLivreur, isFrodeur, isTransporteur } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(wilaya         !== undefined ? { wilaya }         : {}),
        ...(vehicleType    !== undefined ? { vehicleType }    : {}),
        ...(vehicleColor   !== undefined ? { vehicleColor }   : {}),
        ...(isLivreur      !== undefined ? { isLivreur }      : {}),
        ...(isFrodeur      !== undefined ? { isFrodeur }      : {}),
        ...(isTransporteur !== undefined ? { isTransporteur } : {}),
      },
      select: {
        wilaya: true, vehicleType: true, vehicleColor: true,
        isLivreur: true, isFrodeur: true, isTransporteur: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[profile PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Self-service account deletion — required by Play Store and Algerian law
// 18-07 (right to be forgotten). Re-confirms with password and refuses to
// proceed if the user has live orders that would orphan the counter-party.
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (session.user.role === "ADMIN") {
      return NextResponse.json(
        { error: "لا يمكن حذف حساب إداري ذاتياً" },
        { status: 400 },
      );
    }

    const id = session.user.id;
    const { password } = await req.json();
    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "كلمة السر مطلوبة لتأكيد الحذف" }, { status: 400 });
    }

    const me = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!me) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });

    const ok = await bcrypt.compare(password, me.password);
    if (!ok) return NextResponse.json({ error: "كلمة السر غير صحيحة" }, { status: 403 });

    // Block when mid-flight on an order, either side.
    const blockingAsClient = await prisma.transportRequest.count({
      where: { clientId: id, status: { in: ["ACCEPTED", "IN_TRANSIT"] } },
    });
    const myBids = await prisma.bid.findMany({
      where: { transporterId: id },
      select: { id: true },
    });
    const blockingAsTransporter = myBids.length === 0 ? 0 : await prisma.transportRequest.count({
      where: {
        acceptedBidId: { in: myBids.map(b => b.id) },
        status: { in: ["ACCEPTED", "IN_TRANSIT"] },
      },
    });
    if (blockingAsClient + blockingAsTransporter > 0) {
      return NextResponse.json({
        error: "لديك طلبات نشطة. أنهِها أو ألغها أولاً قبل حذف الحساب.",
      }, { status: 409 });
    }

    // Cascade — same raw-SQL pattern as admin's /api/admin/users/[id] DELETE.
    // NeonHTTP-friendly: each statement is independent, no implicit
    // multi-statement transaction wrapping.
    await prisma.$executeRaw`DELETE FROM device_tokens   WHERE "userId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM notifications   WHERE "userId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM coupon_uses     WHERE "userId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM documents       WHERE "transporterId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM vehicles        WHERE "transporterId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM ratings         WHERE "clientId" = ${id} OR "transporterId" = ${id}`;

    await prisma.$executeRaw`
      UPDATE transport_requests
         SET "acceptedBidId" = NULL
       WHERE "acceptedBidId" IN (SELECT id FROM bids WHERE "transporterId" = ${id})
    `;
    await prisma.$executeRaw`DELETE FROM bids WHERE "transporterId" = ${id}`;

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
    await prisma.$executeRaw`UPDATE transport_requests SET "acceptedBidId" = NULL WHERE "clientId" = ${id}`;
    await prisma.$executeRaw`
      DELETE FROM bids
       WHERE "requestId" IN (SELECT id FROM transport_requests WHERE "clientId" = ${id})
    `;
    await prisma.$executeRaw`DELETE FROM transport_requests WHERE "clientId" = ${id}`;

    await prisma.$executeRaw`UPDATE transport_requests SET "assignedTransporterId" = NULL WHERE "assignedTransporterId" = ${id}`;
    await prisma.$executeRaw`DELETE FROM users WHERE id = ${id}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[profile DELETE]", error);
    const msg = error instanceof Error ? error.message : "خطأ في الحذف";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
