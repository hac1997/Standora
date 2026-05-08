import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Organização demo
  const org = await prisma.organization.upsert({
    where: { id: "seed-org-standora" },
    update: {},
    create: {
      id: "seed-org-standora",
      name: "Standora Demo",
      cnpj: "00.000.000/0001-00",
    },
  });

  // Usuário admin demo
  const hashedPassword = await bcrypt.hash("standora123", 12);

  await prisma.user.upsert({
    where: { email: "admin@standora.com" },
    update: { password: hashedPassword },
    create: {
      name: "Admin",
      email: "admin@standora.com",
      password: hashedPassword,
      role: "admin",
      organizationId: org.id,
    },
  });

  console.log("✅ Seed concluído!");
  console.log("   Email:  admin@standora.com");
  console.log("   Senha:  standora123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
