import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {}, // No actualizar nada si ya existe
    create: {
      username: "admin",
      password: hashedPassword,
      emails: [
        "luisangel930115@gmail.com",
        "laortiz937@soy.sena.edu.co"
      ], // Prisma convierte automáticamente a JSON
    },
  });

  console.log("Administrador creado/actualizado con éxito!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Seed finalizado.");
  });
