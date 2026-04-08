import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const PASOS = ["a_retirar", "en_deposito", "en_camino", "entregado"];
const PASO_LABEL = ["Registrado", "En depósito", "En camino", "Entregado"];
const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "Pedido registrado", en_deposito: "En nuestro depósito",
  en_camino: "En camino a tu domicilio", entregado: "Entregado exitosamente",
  observacion: "Intento de entrega sin éxito", cancelado: "Cancelado",
};

export default async function TrackingPage({ params }: { params: { token: string } }) {
  const envio = await prisma.envio.findUnique({
    where: { trackingToken: params.token },
    select: {
      numeroEnvio: true, estado: true, compradorNombre: true,
      compradorApellido: true, entregaLocalidad: true, createdAt: true,
      entregadoAt: true, zona: { select: { nombre: true } },
      historial: { select: { estadoNuevo: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!envio) notFound();

  const pasoActual = PASOS.indexOf(envio.estado);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-amber-700">M&G Mensajeros</h1>
          <p className="text-sm text-gray-500 mt-1">Seguimiento de tu pedido</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{envio.numeroEnvio}</p>
            <p className="text-xs text-gray-400">{envio.zona.nombre}</p>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            {envio.compradorNombre} {envio.compradorApellido} — {envio.entregaLocalidad}
          </p>

          <div className="flex items-center mb-2">
            {PASOS.map((p, i) => (
              <div key={p} className="flex items-center flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  i < pasoActual ? "bg-amber-700 text-white" :
                  i === pasoActual ? "bg-amber-700 text-white ring-4 ring-amber-100" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {i < pasoActual ? "✓" : i + 1}
                </div>
                {i < PASOS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${i < pasoActual ? "bg-amber-700" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mb-6">
            {PASO_LABEL.map((l, i) => (
              <span key={l} className={`text-xs text-center ${i === pasoActual ? "text-amber-700 font-medium" : "text-gray-400"}`}
                style={{ width: "25%" }}>{l}</span>
            ))}
          </div>

          <div className="bg-amber-50 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm font-semibold text-amber-800">{ESTADO_LABEL[envio.estado]}</p>
            {envio.entregadoAt && (
              <p className="text-xs text-amber-600 mt-0.5">
                {new Date(envio.entregadoAt).toLocaleString("es-AR")}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Historial</p>
            <ol className="space-y-3">
              {envio.historial.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{ESTADO_LABEL[h.estadoNuevo] ?? h.estadoNuevo}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(h.createdAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <a href="https://wa.me/5491100000000?text=Consulta%20sobre%20mi%20pedido"
            target="_blank" rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-700 transition-colors">
            Contactar por WhatsApp
          </a>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Este link es personal. No lo compartas.</p>
      </div>
    </div>
  );
}
