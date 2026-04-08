import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const role = (session.user as any).role;

  if (role === "admin") redirect("/admin/dashboard");
  if (role === "pdv") redirect("/pdv/mis-envios");
  if (role === "transportista") redirect("/trans/mis-envios");

  redirect("/auth/login");
}