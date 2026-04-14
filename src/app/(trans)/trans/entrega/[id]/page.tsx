"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Envio {
  id: string; numeroEnvio: string;
  compradorNombre: string; compradorApellido: string;
  compradorTelefono: string;
  entregaDireccion: string; entregaLocalidad: string;
  estado: string; dniVerificadoAt: string | null;
  zona: { nombre: string; slaHoras: number };
}

export default function EntregaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [dniInput, setDniInput] = useState("");
  const [dniOk, setDniOk] = useState(false);
  const [dniError, setDniError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [scanMode, setScanMode] = useState<"manual" | "camara">("manual");
  
  useEffect(() => {
    fetch(`/api/envios/${id}`).then(r => r.json()).then(data => {
      setEnvio(data);
      if (data.dniVerificadoAt) setDniOk(true);
    });
  }, [id]);

  // Iniciar scanner de barcode/QR para DNI
  useEffect(() => {
    if (scanMode !== "camara") return;
    let scanner: any;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode("dni-scanner");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 120 } },
        (decodedText: string) => {
          // DNI argentino PDF417: campo 1 contiene el numero
          // Formato: "00@APELLIDO@NOMBRE@M@DNI@..."
          const partes = decodedText.split("@");
          const dni = partes.length >= 5 ? partes[4] : decodedText.replace(/\D/g, "");
          setDniInput(dni);
          setScanMode("manual");
          scanner.stop().catch(() => {});
        },
        () => {}
      ).catch(() => setScanMode("manual"));
    });
    return () => { if (scanner) scanner.stop().catch(() => {}); };
  }, [scanMode]);
  

  async function verificarDni() {
    setLoading(true);
    setDniError("");
    const res = await fetch(`/api/envios/${id}/verificar-dni`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dniEscaneado: dniInput }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.verificado) { setDniOk(true); setDniError(""); }
    else setDniError(data.error || "DNI no coincide.");
  }

  async function confirmar(estado: "entregado" | "observacion") {
    if (estado === "entregado" && !dniOk) {
      setMsg("Primero verifica el DNI del receptor.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/envios/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado,
        nota: estado === "observacion" ? "Sin respuesta / ausente" : "Entrega confirmada con DNI verificado",
      }),
    });
    setLoading(false);
    if (res.ok) router.push("/trans/mis-envios");
    else setMsg("Error al confirmar. Intenta de nuevo.");
  }

  function abrirWhatsApp() {
    if (!envio) return;
    const tel = envio.compradorTelefono.replace(/\D/g, "");
    const numero = tel.startsWith("54") ? tel : `549${tel}`;
    window.open(`https://wa.me/${numero}`, "_blank");
  }

  

  if (!envio) return <div className="text-center py-10 text-sm text-gray-400">Cargando...</div>;


  return (
    <div>
      <button onClick={() => router.back()}
        className="text-sm text-gray-400 mb-4 flex items-center gap-1">
        ← Volver
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold">{envio.numeroEnvio}</h1>
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
          {envio.zona.nombre}
        </span>
      </div>

      {/* Datos de entrega */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-3">
        <p className="text-xs font-medium text-amber-700 mb-1">Direccion de entrega</p>
        <p className="font-semibold text-amber-900">{envio.entregaDireccion}</p>
        <p className="text-sm text-amber-700">{envio.entregaLocalidad}</p>
      </div>

      {/* Datos del receptor */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <p className="text-xs font-medium text-gray-500 mb-3">Datos del receptor</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nombre</span>
            <span className="font-medium">{envio.compradorNombre} {envio.compradorApellido}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Telefono</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{envio.compradorTelefono}</span>
              <button onClick={abrirWhatsApp}
                className="flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-lg hover:bg-green-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verificacion DNI */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-3">Verificar identidad del receptor</p>
        {dniOk ? (
          <div className="bg-green-50 rounded-lg px-3 py-2.5 text-sm text-green-700 font-medium flex items-center gap-2">
            <span className="text-green-500">✓</span> DNI verificado correctamente
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={dniInput}
                onChange={e => setDniInput(e.target.value)}
                placeholder="Numero de DNI"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => setScanMode(scanMode === "camara" ? "manual" : "camara")}
                className="bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-200 whitespace-nowrap"
              >
                {scanMode === "camara" ? "Cancelar" : "Escanear"}
              </button>
            </div>
            {scanMode === "camara" && (
              <div>
                <div id="dni-scanner" className="w-full rounded-lg overflow-hidden" style={{ minHeight: 160 }} />
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Apunta al codigo de barras del DNI argentino
                </p>
              </div>
            )}
            {dniError && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{dniError}</p>
            )}
            <button onClick={verificarDni} disabled={loading || !dniInput}
              className="w-full bg-gray-800 text-white text-sm py-2.5 rounded-lg hover:bg-gray-900 disabled:opacity-50">
              {loading ? "Verificando..." : "Verificar DNI"}
            </button>
          </div>
        )}
      </div>

      {msg && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{msg}</p>
      )}

      <div className="space-y-3">
        <button onClick={() => confirmar("entregado")} disabled={loading || !dniOk}
          className="w-full bg-green-700 text-white font-medium py-3 rounded-xl hover:bg-green-800 disabled:opacity-50 text-sm">
          {loading ? "Confirmando..." : "Confirmar entrega"}
        </button>
        <button onClick={() => confirmar("observacion")} disabled={loading}
          className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm">
          Sin respuesta / Ausente
        </button>
      </div>
    </div>
  );
}