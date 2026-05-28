"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface DatosExtraidos {
  nombre?: string; apellido?: string; dni?: string;
  telefono?: string; email?: string; direccion?: string;
  piso?: string; localidad?: string; partido?: string;
  provincia?: string; codigoPostal?: string;
  entreCalles?: string; observaciones?: string;
  pedidoExterno?: string; confianza: number;
}

interface Zona { id: string; nombre: string; slaHoras: number; costo: number; }

export default function OCRPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [datos, setDatos] = useState<DatosExtraidos | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [form, setForm] = useState<any>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  function set(field: string, value: string) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPreview(base64);
      setProcesando(true);
      setError("");
      setDatos(null);

      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagen: base64 }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al procesar la imagen.");
          setProcesando(false);
          return;
        }

        setDatos(data.datos);
        setForm({
          compradorNombre: data.datos.nombre ?? "",
          compradorApellido: data.datos.apellido ?? "",
          compradorDni: data.datos.dni ?? "",
          compradorTelefono: data.datos.telefono ?? "",
          compradorEmail: data.datos.email ?? "",
          entregaDireccion: data.datos.direccion ?? "",
          entregaPiso: data.datos.piso ?? "",
          entregaLocalidad: data.datos.localidad ?? "",
          entregaPartido: data.datos.partido ?? "",
          entregaProvincia: data.datos.provincia ?? "",
          entregaCodigoPostal: data.datos.codigoPostal ?? "",
          entregaEntreCalles: data.datos.entreCalles ?? "",
          observaciones: data.datos.observaciones ?? "",
          zonaId: "",
        });

        // Cargar zonas
        const zonasRes = await fetch("/api/zonas").then(r => r.json());
        setZonas(zonasRes);

      } catch {
        setError("Error de conexion. Intenta de nuevo.");
      }

      setProcesando(false);
    };
    reader.readAsDataURL(file);
  }

  async function guardar() {
    setGuardando(true);
    setError("");

    const body: any = {
      compradorNombre: form.compradorNombre,
      compradorApellido: form.compradorApellido,
      compradorDni: form.compradorDni,
      compradorTelefono: form.compradorTelefono,
      compradorEmail: form.compradorEmail || undefined,
      entregaDireccion: form.entregaDireccion,
      entregaPiso: form.entregaPiso || undefined,
      entregaLocalidad: form.entregaLocalidad,
      entregaPartido: form.entregaPartido || undefined,
      entregaProvincia: form.entregaProvincia || undefined,
      entregaCodigoPostal: form.entregaCodigoPostal || undefined,
      entregaEntreCalles: form.entregaEntreCalles || undefined,
      observaciones: form.observaciones || undefined,
      zonaId: form.zonaId || undefined,
    };

    const res = await fetch("/api/envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setGuardando(false);

    if (res.ok) {
      setMsg("Envio registrado correctamente.");
      setTimeout(() => router.push("/pdv/mis-envios"), 1500);
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar el envio.");
    }
  }

  function confianzaColor(c: number) {
    if (c >= 80) return "text-green-700 bg-green-50";
    if (c >= 50) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Escanear comprobante</h1>

      {!datos && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-500 mb-4">
            Toma una foto del comprobante PEDIDO/VENTA de E3. El sistema extrae
            automaticamente los datos del comprador.
          </p>

          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg object-contain"
              />
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-500">Toca para tomar foto o seleccionar imagen</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG hasta 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImagen}
            className="hidden"
          />

          {procesando && (
            <div className="mt-4 bg-amber-50 rounded-lg px-4 py-3 text-sm text-amber-700 text-center">
              Procesando imagen con OCR...
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      )}

      {datos && (
        <div>
          {/* Indicador de confianza */}
          <div className={`rounded-xl px-4 py-3 mb-4 flex items-center justify-between ${confianzaColor(datos.confianza)}`}>
            <div>
              <p className="text-sm font-medium">
                Confianza del OCR: {datos.confianza}%
              </p>
              <p className="text-xs mt-0.5">
                {datos.confianza >= 80
                  ? "Datos extraidos correctamente. Verifica antes de guardar."
                  : datos.confianza >= 50
                  ? "Algunos campos pueden necesitar correccion."
                  : "Imagen con baja calidad. Revisa todos los campos."}
              </p>
            </div>
            <button
              onClick={() => { setDatos(null); setPreview(null); setForm({}); }}
              className="text-xs underline ml-4"
            >
              Nueva foto
            </button>
          </div>

          {/* Formulario editable */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mb-4">
            <p className="text-xs font-medium text-gray-500">Verifica y corrige los datos:</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                <input value={form.compradorNombre ?? ""} onChange={e => set("compradorNombre", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Apellido *</label>
                <input value={form.compradorApellido ?? ""} onChange={e => set("compradorApellido", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">DNI *</label>
                <input value={form.compradorDni ?? ""} onChange={e => set("compradorDni", e.target.value)}
                  inputMode="numeric"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telefono *</label>
                <input value={form.compradorTelefono ?? ""} onChange={e => set("compradorTelefono", e.target.value)}
                  inputMode="tel"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input value={form.compradorEmail ?? ""} onChange={e => set("compradorEmail", e.target.value)}
                type="email"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Direccion *</label>
              <input value={form.entregaDireccion ?? ""} onChange={e => set("entregaDireccion", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Piso/Dpto</label>
                <input value={form.entregaPiso ?? ""} onChange={e => set("entregaPiso", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Localidad *</label>
                <input value={form.entregaLocalidad ?? ""} onChange={e => set("entregaLocalidad", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Partido</label>
                <input value={form.entregaPartido ?? ""} onChange={e => set("entregaPartido", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CP</label>
                <input value={form.entregaCodigoPostal ?? ""} onChange={e => set("entregaCodigoPostal", e.target.value)}
                  inputMode="numeric"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Zona
                {!form.zonaId && (form.entregaPartido || form.entregaCodigoPostal) && (
                  <span className="text-amber-600 ml-1">(se detecta automaticamente)</span>
                )}
              </label>
              <select value={form.zonaId ?? ""} onChange={e => set("zonaId", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                <option value="">Detectar automaticamente</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} ({z.slaHoras}hs) — ${z.costo.toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Observaciones</label>
              <textarea value={form.observaciones ?? ""} onChange={e => set("observaciones", e.target.value)}
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            {datos.pedidoExterno && (
              <p className="text-xs text-gray-400">
                Operacion E3: #{datos.pedidoExterno}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg px-4 py-3 text-sm text-red-600 mb-4">{error}</div>
          )}
          {msg && (
            <div className="bg-green-50 rounded-lg px-4 py-3 text-sm text-green-700 mb-4">{msg}</div>
          )}

          <button
            onClick={guardar}
            disabled={guardando || !form.compradorNombre || !form.compradorDni || !form.entregaDireccion}
            className="w-full bg-amber-700 text-white text-sm py-3 rounded-xl hover:bg-amber-800 disabled:opacity-50 font-medium"
          >
            {guardando ? "Guardando..." : "Confirmar y registrar envio"}
          </button>
        </div>
      )}
    </div>
  );
}