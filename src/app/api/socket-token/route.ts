import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// Mint a short-lived JWT that the browser/app can use to authenticate against
// the Socket.IO gateway. We can't reuse the NextAuth session cookie directly
// because it's HttpOnly (and JWE-encrypted) — the client never sees it.
//
// SOCKET_JWT_SECRET must be the same on Vercel and on the socket server.
// We default to NEXTAUTH_SECRET so there's nothing extra to configure.
const SECRET = process.env.SOCKET_JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!SECRET) {
      console.error("[socket-token] no SECRET configured");
      return NextResponse.json({ error: "Socket auth disabled" }, { status: 503 });
    }

    const token = jwt.sign(
      { id: session.user.id, role: session.user.role },
      SECRET,
      { expiresIn: "1h", algorithm: "HS256" },
    );

    // 1-hour TTL — the client refreshes by hitting this endpoint again before
    // the socket reconnects. Browser caches are bypassed via no-store.
    return NextResponse.json(
      { token, url: process.env.NEXT_PUBLIC_SOCKET_URL ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[socket-token]", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
