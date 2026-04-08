import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  const pdv = await prisma.puntoDeVenta.upsert({
    where: { id: "pdv-racing-01" },
    update: {},
    create: {
      id: "pdv-racing-01",
      nombre: "Racing Club Avellaneda",
      direccion: "Av. Mitre 470, Avellaneda",
      contacto: "ventas@racingclub.com.ar",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@mgmensajeros.com" },
    update: {},
    create: {
      email: "admin@mgmensajeros.com",
      passwordHash: await bcrypt.hash("admin1234", 12),
      fullName: "Administrador Principal",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "ventas@racingclub.com" },
    update: {},
    create: {
      email: "ventas@racingclub.com",
      passwordHash: await bcrypt.hash("ventas1234", 12),
      fullName: "Ventas Racing Club",
      role: "pdv",
      pdvId: pdv.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "rmolina@mgmensajeros.com" },
    update: {},
    create: {
      email: "rmolina@mgmensajeros.com",
      passwordHash: await bcrypt.hash("trans1234", 12),
      fullName: "R. Molina",
      role: "transportista",
    },
  });

  const zonas = [
    { id: "la-matanza",      nombre: "La Matanza",      grupo: "Oeste", costo: 3500 },
    { id: "moron",           nombre: "Moron",            grupo: "Oeste", costo: 3000 },
    { id: "merlo",           nombre: "Merlo",            grupo: "Oeste", costo: 3800 },
    { id: "quilmes",         nombre: "Quilmes",          grupo: "Sur",   costo: 3600 },
    { id: "lanus",           nombre: "Lanus",            grupo: "Sur",   costo: 3200 },
    { id: "lomas-de-zamora", nombre: "Lomas de Zamora",  grupo: "Sur",   costo: 3400 },
    { id: "tigre",           nombre: "Tigre",            grupo: "Norte", costo: 4200 },
    { id: "san-isidro",      nombre: "San Isidro",       grupo: "Norte", costo: 3800 },
    { id: "vicente-lopez",   nombre: "Vicente Lopez",    grupo: "Norte", costo: 3500 },
    { id: "caba-centro",     nombre: "CABA Centro",      grupo: "CABA",  costo: 2800 },
    { id: "caba-norte",      nombre: "CABA Norte",       grupo: "CABA",  costo: 2900 },
    { id: "caba-sur",        nombre: "CABA Sur",         grupo: "CABA",  costo: 2900 },
  ];

  for (const z of zonas) {
    await prisma.zona.upsert({
      where: { id: z.id },
      update: { costo: z.costo },
      create: z,
    });
  }

  const plantillas = [
    {
      evento: "registrado" as const,
      canal: "whatsapp" as const,
      cuerpo: "Hola {nombre}, tu pedido fue registrado con el numero {nro_envio}. Seguilo en: {link_tracking}",
    },
    {
      evento: "deposito" as const,
      canal: "whatsapp" as const,
      cuerpo: "Hola {nombre}, tu pedido {nro_envio} llego a nuestro deposito. Seguilo en: {link_tracking}",
    },
    {
      evento: "camino" as const,
      canal: "whatsapp" as const,
      cuerpo: "Hola {nombre}, tu pedido {nro_envio} esta en camino a {direccion}. Seguilo en: {link_tracking}",
    },
    {
      evento: "entregado" as const,
      canal: "whatsapp" as const,
      cuerpo: "Hola {nombre}, tu pedido {nro_envio} fue entregado exitosamente.",
    },
  ];

  for (const p of plantillas) {
    await prisma.plantillaAlerta.upsert({
      where: { evento_canal: { evento: p.evento, canal: p.canal } },
      update: { cuerpo: p.cuerpo },
      create: p,
    });
  }

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });