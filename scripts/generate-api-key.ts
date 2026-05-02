import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const rawKey = `mgm_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  await prisma.apiKey.create({
    data: {
      nombre: "Racing Club Avellaneda",
      keyHash,
      clienteId: "pdv-racing-01",
      isActive: true,
    },
  });

  console.log("API Key generada — guardar en lugar seguro:");
  console.log(rawKey);
  console.log("Esta clave no se puede recuperar luego.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());