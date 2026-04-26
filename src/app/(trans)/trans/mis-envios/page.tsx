"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ESTADO_COLOR: Record<string, string> = {
  en_camino: "bg-amber-50 text-amber-700",
  entregado: "bg-green-50 text-green-700",
  observacion: "bg-red-50 text-red-700",
  en_deposito: "bg-teal-50 text-teal-700",
  a_retirar: "bg-purple-50 text-purple-700",
};
const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar",
  en_deposito: "En deposito",
  en_camino: "En camino",
  entregado: "Entregado",
  observacion: "Sin respuesta",
};

function simplificarZona(nombre: string): string {
  return nombre.split(" ")[0];
}

interface Envio {
  id: string;
  numeroEnvio: string;
  estado: string;
  compradorNombre: string;
  compradorApellido: string;
  entregaDireccion: string;
  entregaLocalidad: string;
  zona: { nombre: string };
}

export default function TransEnviosPage() {
  const router = useRouter();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [cambiando, setCambiando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/envios")
      .then(r => r.json())
      .then(data => {
        setEnvios(data.filter((e: Envio) =>
          e.estado === "en_camino" || e.estado === "en_deposito"
        ));
        setLoading(false);
      });
  }, []);

  async function marcarEnCamino(envioId: string, e: React.MouseEvent) {
    e.preventDefault();
    setCambiando(envioId);
    await fetch(`/api/envios/${envioId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_camino", nota: "Transportista salio a entregar" }),
    });
    setEnvios(prev => prev.map(env =>
      env.id === envioId ? { ...env, estado: "en_camino" } : env
    ));
    setCambiando(null);
  }

  if (loading) return (
    <div className="text-center py-10 text-sm text-gray-400">Cargando...</div>
  );

  return (
    <div>
      <h1 className="text-base font-semibold mb-4">Envios asignados</h1>
      <div className="space-y-3">
        {envios.map(e => (
          <Link
            key={e.id}
            href={`/trans/entrega/${e.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{e.numeroEnvio}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {e.compradorNombre} {e.compradorApellido}
                </p>
                <p className="text-xs text-gray-500">
                  {e.entregaDireccion}, {e.entregaLocalidad}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {simplificarZona(e.zona.nombre)}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[e.estado] ?? ""}`}>
                {ESTADO_LABEL[e.estado]}
              </span>
            </div>

            {e.estado === "en_deposito" && (
              <button
                onClick={(ev) => marcarEnCamino(e.id, ev)}
                disabled={cambiando === e.id}
                className="w-full text-xs bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium"
              >
                {cambiando === e.id ? "Actualizando..." : "Salir a entregar"}
              </button>
            )}
          </Link>
        ))}

        {envios.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            No tenes envios asignados.
          </div>
        )}
      </div>
    </div>
  );
}