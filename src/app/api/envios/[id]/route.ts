import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  transportistaId: z.string().uuid().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin", "pdv", "transportista"]);
  if (error) return error;

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    include: {
      zona: true,
      pdv: true,
      transportista: true,
      historial: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      alertasEnviadas: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!envio) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(envio);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const envio = await prisma.envio.update({
    where: { id: params.id },
    data: parsed.data,
    include: { zona: true, pdv: true, transportista: true },
  });

  return NextResponse.json(envio);
}