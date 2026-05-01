import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const COMMISSION = 0.10; // 10 % admin fee per delivery

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
          select: { fromCity: true, toCity: true, updatedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now         = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalGross = 0, thisMonthGross = 0;

    for (const b of deliveredBids) {
      totalGross += b.price;
      if (new Date(b.createdAt) >= startOfMonth) thisMonthGross += b.price;
    }

    const totalAdminFee      = totalGross      * COMMISSION;
    const totalNet           = totalGross      * (1 - COMMISSION);
    const thisMonthAdminFee  = thisMonthGross  * COMMISSION;
    const thisMonthNet       = thisMonthGross  * (1 - COMMISSION);

    const completedTrips = deliveredBids.length;
    const avgNetPerTrip  = completedTrips > 0 ? totalNet / completedTrips : 0;

    return NextResponse.json({
      totalGross,
      totalNet,
      totalAdminFee,
      thisMonthGross,
      thisMonthNet,
      thisMonthAdminFee,
      completedTrips,
      avgNetPerTrip,
      commissionRate: COMMISSION,
      history: deliveredBids.map(b => ({
        id:          b.id,
        grossPrice:  b.price,
        netPrice:    b.price * (1 - COMMISSION),
        adminFee:    b.price * COMMISSION,
        fromCity:    b.request.fromCity,
        toCity:      b.request.toCity,
        deliveredAt: b.request.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[earnings]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
