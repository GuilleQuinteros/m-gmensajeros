"use client";
import { useEffect, useState } from "react";

interface Zona {
  id: string; nombre: string; grupo: string;
  costo: number; isActive: boolean;
}

const EMPTY_FORM = { nombre: "", grupo: "", costo: "" };
const GRUPOS = ["Norte", "Sur", "Oeste", "CABA", "Otro"];

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState("");

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function cargar() {
    const data: Zona[] = await fetch("/api/zonas?all=1").then(r => r.json());
    setZonas(data);
    const c: Record<string, string> = {};
    data.forEach(z => { c[z.id] = String(z.costo); });
    setCosts(c);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function saveCosto(id: string) {
    setSaving(id);
    await fetch(`/api/zonas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ costo: Number(costs[id]) }),
    });
    setSaving(null);
    setMsg("Costo actualizado.");
    setTimeout(() => setMsg(""), 2000);
  }

  async function toggleActiva(z: Zona) {
    await fetch(`/api/zonas/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !z.isActive }),
    });
    setZonas(prev => prev.map(x => x.id === z.id ? { ...x, isActive: !x.isActive } : x));
  }

  async function crearZona() {
    if (!form.nombre || !form.grupo || !form.costo) return;
    setSaving("new");
    const res = await fetch("/api/zonas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.nombre, grupo: form.grupo, costo: Number(form.costo) }),
    });
    if (res.ok) {
      await cargar();
      setModal(false);
      setForm({ ...EMPTY_FORM });
      setMsg("Zona creada correctamente.");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(null);
  }

  const grupos = Array.from(new Set(zonas.map(z => z.grupo))).sort();
  if (loading) return <div className="text-sm text-gray-400 p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Zonas y costos</h1>
        <button onClick={() => setModal(true)}
          className="bg-amber-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-800">
          + Nueva zona
        </button>
      </div>

      {msg && <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grupos.map(grupo => (
          <div key={grupo} className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Zona {grupo}</h2>
            <div className="space-y-3">
              {zonas.filter(z => z.grupo === grupo).map(z => (
                <div key={z.id} className="flex items-center gap-2">
                  <span className={`flex-1 text-sm ${!z.isActive ? "line-through text-gray-400" : ""}`}>
                    {z.nombre}
                  </span>
                  <input
                    type="number"
                    value={costs[z.id] || ""}
                    onChange={e => setCosts(prev => ({ ...prev, [z.id]: e.target.value }))}
                    disabled={!z.isActive}
                    className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    onClick={() => saveCosto(z.id)}
                    disabled={saving === z.id || !z.isActive}
                    className="text-xs bg-amber-700 text-white px-2.5 py-1.5 rounded-lg hover:bg-amber-800 disabled:opacity-40"
                  >
                    {saving === z.id ? "..." : "OK"}
                  </button>
                  <button
                    onClick={() => toggleActiva(z)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                      z.isActive
                        ? "border-red-200 text-red-500 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {z.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-5">Nueva zona</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre de la localidad</label>
                <input value={form.nombre} onChange={e => set("nombre", e.target.value)}
                  placeholder="Ej: Berazategui"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Grupo</label>
                <select value={form.grupo} onChange={e => set("grupo", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Seleccionar grupo...</option>
                  {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Costo del envio ($)</label>
                <input type="number" value={form.costo} onChange={e => set("costo", e.target.value)}
                  placeholder="Ej: 3500"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={crearZona} disabled={saving === "new"}
                className="flex-1 bg-amber-700 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium">
                {saving === "new" ? "Creando..." : "Crear zona"}
              </button>
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}