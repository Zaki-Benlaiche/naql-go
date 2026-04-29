import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time admin setup — protected by secret key
export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const phone = "0555000000";
  const password = "Admin@1234";

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { phone }, data: { role: "ADMIN" } });
      return NextResponse.json({ message: "تم تحديث الدور إلى ADMIN", phone });
    }
    return NextResponse.json({ message: "الأدمن موجود مسبقاً", phone });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name: "Admin NaqlGo", phone, password: hashed, role: "ADMIN" },
  });

  return NextResponse.json({ message: "✅ تم إنشاء حساب الأدمن", phone, password });
}
