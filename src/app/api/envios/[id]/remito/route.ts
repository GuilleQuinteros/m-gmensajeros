import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function generarNumeroRemito(pdvId: string): Promise<string> {
  const count = await prisma.envio.count({
    where: { pdvId, remitoNumero: { not: null } },
  });
  const correlativo = String(count + 1).padStart(8, "0");
  return `0001-${correlativo}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const envio = await prisma.envio.findUnique({
    where: { id: params.id },
    include: { zona: true, pdv: true, transportista: true },
  });

  if (!envio) {
    return NextResponse.json({ error: "Envio no encontrado" }, { status: 404 });
  }

  let remitoNumero = envio.remitoNumero;
  if (!remitoNumero) {
    remitoNumero = await generarNumeroRemito(envio.pdvId);
    await prisma.envio.update({
      where: { id: params.id },
      data: { remitoNumero },
    });
  }

  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  // Generar HTML del remito
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #B8860B; padding-bottom: 16px; margin-bottom: 20px; }
  .logo { font-size: 22px; font-weight: bold; color: #B8860B; }
  .logo-sub { font-size: 10px; color: #666; margin-top: 2px; }
  .letra-box { width: 56px; height: 56px; border: 3px solid #B8860B; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
  .letra { font-size: 32px; font-weight: bold; color: #B8860B; text-align: center; line-height: 56px; }
  .remito-info { text-align: right; margin-top: 6px; }
  .remito-title { font-size: 13px; font-weight: bold; color: #333; }
  .remito-num { font-size: 15px; font-weight: bold; color: #B8860B; }
  .badge { display: inline-block; background: #FDF6E3; border: 1px solid #B8860B; color: #B8860B; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 4px; margin-bottom: 16px; }
  .fecha { font-size: 10px; color: #666; float: right; margin-top: -24px; }
  .section { margin-bottom: 18px; clear: both; }
  .section-title { font-size: 9px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: .06em; border-bottom: 0.5px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 8px; }
  .field-row { display: flex; margin-bottom: 5px; }
  .field-label { width: 140px; color: #666; flex-shrink: 0; }
  .field-value { font-weight: bold; flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead th { background: #f5f5f5; padding: 7px 10px; text-align: left; font-size: 10px; border-bottom: 1px solid #ddd; }
  tbody td { padding: 7px 10px; border-bottom: 0.5px solid #f0f0f0; }
  .text-right { text-align: right; }
  .firmas { display: flex; justify-content: space-between; margin-top: 48px; }
  .firma-box { width: 200px; border-top: 1px solid #333; padding-top: 6px; text-align: center; }
  .firma-label { font-size: 9px; color: #666; }
  .footer { position: fixed; bottom: 24px; left: 32px; right: 32px; border-top: 0.5px solid #e0e0e0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8px; color: #999; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">M&G Mensajeros</div>
    <div class="logo-sub">Logistica & Mensajeria</div>
    <div class="logo-sub" style="margin-top:6px">Buenos Aires, Argentina</div>
  </div>
  <div style="text-align:right">
    <div class="letra-box" style="margin-left:auto"><div class="letra">R</div></div>
    <div class="remito-info">
      <div class="remito-title">REMITO</div>
      <div class="remito-num">${remitoNumero}</div>
    </div>
  </div>
</div>

<div>
  <span class="badge">Entrega en ${envio.zona.slaHoras}hs</span>
  <span class="fecha">Fecha: ${fecha}</span>
</div>

<div class="section">
  <div class="section-title">Transportista</div>
  <div class="field-row"><span class="field-label">Nombre:</span><span class="field-value">${envio.transportista?.fullName ?? "Sin asignar"}</span></div>
  <div class="field-row"><span class="field-label">PDV Origen:</span><span class="field-value">${envio.pdv.nombre}</span></div>
</div>

<div class="section">
  <div class="section-title">Datos del receptor</div>
  <div class="field-row"><span class="field-label">Nombre y Apellido:</span><span class="field-value">${envio.compradorNombre} ${envio.compradorApellido}</span></div>
  <div class="field-row"><span class="field-label">DNI:</span><span class="field-value">${envio.compradorDni}</span></div>
  <div class="field-row"><span class="field-label">Telefono:</span><span class="field-value">${envio.compradorTelefono}</span></div>
  <div class="field-row"><span class="field-label">Direccion:</span><span class="field-value">${envio.entregaDireccion}</span></div>
  <div class="field-row"><span class="field-label">Localidad:</span><span class="field-value">${envio.entregaLocalidad}</span></div>
</div>

<div class="section">
  <div class="section-title">Detalle del envio</div>
  <table>
    <thead>
      <tr>
        <th>Nro. Envio</th>
        <th>Zona</th>
        <th>SLA</th>
        <th class="text-right">Costo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${envio.numeroEnvio}</strong></td>
        <td>${envio.zona.nombre}</td>
        <td>${envio.zona.slaHoras}hs</td>
        <td class="text-right"><strong>$${Number(envio.costoEnvio).toLocaleString("es-AR")}</strong></td>
      </tr>
    </tbody>
  </table>
</div>

<div class="firmas">
  <div class="firma-box">
    <div class="firma-label">Firma del transportista</div>
  </div>
  <div class="firma-box">
    <div class="firma-label">Firma y aclaracion del receptor</div>
  </div>
</div>

<div class="footer">
  <span>M&G Mensajeros - Documento no valido como factura</span>
  <span>Generado: ${fecha}</span>
</div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}