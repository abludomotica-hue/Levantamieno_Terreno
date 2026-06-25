import prisma from "./src/lib/prisma";
import bcrypt from "bcryptjs";

const TECHNICIANS_DATA = [
  { name: "Pedro Muñoz", email: "pedro@ablutech.cl" },
  { name: "Sofía Rojas", email: "sofia@ablutech.cl" },
  { name: "Carlos Silva", email: "carlos@ablutech.cl" },
  { name: "Valentina Henríquez", email: "valentina@ablutech.cl" },
  { name: "Miguel Castro", email: "miguel@ablutech.cl" },
  { name: "Camila Barraza", email: "camila@ablutech.cl" },
  { name: "Javier Tapia", email: "javier@ablutech.cl" },
  { name: "Daniela Fuentes", email: "daniela@ablutech.cl" },
  { name: "Andrés Morales", email: "andres@ablutech.cl" },
  { name: "Constanza Rivas", email: "constanza@ablutech.cl" },
];

async function main() {
  console.log("🌱 Creando 10 técnicos en la base de datos...");
  const hashedPassword = await bcrypt.hash("tecnico123", 10);

  for (const tech of TECHNICIANS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: tech.email },
      update: {
        role: "TECHNICIAN",
      },
      create: {
        email: tech.email,
        name: tech.name,
        password: hashedPassword,
        role: "TECHNICIAN",
      },
    });
    console.log(`✅ Técnico creado/actualizado: ${user.name} (${user.email})`);
  }

  console.log("🎉 Todos los técnicos fueron creados con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error al crear técnicos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
