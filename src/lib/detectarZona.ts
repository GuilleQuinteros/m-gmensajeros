import { prisma } from "./prisma";

export async function detectarZonaId(
  partido?: string,
  provincia?: string,
  codigoPostal?: string
): Promise<string | null> {

  // 1. Buscar por partido primero
  if (partido) {
    const match = await prisma.partidoZona.findUnique({
      where: { partido: partido.toUpperCase().trim() },
      select: { zonaId: true },
    });
    if (match) return match.zonaId;
  }

  // 2. Si la provincia es Capital Federal → CABA
  if (provincia) {
    const prov = provincia.toUpperCase().trim();
    if (
      prov.includes("CAPITAL") ||
      prov.includes("CABA") ||
      prov === "C.A.B.A."
    ) {
      return "caba-24";
    }
  }

  // 3. Por rango de CP
  if (codigoPostal) {
    const cp = parseInt(codigoPostal.replace(/\D/g, ""));
    if (!isNaN(cp)) {
      if (cp >= 1000 && cp <= 1499) return "caba-24";
      if (cp >= 1500 && cp <= 1999) return "provincia";
    }
  }

  // 4. No se pudo determinar
  return null;
}