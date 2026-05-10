import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { normalizePhone, isValidPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

// Limits per IP. Tuned for legitimate users (rarely register more than once)
// vs. abuse (bots opening dozens of accounts per minute).
const REG_LIMIT_PER_HOUR = 5;
const REG_WINDOW_SEC = 60 * 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate-limit BEFORE any DB call or bcrypt work — cheapest rejection path.
    const ip = clientIp(req);
    const rl = await rateLimit("register", ip, REG_LIMIT_PER_HOUR, REG_WINDOW_SEC);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "محاولات كثيرة، حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const body = await req.json();
    const name: string = (body.name ?? "").trim();
    const rawPhone: string = body.phone ?? "";
    const email: string | null = body.email ? String(body.email).trim().toLowerCase() : null;
    const password: string = body.password ?? "";
    const role: string = body.role ?? "";

    if (!name || !rawPhone || !password || !role) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    // Cap password length so an attacker can't tie up CPU with huge bcrypt inputs.
    if (password.length > 72) {
      return NextResponse.json({ error: "كلمة السر طويلة جداً" }, { status: 400 });
    }
    if (!["CLIENT", "TRANSPORTER"].includes(role)) {
      return NextResponse.json({ error: "دور غير صالح" }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }

    // 2. Single duplicate-check query (was 2). Only fetch the columns we need
    //    to decide which message to return — not the whole row.
    const duplicate = await prisma.user.findFirst({
      where: email
        ? { OR: [{ phone }, { email }] }
        : { phone },
      select: { phone: true, email: true },
    });

    if (duplicate) {
      if (duplicate.phone === phone) {
        return NextResponse.json({ error: "رقم الهاتف مستخدم مسبقاً" }, { status: 409 });
      }
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم مسبقاً، استخدم بريداً آخر أو اتركه فارغاً" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phone, email, password: hashed, role },
      select: { id: true, name: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
