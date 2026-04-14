import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");

  const zonas = await prisma.zona.findMany({
    where: all ? {} : { isActive: true },
    include: {
      transportistas: {
        where: { isActive: true },
        include: { transportista: { select: { id: true, fullName: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(zonas);
}

const createSchema = z.object({
  nombre: z.string().min(1),
  slaHoras: z.number().int().positive(),
  costo: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const zona = await prisma.zona.create({ data: parsed.data });
  return NextResponse.json(zona, { status: 201 });
}