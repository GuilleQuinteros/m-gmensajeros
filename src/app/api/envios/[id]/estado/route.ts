import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { enviarAlerta } from "@/lib/whatsapp";
import { z } from "zod";
import type { EstadoEnvio } from "@prisma/client";
import { enviarEmailEstado } from "@/lib/email";

const schema = z.object({
  estado: z.enum([
    "a_retirar", "en_deposito", "en_camino",
    "entregado", "observacion", "cancelado",
  ]),
  nota: z.string().optional(),
});

const EMAILS_EVENTOS: Partial<Record<EstadoEnvio, "deposito" | "camino">> = {
  en_deposito: "deposito",
  en_camino: "camino",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth(["admin", "transportista"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const { estado, nota } = parsed.data;
  const role = (session!.user as any).role;

  if (role === "transportista" && estado === "cancelado") {
    return NextResponse.json({ error: "Sin permisos para cancelar" }, { status: 403 });
  }

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    include: { zona: true },
  });
  if (!envio) {
    return NextResponse.json({ error: "Envio no encontrado" }, { status: 404 });
  }

  const updated = await prisma.envio.update({
    where: { id: params.id },
    data: {
      estado,
      ...(estado === "entregado" ? { entregadoAt: new Date() } : {}),
    },
    include: { zona: true },
  });

  await prisma.envioHistorial.create({
    data: {
      envioId: params.id,
      userId: (session!.user as any).id,
      estadoAnterior: envio.estado,
      estadoNuevo: estado,
      nota: nota ?? null,
    },
  });

  // Enviar alerta solo si hay credenciales configuradas
  const tieneWA =
    (process.env.META_WA_TOKEN && process.env.META_WA_PHONE_ID) ||
    process.env.CALLMEBOT_APIKEY;

  const eventoEmail = EMAILS_EVENTOS[estado as EstadoEnvio];
if (eventoEmail) {
  try {
    await enviarEmailEstado(updated as any, eventoEmail);
  } catch (err) {
    console.error("[Email] Error, continuando:", err);
  }
}

  return NextResponse.json(updated);
}