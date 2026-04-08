import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

const ESTADO_COLOR: Record<string, string> = {
  en_camino: "bg-amber-50 text-amber-700", entregado: "bg-green-50 text-green-700",
  observacion: "bg-red-50 text-red-700", en_deposito: "bg-teal-50 text-teal-700",
  a_retirar: "bg-purple-50 text-purple-700",
};
const ESTADO_LABEL: Record<string, string> = {
  a_retirar: "A retirar", en_deposito: "En depósito", en_camino: "En camino",
  entregado: "Entregado", observacion: "Sin respuesta",
};

export default async function TransEnviosPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "transportista") redirect("/auth/login");

  const userId = (session.user as any).id;
  const envios = await prisma.envio.findMany({
    where: { transportistaId: userId, estado: { in: ["en_camino", "en_deposito"] } },
    include: { zona: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-base font-semibold mb-4">Envíos asignados</h1>
      <div className="space-y-3">
        {envios.map(e => (
          <Link key={e.id} href={`/trans/entrega/${e.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{e.numeroEnvio}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.compradorNombre} {e.compradorApellido}</p>
                <p className="text-xs text-gray-500">{e.entregaDireccion}, {e.entregaLocalidad}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[e.estado] ?? ""}`}>
                {ESTADO_LABEL[e.estado]}
              </span>
            </div>
          </Link>
        ))}
        {envios.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            No tenés envíos asignados para hoy.
          </div>
        )}
      </div>
    </div>
  );
}
