// ============================================================================
// Prisma Seed - Datos iniciales para Levantamiento Terreno
// ============================================================================

import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // --- Usuario Administrador ---
  const hashedPassword = await bcrypt.hash("admin", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      email: "admin",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Usuario admin creado: ${admin.name} (${admin.email})`);

  // --- Cliente de ejemplo ---
  const client = await prisma.client.create({
    data: {
      name: "Juan Pérez",
      address: "Av. Providencia 1234, Santiago",
      phone: "+56912345678",
    },
  });

  console.log(`✅ Cliente de ejemplo creado: ${client.name}`);

  console.log("🎉 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
