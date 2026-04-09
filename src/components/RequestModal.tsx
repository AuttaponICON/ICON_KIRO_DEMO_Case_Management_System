"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface RequestData {
  id?: number; title: string; location: string; category: string; detail: string;
}

interface Props {
  open: boolean; initial?: RequestData | null; onClose: () => void; onSave: (data: RequestData) => void;
}

const categories = ["ELECTRICAL", "PLUMBING", "AC", "BUILDING", "OTHER"];

export default function RequestModal({ open, initial, onClose, onSave }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<RequestData>({ title: "", location: "", category: "ELECTRICAL", detail: "" });

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: "", location: "", category: "ELECTRICAL", detail: "" });
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{initial?.id ? t("modal.editTitle") : t("modal.createTitle")}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">{t("modal.repairItem")}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("modal.repairItemPlaceholder")} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("table.location")}</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={t("modal.locationPlaceholder")} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("table.category")}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              {categories.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("modal.detailLabel")}</label>
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={3} placeholder={t("modal.detailPlaceholder")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("action.close")}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("action.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
