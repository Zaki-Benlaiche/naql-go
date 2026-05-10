import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rateLimit";
import { normalizePhone } from "./phone";

// Credential-stuffing protection: cap attempts per identifier per window.
// Keyed on the identifier (not IP) so an attacker rotating IPs still gets
// throttled when hammering the same account.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SEC = 15 * 60;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: { sameSite: "none", path: "/", secure: true },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Phone or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        if (credentials.password.length > 72) return null;

        const raw = credentials.identifier.trim();
        // If the input looks like a phone, normalize it so "06 12..." and
        // "+213612..." resolve to the same DB row.
        const asPhone = normalizePhone(raw);
        const looksLikePhone = /^[\d+\s().-]+$/.test(raw);
        const phoneCandidate = looksLikePhone ? asPhone : raw;
        const emailCandidate = raw.toLowerCase();

        // Throttle on the normalized identifier so we don't burn CPU on bcrypt
        // for accounts under active attack.
        const rl = await rateLimit("login", phoneCandidate || emailCandidate, LOGIN_LIMIT, LOGIN_WINDOW_SEC);
        if (!rl.allowed) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: phoneCandidate },
              { email: emailCandidate },
            ],
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.phone = (user as unknown as { phone: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.phone = token.phone;
      return session;
    },
  },
};
