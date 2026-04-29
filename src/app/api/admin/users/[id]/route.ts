import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { isActive } = await req.json();
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[admin/users PATCH]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
