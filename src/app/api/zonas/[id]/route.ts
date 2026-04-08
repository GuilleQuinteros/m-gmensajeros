import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  nombre: z.string().min(1).optional(),
  grupo: z.string().min(1).optional(),
  costo: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const zona = await prisma.zona.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(zona);
}