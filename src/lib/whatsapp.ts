import twilio from "twilio";
import { prisma } from "./prisma";
import type { EventoAlerta } from "@prisma/client";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

interface EnvioParaAlerta {
  id: string;
  compradorNombre: string;
  compradorTelefono: string;
  numeroEnvio: string;
  entregaDireccion: string;
  zona: { nombre: string };
  trackingToken: string;
}

export async function enviarAlerta(
  envio: EnvioParaAlerta,
  evento: EventoAlerta
): Promise<void> {
  const plantilla = await prisma.plantillaAlerta.findUnique({
    where: { evento_canal: { evento, canal: "whatsapp" } },
  });

  if (!plantilla || !plantilla.activa) return;

  const linkTracking = `${process.env.NEXT_PUBLIC_APP_URL}/t/${envio.trackingToken}`;

  const mensaje = plantilla.cuerpo
    .replace("{nombre}", envio.compradorNombre)
    .replace("{nro_envio}", envio.numeroEnvio)
    .replace("{direccion}", envio.entregaDireccion)
    .replace("{zona}", envio.zona.nombre)
    .replace("{link_tracking}", linkTracking);

  const tel = envio.compradorTelefono.replace(/\D/g, "");
  const to = tel.startsWith("54") ? `whatsapp:+${tel}` : `whatsapp:+54${tel}`;

  const alerta = await prisma.alertaEnviada.create({
    data: {
      envioId: envio.id,
      tipo: evento,
      canal: "whatsapp",
      mensaje,
      estadoEnvio: "pendiente",
    },
  });

  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to,
      body: mensaje,
    });
    await prisma.alertaEnviada.update({
      where: { id: alerta.id },
      data: { estadoEnvio: "enviado", sentAt: new Date() },
    });
  } catch (err) {
    await prisma.alertaEnviada.update({
      where: { id: alerta.id },
      data: { estadoEnvio: "fallido" },
    });
    console.error("[WhatsApp] Error al enviar alerta:", err);
  }
}
