import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { transporterId: session.user.id },
      select: { id: true, type: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[documents GET]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { type, fileData } = await req.json();
    if (!type || !fileData) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    if (fileData.length > 3_000_000) return NextResponse.json({ error: "الملف كبير جداً" }, { status: 413 });

    const validTypes = ["license", "vehicle_reg", "insurance", "other"];
    if (!validTypes.includes(type)) return NextResponse.json({ error: "نوع غير صالح" }, { status: 400 });

    // Replace existing document of same type
    await prisma.document.deleteMany({
      where: { transporterId: session.user.id, type },
    });

    const doc = await prisma.document.create({
      data: { transporterId: session.user.id, type, fileData, status: "PENDING" },
    });

    return NextResponse.json({ id: doc.id, type: doc.type, status: doc.status }, { status: 201 });
  } catch (error) {
    console.error("[documents POST]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
