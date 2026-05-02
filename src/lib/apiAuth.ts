import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import * as crypto from "crypto";

export async function requireApiKey(req: NextRequest): Promise<{
  error: NextResponse | null;
  clienteId: string | null;
}> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "API key requerida. Header: Authorization: Bearer mgm_..." },
        { status: 401 }
      ),
      clienteId: null,
    };
  }

  const rawKey = authHeader.replace("Bearer ", "").trim();
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKey || !apiKey.isActive) {
    return {
      error: NextResponse.json(
        { error: "API key invalida o inactiva." },
        { status: 401 }
      ),
      clienteId: null,
    };
  }

  // Actualizar lastUsedAt
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { error: null, clienteId: apiKey.clienteId };
}