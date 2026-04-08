import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const patchSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "pdv", "transportista"]).optional(),
  pdvId: z.string().optional().nullable(),
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

  const { password, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}