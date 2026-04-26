import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generarNumeroEnvio } from "@/lib/numeroEnvio";
import { enviarAlerta } from "@/lib/whatsapp";

export const dynamic = "force-dynamic"

interface BulkRow {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion: string;
  localidad: string;
  zona: string;
  observaciones?: string;
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const { rows }: { rows: BulkRow[] } = await req.json();
  if (!rows?.length) {
    return NextResponse.json({ error: "Sin filas" }, { status: 400 });
  }

  const pdvId = (session!.user as any).pdvId;
  const userId = (session!.user as any).id;
  const zonas = await prisma.zona.findMany({ where: { isActive: true } });
  const zonaMap = Object.fromEntries(
    zonas.map((z) => [z.nombre.toLowerCase().trim(), z])
  );

  const errores: string[] = [];
  const creados: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const zona = zonaMap[row.zona?.toLowerCase().trim()];
    if (!zona) {
      errores.push(`Fila ${i + 2}: zona "${row.zona}" no encontrada.`);
      continue;
    }
    if (!row.nombre || !row.apellido || !row.dni || !row.telefono || !row.direccion) {
      errores.push(`Fila ${i + 2}: campos obligatorios incompletos.`);
      continue;
    }
    try {
      const numeroEnvio = await generarNumeroEnvio();
      const envio = await prisma.envio.create({
        data: {
          numeroEnvio,
          pdvId,
          zonaId: zona.id,
          costoEnvio: zona.costo,
          compradorNombre: row.nombre,
          compradorApellido: row.apellido,
          compradorDni: row.dni,
          compradorTelefono: row.telefono,
          compradorEmail: row.email || null,
          entregaDireccion: row.direccion,
          entregaLocalidad: row.localidad ?? "",
          observaciones: row.observaciones,
        },
        include: { zona: true },
      });
      await prisma.envioHistorial.create({
        data: {
          envioId: envio.id,
          userId,
          estadoAnterior: "a_retirar",
          estadoNuevo: "a_retirar",
          nota: "Carga masiva",
        },
      });
      await enviarAlerta(envio as any, "registrado");
      creados.push(envio.numeroEnvio);
    } catch {
      errores.push(`Fila ${i + 2}: error interno al crear el envío.`);
    }
  }

  return NextResponse.json({ creados: creados.length, errores });
}
