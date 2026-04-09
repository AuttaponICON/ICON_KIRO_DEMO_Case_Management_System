"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface LogItem {
  id: number; timestamp: string; username: string; success: boolean;
  ip: string; userAgent: string; reason: string | null;
}

export default function LoginLogsPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filterSuccess, setFilterSuccess] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const load = useCallback(() => { fetch("/api/logs/login").then((r) => r.json()).then(setLogs); }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) => {
    if (filterSuccess === "true" && !l.success) return false;
    if (filterSuccess === "false" && l.success) return false;
    if (filterUser && !l.username.toLowerCase().includes(filterUser.toLowerCase())) return false;
    return true;
  });

  const successCount = logs.filter((l) => l.success).length;
  const failCount = logs.filter((l) => !l.success).length;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("logs.loginTitle")}</h2>
        <p className="text-sm text-slate-500">{t("logs.loginSubtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold">{logs.length}</div>
          <div className="text-xs text-slate-500">{t("logs.totalAttempts")}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-xs text-slate-500">{t("logs.success")}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{failCount}</div>
          <div className="text-xs text-slate-500">{t("logs.failed")}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input value={filterUser} onChange={(e) => setFilterUser(e.target.value)} placeholder={t("logs.filterUser")} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-48" />
        <select value={filterSuccess} onChange={(e) => setFilterSuccess(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
          <option value="">{t("logs.allStatus")}</option>
          <option value="true">✅ {t("logs.success")}</option>
          <option value="false">❌ {t("logs.failed")}</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} {t("search.results")}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase">
              <th className="pb-3 pr-3">{t("logs.time")}</th><th className="pb-3 pr-3">{t("admin.username")}</th>
              <th className="pb-3 pr-3">{t("logs.result")}</th><th className="pb-3 pr-3">IP</th>
              <th className="pb-3 pr-3">User Agent</th><th className="pb-3">{t("logs.reason")}</th>
            </tr></thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className={`border-t border-slate-100 ${!l.success ? "bg-red-50" : ""}`}>
                  <td className="py-2 pr-3 text-xs">{new Date(l.timestamp).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" })}</td>
                  <td className="py-2 pr-3 font-medium">{l.username}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${l.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {l.success ? `✅ ${t("logs.success")}` : `❌ ${t("logs.failed")}`}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{l.ip}</td>
                  <td className="py-2 pr-3 text-xs max-w-[200px] truncate">{l.userAgent}</td>
                  <td className="py-2 text-xs text-red-600">{l.reason || "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">{t("logs.noLogs")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
