import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DatosExtraidos {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  piso?: string;
  localidad?: string;
  partido?: string;
  provincia?: string;
  codigoPostal?: string;
  entreCalles?: string;
  observaciones?: string;
  pedidoExterno?: string;
  confianza: number;
}

export async function extraerDatosComprobante(
  imagenBase64: string,
  mediaType: string = "image/jpeg"
): Promise<DatosExtraidos> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as any,
              data: imagenBase64,
            },
          },
          {
            type: "text",
            text: `Analizá este comprobante de venta de una tienda argentina y extraé los datos del comprador y envío.
            
Devolvé ÚNICAMENTE un JSON válido con esta estructura, sin texto adicional ni markdown:
{
  "nombre": "primer nombre del comprador",
  "apellido": "apellido del comprador", 
  "dni": "numero de DNI sin puntos",
  "telefono": "numero de telefono sin espacios ni guiones",
  "email": "email del comprador",
  "direccion": "calle y numero",
  "piso": "piso y departamento si existe",
  "localidad": "localidad o barrio",
  "partido": "partido o municipio",
  "provincia": "provincia",
  "codigoPostal": "codigo postal",
  "entreCalles": "entre calles si existe",
  "observaciones": "cualquier nota u observacion relevante incluyendo receptor autorizado si existe",
  "pedidoExterno": "numero de operacion o pedido",
  "confianza": numero del 0 al 100 indicando que tan completos y claros estan los datos
}

Si un campo no existe en el documento, omitilo del JSON.
El campo confianza es obligatorio siempre.`,
          },
        ],
      },
    ],
  });

  const texto = response.content[0].type === "text" ? response.content[0].text : "";
  
  // Limpiar posible markdown
  const jsonLimpio = texto.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  const datos = JSON.parse(jsonLimpio);
  return datos as DatosExtraidos;
}