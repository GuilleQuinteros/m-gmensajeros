"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (status !== "authenticated" || !session) return;
  const role = (session.user as any).role;
  if (role === "admin") router.replace("/admin/dashboard");
  else if (role === "pdv") router.replace("/pdv/mis-envios");
  else if (role === "transportista") router.replace("/trans/mis-envios");
}, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Email o contrasena incorrectos.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-700">M&G Mensajeros</h1>
          <p className="text-gray-500 text-sm mt-1">Logistica & Mensajeria</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Iniciar sesion
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Sistema de gestion logistica v1.0
        </p>
      </div>
    </div>
  );
}