import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Admin KYC queue: transporters who have submitted documents (or signed up)
// and are waiting for review. We return their profile + every uploaded
// document so the admin can decide without a second round-trip.

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const pending = await prisma.user.findMany({
      where: {
        role: "TRANSPORTER",
        kycReviewedAt: null,
      },
      select: {
        id: true, name: true, phone: true, email: true,
        wilaya: true, vehicleType: true, vehicleColor: true,
        isLivreur: true, isFrodeur: true, isTransporteur: true,
        createdAt: true,
        documents: {
          select: { id: true, type: true, fileData: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ pending, total: pending.length });
  } catch (error) {
    console.error("[admin/kyc GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
