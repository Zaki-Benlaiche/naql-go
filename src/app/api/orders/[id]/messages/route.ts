import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// One round-trip auth check: returns 1 row if the caller is authorized, else 0.
// Replaces a heavy findUnique({ include: { bids: { where: ACCEPTED } } })
// that pulled the full request row + bids list on every chat poll/refresh.
async function isParticipant(requestId: string, userId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ ok: number }[]>`
    SELECT 1 AS ok
      FROM transport_requests r
      LEFT JOIN bids b
        ON b."requestId" = r.id AND b.status = 'ACCEPTED'
     WHERE r.id = ${requestId}
       AND (r."clientId" = ${userId} OR b."transporterId" = ${userId})
     LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!(await isParticipant(id, session.user.id))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "asc" },
      take: 100,
      select: { id: true, senderName: true, senderRole: true, text: true, createdAt: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[messages GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
    if (text.length > 1000) return NextResponse.json({ error: "الرسالة طويلة جداً" }, { status: 400 });

    if (!(await isParticipant(id, session.user.id))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        requestId: id,
        senderId: session.user.id,
        senderName: session.user.name ?? "",
        senderRole: session.user.role,
        text: text.trim(),
      },
      select: { id: true, senderName: true, senderRole: true, text: true, createdAt: true },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[messages POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
