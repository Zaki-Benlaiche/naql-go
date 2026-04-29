import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, phone: true, wilaya: true, vehicleType: true, avgRating: true, totalRatings: true, isOnline: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[profile GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { wilaya, vehicleType } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(wilaya      !== undefined ? { wilaya }      : {}),
        ...(vehicleType !== undefined ? { vehicleType } : {}),
      },
      select: { wilaya: true, vehicleType: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[profile PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
