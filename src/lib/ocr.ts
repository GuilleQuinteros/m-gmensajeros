import vision from "@google-cloud/vision";

function getClient() {
  const credentials = process.env.GOOGLE_VISION_CREDENTIALS;
  if (!credentials) throw new Error("GOOGLE_VISION_CREDENTIALS no configurado");
  
  const parsed = JSON.parse(credentials);
  return new vision.ImageAnnotatorClient({ credentials: parsed });
}

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
  confianza: number; // 0-100
}

export async function extraerDatosComprobante(
  imagenBase64: string
): Promise<DatosExtraidos> {
  const client = getClient();

  const [result] = await client.textDetection({
    image: { content: imagenBase64 },
  });

  const texto = result.fullTextAnnotation?.text ?? "";
  console.log("[OCR] Texto extraido:", texto.substring(0, 200));

  return parsearTextoE3(texto);
}

function limpiar(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function parsearTextoE3(texto: string): DatosExtraidos {
  const lineas = texto.split("\n").map(l => l.trim()).filter(Boolean);
  const datos: DatosExtraidos = { confianza: 0 };
  let camposEncontrados = 0;

  // Buscar número de operación
  const opMatch = texto.match(/Operaci[oó]n\s*#[:\s]*(\d+)/i);
  if (opMatch) {
    datos.pedidoExterno = opMatch[1];
    camposEncontrados++;
  }

  // Buscar DNI
  const dniMatch = texto.match(/DN[I:]?\s*[:\s]?(\d{7,8})/i);
  if (dniMatch) {
    datos.dni = dniMatch[1];
    camposEncontrados++;
  }

  // Buscar email
  const emailMatch = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    datos.email = emailMatch[0].toLowerCase();
    camposEncontrados++;
  }

  // Buscar teléfono — formato argentino
  const telMatch = texto.match(/(?:T[eé]l[eé]fono|Tel|T\.)[:\s]*([0-9]{6,12})/i) ??
                   texto.match(/\b(11\d{8}|15\d{8}|\d{10})\b/);
  if (telMatch) {
    datos.telefono = telMatch[1].replace(/\D/g, "");
    camposEncontrados++;
  }

  // Buscar Nombre y Apellido — sección "Nombre y Apellido:"
  const nombreApellidoMatch = texto.match(/Nombre\s*y\s*Apellido[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i);
  if (nombreApellidoMatch) {
    datos.nombre = limpiar(nombreApellidoMatch[1]);
    datos.apellido = limpiar(nombreApellidoMatch[2]);
    camposEncontrados += 2;
  } else {
    // Buscar en "Datos de Envío" — primera línea después del label
    const envioIdx = lineas.findIndex(l => l.match(/datos de env[ií]o/i));
    if (envioIdx >= 0 && lineas[envioIdx + 1]) {
      const partes = lineas[envioIdx + 1].split(" ");
      if (partes.length >= 2) {
        datos.nombre = partes[0];
        datos.apellido = partes[1];
        camposEncontrados += 2;
      }
    }
  }

  // Buscar dirección y localidad — sección Datos de Envío
  const envioIdx = lineas.findIndex(l => l.match(/datos de env[ií]o/i));
  if (envioIdx >= 0) {
    // La dirección suele estar 2 líneas después del encabezado
    for (let i = envioIdx + 1; i < Math.min(envioIdx + 6, lineas.length); i++) {
      const linea = lineas[i];

      // Detectar dirección — contiene número y nombre de calle
      if (!datos.direccion && linea.match(/^[A-Za-záéíóúñÁÉÍÓÚÑ\s]+ \d+/)) {
        datos.direccion = limpiar(linea);
        camposEncontrados++;
        continue;
      }

      // Detectar localidad, partido, provincia y CP
      // Formato E3: "LANUS, LANUS, BUENOS AIRES ( 1824 )"
      const localMatch = linea.match(
        /([A-ZÁÉÍÓÚÑ\s]+),\s*([A-ZÁÉÍÓÚÑ\s]+),\s*([A-ZÁÉÍÓÚÑ\s]+)\s*\(\s*(\d{4})\s*\)/i
      );
      if (localMatch) {
        datos.localidad = limpiar(localMatch[1]);
        datos.partido = limpiar(localMatch[2]);
        datos.provincia = limpiar(localMatch[3]);
        datos.codigoPostal = localMatch[4];
        camposEncontrados += 4;
        continue;
      }

      // Formato alternativo sin CP
      const localMatch2 = linea.match(
        /([A-ZÁÉÍÓÚÑ\s]+),\s*([A-ZÁÉÍÓÚÑ\s]+),\s*([A-ZÁÉÍÓÚÑ\s]+)/i
      );
      if (localMatch2 && !datos.localidad) {
        datos.localidad = limpiar(localMatch2[1]);
        datos.partido = limpiar(localMatch2[2]);
        datos.provincia = limpiar(localMatch2[3]);
        camposEncontrados += 3;
      }
    }
  }

  // Buscar observaciones — sección Obs:
  const obsMatch = texto.match(/Obs[:\s]+(.+?)(?:\n|$)/i);
  if (obsMatch) {
    datos.observaciones = limpiar(obsMatch[1]);
    camposEncontrados++;
  }

  // Calcular confianza basada en campos encontrados
  const totalCampos = 10; // nombre, apellido, dni, tel, email, dir, localidad, partido, provincia, CP
  datos.confianza = Math.round((camposEncontrados / totalCampos) * 100);

  return datos;
}