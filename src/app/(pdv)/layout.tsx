import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { PdvNav } from "./sidebar";

export default async function PdvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "pdv") {
    redirect("/auth/login");
  }

  const pdvName = (session.user as any).pdvName ?? "Punto de venta";
  const userName = session.user?.name ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <PdvNav pdvName={pdvName} userName={userName} />
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}