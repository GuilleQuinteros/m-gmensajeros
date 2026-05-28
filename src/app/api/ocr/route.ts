import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { extraerDatosComprobante } from "@/lib/ocr";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const { imagen } = await req.json();
  if (!imagen) {
    return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
  }

  // Remover el prefijo data:image/...;base64,
  const base64 = imagen.replace(/^data:image\/[a-z]+;base64,/, "");

  try {
    const datos = await extraerDatosComprobante(base64);
    return NextResponse.json({ ok: true, datos });
  } catch (err) {
    console.error("[OCR] Error:", err);
    return NextResponse.json(
      { error: "Error al procesar la imagen. Intentá con mejor iluminación." },
      { status: 500 }
    );
  }
}