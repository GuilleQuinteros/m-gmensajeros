"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE — header con hamburguesa */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-bold text-amber-700 text-sm">M&G Mensajeros</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </header>

      {/* MOBILE — menu desplegable */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-gray-100 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <nav className="py-2">
              {NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-5 py-3 text-sm transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-amber-50 text-amber-800 font-medium border-l-2 border-amber-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500 truncate">{userName}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP — sidebar fijo */}
      <aside className="hidden md:flex w-52 flex-shrink-0 bg-white border-r border-gray-100 flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <p className="font-bold text-amber-700 text-sm">M&G Mensajeros</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(item => (
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
    </>
  );
}