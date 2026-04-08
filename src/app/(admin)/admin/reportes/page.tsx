"use client";
import { useEffect, useState } from "react";

interface ReporteData {
  totales: {
    envios: number; facturacion: number;
    entregados: number; tasaEntrega: number;
  };
  porZona: { zona: string; grupo: string; envios: number; total: number }[];
  porTransportista: { transportista: string; envios: number; entregados: number; tasa: number }[];
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  function calcFechas(p: string) {
    const hoy = new Date();
    let d = new Date();
    if (p === "hoy") { d = new Date(); d.setHours(0,0,0,0); }
    else if (p === "semana") { d.setDate(hoy.getDate() - 7); }
    else if (p === "mes") { d.setDate(1); d.setHours(0,0,0,0); }
    else if (p === "anio") { d = new Date(hoy.getFullYear(), 0, 1); }
    else return { desde: desde, hasta: hasta };
    return {
      desde: d.toISOString().split("T")[0],
      hasta: new Date(hoy.getTime() + 86400000).toISOString().split("T")[0],
    };
  }

  async function cargar(p = periodo) {
    setLoading(true);
    const fechas = calcFechas(p);
    const params = new URLSearchParams();
    if (fechas.desde) params.set("desde", fechas.desde);
    if (fechas.hasta) params.set("hasta", fechas.hasta);
    const res = await fetch(`/api/reportes?${params}`).then(r => r.json());
    setData(res);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  function exportarCSV() {
    if (!data) return;
    const rows = [
      ["Zona", "Grupo", "Envios", "Total ARS"],
      ...data.porZona.map(r => [r.zona, r.grupo, r.envios, r.total]),
      [],
      ["Transportista", "Asignados", "Entregados", "Tasa %"],
      ...data.porTransportista.map(r => [r.transportista, r.envios, r.entregados, r.tasa]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${periodo}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <button onClick={exportarCSV}
          className="border border-amber-600 text-amber-700 text-sm px-4 py-2 rounded-lg hover:bg-amber-50">
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Periodo</p>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="hoy">Hoy</option>
            <option value="semana">Ultima semana</option>
            <option value="mes">Este mes</option>
            <option value="anio">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        {periodo === "custom" && (
          <>
            <div>
              <p className="text-xs text-gray-400 mb-1">Desde</p>
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Hasta</p>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </>
        )}
        <button onClick={() => cargar(periodo)}
          className="bg-amber-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-800">
          Aplicar
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Cargando...</div>
      ) : data && (
        <>
          {/* Totales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total envios",   value: data.totales.envios,     color: "text-gray-800" },
              { label: "Entregados",     value: data.totales.entregados, color: "text-green-700" },
              { label: "Tasa de entrega",value: `${data.totales.tasaEntrega}%`, color: "text-amber-700" },
              { label: "Facturacion",    value: `$${Number(data.totales.facturacion ?? 0).toLocaleString("es-AR")}`, color: "text-gray-800" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Por zona */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Facturacion por zona</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Zona","Grupo","Envios","Total"].map(h => (
                      <th key={h} className="text-left py-2 text-xs text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.porZona.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">Sin datos en este periodo</td></tr>
                  ) : data.porZona.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2">{row.zona}</td>
                      <td className="py-2 text-gray-400 text-xs">{row.grupo}</td>
                      <td className="py-2 text-center">{row.envios}</td>
                      <td className="py-2 font-medium text-right">
                        ${Number(row.total ?? 0).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))}
                  {data.porZona.length > 0 && (
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={2} className="py-2 font-semibold text-xs text-gray-600">Total</td>
                      <td className="py-2 text-center font-semibold">{data.totales.envios}</td>
                      <td className="py-2 text-right font-semibold text-amber-700">
                        ${Number(data.totales.facturacion ?? 0).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Por transportista */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Rendimiento transportistas</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Transportista","Asignados","Entregados","Tasa"].map(h => (
                      <th key={h} className="text-left py-2 text-xs text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.porTransportista.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">Sin datos en este periodo</td></tr>
                  ) : data.porTransportista.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2">{row.transportista}</td>
                      <td className="py-2 text-center">{row.envios}</td>
                      <td className="py-2 text-center">{row.entregados}</td>
                      <td className={`py-2 font-medium text-right ${row.tasa >= 90 ? "text-green-600" : "text-amber-600"}`}>
                        {row.tasa}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}