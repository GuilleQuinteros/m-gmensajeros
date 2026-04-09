import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { enviarAlerta } from "@/lib/whatsapp";

export async function GET() {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const plantillas = await prisma.plantillaAlerta.findMany({
    orderBy: { evento: "asc" },
  });

  return NextResponse.json(plantillas);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const { envioId } = await req.json();
  if (!envioId) {
    return NextResponse.json({ error: "envioId requerido" }, { status: 400 });
  }

  const envio = await prisma.envio.findUnique({
    where: { id: envioId },
    include: { zona: true },
  });

  if (!envio) {
    return NextResponse.json({ error: "Envio no encontrado" }, { status: 404 });
  }

  await enviarAlerta(envio as any, "manual");

  return NextResponse.json({ ok: true });
}