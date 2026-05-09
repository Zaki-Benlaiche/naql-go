import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, cacheKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

const COMMISSION = 0.10;

type SummaryRow = {
  totalGross: number;
  thisMonthGross: number;
  totalDeliveries: number;
};

type TransporterRow = {
  id: string;
  name: string;
  phone: string;
  deliveries: number;
  totalGross: number;
  thisMonthGross: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Cache for 60s — earnings don't change second-to-second.
    const data = await redis.cached(`${cacheKey.adminStats()}:earnings`, 60, async () => {
      const now          = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Two SQL aggregates done in parallel — DB does the heavy lifting,
      // we ship 1 summary row + ~100 transporter rows instead of every bid.
      const [summaryRows, transporterRows] = await Promise.all([
        prisma.$queryRaw<SummaryRow[]>`
          SELECT
            COALESCE(SUM(b.price), 0)                                                    AS "totalGross",
            COALESCE(SUM(CASE WHEN COALESCE(r."deliveredAt", r."updatedAt") >= ${startOfMonth}
                              THEN b.price ELSE 0 END), 0)                              AS "thisMonthGross",
            COUNT(*)::int                                                                AS "totalDeliveries"
          FROM bids b
          JOIN transport_requests r ON r.id = b."requestId"
          WHERE b.status = 'ACCEPTED' AND r.status = 'DELIVERED'
        `,
        prisma.$queryRaw<TransporterRow[]>`
          SELECT
            u.id                                                                         AS "id",
            u.name                                                                       AS "name",
            u.phone                                                                      AS "phone",
            COUNT(*)::int                                                                AS "deliveries",
            COALESCE(SUM(b.price), 0)                                                    AS "totalGross",
            COALESCE(SUM(CASE WHEN COALESCE(r."deliveredAt", r."updatedAt") >= ${startOfMonth}
                              THEN b.price ELSE 0 END), 0)                              AS "thisMonthGross"
          FROM bids b
          JOIN transport_requests r ON r.id = b."requestId"
          JOIN users u              ON u.id = b."transporterId"
          WHERE b.status = 'ACCEPTED' AND r.status = 'DELIVERED'
          GROUP BY u.id, u.name, u.phone
          ORDER BY "thisMonthGross" DESC
          LIMIT 200
        `,
      ]);

      const s = summaryRows[0] ?? { totalGross: 0, thisMonthGross: 0, totalDeliveries: 0 };

      const transporters = transporterRows.map(r => ({
        id:                  r.id,
        name:                r.name,
        phone:               r.phone,
        deliveries:          Number(r.deliveries),
        totalGross:          Number(r.totalGross),
        totalCommission:     Number(r.totalGross) * COMMISSION,
        thisMonthGross:      Number(r.thisMonthGross),
        thisMonthCommission: Number(r.thisMonthGross) * COMMISSION,
      }));

      return {
        totalCommission:      Number(s.totalGross) * COMMISSION,
        thisMonthCommission:  Number(s.thisMonthGross) * COMMISSION,
        totalDeliveries:      Number(s.totalDeliveries),
        totalGross:           Number(s.totalGross),
        commissionRate:       COMMISSION,
        transporters,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[admin/earnings]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
