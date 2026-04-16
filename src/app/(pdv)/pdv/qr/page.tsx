"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface EnvioQR {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  localidad: string;
  zonaId?: string;
  zonaNombre?: string;
}

interface Zona { id: string; nombre: string; slaHoras: number; costo: number; }

export default function QRPage() {
  const router = useRouter();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [scanning, setScanning] = useState(false);
  const [envios, setEnvios] = useState<EnvioQR[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [zonaId, setZonaId] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/zonas").then(r => r.json()).then(setZonas);
  }, []);

  useEffect(() => {
    if (!scanning) return;

    let scanner: any;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decoded: string) => {
          procesarQR(decoded);
          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      ).catch((err: any) => {
        setError("No se pudo acceder a la camara. Verifica los permisos.");
        setScanning(false);
      });
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  function procesarQR(texto: string) {
    setError("");
    try {
      // Intentar parsear como JSON (formato propio)
      const data = JSON.parse(texto);

      // Si viene un array de envios
      if (Array.isArray(data)) {
        setEnvios(data);
        setMsg(`${data.length} envios detectados en el QR.`);
        return;
      }

      // Si viene un objeto unico
      if (data.nombre || data.apellido) {
        setEnvios([data]);
        setMsg("1 envio detectado en el QR.");
        return;
      }

      setError("El QR no contiene datos de envios reconocibles.");
    } catch {
      // No es JSON — podria ser una URL o texto plano
      if (texto.startsWith("http")) {
        // Es una URL — intentar cargarla como API
        fetch(texto)
          .then(r => r.json())
          .then(data => {
            const lista = Array.isArray(data) ? data : [data];
            setEnvios(lista);
            setMsg(`${lista.length} envios cargados desde URL del QR.`);
          })
          .catch(() => {
            setError("No se pudo obtener datos desde la URL del QR.");
          });
      } else {
        setError(`QR leido: "${texto.substring(0, 80)}..." — formato no reconocido.`);
      }
    }
  }

  function simularQR() {
    const ejemplo = [
      { nombre: "Juan", apellido: "Perez", dni: "28441220", telefono: "1145238812", direccion: "Av. Rivadavia 1234", localidad: "CABA" },
      { nombre: "Maria", apellido: "Garcia", dni: "33812009", telefono: "1144569921", direccion: "Corrientes 890", localidad: "Quilmes" },
    ];
    procesarQR(JSON.stringify(ejemplo));
  }

  function quitarEnvio(i: number) {
    setEnvios(prev => prev.filter((_, idx) => idx !== i));
  }

  async function guardarTodos() {
  // Verificar que todos tengan zona, si no pedir selección
  const sinZona = envios.filter(e => !e.zonaId);
  if (sinZona.length > 0 && !zonaId) {
    setError(`${sinZona.length} envio(s) sin zona. Selecciona una zona para aplicar a todos.`);
    return;
  }
  setGuardando(true);
  setError("");

  const rows = envios.map(e => ({
    nombre: e.nombre,
    apellido: e.apellido,
    dni: e.dni,
    telefono: e.telefono,
    direccion: e.direccion,
    localidad: e.localidad,
    // Usar zonaId del QR si existe, sino el seleccionado manualmente
    zonaId: e.zonaId ?? zonaId,
    zona: e.zonaNombre ?? zonas.find(z => z.id === zonaId)?.nombre ?? "",
  }));

  const res = await fetch("/api/envios/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });

  const data = await res.json();
  setGuardando(false);

  if (data.creados > 0) {
    setMsg(`${data.creados} envios registrados correctamente.`);
    setTimeout(() => router.push("/pdv/mis-envios"), 1500);
  }
  if (data.errores?.length > 0) {
    setError(`Errores: ${data.errores.join(", ")}`);
  }
}

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Leer QR de pedidos</h1>

      {/* Estado vacío — instrucciones */}
      {envios.length === 0 && !scanning && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center mb-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="#B8860B" strokeWidth="1.5"/>
              <rect x="18" y="2" width="12" height="12" rx="2" stroke="#B8860B" strokeWidth="1.5"/>
              <rect x="2" y="18" width="12" height="12" rx="2" stroke="#B8860B" strokeWidth="1.5"/>
              <rect x="5" y="5" width="6" height="6" rx="1" fill="#B8860B" opacity=".5"/>
              <rect x="21" y="5" width="6" height="6" rx="1" fill="#B8860B" opacity=".5"/>
              <rect x="5" y="21" width="6" height="6" rx="1" fill="#B8860B" opacity=".5"/>
              <path d="M22 18h4M26 18v4M22 22h4M28 26v2M24 28h4" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">Escanear QR de la tienda</p>
          <p className="text-xs text-gray-400 mb-4">
            Apunta la camara al codigo QR generado por la tienda de Racing Club
            para cargar automaticamente todos los pedidos del dia.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setScanning(true)}
              className="w-full bg-amber-700 text-white text-sm py-3 rounded-lg hover:bg-amber-800 font-medium"
            >
              Abrir camara y escanear
            </button>
            <button
              onClick={simularQR}
              className="w-full border border-gray-200 text-gray-500 text-xs py-2.5 rounded-lg hover:bg-gray-50"
            >
              Simular QR de prueba
            </button>
          </div>
        </div>
      )}

      {/* Scanner activo */}
      {scanning && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden" style={{ minHeight: 280 }} />
          <button
            onClick={() => setScanning(false)}
            className="w-full mt-3 border border-gray-200 text-gray-500 text-sm py-2.5 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Mensajes */}
      {msg && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-4">{msg}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>
      )}

      {/* Lista de envios detectados */}
      {envios.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {envios.length} envio{envios.length > 1 ? "s" : ""} para registrar
            </h2>
            <button
              onClick={() => { setEnvios([]); setMsg(""); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {envios.map((e, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{e.nombre} {e.apellido}</p>
                  <p className="text-xs text-gray-400">{e.direccion}, {e.localidad}</p>
                  <p className="text-xs text-gray-400">DNI: {e.dni} &mdash; Tel: {e.telefono}</p>
                </div>
                <button
                  onClick={() => quitarEnvio(i)}
                  className="text-xs text-red-400 hover:text-red-600 ml-2 mt-0.5 flex-shrink-0"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Zona para envios sin zona asignada (opcional si el QR ya la trae)
                  </label>
              <select
                value={zonaId}
                onChange={e => setZonaId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="">Seleccionar zona...</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} ({z.slaHoras}hs) - ${z.costo.toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={guardarTodos}
              disabled={guardando || !zonaId}
              className="w-full bg-amber-700 text-white text-sm py-3 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium"
            >
              {guardando ? "Registrando..." : `Registrar ${envios.length} envio${envios.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}