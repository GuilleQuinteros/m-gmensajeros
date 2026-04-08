import { prisma } from "@/lib/prisma";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar", en_deposito: "En depósito",
  en_camino: "En camino", entregado: "Entregado",
  observacion: "Observación", cancelado: "Cancelado",
};

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: { estado?: string; zona?: string };
}) {
  const where: any = {};
  if (searchParams.estado) where.estado = searchParams.estado;
  if (searchParams.zona) where.zonaId = searchParams.zona;

  const [envios, zonas] = await Promise.all([
    prisma.envio.findMany({
      where,
      include: { zona: true, pdv: true, transportista: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.zona.findMany({ where: { isActive: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Envíos</h1>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <form className="flex gap-3 flex-wrap">
            <select name="estado" defaultValue={searchParams.estado || ""} className="w-44">
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select name="zona" defaultValue={searchParams.zona || ""} className="w-44">
              <option value="">Todas las zonas</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary">Filtrar</button>
            <Link href="/admin/envios" className="btn-secondary">Limpiar</Link>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Nro.</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Comprador</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">DNI</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Zona</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Transportista</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Estado</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {envios.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-amber-700">{e.numeroEnvio}</td>
                  <td className="py-2.5 px-3">{e.compradorNombre} {e.compradorApellido}</td>
                  <td className="py-2.5 px-3 text-gray-500">{e.compradorDni}</td>
                  <td className="py-2.5 px-3 text-gray-500">{e.zona.nombre}</td>
                  <td className="py-2.5 px-3 text-gray-500">{e.transportista?.fullName ?? "—"}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge-${e.estado}`}>{ESTADO_LABEL[e.estado]}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link href={`/admin/envios/${e.id}`} className="text-amber-700 hover:underline text-xs">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {envios.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No hay envíos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
