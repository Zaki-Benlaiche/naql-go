import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { isOnline } = await req.json();
    if (typeof isOnline !== "boolean") {
      return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });
    }

    // KYC gate — unapproved transporters can't go online.
    if (isOnline) {
      const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isApproved: true },
      });
      if (!me?.isApproved) {
        return NextResponse.json(
          { error: "حسابك قيد المراجعة من قبل الإدارة" },
          { status: 403 },
        );
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { isOnline },
    });

    return NextResponse.json({ isOnline });
  } catch (error) {
    console.error("[profile/status]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isOnline: true, avgRating: true, totalRatings: true,
        isApproved: true, kycReviewedAt: true, rejectionReason: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[profile/status GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
