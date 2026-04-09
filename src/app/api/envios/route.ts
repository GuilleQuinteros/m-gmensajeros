import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generarNumeroEnvio } from "@/lib/numeroEnvio";
import { enviarAlerta } from "@/lib/whatsapp";
import { z } from "zod";

export const dynamic = "force-dynamic"

const createSchema = z.object({
  compradorNombre: z.string().min(1),
  compradorApellido: z.string().min(1),
  compradorDni: z.string().min(7),
  compradorTelefono: z.string().min(8),
  entregaDireccion: z.string().min(1),
  entregaLocalidad: z.string().min(1),
  zonaId: z.string().min(1),
  observaciones: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth(["admin", "pdv", "transportista"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const zonaId = searchParams.get("zonaId");
  const transportistaId = searchParams.get("transportistaId");

  const role = (session!.user as any).role;
  const pdvId = (session!.user as any).pdvId;
  const userId = (session!.user as any).id;

  const where: any = {};
  if (role === "pdv") where.pdvId = pdvId;
  if (role === "transportista") where.transportistaId = userId;
  if (estado) where.estado = estado;
  if (zonaId) where.zonaId = zonaId;
  if (transportistaId && role === "admin") where.transportistaId = transportistaId;

  const envios = await prisma.envio.findMany({
    where,
    include: { zona: true, pdv: true, transportista: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(envios);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
if (!parsed.success) {
  console.log("BODY RECIBIDO:", JSON.stringify(body, null, 2));
  console.log("ERRORES ZOD:", JSON.stringify(parsed.error.flatten(), null, 2));
  return NextResponse.json(
    { error: "Datos invalidos", detalle: parsed.error.flatten() },
    { status: 400 }
  );
}

  const data = parsed.data;
  const role = (session!.user as any).role;
  let pdvId = (session!.user as any).pdvId;

  // Si es admin sin pdvId, buscar o usar el primer PDV disponible
  if (!pdvId && role === "admin") {
    const primerPdv = await prisma.puntoDeVenta.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!primerPdv) {
      return NextResponse.json(
        { error: "No hay ningun punto de venta configurado" },
        { status: 400 }
      );
    }
    pdvId = primerPdv.id;
  }

  if (!pdvId) {
    return NextResponse.json(
      { error: "Usuario sin punto de venta asignado" },
      { status: 400 }
    );
  }

  const zona = await prisma.zona.findUnique({ where: { id: data.zonaId } });
  if (!zona) {
    return NextResponse.json({ error: "Zona no encontrada" }, { status: 404 });
  }

  const numeroEnvio = await generarNumeroEnvio();

  const envio = await prisma.envio.create({
    data: {
      numeroEnvio,
      pdvId,
      zonaId: data.zonaId,
      costoEnvio: zona.costo,
      compradorNombre: data.compradorNombre,
      compradorApellido: data.compradorApellido,
      compradorDni: data.compradorDni,
      compradorTelefono: data.compradorTelefono,
      entregaDireccion: data.entregaDireccion,
      entregaLocalidad: data.entregaLocalidad,
      observaciones: data.observaciones,
    },
    include: { zona: true },
  });

  await prisma.envioHistorial.create({
    data: {
      envioId: envio.id,
      userId: (session!.user as any).id,
      estadoAnterior: "a_retirar",
      estadoNuevo: "a_retirar",
      nota: "Envio creado",
    },
  });

  // Solo enviar alerta si Twilio esta configurado
  if (
    process.env.TWILIO_ACCOUNT_SID !== "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  ) {
    await enviarAlerta(envio as any, "registrado");
  }

  return NextResponse.json(envio, { status: 201 });
}