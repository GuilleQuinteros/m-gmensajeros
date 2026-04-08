import Link from "next/link";

export default function NoAutorizadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sin permisos</h1>
        <p className="text-gray-500 mb-6">No tenés acceso a esta sección.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
}
