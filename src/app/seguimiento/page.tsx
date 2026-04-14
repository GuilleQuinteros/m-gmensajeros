"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
  
export default function SeguimientoPage() {
  const router = useRouter();
  const [nro, setNro] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  


  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/tracking/buscar?nro=${nro.trim().toUpperCase()}`);
    if (!res.ok) {
      setError("No encontramos un envio con ese numero. Verificá que esté bien escrito.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    router.push(`/t/${data.trackingToken}`);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-700">M&G Mensajeros</h1>
          <p className="text-gray-500 text-sm mt-1">Seguimiento de envios</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Consultá tu envio</h2>
          <p className="text-xs text-gray-400 mb-5">
            Ingresá el numero de envio que te enviamos por WhatsApp. Ejemplo: ENV-0042
          </p>
          <form onSubmit={buscar} className="space-y-3">
            <input
              value={nro}
              onChange={e => setNro(e.target.value)}
              placeholder="ENV-0001"
              required
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-lg font-mono tracking-widest uppercase"
            />
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Ver estado de mi envio"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          ¿No tenés tu numero de envio? Contactanos por WhatsApp.
        </p>
      </div>
    </div>
  );
}