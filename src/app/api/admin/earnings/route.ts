import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const COMMISSION = 0.10;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const deliveredBids = await prisma.bid.findMany({
      where: {
        status: "ACCEPTED",
        request: { status: "DELIVERED" },
      },
      include: {
        transporter: { select: { id: true, name: true, phone: true } },
        request:     { select: { fromCity: true, toCity: true, updatedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Group by transporter
    const byTransporter = new Map<string, {
      id: string; name: string; phone: string;
      deliveries: number;
      totalGross: number; totalCommission: number;
      thisMonthGross: number; thisMonthCommission: number;
    }>();

    for (const b of deliveredBids) {
      const t = b.transporter;
      if (!byTransporter.has(t.id)) {
        byTransporter.set(t.id, {
          id: t.id, name: t.name, phone: t.phone,
          deliveries: 0,
          totalGross: 0, totalCommission: 0,
          thisMonthGross: 0, thisMonthCommission: 0,
        });
      }
      const entry = byTransporter.get(t.id)!;
      entry.deliveries++;
      entry.totalGross      += b.price;
      entry.totalCommission += b.price * COMMISSION;
      if (new Date(b.createdAt) >= startOfMonth) {
        entry.thisMonthGross      += b.price;
        entry.thisMonthCommission += b.price * COMMISSION;
      }
    }

    const transporters = Array.from(byTransporter.values())
      .sort((a, b) => b.thisMonthCommission - a.thisMonthCommission);

    const totalCommission      = deliveredBids.reduce((s, b) => s + b.price * COMMISSION, 0);
    const thisMonthCommission  = deliveredBids
      .filter(b => new Date(b.createdAt) >= startOfMonth)
      .reduce((s, b) => s + b.price * COMMISSION, 0);
    const totalDeliveries      = deliveredBids.length;
    const totalGross           = deliveredBids.reduce((s, b) => s + b.price, 0);

    return NextResponse.json({
      totalCommission,
      thisMonthCommission,
      totalDeliveries,
      totalGross,
      commissionRate: COMMISSION,
      transporters,
    });
  } catch (error) {
    console.error("[admin/earnings]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
