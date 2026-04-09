"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface UserItem { id: number; username: string; name: string; roleId: number; roleName: string; active: boolean; }
interface RoleItem { id: number; name: string; label: string; }

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState({ username: "", name: "", password: "", roleId: 1 });

  const load = useCallback(() => { fetch("/api/users").then((r) => r.json()).then(setUsers); fetch("/api/roles").then((r) => r.json()).then(setRoles); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (editing) { await fetch(`/api/users/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    else { await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    setModalOpen(false); setEditing(null); load();
  };
  const handleDelete = async (id: number) => { if (!confirm(t("admin.deleteConfirmUser"))) return; await fetch(`/api/users/${id}`, { method: "DELETE" }); load(); };
  const openEdit = (u: UserItem) => { setEditing(u); setForm({ username: u.username, name: u.name, password: "", roleId: u.roleId }); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ username: "", name: "", password: "1234", roleId: roles[0]?.id || 1 }); setModalOpen(true); };

  return (
    <>
      <div className="mb-6"><h2 className="text-xl font-bold">{t("admin.usersTitle")}</h2><p className="text-sm text-slate-500">{t("admin.usersSubtitle")}</p></div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{t("admin.allUsers")}</h3>
          <button onClick={openCreate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("admin.addUser")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase"><th className="pb-3 pr-4">{t("admin.username")}</th><th className="pb-3 pr-4">{t("admin.name")}</th><th className="pb-3 pr-4">{t("admin.role")}</th><th className="pb-3 pr-4">{t("admin.statusLabel")}</th><th className="pb-3">{t("table.actions")}</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{u.username}</td><td className="py-3 pr-4">{u.name}</td>
                  <td className="py-3 pr-4"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{u.roleName}</span></td>
                  <td className="py-3 pr-4">{u.active ? <span className="text-green-600">✓ {t("admin.active")}</span> : <span className="text-slate-400">{t("admin.inactive")}</span>}</td>
                  <td className="py-3 flex gap-1">
                    <button onClick={() => openEdit(u)} className="px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50">{t("action.edit")}</button>
                    <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">{t("action.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">{editing ? t("admin.editUser") : t("admin.createUser")}</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold mb-1">{t("admin.username")}</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!editing} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50" /></div>
              <div><label className="block text-sm font-semibold mb-1">{t("admin.name")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold mb-1">{t("login.password")} {editing && t("admin.passwordHint")}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold mb-1">{t("admin.role")}</label><select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">{t("action.close")}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">{t("action.save")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
