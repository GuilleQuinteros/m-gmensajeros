"use client";
import { useEffect, useState } from "react";

interface Transportista { id: string; fullName: string; }
interface ZonaTransportista { transportista: { id: string; fullName: string }; isActive: boolean; }
interface Zona {
  id: string; nombre: string; slaHoras: number;
  costo: number; isActive: boolean;
  transportistas: ZonaTransportista[];
}

const SLA_OPTS = [
  { value: 24,  label: "24 horas" },
  { value: 48,  label: "48 horas" },
  { value: 72,  label: "72 horas" },
  { value: 96,  label: "96 horas" },
];

const EMPTY = { nombre: "", slaHoras: 24, costo: "" };

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [msg, setMsg] = useState("");

  function set(f: string, v: any) { setForm((p: any) => ({ ...p, [f]: v })); }

  async function cargar() {
    const [z, t] = await Promise.all([
      fetch("/api/zonas?all=1").then(r => r.json()),
      fetch("/api/usuarios?role=transportista").then(r => r.json()),
    ]);
    setZonas(z);
    setTransportistas(t);
    const c: Record<string, string> = {};
    z.forEach((zona: Zona) => { c[zona.id] = String(zona.costo); });
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
    flash("Costo actualizado.");
  }

  async function toggleActiva(z: Zona) {
    await fetch(`/api/zonas/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !z.isActive }),
    });
    await cargar();
  }

  async function crearZona() {
    if (!form.nombre || !form.slaHoras || !form.costo) return;
    setSaving("new");
    await fetch("/api/zonas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.nombre, slaHoras: Number(form.slaHoras), costo: Number(form.costo) }),
    });
    await cargar();
    setModal(false);
    setForm({ ...EMPTY });
    setSaving(null);
    flash("Zona creada.");
  }

  async function asignarTransportista(zonaId: string, transportistaId: string) {
    await fetch(`/api/zonas/${zonaId}/transportistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportistaId }),
    });
    await cargar();
    flash("Transportista asignado.");
  }

  async function quitarTransportista(zonaId: string, transportistaId: string) {
    await fetch(`/api/zonas/${zonaId}/transportistas`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportistaId }),
    });
    await cargar();
    flash("Transportista removido.");
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

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

      <div className="space-y-4">
        {zonas.map(z => {
          const asignados = z.transportistas.filter(t => t.isActive).map(t => t.transportista);
          const disponibles = transportistas.filter(t => !asignados.find(a => a.id === t.id));

          return (
            <div key={z.id} className={`bg-white rounded-xl border p-5 ${!z.isActive ? "border-gray-100 opacity-60" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">{z.nombre}</h2>
                  <span className="text-xs text-gray-400">SLA: {z.slaHoras}hs</span>
                </div>
                <button onClick={() => toggleActiva(z)}
                  className={`text-xs px-2.5 py-1 rounded-lg border ${
                    z.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}>
                  {z.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Costo */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Costo del envio</p>
                  <div className="flex gap-2">
                    <input type="number" value={costs[z.id] || ""} disabled={!z.isActive}
                      onChange={e => setCosts(p => ({ ...p, [z.id]: e.target.value }))}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50"
                    />
                    <button onClick={() => saveCosto(z.id)} disabled={saving === z.id || !z.isActive}
                      className="bg-amber-700 text-white text-xs px-3 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-40">
                      {saving === z.id ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>

                {/* Transportistas */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Transportistas asignados</p>
                  <div className="space-y-1 mb-2">
                    {asignados.length === 0 ? (
                      <p className="text-xs text-gray-400">Sin asignar</p>
                    ) : asignados.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-medium text-amber-800">{t.fullName}</span>
                        <button onClick={() => quitarTransportista(z.id, t.id)}
                          className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                      </div>
                    ))}
                  </div>
                  {disponibles.length > 0 && z.isActive && (
                    <select defaultValue=""
                      onChange={e => { if (e.target.value) asignarTransportista(z.id, e.target.value); e.target.value = ""; }}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                      <option value="">+ Asignar transportista...</option>
                      {disponibles.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-5">Nueva zona</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input value={form.nombre} onChange={e => set("nombre", e.target.value)}
                  placeholder="Ej: Interior 96hs"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tiempo de entrega (SLA)</label>
                <select value={form.slaHoras} onChange={e => set("slaHoras", Number(e.target.value))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {SLA_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Costo del envio ($)</label>
                <input type="number" value={form.costo} onChange={e => set("costo", e.target.value)}
                  placeholder="Ej: 4500"
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