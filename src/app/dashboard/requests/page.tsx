"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import PermissionGate from "@/components/PermissionGate";
import { useI18n } from "@/lib/i18n";

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; detail: string; status: string; createdAt: string;
  slaDeadline?: string;
  assignee?: { name: string } | null;
}
interface UserInfo { permissions: string[]; }

const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];
const CATEGORIES = ["ELECTRICAL", "PLUMBING", "AC", "BUILDING", "OTHER"];

function RequestsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [user, setUser] = useState<UserInfo>({ permissions: [] });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAssignee, setFilterAssignee] = useState(searchParams.get("assignee") || "");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterSlaOverdue, setFilterSlaOverdue] = useState(false);

  const load = useCallback(() => { fetch("/api/requests").then((r) => r.json()).then(setRequests); }, []);
  useEffect(() => { load(); fetch("/api/auth/me").then((r) => r.json()).then(setUser); }, [load]);
  useEffect(() => { if (searchParams.get("assignee") || searchParams.get("search")) setShowAdvanced(true); }, [searchParams]);

  const perms = user.permissions;

  const filtered = requests.filter((r) => {
    if (searchText) { const q = searchText.toLowerCase(); if (!(r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q))) return false; }
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterAssignee && r.assignee?.name !== filterAssignee) return false;
    if (filterDateFrom && r.createdAt < filterDateFrom) return false;
    if (filterDateTo && r.createdAt > filterDateTo + "T23:59:59") return false;
    if (filterSlaOverdue) { const active = ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","REJECTED"]; if (!(active.includes(r.status) && r.slaDeadline && new Date(r.slaDeadline) < new Date())) return false; }
    return true;
  });

  const clearFilters = () => { setSearchText(""); setFilterStatus(""); setFilterCategory(""); setFilterAssignee(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterSlaOverdue(false); };
  const assignees = [...new Set(requests.filter((r) => r.assignee?.name).map((r) => r.assignee!.name))];

  const openDetail = (id: number) => { window.open(`/dashboard/requests/${id}`, "_blank"); };
  const openCreate = () => { window.open("/dashboard/requests/create", "_blank"); };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("requests.title")}</h2>
        <p className="text-sm text-slate-500">{t("requests.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={t("search.placeholder")}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 border rounded-lg text-sm ${showAdvanced ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 hover:bg-slate-50"}`}>
            ⚙️ {t("search.advanced")}
          </button>
          <PermissionGate permissions={perms} required="case:create">
            <button onClick={openCreate} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("requests.createNew")}</button>
          </PermissionGate>
          <PermissionGate permissions={perms} required="case:create">
            <button onClick={() => window.open("/dashboard/requests/import", "_blank")} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">📊 {t("import.title")}</button>
          </PermissionGate>
        </div>
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="block text-xs text-slate-500 mb-1">{t("table.status")}</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm"><option value="">{t("search.all")}</option>{STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}</select></div>
            <div><label className="block text-xs text-slate-500 mb-1">{t("table.category")}</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm"><option value="">{t("search.all")}</option>{CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}</select></div>
            <div><label className="block text-xs text-slate-500 mb-1">{t("table.assignee")}</label><select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm"><option value="">{t("search.all")}</option>{assignees.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={filterSlaOverdue} onChange={(e) => setFilterSlaOverdue(e.target.checked)} className="rounded" /><span>🚨 {t("search.slaOverdueOnly")}</span></label></div>
            <div><label className="block text-xs text-slate-500 mb-1">{t("search.dateFrom")}</label><input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">{t("search.dateTo")}</label><input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" /></div>
            <div className="flex items-end"><button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("search.clear")}</button></div>
            <div className="flex items-end"><span className="text-xs text-slate-400">{t("search.results")}: {filtered.length}</span></div>
          </div>
        )}
      </div>

      {/* Table — no action column */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase">
              <th className="pb-3 pr-3">{t("table.code")}</th><th className="pb-3 pr-3">{t("table.item")}</th>
              <th className="pb-3 pr-3">{t("table.location")}</th><th className="pb-3 pr-3">{t("table.category")}</th>
              <th className="pb-3 pr-3">{t("table.status")}</th><th className="pb-3 pr-3">{t("table.assignee")}</th>
              <th className="pb-3 pr-3">SLA</th><th className="pb-3">{t("table.date")}</th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => {
                const isOverdue = r.slaDeadline && ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","REJECTED"].includes(r.status) && new Date(r.slaDeadline) < new Date();
                return (
                  <tr key={r.id} onClick={() => openDetail(r.id)}
                    className={`border-t border-slate-100 cursor-pointer hover:bg-indigo-50/50 transition ${isOverdue ? "bg-red-50" : ""}`}>
                    <td className="py-3 pr-3 font-mono text-xs">{r.code}</td>
                    <td className="py-3 pr-3 text-indigo-600 font-medium">{r.title}</td>
                    <td className="py-3 pr-3">{r.location}</td>
                    <td className="py-3 pr-3">{t(`category.${r.category}`)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 pr-3">{r.assignee?.name || "-"}</td>
                    <td className="py-3 pr-3 text-xs">
                      {r.slaDeadline ? (<span className={isOverdue ? "text-red-600 font-bold" : "text-slate-500"}>{new Date(r.slaDeadline).toLocaleDateString("th-TH")}{isOverdue && " ⚠️"}</span>) : "-"}
                    </td>
                    <td className="py-3">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-400">{t("requests.noData")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function RequestsPage() {
  return <Suspense><RequestsContent /></Suspense>;
}
