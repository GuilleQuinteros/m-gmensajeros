import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const where: any = {};
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, email: true, fullName: true,
      role: true, isActive: true, createdAt: true,
      pdv: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(["admin", "pdv", "transportista"]),
  pdvId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { ...rest, passwordHash },
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });

  return NextResponse.json(user, { status: 201 });
}