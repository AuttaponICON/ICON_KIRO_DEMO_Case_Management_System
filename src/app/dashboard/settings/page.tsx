"use client";

import { useState } from "react";
import { useI18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-indigo-600" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("settings.title")}</h2>
        <p className="text-sm text-slate-500">{t("settings.subtitle")}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-6">
        <div>
          <h4 className="font-semibold mb-3">{t("settings.notifications")}</h4>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">{t("settings.emailNotif")}</div><div className="text-xs text-slate-500">{t("settings.emailNotifDesc")}</div></div>
              <Toggle />
            </div>
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">{t("settings.systemNotif")}</div><div className="text-xs text-slate-500">{t("settings.systemNotifDesc")}</div></div>
              <Toggle />
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("settings.general")}</h4>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">{t("settings.language")}</div><div className="text-xs text-slate-500">{t("settings.languageDesc")}</div></div>
              <select value={lang} onChange={(e) => setLang(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                {SUPPORTED_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">{t("settings.pageSize")}</div><div className="text-xs text-slate-500">{t("settings.pageSizeDesc")}</div></div>
              <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"><option>10</option><option>25</option><option>50</option></select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
