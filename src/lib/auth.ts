import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function requireAuth(roles?: string[]) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  if (roles && !roles.includes((session.user as any).role)) {
    return {
      error: NextResponse.json({ error: "Sin permisos" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}