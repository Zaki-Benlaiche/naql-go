import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushToUserAsync } from "@/lib/push";
import { arMonthLabel } from "@/lib/commission";

export const dynamic = "force-dynamic";

// Admin acts on a payment: { action: "approve" } or { action: "reject", reason }.
// On approve we record `paidAt` + `reviewedBy` and unblock the driver if they
// were locked out. On reject we surface a reason the driver can read and
// resubmit against.

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

    const row = await prisma.commissionPayment.findUnique({
      where: { id },
      select: {
        id: true, transporterId: true, status: true, amount: true,
        periodYear: true, periodMonth: true,
      },
    });
    if (!row) return NextResponse.json({ error: "الدفعة غير موجودة" }, { status: 404 });
    if (row.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: "هذه الدفعة ليست بانتظار المراجعة" },
        { status: 400 },
      );
    }

    const now = new Date();
    const periodLabel = arMonthLabel(row.periodYear, row.periodMonth);
    const isApprove = action === "approve";

    await prisma.commissionPayment.update({
      where: { id },
      data: {
        status: isApprove ? "PAID" : "REJECTED",
        reviewedAt: now,
        reviewedById: session.user.id,
        rejectionReason: isApprove ? null : reason,
        paidAt: isApprove ? now : null,
      },
    });

    // In-app + push notification.
    const title = isApprove ? "✅ تم تأكيد دفعتك" : "❌ تم رفض الإثبات";
    const bodyText = isApprove
      ? `عمولة ${periodLabel} — ${row.amount.toLocaleString()} DA — مدفوعة بالكامل`
      : `عمولة ${periodLabel} — السبب: ${reason}`;

    try {
      await prisma.notification.create({
        data: {
          userId: row.transporterId,
          title, body: bodyText,
          type: isApprove ? "commission_paid" : "commission_rejected",
        },
      });
    } catch (e) { console.error("[admin/payments notif]", e); }

    pushToUserAsync(row.transporterId, {
      title, body: bodyText,
      data: {
        type: isApprove ? "commission_paid" : "commission_rejected",
        paymentId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/payments PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
