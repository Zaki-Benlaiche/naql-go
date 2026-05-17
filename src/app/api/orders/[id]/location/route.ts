import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publish, room, events } from "@/lib/realtime";

export const dynamic = "force-dynamic";

// Lightweight auth: 1 row from DB if the caller is allowed to push GPS,
// else 0. Replaces a findUnique({ include: bids: { where: ACCEPTED } })
// that pulled the whole TransportRequest + matching bids on every 15 s tick.
async function canPushLocation(requestId: string, transporterId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ ok: number }[]>`
    SELECT 1 AS ok
      FROM transport_requests r
      LEFT JOIN bids b
        ON b."requestId" = r.id
       AND b."transporterId" = ${transporterId}
       AND b.status = 'ACCEPTED'
     WHERE r.id = ${requestId}
       AND (b.id IS NOT NULL OR r."assignedTransporterId" = ${transporterId})
     LIMIT 1
  `;
  return rows.length > 0;
}

async function canReadLocation(requestId: string, userId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ ok: number }[]>`
    SELECT 1 AS ok
      FROM transport_requests r
      LEFT JOIN bids b
        ON b."requestId" = r.id
       AND b."transporterId" = ${userId}
       AND b.status = 'ACCEPTED'
     WHERE r.id = ${requestId}
       AND (
            r."clientId" = ${userId}
         OR r."assignedTransporterId" = ${userId}
         OR b.id IS NOT NULL
       )
     LIMIT 1
  `;
  return rows.length > 0;
}

// Transporter updates their GPS location (INTER bid-based OR INTRA direct)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { lat, lng, heading, speed } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "إحداثيات غير صالحة" }, { status: 400 });
    }

    if (!(await canPushLocation(id, session.user.id))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const updated = await prisma.locationTrack.upsert({
      where:  { requestId: id },
      create: { requestId: id, lat, lng },
      update: { lat, lng },
    });

    // Fan out to anyone watching this request on the socket (client + admins).
    // Heading & speed are passed through but not persisted — only the latest
    // (lat, lng) lives in the DB; in-flight metadata stays on the wire.
    publish(room.req(id), events.locationUpdate, {
      lat,
      lng,
      heading: typeof heading === "number" && isFinite(heading) ? heading : null,
      speed:   typeof speed   === "number" && isFinite(speed)   ? speed   : null,
      updatedAt: updated.updatedAt.toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[location PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Client (or assigned transporter) reads current location
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!(await canReadLocation(id, session.user.id))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const loc = await prisma.locationTrack.findUnique({
      where: { requestId: id },
      select: { lat: true, lng: true, updatedAt: true },
    });
    if (!loc) return NextResponse.json(null);

    return NextResponse.json(loc);
  } catch (error) {
    console.error("[location GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
