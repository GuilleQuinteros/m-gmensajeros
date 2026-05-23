import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // CABA — todos los barrios van a caba-24
  const barricasCaba = [
    "CAPITAL FEDERAL","CABA","BUENOS AIRES (CABA)",
    "PALERMO","BELGRANO","RECOLETA","ALMAGRO","CABALLITO",
    "FLORES","VILLA DEL PARQUE","DEVOTO","VILLA URQUIZA",
    "NUÑEZ","COLEGIALES","CHACARITA","VILLA CRESPO",
    "VILLA PUEYRREDON","PARQUE PATRICIOS","BARRACAS",
    "LA BOCA","SAN TELMO","MONTSERRAT","SAN NICOLAS",
    "RETIRO","PUERTO MADERO","CONSTITUCION","BOEDO",
    "PARQUE CHACABUCO","NUEVA POMPEYA","VILLA LUGANO",
    "VILLA SOLDATI","VILLA RIACHUELO","MATADEROS",
    "LINIERS","VERSALLES","MONTE CASTRO","VELEZ SARSFIELD",
    "FLORESTA","VILLA REAL","VILLA GENERAL MITRE",
    "AGRONOMIA","VILLA ORTUZAR","PATERNAL","VILLA SANTA RITA",
  ];

  // GBA — van a provincia
  const partidosGBA = [
    "LANUS","AVELLANEDA","QUILMES","BERAZATEGUI","FLORENCIO VARELA",
    "ALMIRANTE BROWN","LOMAS DE ZAMORA","ESTEBAN ECHEVERRIA",
    "EZEIZA","LA MATANZA","MORON","ITUZAINGO","HURLINGHAM",
    "TRES DE FEBRERO","SAN MARTIN","VICENTE LOPEZ","SAN ISIDRO",
    "TIGRE","SAN FERNANDO","PILAR","ESCOBAR","CAMPANA","ZARATE",
    "MERLO","MORENO","GENERAL RODRIGUEZ","LUJAN","MARCOS PAZ",
    "CAÑUELAS","SAN VICENTE","PRESIDENTE PERON","QUILMES",
    "BERISSO","ENSENADA","LA PLATA","BRANDSEN","MAGDALENA",
    "GENERAL LAS HERAS","LOBOS","GENERAL PAZ","MONTE",
    "SAN MIGUEL","JOSE C PAZ","MALVINAS ARGENTINAS","TIGRE",
    "PACHECO","DON TORCUATO","GRAND BOURG","LOS POLVORINES",
  ];

  let ok = 0;

  for (const p of barricasCaba) {
    await prisma.partidoZona.upsert({
      where: { partido: p.toUpperCase() },
      update: { zonaId: "caba-24" },
      create: { partido: p.toUpperCase(), zonaId: "caba-24" },
    });
    ok++;
  }

  for (const p of partidosGBA) {
    await prisma.partidoZona.upsert({
      where: { partido: p.toUpperCase() },
      update: { zonaId: "provincia" },
      create: { partido: p.toUpperCase(), zonaId: "provincia" },
    });
    ok++;
  }

  console.log(`${ok} partidos/barrios cargados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());