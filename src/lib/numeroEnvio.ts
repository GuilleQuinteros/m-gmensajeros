import { prisma } from "./prisma";

export async function generarNumeroEnvio(): Promise<string> {
  const ultimo = await prisma.envio.findFirst({
    orderBy: { createdAt: "desc" },
    select: { numeroEnvio: true },
  });
  if (!ultimo) return "ENV-0001";
  const num = parseInt(ultimo.numeroEnvio.replace("ENV-", ""), 10);
  return `ENV-${String(num + 1).padStart(4, "0")}`;
}
