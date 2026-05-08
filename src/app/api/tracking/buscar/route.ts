import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nro = searchParams.get("nro");
  const limited = await checkRateLimit(req, "api");
  if (limited) return limited;

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