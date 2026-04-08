"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Row { compradorNombre: string; compradorApellido: string; compradorDni: string; compradorTelefono: string; entregaDireccion: string; entregaLocalidad: string; zonaId: string; }

export default function MasivoPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const parsed: Row[] = [];
      const errs: string[] = [];
      data.slice(0, 500).forEach((row, i) => {
        if (!row.nombre || !row.apellido || !row.dni || !row.telefono || !row.direccion || !row.localidad || !row.zona_id) {
          errs.push(`Fila ${i + 2}: faltan campos obligatorios.`);
        } else {
          parsed.push({
            compradorNombre: String(row.nombre), compradorApellido: String(row.apellido),
            compradorDni: String(row.dni), compradorTelefono: String(row.telefono),
            entregaDireccion: String(row.direccion), entregaLocalidad: String(row.localidad),
            zonaId: String(row.zona_id),
          });
        }
      });
      setRows(parsed);
      setErrors(errs);
    };
    reader.readAsBinaryString(file);
  }

  async function confirmar() {
    setLoading(true);
    for (const row of rows) {
      await fetch("/api/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
    }
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/pdv/mis-envios"), 2000);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Carga masiva</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-5 max-w-2xl">
        <p className="text-xs text-gray-500 mb-4">
          El archivo debe tener las columnas: <code className="bg-gray-100 px-1 rounded">nombre, apellido, dni, telefono, direccion, localidad, zona_id</code>
        </p>
        <a href="#" className="text-xs text-amber-700 underline mb-4 inline-block">Descargar plantilla CSV</a>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-4">
          <input type="file" accept=".xlsx,.csv" onChange={handleFile} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="cursor-pointer text-sm text-gray-500 hover:text-amber-700">
            Hacé clic para seleccionar un archivo .xlsx o .csv
          </label>
        </div>
        {errors.length > 0 && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          </div>
        )}
        {rows.length > 0 && (
          <>
            <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 mb-4">
              {rows.length} filas listas para importar.
            </div>
            <div className="overflow-x-auto mb-4 max-h-48">
              <table className="w-full text-xs">
                <thead><tr className="border-b">{["Nombre","Apellido","DNI","Dirección","Localidad"].map(h => <th key={h} className="text-left py-1 px-2 text-gray-400">{h}</th>)}</tr></thead>
                <tbody>{rows.slice(0,5).map((r,i) => <tr key={i} className="border-b border-gray-50"><td className="py-1 px-2">{r.compradorNombre}</td><td className="py-1 px-2">{r.compradorApellido}</td><td className="py-1 px-2">{r.compradorDni}</td><td className="py-1 px-2">{r.entregaDireccion}</td><td className="py-1 px-2">{r.entregaLocalidad}</td></tr>)}{rows.length > 5 && <tr><td colSpan={5} className="py-1 px-2 text-gray-400">...y {rows.length - 5} más</td></tr>}</tbody>
              </table>
            </div>
            <button onClick={confirmar} disabled={loading || done}
              className="bg-amber-700 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium">
              {done ? "¡Importado!" : loading ? "Importando..." : `Confirmar importación (${rows.length} envíos)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
