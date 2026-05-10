import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// The mobile app posts here right after it gets an FCM registration token.
// Re-posting the same token is a no-op (upsert), so the client can call this
// on every cold start without worrying about duplicates.

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { token, platform } = await req.json();
    if (typeof token !== "string" || token.length < 20 || token.length > 4096) {
      return NextResponse.json({ error: "token غير صالح" }, { status: 400 });
    }
    const plat = ["android", "ios", "web"].includes(platform) ? platform : "android";

    await prisma.deviceToken.upsert({
      where: { userId_token: { userId: session.user.id, token } },
      update: { lastSeenAt: new Date(), platform: plat },
      create: { userId: session.user.id, token, platform: plat },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[devices/register]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Called on logout so we don't keep delivering pushes to a logged-out device.
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { token } = await req.json();
    if (typeof token !== "string") {
      return NextResponse.json({ error: "token غير صالح" }, { status: 400 });
    }

    await prisma.deviceToken.deleteMany({
      where: { userId: session.user.id, token },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[devices/register DELETE]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
