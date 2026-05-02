import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "Pendiente de retiro",
  en_deposito: "En deposito",
  en_camino: "En camino",
  entregado: "Entregado",
  observacion: "Sin respuesta",
  cancelado: "Cancelado",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { numeroEnvio: string } }
) {
  const { error } = await requireApiKey(req);
  if (error) return error;

  const envio = await prisma.envio.findUnique({
    where: { numeroEnvio: params.numeroEnvio.toUpperCase() },
    include: { zona: true },
  });

  if (!envio) {
    return NextResponse.json(
      { error: `Envio "${params.numeroEnvio}" no encontrado.` },
      { status: 404 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return NextResponse.json({
    numeroEnvio: envio.numeroEnvio,
    estado: envio.estado,
    estadoDescripcion: ESTADO_LABEL[envio.estado],
    trackingUrl: `${appUrl}/t/${envio.trackingToken}`,
    zona: envio.zona.nombre,
    entregadoAt: envio.entregadoAt,
    createdAt: envio.createdAt,
  });
}