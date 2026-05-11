import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arMonthLabel, isOverdue } from "@/lib/commission";

export const dynamic = "force-dynamic";

// Admin view of every commission payment. Filterable by status — the
// default filter (UNDER_REVIEW) is the action queue: "what needs me to
// verify a CCP transfer right now".

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING_PROOF | UNDER_REVIEW | PAID | REJECTED | ""

    const rows = await prisma.commissionPayment.findMany({
      where: status ? { status } : {},
      include: {
        transporter: {
          select: { id: true, name: true, phone: true, wilaya: true },
        },
      },
      orderBy: [
        // Queue order: oldest unpaid first.
        { status: "asc" },
        { periodYear: "asc" },
        { periodMonth: "asc" },
      ],
      take: 200,
    });

    const now = new Date();

    return NextResponse.json({
      total: rows.length,
      payments: rows.map(r => ({
        id: r.id,
        amount: r.amount,
        status: r.status,
        periodYear: r.periodYear,
        periodMonth: r.periodMonth,
        periodLabel: arMonthLabel(r.periodYear, r.periodMonth),
        overdue: r.status !== "PAID" && isOverdue(r.periodYear, r.periodMonth, now),
        proofUrl: r.proofUrl,
        transactionRef: r.transactionRef,
        rejectionReason: r.rejectionReason,
        submittedAt: r.submittedAt,
        reviewedAt: r.reviewedAt,
        paidAt: r.paidAt,
        transporter: r.transporter,
      })),
    });
  } catch (error) {
    console.error("[admin/payments GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
