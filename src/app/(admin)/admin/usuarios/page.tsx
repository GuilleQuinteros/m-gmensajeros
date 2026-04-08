"use client";
import { useEffect, useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  pdv: "Punto de venta",
  transportista: "Transportista",
};

interface PDV { id: string; nombre: string; }
interface User {
  id: string; fullName: string; email: string;
  role: string; isActive: boolean;
  pdv: { id: string; nombre: string } | null;
}

const EMPTY_FORM = {
  fullName: "", email: "", password: "",
  role: "transportista", pdvId: "", isActive: true,
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pdvs, setPdvs] = useState<PDV[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/usuarios").then(r => r.json()),
      fetch("/api/pdv").then(r => r.json()),
    ]).then(([u, p]) => {
      setUsers(u);
      setPdvs(p);
      setLoading(false);
    });
  }, []);

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function abrirNuevo() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setModal("nuevo");
  }

  function abrirEditar(u: User) {
    setForm({
      fullName: u.fullName,
      email: u.email,
      password: "",
      role: u.role,
      pdvId: u.pdv?.id ?? "",
      isActive: u.isActive,
    });
    setEditId(u.id);
    setModal("editar");
  }

  async function guardar() {
    setSaving(true);
    const body: any = {
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      pdvId: form.pdvId || undefined,
      isActive: form.isActive,
    };
    if (form.password) body.password = form.password;

    const res = await fetch(
      modal === "editar" ? `/api/usuarios/${editId}` : "/api/usuarios",
      {
        method: modal === "editar" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const updated = await fetch("/api/usuarios").then(r => r.json());
      setUsers(updated);
      setModal(null);
      setMsg(modal === "editar" ? "Usuario actualizado." : "Usuario creado.");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  }

  async function toggleActivo(u: User) {
    await fetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
  }

  if (loading) return <div className="text-sm text-gray-400 p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <button onClick={abrirNuevo} className="bg-amber-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-800">
          + Nuevo usuario
        </button>
      </div>

      {msg && <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{msg}</div>}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Nombre","Email","Rol","PDV","Estado","Acciones"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{u.fullName}</td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{u.pdv?.nombre ?? "—"}</td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleActivo(u)}
                    className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${
                      u.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => abrirEditar(u)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-medium">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-semibold mb-5">
              {modal === "nuevo" ? "Nuevo usuario" : "Editar usuario"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {modal === "editar" ? "Nueva contrasena (dejar vacio para no cambiar)" : "Contrasena"}
                </label>
                <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rol</label>
                <select value={form.role} onChange={e => set("role", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="admin">Admin</option>
                  <option value="pdv">Punto de venta</option>
                  <option value="transportista">Transportista</option>
                </select>
              </div>
              {form.role === "pdv" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Punto de venta</label>
                  <select value={form.pdvId} onChange={e => set("pdvId", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="">Seleccionar PDV...</option>
                    {pdvs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              )}
              {modal === "editar" && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive}
                    onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  <label htmlFor="isActive" className="text-sm text-gray-600">Usuario activo</label>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={guardar} disabled={saving}
                className="flex-1 bg-amber-700 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}