import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // CLIENT | TRANSPORTER | null
    const search = searchParams.get("q");

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        } : {}),
      },
      select: {
        id: true, name: true, phone: true, email: true,
        role: true, isActive: true, isOnline: true,
        avgRating: true, totalRatings: true, createdAt: true,
        _count: { select: { requests: true, bids: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[admin/users GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
