import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userName={session.user?.name ?? ""} />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}