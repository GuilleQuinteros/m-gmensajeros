import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar", en_deposito: "En depósito",
  en_camino: "En camino", entregado: "Entregado",
  observacion: "Observación", cancelado: "Cancelado",
};
const ESTADO_COLOR: Record<string, string> = {
  a_retirar: "bg-purple-50 text-purple-700", en_deposito: "bg-teal-50 text-teal-700",
  en_camino: "bg-amber-50 text-amber-700", entregado: "bg-green-50 text-green-700",
  observacion: "bg-red-50 text-red-700", cancelado: "bg-gray-100 text-gray-500",
};

export default async function MisEnviosPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "pdv") redirect("/auth/login");

  const pdvId = (session.user as any).pdvId;
  const envios = await prisma.envio.findMany({
    where: { pdvId },
    include: { zona: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Mis envíos</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Nro.","Comprador","Zona","Estado","Fecha"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {envios.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-amber-700">{e.numeroEnvio}</td>
                <td className="py-3 px-4">{e.compradorNombre} {e.compradorApellido}</td>
                <td className="py-3 px-4 text-gray-500">{e.zona.nombre}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[e.estado]}`}>
                    {ESTADO_LABEL[e.estado]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(e.createdAt).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
            {envios.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">No hay envíos cargados aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
