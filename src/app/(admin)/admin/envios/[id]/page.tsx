"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar",
  en_deposito: "En deposito",
  en_camino: "En camino",
  entregado: "Entregado",
  observacion: "Observacion",
  cancelado: "Cancelado",
};

const ESTADO_SIGUIENTE: Record<string, string[]> = {
  a_retirar:   ["en_deposito", "cancelado"],
  en_deposito: ["en_camino", "cancelado"],
  en_camino:   ["entregado", "observacion"],
  observacion: ["en_camino", "cancelado"],
  entregado:   [],
  cancelado:   [],
};

const ESTADO_COLOR: Record<string, string> = {
  a_retirar:   "bg-purple-100 text-purple-800",
  en_deposito: "bg-teal-100 text-teal-800",
  en_camino:   "bg-amber-100 text-amber-800",
  entregado:   "bg-green-100 text-green-800",
  observacion: "bg-red-100 text-red-800",
  cancelado:   "bg-gray-100 text-gray-600",
};

interface Transportista { id: string; fullName: string; }
interface Envio {
  id: string; numeroEnvio: string; estado: string;
  compradorNombre: string; compradorApellido: string;
  compradorDni: string; compradorTelefono: string;
  entregaDireccion: string; entregaLocalidad: string;
  costoEnvio: number; trackingToken: string;
  zona: { nombre: string };
  pdv: { nombre: string };
  transportista: { id: string; fullName: string } | null;
  historial: { id: string; estadoNuevo: string; createdAt: string; nota: string | null; user: { fullName: string } }[];
  alertasEnviadas: { id: string; tipo: string; canal: string; mensaje: string; estadoEnvio: string; sentAt: string | null }[];
}

export default function EnvioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [nota, setNota] = useState("");
  const [transId, setTransId] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/envios/${params.id}`).then(r => r.json()),
      fetch("/api/usuarios?role=transportista").then(r => r.json()),
    ]).then(([e, t]) => {
      setEnvio(e);
      setTransportistas(t);
      setTransId(e.transportista?.id ?? "");
      setLoading(false);
    });
  }, [params.id]);

  async function cambiarEstado() {
    if (!estadoNuevo) return;
    setSaving(true);
    const res = await fetch(`/api/envios/${params.id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estadoNuevo, nota }),
    });
    if (res.ok) {
      const updated = await fetch(`/api/envios/${params.id}`).then(r => r.json());
      setEnvio(updated);
      setEstadoNuevo("");
      setNota("");
      setMsg("Estado actualizado correctamente.");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  }

  async function asignarTransportista() {
    if (!transId) return;
    setSaving(true);
    const res = await fetch(`/api/envios/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportistaId: transId }),
    });
    if (res.ok) {
      const updated = await fetch(`/api/envios/${params.id}`).then(r => r.json());
      setEnvio(updated);
      setMsg("Transportista asignado correctamente.");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  }

  async function enviarAlertaManual() {
    setSaving(true);
    await fetch(`/api/alertas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ envioId: params.id }),
    });
    setMsg("Alerta enviada.");
    setTimeout(() => setMsg(""), 3000);
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-gray-400 p-6">Cargando...</div>;
  if (!envio) return <div className="text-sm text-red-500 p-6">Envio no encontrado.</div>;

  const siguientes = ESTADO_SIGUIENTE[envio.estado] ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/envios" className="text-sm text-gray-400 hover:text-gray-600">← Volver</Link>
        <h1 className="text-xl font-semibold">{envio.numeroEnvio}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_COLOR[envio.estado]}`}>
          {ESTADO_LABEL[envio.estado]}
        </span>
      </div>

      {msg && (
        <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos del comprador</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Nombre", `${envio.compradorNombre} ${envio.compradorApellido}`],
              ["DNI", envio.compradorDni],
              ["Telefono", envio.compradorTelefono],
              ["Direccion", envio.entregaDireccion],
              ["Localidad", envio.entregaLocalidad],
              ["Zona", envio.zona.nombre],
              ["Costo envio", `$${Number(envio.costoEnvio).toLocaleString("es-AR")}`],
              ["PDV origen", envio.pdv.nombre],
              ["Transportista", envio.transportista?.fullName ?? "Sin asignar"],
              ["Link tracking", `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${envio.trackingToken}`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-gray-400 w-28 shrink-0">{k}</dt>
                <dd className="text-gray-800 font-medium break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          {/* Cambiar estado */}
          {siguientes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Cambiar estado</h2>
              <div className="space-y-3">
                <select
                  value={estadoNuevo}
                  onChange={e => setEstadoNuevo(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Seleccionar nuevo estado...</option>
                  {siguientes.map(s => (
                    <option key={s} value={s}>{ESTADO_LABEL[s]}</option>
                  ))}
                </select>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Nota opcional..."
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
                <button
                  onClick={cambiarEstado}
                  disabled={!estadoNuevo || saving}
                  className="w-full bg-amber-700 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium"
                >
                  {saving ? "Guardando..." : "Confirmar cambio de estado"}
                </button>
              </div>
            </div>
          )}

          {/* Asignar transportista */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Asignar transportista</h2>
            <div className="flex gap-2">
              <select
                value={transId}
                onChange={e => setTransId(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Sin asignar</option>
                {transportistas.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
              <button
                onClick={asignarTransportista}
                disabled={saving}
                className="bg-amber-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>

          {/* Alerta manual */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Notificacion manual</h2>
            <p className="text-xs text-gray-400 mb-3">
              Envia una alerta WhatsApp al comprador con el estado actual del envio.
            </p>
            <button
              onClick={enviarAlertaManual}
              disabled={saving}
              className="w-full border border-green-600 text-green-700 text-sm px-4 py-2.5 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              Enviar alerta WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h2>
        <ol className="space-y-4">
          {envio.historial.map((h, i) => (
            <li key={h.id} className="flex gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                i === envio.historial.length - 1 ? "bg-amber-600" : "bg-green-500"
              }`} />
              <div>
                <p className="text-sm font-medium">{ESTADO_LABEL[h.estadoNuevo]}</p>
                <p className="text-xs text-gray-400">
                  {new Date(h.createdAt).toLocaleString("es-AR")} — {h.user.fullName}
                </p>
                {h.nota && <p className="text-xs text-gray-500 mt-0.5">{h.nota}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Alertas enviadas */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Alertas enviadas</h2>
        {envio.alertasEnviadas.length === 0 ? (
          <p className="text-sm text-gray-400">Sin alertas enviadas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Tipo","Canal","Mensaje","Estado","Hora"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {envio.alertasEnviadas.map(a => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-2 px-3 capitalize">{a.tipo}</td>
                  <td className="py-2 px-3 capitalize">{a.canal}</td>
                  <td className="py-2 px-3 text-gray-500 max-w-xs truncate">{a.mensaje}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs font-medium ${
                      a.estadoEnvio === "enviado" ? "text-green-600" :
                      a.estadoEnvio === "fallido" ? "text-red-500" : "text-gray-400"
                    }`}>{a.estadoEnvio}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-xs">
                    {a.sentAt ? new Date(a.sentAt).toLocaleString("es-AR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}