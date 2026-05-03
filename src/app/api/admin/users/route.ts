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
    const role   = searchParams.get("role");   // CLIENT | TRANSPORTER
    const search = searchParams.get("q");
    const page   = Math.max(1, Number(searchParams.get("page") || 1));
    const skip   = (page - 1) * PAGE_SIZE;

    const where = {
      ...(role ? { role } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, phone: true, email: true,
          role: true, isActive: true, isOnline: true,
          wilaya: true, vehicleType: true, vehicleColor: true,
          isLivreur: true, isFrodeur: true, isTransporteur: true,
          avgRating: true, totalRatings: true, createdAt: true,
          _count: { select: { requests: true, bids: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("[admin/users GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
