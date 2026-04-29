import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns transporter's orders: accepted (bid-based) + direct INTRA requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // INTER bid-based orders (already accepted)
    const bidOrders = await prisma.transportRequest.findMany({
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

    // INTRA direct requests assigned to this transporter (OPEN = pending accept)
    const directOrders = await prisma.transportRequest.findMany({
      where: {
        assignedTransporterId: session.user.id,
        transportType: "INTRA",
        status: { in: ["OPEN", "ACCEPTED", "IN_TRANSIT"] },
        // Exclude any that already appear in bidOrders (shouldn't happen, but safe)
        bids: { none: { transporterId: session.user.id, status: "ACCEPTED" } },
      },
      include: {
        client: { select: { name: true, phone: true } },
        bids: { where: { transporterId: session.user.id } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Merge, dedup by id
    const seen = new Set<string>();
    const merged = [...directOrders, ...bidOrders].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error("[orders GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
