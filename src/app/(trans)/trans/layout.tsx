import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { TransHeader } from "./header";

export default async function TransLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "transportista") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TransHeader userName={session.user?.name ?? ""} />
      <main className="p-4 max-w-lg mx-auto">{children}</main>
    </div>
  );
}