import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  COMMISSION_RATE, MIN_PAYMENT, BANK_INFO,
  billablePeriodsUpTo, isOverdue, arMonthLabel,
} from "@/lib/commission";

export const dynamic = "force-dynamic";

// Returns the transporter's settlement ledger plus the bank info they need
// to transfer the money. Lazy-creates rows for past months that crossed the
// MIN_PAYMENT threshold but haven't been billed yet — so a driver who never
// opens the page is still tracked the moment we read for them.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tid = session.user.id;

    // Aggregate gross earnings per (year, month) for every delivered bid.
    // One round-trip; DB does the grouping.
    type Row = { year: number; month: number; gross: number };
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        EXTRACT(YEAR  FROM COALESCE(r."deliveredAt", r."updatedAt"))::int AS "year",
        EXTRACT(MONTH FROM COALESCE(r."deliveredAt", r."updatedAt"))::int AS "month",
        COALESCE(SUM(b.price), 0)::float                                  AS "gross"
      FROM bids b
      JOIN transport_requests r ON r.id = b."requestId"
      WHERE b."transporterId" = ${tid}
        AND b.status = 'ACCEPTED'
        AND r.status = 'DELIVERED'
      GROUP BY 1, 2
    `;

    const grossByKey = new Map<string, number>();
    for (const r of rows) grossByKey.set(`${r.year}-${r.month}`, r.gross);

    // Lazy upsert: for each past period with commission >= MIN_PAYMENT, make
    // sure a CommissionPayment row exists.
    const now = new Date();
    const periods = billablePeriodsUpTo(now, 12);

    for (const p of periods) {
      const gross = grossByKey.get(`${p.year}-${p.month}`) ?? 0;
      const commission = gross * COMMISSION_RATE;
      if (commission < MIN_PAYMENT) continue;

      // upsert — idempotent. Don't overwrite the amount if a row already
      // exists (we frozen-snapshot the amount at first creation).
      const existing = await prisma.commissionPayment.findUnique({
        where: {
          transporterId_periodYear_periodMonth: {
            transporterId: tid,
            periodYear: p.year,
            periodMonth: p.month,
          },
        },
        select: { id: true },
      });
      if (!existing) {
        await prisma.commissionPayment.create({
          data: {
            transporterId: tid,
            periodYear: p.year,
            periodMonth: p.month,
            amount: Math.round(commission * 100) / 100,
            status: "PENDING_PROOF",
          },
        });
      }
    }

    // Return the full ledger + bank info, ordered newest first.
    const payments = await prisma.commissionPayment.findMany({
      where: { transporterId: tid },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });

    const totalDue = payments
      .filter(p => p.status !== "PAID")
      .reduce((s, p) => s + p.amount, 0);

    const hasOverdue = payments.some(p =>
      p.status !== "PAID" && isOverdue(p.periodYear, p.periodMonth, now),
    );

    return NextResponse.json({
      bank: BANK_INFO,
      minPayment: MIN_PAYMENT,
      totalDue,
      hasOverdue,
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        periodYear: p.periodYear,
        periodMonth: p.periodMonth,
        periodLabel: arMonthLabel(p.periodYear, p.periodMonth),
        proofUrl: p.proofUrl,
        transactionRef: p.transactionRef,
        rejectionReason: p.rejectionReason,
        submittedAt: p.submittedAt,
        paidAt: p.paidAt,
        overdue: p.status !== "PAID" && isOverdue(p.periodYear, p.periodMonth, now),
      })),
    });
  } catch (error) {
    console.error("[transporter/payments GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
