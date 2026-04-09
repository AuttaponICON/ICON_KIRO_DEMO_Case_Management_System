"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface LogItem {
  id: number; timestamp: string; method: string; path: string;
  statusCode: number; success: boolean; requestBody: unknown;
  responseBody: unknown; userId: number | null; userName: string | null; durationMs: number;
}

export default function InterfaceLogsPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [detail, setDetail] = useState<LogItem | null>(null);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterPath, setFilterPath] = useState("");
  const [filterSuccess, setFilterSuccess] = useState("");

  const load = useCallback(() => { fetch("/api/logs/interface").then((r) => r.json()).then(setLogs); }, []);
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, [load]);

  const filtered = logs.filter((l) => {
    if (filterMethod && l.method !== filterMethod) return false;
    if (filterPath && !l.path.toLowerCase().includes(filterPath.toLowerCase())) return false;
    if (filterSuccess === "true" && !l.success) return false;
    if (filterSuccess === "false" && l.success) return false;
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("logs.interfaceTitle")}</h2>
        <p className="text-sm text-slate-500">{t("logs.interfaceSubtitle")}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
          <option value="">All Methods</option>
          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
        </select>
        <input value={filterPath} onChange={(e) => setFilterPath(e.target.value)} placeholder={t("logs.filterPath")} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-48" />
        <select value={filterSuccess} onChange={(e) => setFilterSuccess(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
          <option value="">{t("logs.allStatus")}</option>
          <option value="true">✅ {t("logs.success")}</option>
          <option value="false">❌ {t("logs.failed")}</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} {t("search.results")}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8">{t("logs.noLogs")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-3">{t("logs.time")}</th><th className="pb-3 pr-3">Method</th>
                <th className="pb-3 pr-3">Path</th><th className="pb-3 pr-3">Status</th>
                <th className="pb-3 pr-3">{t("logs.user")}</th><th className="pb-3 pr-3">Duration</th>
                <th className="pb-3"></th>
              </tr></thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${!l.success ? "bg-red-50" : ""}`} onClick={() => setDetail(l)}>
                    <td className="py-2 pr-3 text-xs">{new Date(l.timestamp).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" })}</td>
                    <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${l.method === "POST" ? "bg-green-100 text-green-700" : l.method === "PUT" ? "bg-blue-100 text-blue-700" : l.method === "DELETE" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{l.method}</span></td>
                    <td className="py-2 pr-3 font-mono text-xs">{l.path}</td>
                    <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${l.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{l.statusCode}</span></td>
                    <td className="py-2 pr-3 text-xs">{l.userName || "-"}</td>
                    <td className="py-2 pr-3 text-xs">{l.durationMs}ms</td>
                    <td className="py-2 text-xs text-indigo-600">{t("requests.detail")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t("logs.requestDetail")}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4 bg-slate-50 rounded-lg p-4">
              <div><span className="text-slate-400 text-xs block">Method</span><span className={`px-2 py-0.5 rounded text-xs font-bold ${detail.method === "POST" ? "bg-green-100 text-green-700" : "bg-slate-100"}`}>{detail.method}</span></div>
              <div><span className="text-slate-400 text-xs block">Path</span><span className="font-mono text-xs">{detail.path}</span></div>
              <div><span className="text-slate-400 text-xs block">Status Code</span><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${detail.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{detail.statusCode} {detail.success ? "OK" : "Error"}</span></div>
              <div><span className="text-slate-400 text-xs block">Duration</span><span className="font-semibold">{detail.durationMs}ms</span></div>
              <div><span className="text-slate-400 text-xs block">{t("logs.user")}</span><span>{detail.userName || "-"} {detail.userId ? `(ID: ${detail.userId})` : ""}</span></div>
              <div><span className="text-slate-400 text-xs block">{t("logs.time")}</span><span className="text-xs">{new Date(detail.timestamp).toLocaleString("th-TH")}</span></div>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">📤 Request Body</h4>
              <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-48">{detail.requestBody ? JSON.stringify(detail.requestBody, null, 2) : "null"}</pre>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">📥 Response Body</h4>
              <pre className={`rounded-lg p-4 text-xs overflow-x-auto max-h-48 ${detail.success ? "bg-slate-900 text-blue-400" : "bg-red-950 text-red-400"}`}>{detail.responseBody ? JSON.stringify(detail.responseBody, null, 2) : "null"}</pre>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setDetail(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">{t("action.close")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
