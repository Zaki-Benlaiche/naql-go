import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const deliveredBids = await prisma.bid.findMany({
      where: {
        transporterId: session.user.id,
        status: "ACCEPTED",
        request: { status: "DELIVERED" },
      },
      include: {
        request: {
          select: { fromCity: true, toCity: true, createdAt: true, updatedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalEarned = deliveredBids.reduce((s, b) => s + b.price, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarned = deliveredBids
      .filter(b => new Date(b.createdAt) >= startOfMonth)
      .reduce((s, b) => s + b.price, 0);

    const completedTrips = deliveredBids.length;
    const avgPerTrip = completedTrips > 0 ? totalEarned / completedTrips : 0;

    return NextResponse.json({
      totalEarned,
      thisMonthEarned,
      completedTrips,
      avgPerTrip,
      history: deliveredBids.map(b => ({
        id: b.id,
        price: b.price,
        fromCity: b.request.fromCity,
        toCity: b.request.toCity,
        deliveredAt: b.request.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[earnings]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
