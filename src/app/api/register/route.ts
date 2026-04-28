import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, password, role } = await req.json();

    if (!name || !phone || !password || !role) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "رقم الهاتف مستخدم مسبقاً" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phone, email: email || null, password: hashed, role },
    });

    return NextResponse.json({ id: user.id, name: user.name, role: user.role }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
