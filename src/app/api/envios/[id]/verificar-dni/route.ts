import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic"

const schema = z.object({ dniEscaneado: z.string().min(7) });

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["transportista", "admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    select: { compradorDni: true, dniVerificadoAt: true },
  });
  if (!envio) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  const dniLimpio = parsed.data.dniEscaneado.replace(/\D/g, "");
  const dniRegistrado = envio.compradorDni.replace(/\D/g, "");

  if (dniLimpio !== dniRegistrado) {
    return NextResponse.json(
      { error: "El DNI no coincide con el registrado para este envío.", verificado: false },
      { status: 422 }
    );
  }

  await prisma.envio.update({
    where: { id: params.id },
    data: { dniVerificadoAt: new Date() },
  });

  return NextResponse.json({ verificado: true, mensaje: "Identidad verificada correctamente." });
}
