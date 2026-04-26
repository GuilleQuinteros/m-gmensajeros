import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

interface EnvioParaEmail {
  id: string;
  compradorNombre: string;
  compradorEmail?: string | null;
  numeroEnvio: string;
  entregaDireccion: string;
  entregaLocalidad: string;
  trackingToken: string;
  zona: { nombre: string; slaHoras: number };
}

function templateDeposito(data: EnvioParaEmail): string {
  const link = `${APP_URL}/t/${data.trackingToken}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f3;margin:0;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#1a1a1a;padding:24px 32px">
      <p style="color:#B8860B;font-size:18px;font-weight:700;margin:0">M&G Mensajeros</p>
      <p style="color:#888;font-size:12px;margin:4px 0 0">Logistica & Mensajeria</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 8px">Hola ${data.compradorNombre},</p>
      <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px">
        Tu pedido <strong>${data.numeroEnvio}</strong> llego a nuestro deposito y esta siendo preparado para su entrega.
        Te avisaremos cuando salga hacia tu domicilio.
      </p>
      <div style="background:#FDF6E3;border:1px solid #B8860B;border-radius:8px;padding:14px 18px;margin-bottom:24px">
        <p style="font-size:12px;color:#666;margin:0 0 4px">Direccion de entrega</p>
        <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0">${data.entregaDireccion}, ${data.entregaLocalidad}</p>
      </div>
      <a href="${link}" style="display:inline-block;background:#B8860B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
        Ver estado de mi envio
      </a>
      <p style="font-size:12px;color:#888;margin:16px 0 0">
        O ingresa <strong>${data.numeroEnvio}</strong> en <a href="${APP_URL}/seguimiento" style="color:#B8860B">${APP_URL}/seguimiento</a>
      </p>
    </div>
    <div style="background:#f5f5f3;padding:16px 32px;border-top:1px solid #eee">
      <p style="font-size:11px;color:#999;margin:0">M&G Mensajeros — Este es un mensaje automatico, no responder.</p>
    </div>
  </div>
</body>
</html>`;
}

function templateEnCamino(data: EnvioParaEmail): string {
  const link = `${APP_URL}/t/${data.trackingToken}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f3;margin:0;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#1a1a1a;padding:24px 32px">
      <p style="color:#B8860B;font-size:18px;font-weight:700;margin:0">M&G Mensajeros</p>
      <p style="color:#888;font-size:12px;margin:4px 0 0">Logistica & Mensajeria</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 8px">Hola ${data.compradorNombre},</p>
      <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px">
        Tu pedido <strong>${data.numeroEnvio}</strong> ya esta en camino hacia tu domicilio.
        El transportista lo entregara durante el dia de hoy.
      </p>
      <div style="background:#E1F5EE;border:1px solid #1D9E75;border-radius:8px;padding:14px 18px;margin-bottom:24px">
        <p style="font-size:12px;color:#666;margin:0 0 4px">Entregando en</p>
        <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0">${data.entregaDireccion}, ${data.entregaLocalidad}</p>
      </div>
      <a href="${link}" style="display:inline-block;background:#B8860B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
        Seguir mi envio en tiempo real
      </a>
      <p style="font-size:12px;color:#888;margin:16px 0 0">
        O ingresa <strong>${data.numeroEnvio}</strong> en <a href="${APP_URL}/seguimiento" style="color:#B8860B">${APP_URL}/seguimiento</a>
      </p>
    </div>
    <div style="background:#f5f5f3;padding:16px 32px;border-top:1px solid #eee">
      <p style="font-size:11px;color:#999;margin:0">M&G Mensajeros — Este es un mensaje automatico, no responder.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function enviarEmailEstado(
  envio: EnvioParaEmail,
  evento: "deposito" | "camino"
): Promise<void> {
  if (!envio.compradorEmail) return;
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] RESEND_API_KEY no configurado, saltando.");
    return;
  }

  const subjects: Record<string, string> = {
    deposito: `Tu pedido ${envio.numeroEnvio} llego al deposito`,
    camino: `Tu pedido ${envio.numeroEnvio} esta en camino`,
  };

  const html = evento === "deposito"
    ? templateDeposito(envio)
    : templateEnCamino(envio);

  try {
    await resend.emails.send({
      from: FROM,
      to: envio.compradorEmail,
      subject: subjects[evento],
      html,
    });
    console.log(`[Email] Enviado a ${envio.compradorEmail} — evento: ${evento}`);
  } catch (err) {
    console.error(`[Email] Error al enviar:`, err);
  }
}