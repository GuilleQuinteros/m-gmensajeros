import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";
import { generarNumeroEnvio } from "@/lib/numeroEnvio";
import { enviarEmailEstado } from "@/lib/email";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().min(7),
  telefono: z.string().min(8),
  email: z.string().email().optional(),
  direccion: z.string().min(1),
  localidad: z.string().min(1),
  zonaId: z.string().min(1),
  observaciones: z.string().optional(),
  pedidoExterno: z.string().optional(), // ID del pedido en E3 u otro sistema
});

export async function POST(req: NextRequest) {
  const { error, clienteId } = await requireApiKey(req);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos invalidos",
        detalle: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Buscar PDV asociado a la API key
  const pdv = clienteId
    ? await prisma.puntoDeVenta.findUnique({
        where: { id: clienteId },
        select: { id: true, nombre: true },
      })
    : await prisma.puntoDeVenta.findFirst({
        where: { isActive: true },
        select: { id: true, nombre: true },
      });

  if (!pdv) {
    return NextResponse.json(
      { error: "No hay punto de venta configurado para esta API key." },
      { status: 400 }
    );
  }

  // Validar zona
  const zona = await prisma.zona.findUnique({
    where: { id: data.zonaId },
  });

  if (!zona || !zona.isActive) {
    return NextResponse.json(
      { error: `Zona "${data.zonaId}" no encontrada o inactiva.` },
      { status: 404 }
    );
  }

  // Buscar transportista automático para la zona
  const asignacion = await prisma.zonaTransportista.findFirst({
    where: { zonaId: zona.id, isActive: true },
    select: { transportistaId: true },
  });

  const numeroEnvio = await generarNumeroEnvio();

  const envio = await prisma.envio.create({
    data: {
      numeroEnvio,
      pdvId: pdv.id,
      zonaId: zona.id,
      transportistaId: asignacion?.transportistaId ?? null,
      costoEnvio: zona.costo,
      compradorNombre: data.nombre,
      compradorApellido: data.apellido,
      compradorDni: data.dni,
      compradorTelefono: data.telefono,
      compradorEmail: data.email ?? null,
      entregaDireccion: data.direccion,
      entregaLocalidad: data.localidad,
      observaciones: data.observaciones ?? null,
    },
    include: { zona: true },
  });

  // Historial
  await prisma.envioHistorial.create({
    data: {
      envioId: envio.id,
      userId: (await prisma.user.findFirst({ where: { role: "admin" } }))!.id,
      estadoAnterior: "a_retirar",
      estadoNuevo: "a_retirar",
      nota: `Creado via API${data.pedidoExterno ? ` — Pedido externo: ${data.pedidoExterno}` : ""}`,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return NextResponse.json(
    {
      ok: true,
      numeroEnvio: envio.numeroEnvio,
      trackingUrl: `${appUrl}/t/${envio.trackingToken}`,
      seguimientoUrl: `${appUrl}/seguimiento`,
      zona: {
        id: zona.id,
        nombre: zona.nombre,
        slaHoras: zona.slaHoras,
      },
      costoEnvio: Number(zona.costo),
      pdv: pdv.nombre,
    },
    { status: 201 }
  );
}