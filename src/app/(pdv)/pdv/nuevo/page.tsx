"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Zona { id: string; nombre: string; slaHoras: number; costo: number; }

export default function NuevoEnvioPage() {
  const router = useRouter();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    compradorNombre: "", compradorApellido: "", compradorDni: "",
    compradorTelefono: "", compradorEmail: "", entregaDireccion: "", entregaLocalidad: "",
    zonaId: "", observaciones: "",
  });

  useEffect(() => {
    fetch("/api/zonas").then(r => r.json()).then(setZonas);
  }, []);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError("Error al crear el envio. Verifica los datos.");
      setLoading(false);
      return;
    }
    router.push("/pdv/mis-envios");
  }

  const zonaSeleccionada = zonas.find(z => z.id === form.zonaId);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Cargar envio</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
              <input
                required
                value={form.compradorNombre}
                onChange={e => set("compradorNombre", e.target.value)}
                autoComplete="off"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Apellido *</label>
              <input
                required
                value={form.compradorApellido}
                onChange={e => set("compradorApellido", e.target.value)}
                autoComplete="off"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">DNI *</label>
              <input
                required
                inputMode="numeric"
                value={form.compradorDni}
                onChange={e => set("compradorDni", e.target.value)}
                placeholder="Sin puntos"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telefono *</label>
              <input
                required
                inputMode="tel"
                value={form.compradorTelefono}
                onChange={e => set("compradorTelefono", e.target.value)}
                placeholder="11 XXXX-XXXX"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email del comprador</label>
              <input
                type="email"
                inputMode="email"
                value={form.compradorEmail}
                onChange={e => set("compradorEmail", e.target.value)}
                placeholder="comprador@email.com"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Direccion de entrega *</label>
            <input
              required
              value={form.entregaDireccion}
              onChange={e => set("entregaDireccion", e.target.value)}
              placeholder="Calle, numero, piso/dpto"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Localidad *</label>
              <input
                required
                value={form.entregaLocalidad}
                onChange={e => set("entregaLocalidad", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Zona *</label>
              <select
                required
                value={form.zonaId}
                onChange={e => set("zonaId", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="">Seleccionar...</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} ({z.slaHoras}hs) - ${z.costo.toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {zonaSeleccionada && (
            <div className="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-700">
              Costo: <strong>${zonaSeleccionada.costo.toLocaleString("es-AR")}</strong>
              {" "}&mdash; Entrega en <strong>{zonaSeleccionada.slaHoras}hs</strong>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={e => set("observaciones", e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-700 text-white text-sm py-3 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium"
            >
              {loading ? "Guardando..." : "Guardar envio"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-500 px-5 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}