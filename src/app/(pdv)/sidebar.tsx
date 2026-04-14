"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/pdv/mis-envios",  label: "Mis envios" },
  { href: "/pdv/nuevo",       label: "Cargar" },
  { href: "/pdv/qr",          label: "Leer QR" },
  { href: "/pdv/masivo",      label: "Masivo" },
];

export function PdvNav({ pdvName, userName }: { pdvName: string; userName: string }) {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-bold text-amber-700 text-sm">M&G Mensajeros</p>
            <p className="text-xs text-gray-400">{pdvName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-xs text-red-500 hover:text-red-700 py-1 px-2"
          >
            Salir
          </button>
        </div>
        <nav className="flex border-t border-gray-100">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-2.5 text-xs font-medium border-b-2 transition-colors ${
                pathname.startsWith(item.href)
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}