import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

    if (unreadOnly) {
      const count = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      });
      return NextResponse.json({ count });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[notifications GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Add latest=true to get single most-recent unread notification
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      await prisma.notification.deleteMany({ where: { id, userId: session.user.id } });
    } else {
      // Delete all read notifications
      await prisma.notification.deleteMany({ where: { userId: session.user.id, read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications DELETE]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
