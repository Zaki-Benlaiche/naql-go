import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    // Verify user is party to this request
    const request = await prisma.transportRequest.findUnique({
      where: { id: params.id },
      include: { bids: { where: { status: "ACCEPTED" } } },
    });
    if (!request) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

    const isClient = request.clientId === session.user.id;
    const isTransporter = request.bids.some(b => b.transporterId === session.user.id);
    if (!isClient && !isTransporter) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const messages = await prisma.message.findMany({
      where: { requestId: params.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[messages GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
    if (text.length > 1000) return NextResponse.json({ error: "الرسالة طويلة جداً" }, { status: 400 });

    const request = await prisma.transportRequest.findUnique({
      where: { id: params.id },
      include: { bids: { where: { status: "ACCEPTED" } } },
    });
    if (!request) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

    const isClient = request.clientId === session.user.id;
    const isTransporter = request.bids.some(b => b.transporterId === session.user.id);
    if (!isClient && !isTransporter) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const message = await prisma.message.create({
      data: {
        requestId: params.id,
        senderId: session.user.id,
        senderName: session.user.name ?? "",
        senderRole: session.user.role,
        text: text.trim(),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[messages POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
