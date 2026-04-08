import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { PdvSidebar } from "./sidebar";

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
    <div className="flex h-screen overflow-hidden">
      <PdvSidebar pdvName={pdvName} userName={userName} />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}