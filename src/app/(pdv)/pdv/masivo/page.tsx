"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface RowParsed {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  localidad: string;
  zona: string;
  observaciones?: string;
}

export default function MasivoPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RowParsed[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ creados: number; errores: string[] } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const parsed: RowParsed[] = [];
      const errs: string[] = [];

      data.slice(0, 500).forEach((row, i) => {
        const fila = i + 2;
        if (!row.nombre || !row.apellido || !row.dni || !row.telefono || !row.direccion || !row.localidad || !row.zona) {
          errs.push(`Fila ${fila}: faltan campos. Requeridos: nombre, apellido, dni, telefono, direccion, localidad, zona.`);
        } else {
          parsed.push({
            nombre: String(row.nombre).trim(),
            apellido: String(row.apellido).trim(),
            dni: String(row.dni).trim(),
            telefono: String(row.telefono).trim(),
            direccion: String(row.direccion).trim(),
            localidad: String(row.localidad).trim(),
            zona: String(row.zona).trim(),
            observaciones: row.observaciones ? String(row.observaciones).trim() : undefined,
          });
        }
      });

      setRows(parsed);
      setErrors(errs);
      setResult(null);
    };
    reader.readAsBinaryString(file);
  }

  async function confirmar() {
    setLoading(true);
    const res = await fetch("/api/envios/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setLoading(false);
    setResult(data);
    if (data.creados > 0) {
      setTimeout(() => router.push("/pdv/mis-envios"), 2000);
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Carga masiva</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs text-gray-500 mb-1">
          Columnas requeridas en el Excel:
        </p>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-4">
          nombre | apellido | dni | telefono | direccion | localidad | zona
        </code>
        <p className="text-xs text-gray-400 mb-4">
          En <strong>zona</strong> escribi el nombre exacto: <em>CABA 24hs</em>, <em>Provincia 24hs</em> o <em>Provincia 96hs</em>
        </p>

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-4">
          <input type="file" accept=".xlsx,.csv" onChange={handleFile} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="cursor-pointer text-sm text-gray-500 hover:text-amber-700">
            Toca para seleccionar archivo .xlsx o .csv
          </label>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-red-700 mb-1">{errors.length} fila(s) con errores:</p>
            {errors.slice(0, 10).map((e, i) => (
              <p key={i} className="text-xs text-red-600">{e}</p>
            ))}
            {errors.length > 10 && (
              <p className="text-xs text-red-400 mt-1">...y {errors.length - 10} mas</p>
            )}
          </div>
        )}

        {rows.length > 0 && !result && (
          <>
            <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 mb-4">
              {rows.length} fila{rows.length > 1 ? "s" : ""} listas para importar.
            </div>
            <div className="overflow-x-auto mb-4 max-h-48 border border-gray-100 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50">
                    {["Nombre","Apellido","DNI","Direccion","Localidad","Zona"].map(h => (
                      <th key={h} className="text-left py-1.5 px-2 text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 px-2">{r.nombre}</td>
                      <td className="py-1.5 px-2">{r.apellido}</td>
                      <td className="py-1.5 px-2">{r.dni}</td>
                      <td className="py-1.5 px-2 max-w-32 truncate">{r.direccion}</td>
                      <td className="py-1.5 px-2">{r.localidad}</td>
                      <td className="py-1.5 px-2">{r.zona}</td>
                    </tr>
                  ))}
                  {rows.length > 5 && (
                    <tr>
                      <td colSpan={6} className="py-1.5 px-2 text-gray-400 text-center">
                        ...y {rows.length - 5} mas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={confirmar}
              disabled={loading}
              className="w-full bg-amber-700 text-white text-sm py-3 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium"
            >
              {loading ? "Importando..." : `Confirmar importacion (${rows.length} envios)`}
            </button>
          </>
        )}

        {result && (
          <div className={`rounded-lg p-4 ${result.creados > 0 ? "bg-green-50" : "bg-red-50"}`}>
            {result.creados > 0 && (
              <p className="text-sm font-medium text-green-700 mb-1">
                {result.creados} envio{result.creados > 1 ? "s" : ""} registrado{result.creados > 1 ? "s" : ""} correctamente.
              </p>
            )}
            {result.errores?.length > 0 && (
              <>
                <p className="text-xs font-medium text-red-700 mb-1">{result.errores.length} error(es):</p>
                {result.errores.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">{e}</p>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}