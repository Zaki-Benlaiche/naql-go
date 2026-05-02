// Create or reset the NaqlGo super-admin account.
//
// Usage:
//   node -r dotenv/config scripts/create-admin.mjs
//
// Reads ADMIN_PHONE / ADMIN_PASSWORD / ADMIN_NAME from env, with
// safe defaults so it can be run on a fresh deploy.
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const ADMIN_PHONE    = process.env.ADMIN_PHONE    || "0700000000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@2026";
const ADMIN_NAME     = process.env.ADMIN_NAME     || "Admin NaqlGo";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Run with: node -r dotenv/config scripts/create-admin.mjs");
  process.exit(1);
}

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await prisma.user.findUnique({ where: { phone: ADMIN_PHONE } });

  if (existing) {
    await prisma.user.update({
      where: { phone: ADMIN_PHONE },
      data: { password: hashed, role: "ADMIN", isActive: true, name: ADMIN_NAME },
    });
    console.log("✅ Admin account RESET");
  } else {
    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        phone: ADMIN_PHONE,
        password: hashed,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("✅ Admin account CREATED");
  }

  console.log("");
  console.log("   Phone    :", ADMIN_PHONE);
  console.log("   Password :", ADMIN_PASSWORD);
  console.log("");
  console.log("   Login at /login → /admin");
}

main()
  .catch((err) => { console.error("❌", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
