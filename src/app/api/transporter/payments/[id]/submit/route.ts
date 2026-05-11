import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBase64 } from "@/lib/blob";

export const dynamic = "force-dynamic";

// Transporter uploads a screenshot of the CCP/BaridiMob transfer + the
// reference number. Moves the row from PENDING_PROOF (or REJECTED) to
// UNDER_REVIEW. The admin then verifies the transfer landed and either
// approves (→ PAID) or rejects with a reason (→ REJECTED).

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { proof, transactionRef } = await req.json();
    if (typeof proof !== "string" || proof.length < 20) {
      return NextResponse.json({ error: "صورة التحويل مطلوبة" }, { status: 400 });
    }
    if (typeof transactionRef !== "string" || transactionRef.trim().length < 3) {
      return NextResponse.json({ error: "رقم العملية مطلوب" }, { status: 400 });
    }
    if (proof.length > 3_000_000) {
      return NextResponse.json({ error: "الصورة كبيرة جداً" }, { status: 413 });
    }

    const row = await prisma.commissionPayment.findUnique({
      where: { id },
      select: { id: true, transporterId: true, status: true, periodYear: true, periodMonth: true },
    });
    if (!row) return NextResponse.json({ error: "الدفعة غير موجودة" }, { status: 404 });
    if (row.transporterId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    if (row.status === "PAID") {
      return NextResponse.json({ error: "هذه الدفعة مؤكَّدة مسبقاً" }, { status: 400 });
    }

    const proofUrl = await uploadBase64(
      `commission-proofs/${row.transporterId}/${row.periodYear}-${row.periodMonth}.jpg`,
      proof,
    );

    await prisma.commissionPayment.update({
      where: { id },
      data: {
        proofUrl,
        transactionRef: transactionRef.trim().slice(0, 100),
        status: "UNDER_REVIEW",
        submittedAt: new Date(),
        // Clear any previous rejection so the admin queue is clean.
        rejectionReason: null,
        reviewedAt: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[transporter/payments submit]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
