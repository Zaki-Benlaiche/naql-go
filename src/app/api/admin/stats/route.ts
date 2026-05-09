import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, cacheKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

type StatsRow = {
  totalUsers: number;
  totalClients: number;
  totalTransporters: number;
  totalRequests: number;
  openRequests: number;
  inTransit: number;
  delivered: number;
  totalBids: number;
  avgRating: number;
  totalRevenue: number;
  newUsersWeek: number;
  newRequestsWeek: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Cache 60s — was 9 parallel COUNTs + a findMany on every page hit.
    // Single SQL aggregate reads each table once instead of 4×.
    const stats = await redis.cached<StatsRow>(cacheKey.adminStats(), 60, async () => {
      const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000);

      const [users, requests, bids, ratings, revenueRows] = await Promise.all([
        prisma.$queryRaw<{ totalUsers: number; totalClients: number; totalTransporters: number; newUsersWeek: number }[]>`
          SELECT
            COUNT(*)::int                                                       AS "totalUsers",
            COUNT(*) FILTER (WHERE role = 'CLIENT')::int                        AS "totalClients",
            COUNT(*) FILTER (WHERE role = 'TRANSPORTER')::int                   AS "totalTransporters",
            COUNT(*) FILTER (WHERE "createdAt" >= ${since7})::int               AS "newUsersWeek"
          FROM users
        `,
        prisma.$queryRaw<{ totalRequests: number; openRequests: number; inTransit: number; delivered: number; newRequestsWeek: number }[]>`
          SELECT
            COUNT(*)::int                                                       AS "totalRequests",
            COUNT(*) FILTER (WHERE status = 'OPEN')::int                        AS "openRequests",
            COUNT(*) FILTER (WHERE status = 'IN_TRANSIT')::int                  AS "inTransit",
            COUNT(*) FILTER (WHERE status = 'DELIVERED')::int                   AS "delivered",
            COUNT(*) FILTER (WHERE "createdAt" >= ${since7})::int               AS "newRequestsWeek"
          FROM transport_requests
        `,
        prisma.$queryRaw<{ totalBids: number }[]>`SELECT COUNT(*)::int AS "totalBids" FROM bids`,
        prisma.$queryRaw<{ avgRating: number | null }[]>`SELECT AVG(score)::float AS "avgRating" FROM ratings`,
        prisma.$queryRaw<{ totalRevenue: number }[]>`
          SELECT COALESCE(SUM(b.price), 0)::float AS "totalRevenue"
          FROM bids b JOIN transport_requests r ON r.id = b."requestId"
          WHERE b.status = 'ACCEPTED' AND r.status = 'DELIVERED'
        `,
      ]);

      const u = users[0],     rq = requests[0];
      const b = bids[0],      rt = ratings[0],   rv = revenueRows[0];

      return {
        totalUsers:        Number(u.totalUsers),
        totalClients:      Number(u.totalClients),
        totalTransporters: Number(u.totalTransporters),
        newUsersWeek:      Number(u.newUsersWeek),
        totalRequests:     Number(rq.totalRequests),
        openRequests:      Number(rq.openRequests),
        inTransit:         Number(rq.inTransit),
        delivered:         Number(rq.delivered),
        newRequestsWeek:   Number(rq.newRequestsWeek),
        totalBids:         Number(b.totalBids),
        avgRating:         Number(rt.avgRating ?? 0),
        totalRevenue:      Number(rv.totalRevenue),
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
