import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = await requireApiKey(req);
  if (error) return error;

  const zonas = await prisma.zona.findMany({
    where: { isActive: true },
    select: {
      id: true,
      nombre: true,
      slaHoras: true,
      costo: true,
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({
    zonas: zonas.map(z => ({
      id: z.id,
      nombre: z.nombre,
      slaHoras: z.slaHoras,
      costo: Number(z.costo),
      descripcion: `Entrega en ${z.slaHoras}hs`,
    })),
  });
}