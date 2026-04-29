import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const [
      totalUsers, totalClients, totalTransporters,
      totalRequests, openRequests, inTransit, delivered,
      totalBids, avgRating,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "TRANSPORTER" } }),
      prisma.transportRequest.count(),
      prisma.transportRequest.count({ where: { status: "OPEN" } }),
      prisma.transportRequest.count({ where: { status: "IN_TRANSIT" } }),
      prisma.transportRequest.count({ where: { status: "DELIVERED" } }),
      prisma.bid.count(),
      prisma.rating.aggregate({ _avg: { score: true } }),
    ]);

    // Revenue estimate: sum of accepted bid prices for delivered orders
    const deliveredBids = await prisma.bid.findMany({
      where: { status: "ACCEPTED", request: { status: "DELIVERED" } },
      select: { price: true },
    });
    const totalRevenue = deliveredBids.reduce((sum, b) => sum + b.price, 0);

    // Recent activity (last 7 days)
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const newUsersWeek = await prisma.user.count({ where: { createdAt: { gte: since7 } } });
    const newRequestsWeek = await prisma.transportRequest.count({ where: { createdAt: { gte: since7 } } });

    return NextResponse.json({
      totalUsers, totalClients, totalTransporters,
      totalRequests, openRequests, inTransit, delivered,
      totalBids,
      avgRating: avgRating._avg.score ?? 0,
      totalRevenue,
      newUsersWeek,
      newRequestsWeek,
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
