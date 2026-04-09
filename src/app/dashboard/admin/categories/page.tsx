"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface SubCat { id: number; name: string; slaDays: number; }
interface CatConfig { id: number; key: string; name: string; icon: string; subCategories: SubCat[]; }

export default function CategoriesPage() {
  const { t } = useI18n();
  const [cats, setCats] = useState<CatConfig[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [modalType, setModalType] = useState<"cat" | "sub" | null>(null);
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [editSubId, setEditSubId] = useState<number | null>(null);
  const [form, setForm] = useState({ key: "", name: "", icon: "📦", slaDays: 3, categoryId: 0 });

  const load = useCallback(() => { fetch("/api/categories").then((r) => r.json()).then(setCats); }, []);
  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id: number) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const openAddCat = () => { setModalType("cat"); setEditCatId(null); setForm({ key: "", name: "", icon: "📦", slaDays: 3, categoryId: 0 }); };
  const openEditCat = (c: CatConfig) => { setModalType("cat"); setEditCatId(c.id); setForm({ key: c.key, name: c.name, icon: c.icon, slaDays: 3, categoryId: 0 }); };
  const openAddSub = (catId: number) => { setModalType("sub"); setEditSubId(null); setForm({ key: "", name: "", icon: "", slaDays: 3, categoryId: catId }); };
  const openEditSub = (sub: SubCat, catId: number) => { setModalType("sub"); setEditSubId(sub.id); setForm({ key: "", name: sub.name, icon: "", slaDays: sub.slaDays, categoryId: catId }); };

  const handleSave = async () => {
    if (modalType === "cat") {
      if (editCatId) {
        await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "category", id: editCatId, name: form.name, icon: form.icon }) });
      } else {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "category", key: form.key, name: form.name, icon: form.icon }) });
      }
    } else {
      if (editSubId) {
        await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "subCategory", id: editSubId, name: form.name, slaDays: form.slaDays }) });
      } else {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "subCategory", categoryId: form.categoryId, name: form.name, slaDays: form.slaDays }) });
      }
    }
    setModalType(null); load();
  };

  const handleDeleteSub = async (id: number) => {
    if (!confirm(t("admin.deleteConfirmRole"))) return;
    await fetch(`/api/categories?type=subCategory&id=${id}`, { method: "DELETE" }); load();
  };

  const handleDeleteCat = async (id: number) => {
    if (!confirm(t("admin.deleteConfirmRole"))) return;
    await fetch(`/api/categories?type=category&id=${id}`, { method: "DELETE" }); load();
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("catConfig.title")}</h2>
        <p className="text-sm text-slate-500">{t("catConfig.subtitle")}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{t("catConfig.allCategories")}</h3>
          <button onClick={openAddCat} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("catConfig.addCategory")}</button>
        </div>
        <div className="space-y-2">
          {cats.map((cat) => (
            <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100" onClick={() => toggleExpand(cat.id)}>
                <span className="text-xs text-slate-400">{expanded[cat.id] ? "▼" : "▶"}</span>
                <span className="text-lg">{cat.icon}</span>
                <span className="font-semibold text-sm">{cat.name}</span>
                <span className="text-xs text-slate-400 font-mono">({cat.key})</span>
                <span className="text-xs text-slate-400 ml-auto">{cat.subCategories.length} {t("catConfig.subItems")}</span>
                <button onClick={(e) => { e.stopPropagation(); openEditCat(cat); }} className="px-2 py-0.5 border border-slate-200 rounded text-xs hover:bg-white">{t("action.edit")}</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }} className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">{t("action.delete")}</button>
              </div>
              {expanded[cat.id] && (
                <div className="px-4 py-2">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-slate-500"><th className="pb-2 pr-3">{t("catConfig.subName")}</th><th className="pb-2 pr-3">SLA ({t("dashboard.days")})</th><th className="pb-2"></th></tr></thead>
                    <tbody>
                      {cat.subCategories.map((sub) => (
                        <tr key={sub.id} className="border-t border-slate-100">
                          <td className="py-2 pr-3">{sub.name}</td>
                          <td className="py-2 pr-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{sub.slaDays} {t("dashboard.days")}</span></td>
                          <td className="py-2 flex gap-1 justify-end">
                            <button onClick={() => openEditSub(sub, cat.id)} className="px-2 py-0.5 border border-slate-200 rounded text-xs hover:bg-slate-50">{t("action.edit")}</button>
                            <button onClick={() => handleDeleteSub(sub.id)} className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">{t("action.delete")}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => openAddSub(cat.id)} className="mt-2 px-3 py-1 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 w-full">+ {t("catConfig.addSub")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">{modalType === "cat" ? (editCatId ? t("catConfig.editCategory") : t("catConfig.addCategory")) : (editSubId ? t("catConfig.editSub") : t("catConfig.addSub"))}</h3>
            <div className="space-y-3">
              {modalType === "cat" && !editCatId && (
                <div><label className="block text-sm font-semibold mb-1">Key</label><input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" placeholder="NETWORK" /></div>
              )}
              <div><label className="block text-sm font-semibold mb-1">{t("admin.name")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              {modalType === "cat" && (
                <div><label className="block text-sm font-semibold mb-1">Icon</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              )}
              {modalType === "sub" && (
                <div><label className="block text-sm font-semibold mb-1">SLA ({t("dashboard.days")})</label><input type="number" min={1} value={form.slaDays} onChange={(e) => setForm({ ...form, slaDays: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setModalType(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">{t("action.close")}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">{t("action.save")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
