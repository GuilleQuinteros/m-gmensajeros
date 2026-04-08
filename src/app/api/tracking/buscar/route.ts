import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nro = searchParams.get("nro");

  if (!nro) {
    return NextResponse.json({ error: "Numero requerido" }, { status: 400 });
  }

  const envio = await prisma.envio.findUnique({
    where: { numeroEnvio: nro },
    select: { trackingToken: true },
  });

  if (!envio) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ trackingToken: envio.trackingToken });
}