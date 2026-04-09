import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const where: any = {};
  if (desde || hasta) {
    where.createdAt = {};
    if (desde) where.createdAt.gte = new Date(desde);
    if (hasta) where.createdAt.lte = new Date(hasta);
  }

  const [porZona, totales, transportistas, entregadosPorTrans] = await Promise.all([
    prisma.envio.groupBy({
      by: ["zonaId"],
      where,
      _count: { id: true },
      _sum: { costoEnvio: true },
    }),
    prisma.envio.aggregate({
      where,
      _count: { id: true },
      _sum: { costoEnvio: true },
    }),
    prisma.user.findMany({
      where: { role: "transportista" },
      select: { id: true, fullName: true },
    }),
    prisma.envio.groupBy({
      by: ["transportistaId", "estado"],
      where: { ...where, transportistaId: { not: null } },
      _count: { id: true },
    }),
  ]);

  const entregados = await prisma.envio.count({
    where: { ...where, estado: "entregado" },
  });

  const zonas = await prisma.zona.findMany({
    select: { id: true, nombre: true, grupo: true },
  });
  const zonaMap = Object.fromEntries(zonas.map(z => [z.id, z]));

  const porTransportista = transportistas.map(t => {
    const filas = entregadosPorTrans.filter(e => e.transportistaId === t.id);
    const total = filas.reduce((a, b) => a + b._count.id, 0);
    const entregadosT = filas.find(e => e.estado === "entregado")?._count.id ?? 0;
    return {
      transportista: t.fullName,
      envios: total,
      entregados: entregadosT,
      tasa: total > 0 ? Math.round((entregadosT / total) * 100) : 0,
    };
  }).filter(t => t.envios > 0);

  return NextResponse.json({
    totales: {
      envios: totales._count.id,
      facturacion: totales._sum.costoEnvio ?? 0,
      entregados,
      tasaEntrega: totales._count.id > 0
        ? Math.round((entregados / totales._count.id) * 100)
        : 0,
    },
    porZona: porZona.map(r => ({
      zona: zonaMap[r.zonaId]?.nombre ?? r.zonaId,
      grupo: zonaMap[r.zonaId]?.grupo ?? "",
      envios: r._count.id,
      total: r._sum.costoEnvio ?? 0,
    })),
    porTransportista,
  });
}