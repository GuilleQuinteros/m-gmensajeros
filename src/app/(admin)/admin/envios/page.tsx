"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar", en_deposito: "En deposito",
  en_camino: "En camino", entregado: "Entregado",
  observacion: "Observacion", cancelado: "Cancelado",
};
const ESTADO_COLOR: Record<string, string> = {
  a_retirar: "bg-purple-100 text-purple-800",
  en_deposito: "bg-teal-100 text-teal-800",
  en_camino: "bg-amber-100 text-amber-800",
  entregado: "bg-green-100 text-green-800",
  observacion: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-600",
};
const ESTADOS_CAMBIO = ["en_deposito", "en_camino", "entregado", "observacion", "cancelado"];

// Acciones rapidas por estado — lo mas comun en deposito
const ACCION_RAPIDA: Record<string, { label: string; next: string; color: string }> = {
  a_retirar:   { label: "Recibir en deposito", next: "en_deposito", color: "bg-teal-600 hover:bg-teal-700" },
  en_deposito: { label: "Despachar", next: "en_camino", color: "bg-amber-600 hover:bg-amber-700" },
  en_camino:   { label: "Marcar entregado", next: "entregado", color: "bg-green-600 hover:bg-green-700" },
};

interface Envio {
  id: string; numeroEnvio: string; estado: string;
  compradorNombre: string; compradorApellido: string;
  zona: { nombre: string }; pdv: { nombre: string };
  transportista: { fullName: string } | null;
  createdAt: string;
}

export default function EnviosPage() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [search, setSearch] = useState("");
  const [estadoMasivo, setEstadoMasivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function cargar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (estadoFiltro) params.set("estado", estadoFiltro);
    const data = await fetch(`/api/envios?${params}`).then(r => r.json());
    setEnvios(data);
    setSelected(new Set());
    setLoading(false);
  }

  useEffect(() => { cargar(); }, [estadoFiltro]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtrados.length) setSelected(new Set());
    else setSelected(new Set(filtrados.map(e => e.id)));
  }

  async function cambiarEstado(id: string, estado: string) {
    setCambiando(id);
    await fetch(`/api/envios/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setEnvios(prev => prev.map(e => e.id === id ? { ...e, estado } : e));
    setCambiando(null);
  }

  async function cambiarEstadoMasivo() {
    if (!estadoMasivo || selected.size === 0) return;
    setSaving(true);
    await Promise.all(
      Array.from(selected).map(id =>
        fetch(`/api/envios/${id}/estado`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: estadoMasivo }),
        })
      )
    );
    setSaving(false);
    setMsg(`${selected.size} envios actualizados a "${ESTADO_LABEL[estadoMasivo]}".`);
    setTimeout(() => setMsg(""), 3000);
    setEstadoMasivo("");
    await cargar();
  }

  const filtrados = envios.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.numeroEnvio.toLowerCase().includes(q) ||
      e.compradorNombre.toLowerCase().includes(q) ||
      e.compradorApellido.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Envios</h1>
        <span className="text-xs text-gray-400">{filtrados.length} envio{filtrados.length !== 1 ? "s" : ""}</span>
      </div>

      {msg && (
        <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{msg}</div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar nombre o numero..."
          className="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <select
          value={estadoFiltro}
          onChange={e => setEstadoFiltro(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Toolbar masivo */}
      {selected.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-amber-800">
            {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
          </span>
          <select
            value={estadoMasivo}
            onChange={e => setEstadoMasivo(e.target.value)}
            className="text-sm border border-amber-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Cambiar estado...</option>
            {ESTADOS_CAMBIO.map(s => (
              <option key={s} value={s}>{ESTADO_LABEL[s]}</option>
            ))}
          </select>
          <button
            onClick={cambiarEstadoMasivo}
            disabled={!estadoMasivo || saving}
            className="bg-amber-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-amber-800 disabled:opacity-50"
          >
            {saving ? "Aplicando..." : "Aplicar"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
          >
            Cancelar
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          No hay envios con los filtros seleccionados.
        </div>
      ) : (
        <>
          {/* MOBILE — tarjetas */}
          <div className="md:hidden space-y-3">
            {filtrados.map(e => {
              const accion = ACCION_RAPIDA[e.estado];
              return (
                <div
                  key={e.id}
                  className={`bg-white rounded-xl border p-4 ${selected.has(e.id) ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="w-4 h-4 accent-amber-600 cursor-pointer mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-sm text-amber-700">{e.numeroEnvio}</p>
                        <p className="text-xs text-gray-600">{e.compradorNombre} {e.compradorApellido}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[e.estado]}`}>
                      {ESTADO_LABEL[e.estado]}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 mb-3 space-y-0.5">
                    <p>{e.zona.nombre} — {e.pdv.nombre}</p>
                    <p>{new Date(e.createdAt).toLocaleDateString("es-AR")}</p>
                  </div>

                  <div className="flex gap-2">
                    {accion && (
                      <button
                        onClick={() => cambiarEstado(e.id, accion.next)}
                        disabled={cambiando === e.id}
                        className={`flex-1 text-white text-xs py-2 rounded-lg disabled:opacity-50 font-medium ${accion.color}`}
                      >
                        {cambiando === e.id ? "..." : accion.label}
                      </button>
                    )}
                    <Link
                      href={`/admin/envios/${e.id}`}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Seleccionar todos en mobile */}
            {filtrados.length > 1 && (
              <button
                onClick={toggleAll}
                className="w-full text-xs text-amber-700 border border-amber-200 py-2 rounded-lg hover:bg-amber-50"
              >
                {selected.size === filtrados.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            )}
          </div>

          {/* DESKTOP — tabla */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === filtrados.length}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-amber-600 cursor-pointer"
                    />
                  </th>
                  {["Nro.", "Comprador", "Zona", "PDV", "Transportista", "Estado", "Fecha", ""].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(e => (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 ${selected.has(e.id) ? "bg-amber-50" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-medium text-amber-700">{e.numeroEnvio}</td>
                    <td className="py-3 px-3">{e.compradorNombre} {e.compradorApellido}</td>
                    <td className="py-3 px-3 text-gray-500">{e.zona.nombre}</td>
                    <td className="py-3 px-3 text-gray-500">{e.pdv.nombre}</td>
                    <td className="py-3 px-3 text-gray-500">{e.transportista?.fullName ?? "-"}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[e.estado]}`}>
                        {ESTADO_LABEL[e.estado]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {new Date(e.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/admin/envios/${e.id}`}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}