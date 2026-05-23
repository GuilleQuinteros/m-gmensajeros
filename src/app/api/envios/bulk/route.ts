import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generarNumeroEnvio } from "@/lib/numeroEnvio";
import { detectarZonaId } from "@/lib/detectarZona";
import { enviarEmailEstado } from "@/lib/email";

export const dynamic = "force-dynamic";

interface BulkRow {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion: string;
  piso?: string;
  localidad: string;
  partido?: string;
  provincia?: string;
  codigo_postal?: string;
  entre_calles?: string;
  zona?: string;
  observaciones?: string;
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(["admin", "pdv"]);
  if (error) return error;

  const { rows }: { rows: BulkRow[] } = await req.json();
  if (!rows?.length) {
    return NextResponse.json({ error: "Sin filas" }, { status: 400 });
  }

  const role = (session!.user as any).role;
  let pdvId = (session!.user as any).pdvId;
  const userId = (session!.user as any).id;

  if (!pdvId && role === "admin") {
    const primerPdv = await prisma.puntoDeVenta.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (primerPdv) pdvId = primerPdv.id;
  }

  if (!pdvId) {
    return NextResponse.json(
      { error: "Usuario sin punto de venta asignado" },
      { status: 400 }
    );
  }

  const zonas = await prisma.zona.findMany({ where: { isActive: true } });
  const zonaMap = Object.fromEntries(
    zonas.map(z => [z.nombre.toLowerCase().trim(), z])
  );

  const errores: string[] = [];
  const creados: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fila = i + 2;

    if (!row.nombre || !row.apellido || !row.dni || !row.telefono || !row.direccion || !row.localidad) {
      errores.push(`Fila ${fila}: campos obligatorios incompletos (nombre, apellido, dni, telefono, direccion, localidad).`);
      continue;
    }

    // 1. Buscar zona por nombre exacto
    let zona = row.zona ? zonaMap[row.zona.toLowerCase().trim()] : null;

    // 2. Si no hay zona o no se encontró, detectar automáticamente
    if (!zona) {
      const zonaIdDetectado = await detectarZonaId(
        row.partido,
        row.provincia,
        row.codigo_postal
      );
      if (zonaIdDetectado) {
        zona = zonas.find(z => z.id === zonaIdDetectado) ?? null;
      }
    }

    // 3. Si tampoco se pudo detectar, error
    if (!zona) {
      errores.push(
        `Fila ${fila}: no se pudo determinar la zona. ` +
        `Completa la columna "zona" con: ${Object.keys(zonaMap).join(", ")}. ` +
        `O agrega partido/provincia/codigo_postal para deteccion automatica.`
      );
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
          compradorNombre: row.nombre.trim(),
          compradorApellido: row.apellido.trim(),
          compradorDni: row.dni.trim(),
          compradorTelefono: row.telefono.trim(),
          compradorEmail: row.email?.trim() || null,
          entregaDireccion: row.direccion.trim(),
          entregaPiso: row.piso?.trim() || null,
          entregaLocalidad: row.localidad.trim(),
          entregaPartido: row.partido?.trim() || null,
          entregaProvincia: row.provincia?.trim() || null,
          entregaCodigoPostal: row.codigo_postal?.trim() || null,
          entregaEntreCalles: row.entre_calles?.trim() || null,
          observaciones: row.observaciones?.trim() || null,
        },
        include: { zona: true },
      });

      await prisma.envioHistorial.create({
        data: {
          envioId: envio.id,
          userId,
          estadoAnterior: "a_retirar",
          estadoNuevo: "a_retirar",
          nota: `Carga masiva${zona.id !== (row.zona ? zonaMap[row.zona?.toLowerCase().trim()]?.id : null) ? " (zona detectada automaticamente)" : ""}`,
        },
      });

      creados.push(envio.numeroEnvio);
    } catch {
      errores.push(`Fila ${fila}: error interno al crear el envio.`);
    }
  }

  return NextResponse.json({ creados: creados.length, errores });
}