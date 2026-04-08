"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/envios", label: "Envios" },
  { href: "/admin/zonas", label: "Zonas y costos" },
  { href: "/admin/alertas", label: "Alertas WA" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/reportes", label: "Reportes" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <p className="font-bold text-amber-700 text-sm">M&G Mensajeros</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-amber-50 text-amber-800 font-medium border-r-2 border-amber-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2 truncate">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}