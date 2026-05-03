import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page   = Math.max(1, Number(searchParams.get("page") || 1));
    const skip   = (page - 1) * PAGE_SIZE;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.transportRequest.findMany({
        where,
        include: {
          client: { select: { name: true, phone: true } },
          acceptedBid: { include: { transporter: { select: { name: true, phone: true } } } },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.transportRequest.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("[admin/orders GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
