import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "أدخل رمز الكوبون" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "الكوبون غير صالح" }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية الكوبون" }, { status: 400 });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "تم استنفاد الكوبون" }, { status: 400 });
    }

    // Check if user already used this coupon
    const alreadyUsed = await prisma.couponUse.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
    });
    if (alreadyUsed) {
      return NextResponse.json({ error: "لقد استخدمت هذا الكوبون مسبقاً" }, { status: 409 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      couponId: coupon.id,
    });
  } catch (error) {
    console.error("[coupons/apply]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
