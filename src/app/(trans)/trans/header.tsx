"use client";
import { signOut } from "next-auth/react";

export function TransHeader({ userName }: { userName: string }) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="font-bold text-amber-700 text-sm">M&G Mensajeros</p>
        <p className="text-xs text-gray-400">{userName}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="text-xs text-red-500"
      >
        Salir
      </button>
    </header>
  );
}