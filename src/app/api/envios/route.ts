import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generarNumeroEnvio } from "@/lib/numeroEnvio";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  compradorNombre: z.string().min(1),
  compradorApellido: z.string().min(1),
  compradorDni: z.string().min(7),
  compradorTelefono: z.string().min(8),
  compradorEmail: z.string().email().optional().or(z.literal("")),
  entregaDireccion: z.string().min(1),
  entregaPiso: z.string().optional(),
  entregaLocalidad: z.string().min(1),
  entregaPartido: z.string().optional(),
  entregaProvincia: z.string().optional(),
  entregaCodigoPostal: z.string().optional(),
  entregaEntreCalles: z.string().optional(),
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

async function getTransportistaParaZona(zonaId: string): Promise<string | null> {
  const asignaciones = await prisma.zonaTransportista.findMany({
    where: { zonaId, isActive: true },
    select: { transportistaId: true },
  });

  if (asignaciones.length === 0) return null;

  const cargas = await Promise.all(
    asignaciones.map(async (a) => {
      const count = await prisma.envio.count({
        where: {
          transportistaId: a.transportistaId,
          estado: { in: ["en_deposito", "en_camino"] },
        },
      });
      return { id: a.transportistaId, count };
    })
  );

  cargas.sort((a, b) => a.count - b.count);
  return cargas[0].id;
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", detalle: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const role = (session!.user as any).role;
  let pdvId = (session!.user as any).pdvId;

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
  const transportistaId = await getTransportistaParaZona(data.zonaId);

  const envio = await prisma.envio.create({
    data: {
      numeroEnvio,
      pdvId,
      zonaId: data.zonaId,
      transportistaId: transportistaId ?? undefined,
      costoEnvio: zona.costo,
      compradorNombre: data.compradorNombre,
      compradorApellido: data.compradorApellido,
      compradorDni: data.compradorDni,
      compradorTelefono: data.compradorTelefono,
      compradorEmail: data.compradorEmail || null,
      entregaDireccion: data.entregaDireccion,
      entregaPiso: data.entregaPiso ?? null,
      entregaLocalidad: data.entregaLocalidad,
      entregaPartido: data.entregaPartido ?? null,
      entregaProvincia: data.entregaProvincia ?? null,
      entregaCodigoPostal: data.entregaCodigoPostal ?? null,
      entregaEntreCalles: data.entregaEntreCalles ?? null,
      observaciones: data.observaciones ?? null,
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

  return NextResponse.json(envio, { status: 201 });
}