import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (session.user.role === "CLIENT") {
    const requests = await prisma.transportRequest.findMany({
      where: { clientId: session.user.id, ...(status ? { status } : {}) },
      include: { bids: { include: { transporter: { select: { name: true, phone: true } } } } },
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
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fromCity, toCity, fromAddress, toAddress, goodsType, weight, description } = body;

    const request = await prisma.transportRequest.create({
      data: {
        clientId: session.user.id,
        fromCity, toCity, fromAddress, toAddress,
        goodsType,
        weight: parseFloat(weight),
        description: description || null,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
