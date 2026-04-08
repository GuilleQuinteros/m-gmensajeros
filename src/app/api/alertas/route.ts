import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;
  const plantillas = await prisma.plantillaAlerta.findMany({ orderBy: { evento: "asc" } });
  return NextResponse.json(plantillas);
}
