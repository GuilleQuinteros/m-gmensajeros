"use client";
import { useEffect, useState } from "react";

interface Plantilla { id: string; evento: string; canal: string; cuerpo: string; activa: boolean; }

const EVENTO_LABEL: Record<string, string> = {
  registrado: "Pedido registrado", deposito: "En depósito",
  camino: "En camino", entregado: "Entregado", manual: "Manual",
};

export default function AlertasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/alertas").then(r => r.json()).then(setPlantillas);
  }, []);

  function update(id: string, field: string, value: string | boolean) {
    setPlantillas(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  async function save(p: Plantilla) {
    setSaving(p.id);
    await fetch(`/api/alertas/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuerpo: p.cuerpo, activa: p.activa }),
    });
    setSaving(null);
    setSaved(p.id);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Plantillas de alertas WhatsApp</h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {plantillas.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">{EVENTO_LABEL[p.evento] ?? p.evento}</h2>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={p.activa}
                  onChange={e => update(p.id, "activa", e.target.checked)}
                  className="accent-amber-600" />
                Activa
              </label>
            </div>
            <textarea
              value={p.cuerpo}
              onChange={e => update(p.id, "cuerpo", e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Variables: {"{nombre}"} {"{nro_envio}"} {"{direccion}"} {"{zona}"} {"{link_tracking}"}</p>
              <button
                onClick={() => save(p)}
                disabled={saving === p.id}
                className="text-xs bg-amber-700 text-white px-4 py-1.5 rounded-lg hover:bg-amber-800 disabled:opacity-50"
              >
                {saved === p.id ? "¡Guardado!" : saving === p.id ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
