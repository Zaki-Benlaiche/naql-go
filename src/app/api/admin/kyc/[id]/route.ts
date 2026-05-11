import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushToUserAsync } from "@/lib/push";

export const dynamic = "force-dynamic";

// Approve or reject a transporter's KYC. The single PATCH handler covers both
// actions — admin sends { action: "approve" } or { action: "reject", reason }.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action as "approve" | "reject";
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : null;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
    }
    if (action === "reject" && !reason) {
      return NextResponse.json({ error: "السبب مطلوب عند الرفض" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true },
    });
    if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    if (target.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "هذا الإجراء للناقلين فقط" }, { status: 400 });
    }

    const isApproved = action === "approve";
    await prisma.user.update({
      where: { id },
      data: {
        isApproved,
        kycReviewedAt: new Date(),
        rejectionReason: isApproved ? null : reason,
        // A rejected driver who was somehow online must drop offline.
        ...(isApproved ? {} : { isOnline: false }),
      },
    });

    // Tell them right away — they're probably watching the app.
    pushToUserAsync(id, {
      title: isApproved ? "✅ تمت الموافقة على حسابك" : "❌ تم رفض حسابك",
      body: isApproved
        ? "يمكنك الآن استقبال الطلبات والعمل عبر التطبيق"
        : `السبب: ${reason}`,
      data: { type: "kyc_result", status: isApproved ? "approved" : "rejected" },
    });

    // In-app notification too — survives if push isn't delivered.
    try {
      await prisma.notification.create({
        data: {
          userId: id,
          title: isApproved ? "✅ تمت الموافقة على حسابك" : "❌ تم رفض حسابك",
          body: isApproved
            ? "يمكنك الآن استقبال الطلبات والعمل عبر التطبيق"
            : `السبب: ${reason}`,
          type: isApproved ? "kyc_approved" : "kyc_rejected",
        },
      });
    } catch (e) { console.error("[kyc notif]", e); }

    return NextResponse.json({ ok: true, isApproved });
  } catch (error) {
    console.error("[admin/kyc PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
