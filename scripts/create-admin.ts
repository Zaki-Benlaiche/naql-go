import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const phone = "0555000000";
  const password = "Admin@1234";

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    console.log("✅ Admin already exists:", existing.phone);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin NaqlGo",
      phone,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created:");
  console.log("   Phone   :", admin.phone);
  console.log("   Password:", password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
