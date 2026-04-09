import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const envio = await prisma.envio.findUnique({
    where: { trackingToken: params.token },
    select: {
      numeroEnvio: true,
      estado: true,
      compradorNombre: true,
      compradorApellido: true,
      entregaLocalidad: true,
      createdAt: true,
      entregadoAt: true,
      zona: { select: { nombre: true } },
      historial: {
        select: { estadoNuevo: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!envio) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  return NextResponse.json(envio);
}
