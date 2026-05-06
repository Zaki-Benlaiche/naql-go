import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daily cleanup — invoked by Vercel Cron (see vercel.json).
// Vercel sets the Authorization: Bearer ${CRON_SECRET} header automatically
// when CRON_SECRET is configured in the project env.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const cutoff7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

  // 1. Read notifications older than 30 days.
  const notifs = await prisma.notification.deleteMany({
    where: { read: true, createdAt: { lt: cutoff30d } },
  });

  // 2. Location tracks for orders delivered/cancelled more than 7 days ago.
  //    Uses raw SQL to avoid loading every row into memory on a large DB.
  const locResult = await prisma.$executeRaw`
    DELETE FROM location_tracks
     WHERE "requestId" IN (
       SELECT id FROM transport_requests
        WHERE status IN ('DELIVERED', 'CANCELLED')
          AND COALESCE("deliveredAt", "updatedAt") < ${cutoff7d}
     )
  `;

  return NextResponse.json({
    ok: true,
    deletedNotifications: notifs.count,
    deletedLocationTracks: locResult,
    ranAt: new Date().toISOString(),
  });
}
