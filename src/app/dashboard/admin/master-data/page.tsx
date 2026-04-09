"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface SubItem { id: number; name: string; }
interface MasterItem { id: number; name: string; children: SubItem[]; }

export default function MasterDataPage() {
  const { t } = useI18n();
  const [locations, setLocations] = useState<MasterItem[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [modalType, setModalType] = useState<"parent" | "child" | null>(null);
  const [parentId, setParentId] = useState(0);
  const [name, setName] = useState("");

  const load = useCallback(() => { fetch("/api/master/locations").then((r) => r.json()).then(setLocations); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!name) return;
    if (modalType === "parent") {
      await fetch("/api/master/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "parent", name }) });
    } else {
      await fetch("/api/master/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "child", parentId, name }) });
    }
    setModalType(null); setName(""); load();
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("ลบรายการนี้?")) return;
    await fetch(`/api/master/locations?type=${type}&id=${id}`, { method: "DELETE" }); load();
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("masterData.title")}</h2>
        <p className="text-sm text-slate-500">{t("masterData.subtitle")}</p>
      </div>

      {/* Locations */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">📍 {t("masterData.locations")}</h3>
          <button onClick={() => { setModalType("parent"); setName(""); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">+ {t("masterData.addGroup")}</button>
        </div>
        <div className="space-y-2">
          {locations.map((loc) => (
            <div key={loc.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100" onClick={() => setExpanded((p) => ({ ...p, [loc.id]: !p[loc.id] }))}>
                <span className="text-xs text-slate-400">{expanded[loc.id] ? "▼" : "▶"}</span>
                <span className="font-semibold text-sm">{loc.name}</span>
                <span className="text-xs text-slate-400 ml-auto">{loc.children.length} {t("catConfig.subItems")}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete("parent", loc.id); }} className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">{t("action.delete")}</button>
              </div>
              {expanded[loc.id] && (
                <div className="px-4 py-2 space-y-1">
                  {loc.children.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 pl-6 text-sm">
                      <span>{c.name}</span>
                      <button onClick={() => handleDelete("child", c.id)} className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">{t("action.delete")}</button>
                    </div>
                  ))}
                  <button onClick={() => { setModalType("child"); setParentId(loc.id); setName(""); }}
                    className="mt-1 px-3 py-1 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 w-full">+ {t("masterData.addItem")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">{modalType === "parent" ? t("masterData.addGroup") : t("masterData.addItem")}</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold mb-1">{t("admin.name")}</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" autoFocus /></div>
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
