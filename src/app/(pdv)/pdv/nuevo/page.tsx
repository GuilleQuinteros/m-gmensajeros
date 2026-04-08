"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Zona { id: string; nombre: string; grupo: string; costo: number; }

export default function NuevoEnvioPage() {
  const router = useRouter();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    compradorNombre: "", compradorApellido: "", compradorDni: "",
    compradorTelefono: "", entregaDireccion: "", entregaLocalidad: "",
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
      setError("Error al crear el envío. Verificá los datos.");
      setLoading(false);
      return;
    }
    router.push("/pdv/mis-envios");
  }

  const grupos = [...new Set(zonas.map(z => z.grupo))].sort();
  const zonaSeleccionada = zonas.find(z => z.id === form.zonaId);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Cargar envío</h1>
      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
              <input required value={form.compradorNombre} onChange={e => set("compradorNombre", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Apellido *</label>
              <input required value={form.compradorApellido} onChange={e => set("compradorApellido", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">DNI *</label>
              <input required value={form.compradorDni} onChange={e => set("compradorDni", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Sin puntos" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Teléfono *</label>
              <input required value={form.compradorTelefono} onChange={e => set("compradorTelefono", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="11 XXXX-XXXX" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Dirección de entrega *</label>
            <input required value={form.entregaDireccion} onChange={e => set("entregaDireccion", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Calle, número, piso/dpto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Localidad *</label>
              <input required value={form.entregaLocalidad} onChange={e => set("entregaLocalidad", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Zona *</label>
              <select required value={form.zonaId} onChange={e => set("zonaId", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Seleccionar...</option>
                {grupos.map(g => (
                  <optgroup key={g} label={g}>
                    {zonas.filter(z => z.grupo === g).map(z => (
                      <option key={z.id} value={z.id}>{z.nombre} — ${z.costo.toLocaleString("es-AR")}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          {zonaSeleccionada && (
            <div className="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-700">
              Costo del envío: <strong>${zonaSeleccionada.costo.toLocaleString("es-AR")}</strong>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={e => set("observaciones", e.target.value)}
              rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="bg-amber-700 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium">
              {loading ? "Guardando..." : "Guardar envío"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="text-sm text-gray-500 px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
