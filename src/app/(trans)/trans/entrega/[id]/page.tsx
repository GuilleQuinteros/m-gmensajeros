"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Envio {
  id: string; numeroEnvio: string; compradorNombre: string;
  entregaDireccion: string; entregaLocalidad: string;
  estado: string; dniVerificadoAt: string | null;
}

export default function EntregaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [dniInput, setDniInput] = useState("");
  const [dniOk, setDniOk] = useState(false);
  const [dniError, setDniError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/envios/${id}`).then(r => r.json()).then(data => {
      setEnvio(data);
      if (data.dniVerificadoAt) setDniOk(true);
    });
  }, [id]);

  async function verificarDni() {
    setLoading(true);
    setDniError("");
    const res = await fetch(`/api/envios/${id}/verificar-dni`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dniEscaneado: dniInput }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.verificado) {
      setDniOk(true);
      setDniError("");
    } else {
      setDniError(data.error || "DNI no coincide.");
    }
  }

  async function confirmar(estado: "entregado" | "observacion") {
    if (estado === "entregado" && !dniOk) {
      setMsg("Primero verifica el DNI del receptor.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/envios/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado,
        nota: estado === "observacion" ? "Sin respuesta / ausente" : "Entrega confirmada con DNI verificado",
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/trans/mis-envios");
    } else {
      setMsg("Error al confirmar. Intenta de nuevo.");
    }
  }

  if (!envio) return (
    <div className="text-center py-10 text-sm text-gray-400">Cargando...</div>
  );

  return (
    <div>
      <button onClick={() => router.back()}
        className="text-sm text-gray-400 mb-4 flex items-center gap-1">
        ← Volver
      </button>
      <h1 className="text-base font-semibold mb-4">{envio.numeroEnvio}</h1>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
        <p className="text-xs font-medium text-amber-700 mb-1">Direccion de entrega</p>
        <p className="font-semibold text-amber-900">{envio.entregaDireccion}</p>
        <p className="text-sm text-amber-700">{envio.entregaLocalidad}</p>
        <p className="text-xs text-amber-600 mt-1">Receptor: {envio.compradorNombre}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Verificar identidad del receptor
        </p>
        {dniOk ? (
          <div className="bg-green-50 rounded-lg px-3 py-2.5 text-sm text-green-700 font-medium flex items-center gap-2">
            <span className="text-green-500 text-base">✓</span>
            DNI verificado correctamente
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              value={dniInput}
              onChange={e => setDniInput(e.target.value)}
              placeholder="Numero de DNI del receptor"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {dniError && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {dniError}
              </p>
            )}
            <button
              onClick={verificarDni}
              disabled={loading || !dniInput}
              className="w-full bg-gray-800 text-white text-sm py-2.5 rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar DNI"}
            </button>
          </div>
        )}
      </div>

      {msg && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
          {msg}
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={() => confirmar("entregado")}
          disabled={loading || !dniOk}
          className="w-full bg-green-700 text-white font-medium py-3 rounded-xl hover:bg-green-800 disabled:opacity-50 text-sm"
        >
          {loading ? "Confirmando..." : "Confirmar entrega"}
        </button>
        <button
          onClick={() => confirmar("observacion")}
          disabled={loading}
          className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Sin respuesta / Ausente
        </button>
      </div>
    </div>
  );
}