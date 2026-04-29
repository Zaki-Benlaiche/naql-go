import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    if (session.user.role === "CLIENT") {
      const requests = await prisma.transportRequest.findMany({
        where: { clientId: session.user.id, ...(status ? { status } : {}) },
        include: {
          bids: { include: { transporter: { select: { name: true, phone: true } } } },
          rating: { select: { score: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    }

    if (session.user.role === "TRANSPORTER") {
      const requests = await prisma.transportRequest.findMany({
        where: { status: "OPEN" },
        include: {
          client: { select: { name: true, phone: true } },
          bids: { where: { transporterId: session.user.id } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("[requests GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { fromCity, toCity, fromAddress, toAddress, goodsType, vehicleType, size,
            weight, description, estimatedPrice, scheduledAt, discountPercent, finalPrice } = body;

    const request = await prisma.transportRequest.create({
      data: {
        clientId: session.user.id,
        fromCity, toCity, fromAddress, toAddress,
        goodsType,
        vehicleType: vehicleType || "any",
        size: size || "medium",
        weight: parseFloat(weight),
        description: description || null,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        discountPercent: discountPercent ? parseInt(discountPercent) : null,
        finalPrice: finalPrice ? parseFloat(finalPrice) : null,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("[requests POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
