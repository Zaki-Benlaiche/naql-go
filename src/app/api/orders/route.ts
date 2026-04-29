import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns transporter's accepted orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const orders = await prisma.transportRequest.findMany({
      where: {
        bids: {
          some: {
            transporterId: session.user.id,
            status: "ACCEPTED",
          },
        },
      },
      include: {
        client: { select: { name: true, phone: true } },
        bids: {
          where: { transporterId: session.user.id, status: "ACCEPTED" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[orders GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
