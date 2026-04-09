"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import PermissionTree from "@/components/PermissionTree";

interface RoleItem { id: number; name: string; label: string; permissions: string[]; }

export default function RolesPage() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [form, setForm] = useState({ name: "", label: "", permissions: [] as string[] });
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(() => { fetch("/api/roles").then((r) => r.json()).then(setRoles); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (editing) { await fetch(`/api/roles/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    else { await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    setModalOpen(false); setEditing(null); load();
  };
  const handleDelete = async (id: number) => { if (!confirm(t("admin.deleteConfirmRole"))) return; await fetch(`/api/roles/${id}`, { method: "DELETE" }); load(); };
  const openEdit = (r: RoleItem) => { setEditing(r); setForm({ name: r.name, label: r.label, permissions: [...r.permissions] }); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ name: "", label: "", permissions: [] }); setModalOpen(true); };

  return (
    <>
      <div className="mb-6"><h2 className="text-xl font-bold">{t("admin.rolesTitle")}</h2><p className="text-sm text-slate-500">{t("admin.rolesSubtitle")}</p></div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{t("admin.allRoles")}</h3>
          <button onClick={openCreate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("admin.addRole")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase"><th className="pb-3 pr-4">{t("admin.name")}</th><th className="pb-3 pr-4">Label</th><th className="pb-3 pr-4">{t("admin.permissions")}</th><th className="pb-3">{t("table.actions")}</th></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4 font-mono text-xs">{r.name}</td><td className="py-3 pr-4">{r.label}</td>
                  <td className="py-3 pr-4"><div className="flex flex-wrap gap-1">{r.permissions.map((p) => <span key={p} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{t(`permLabel.${p}`)}</span>)}</div></td>
                  <td className="py-3 flex gap-1">
                    <button onClick={() => openEdit(r)} className="px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50">{t("action.edit")}</button>
                    <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">{t("action.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editing ? t("admin.editRole") : t("admin.createRole")}</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold mb-1">{t("admin.roleKey")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!!editing} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono disabled:bg-slate-50" placeholder={t("admin.roleKeyPlaceholder")} /></div>
              <div><label className="block text-sm font-semibold mb-1">{t("admin.roleLabel")}</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={t("admin.roleLabelPlaceholder")} /></div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t("admin.permissions")}</label>
                <PermissionTree selected={form.permissions} onChange={(perms) => setForm({ ...form, permissions: perms })} />
              </div>
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
