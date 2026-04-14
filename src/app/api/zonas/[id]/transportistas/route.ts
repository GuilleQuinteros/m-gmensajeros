import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  transportistaId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rel = await prisma.zonaTransportista.upsert({
    where: {
      zonaId_transportistaId: {
        zonaId: params.id,
        transportistaId: parsed.data.transportistaId,
      },
    },
    update: { isActive: parsed.data.isActive ?? true },
    create: {
      zonaId: params.id,
      transportistaId: parsed.data.transportistaId,
    },
  });

  return NextResponse.json(rel);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const { transportistaId } = await req.json();

  await prisma.zonaTransportista.updateMany({
    where: { zonaId: params.id, transportistaId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}