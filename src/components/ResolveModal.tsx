"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Props { open: boolean; onClose: () => void; onResolve: (rootCause: string, resolution: string) => void; }

export default function ResolveModal({ open, onClose, onResolve }: Props) {
  const { t } = useI18n();
  const [rootCause, setRootCause] = useState("");
  const [resolution, setResolution] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">{t("modal.resolveTitle")}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">{t("modal.rootCause")}</label>
            <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} rows={2} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={t("modal.rootCausePlaceholder")} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("modal.resolution")}</label>
            <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={t("modal.resolutionPlaceholder")} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("action.close")}</button>
            <button onClick={() => { if (rootCause && resolution) { onResolve(rootCause, resolution); onClose(); } }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">{t("modal.submitResolve")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
