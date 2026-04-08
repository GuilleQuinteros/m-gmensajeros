import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

async function getMetrics() {
  const [total, aRetirar, enDeposito, enCamino, entregados, observacion] =
    await Promise.all([
      prisma.envio.count(),
      prisma.envio.count({ where: { estado: "a_retirar" } }),
      prisma.envio.count({ where: { estado: "en_deposito" } }),
      prisma.envio.count({ where: { estado: "en_camino" } }),
      prisma.envio.count({ where: { estado: "entregado" } }),
      prisma.envio.count({ where: { estado: "observacion" } }),
    ]);
  const recientes = await prisma.envio.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { zona: true, pdv: true },
  });
  return { total, aRetirar, enDeposito, enCamino, entregados, observacion, recientes };
}

const ESTADO_LABEL: Record<string, string> = {
  a_retirar:   "A retirar",
  en_deposito: "En deposito",
  en_camino:   "En camino",
  entregado:   "Entregado",
  observacion: "Observacion",
  cancelado:   "Cancelado",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  if ((session.user as any).role !== "admin") redirect("/auth/login");

  const m = await getMetrics();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total",       value: m.total,       color: "text-gray-800"   },
          { label: "A retirar",   value: m.aRetirar,    color: "text-purple-700" },
          { label: "En deposito", value: m.enDeposito,  color: "text-teal-700"   },
          { label: "En camino",   value: m.enCamino,    color: "text-amber-700"  },
          { label: "Entregados",  value: m.entregados,  color: "text-green-700"  },
          { label: "Observacion", value: m.observacion, color: "text-red-700"    },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">Ultimos envios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Nro.</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Comprador</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Zona</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">PDV</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Estado</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {m.recientes.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-amber-700">{e.numeroEnvio}</td>
                  <td className="py-2.5 px-3">{e.compradorNombre} {e.compradorApellido}</td>
                  <td className="py-2.5 px-3 text-gray-500">{e.zona.nombre}</td>
                  <td className="py-2.5 px-3 text-gray-500">{e.pdv.nombre}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge-${e.estado}`}>{ESTADO_LABEL[e.estado]}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}