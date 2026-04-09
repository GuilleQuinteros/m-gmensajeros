import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const pdvs = await prisma.puntoDeVenta.findMany({
    where: { isActive: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(pdvs);
}