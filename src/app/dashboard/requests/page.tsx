"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import RequestModal from "@/components/RequestModal";
import AssignModal from "@/components/AssignModal";
import CancelModal from "@/components/CancelModal";
import ResolveModal from "@/components/ResolveModal";
import RejectModal from "@/components/RejectModal";
import PermissionGate from "@/components/PermissionGate";
import { useI18n } from "@/lib/i18n";

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; detail: string; status: string; createdAt: string;
  slaDeadline?: string;
  assignee?: { name: string } | null; creator?: { name: string };
  rootCause?: string | null; resolution?: string | null;
  cancelReason?: string | null; rejectReason?: string | null;
}
interface UserInfo { permissions: string[]; }
interface HistoryItem { id: number; action: string; comment: string | null; createdAt: string; user?: { name: string }; }

const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];
const CATEGORIES = ["ELECTRICAL", "PLUMBING", "AC", "BUILDING", "OTHER"];

function RequestsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [user, setUser] = useState<UserInfo>({ permissions: [] });
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [detailItem, setDetailItem] = useState<(RequestItem & { history?: HistoryItem[] }) | null>(null);

  // Search state
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

  // Auto-open advanced if URL has filters
  useEffect(() => {
    if (searchParams.get("assignee") || searchParams.get("search")) setShowAdvanced(true);
  }, [searchParams]);

  const perms = user.permissions;

  // Filter logic
  const filtered = requests.filter((r) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!(r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.detail?.toLowerCase().includes(q))) return false;
    }
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterAssignee && r.assignee?.name !== filterAssignee) return false;
    if (filterDateFrom && r.createdAt < filterDateFrom) return false;
    if (filterDateTo && r.createdAt > filterDateTo + "T23:59:59") return false;
    if (filterSlaOverdue) {
      const active = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
      if (!(active.includes(r.status) && r.slaDeadline && new Date(r.slaDeadline) < new Date())) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchText(""); setFilterStatus(""); setFilterCategory("");
    setFilterAssignee(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterSlaOverdue(false);
  };

  // Unique assignees for dropdown
  const assignees = [...new Set(requests.filter((r) => r.assignee?.name).map((r) => r.assignee!.name))];

  const handleCreate = async (data: { title: string; location: string; category: string; detail: string }) => {
    await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setCreateOpen(false); load();
  };
  const handleAssign = async (assigneeId: number, comment: string) => {
    await fetch(`/api/requests/${selectedId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId, comment }) }); load();
  };
  const handleSelfAssign = async (id: number) => {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    await fetch(`/api/requests/${id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId: me.id, comment: "Self assigned" }) }); load();
  };
  const handleCancel = async (reason: string) => { await fetch(`/api/requests/${selectedId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); load(); };
  const handleResolve = async (rootCause: string, resolution: string) => { await fetch(`/api/requests/${selectedId}/resolve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rootCause, resolution }) }); load(); };
  const handleApprove = async (id: number) => { await fetch(`/api/requests/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }); load(); };
  const handleReject = async (reason: string) => { await fetch(`/api/requests/${selectedId}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); load(); };
  const handleComplete = async (id: number) => { await fetch(`/api/requests/${id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }); load(); };
  const viewDetail = async (id: number) => { const data = await fetch(`/api/requests/${id}`).then((r) => r.json()); setDetailItem(data); };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("requests.title")}</h2>
        <p className="text-sm text-slate-500">{t("requests.subtitle")}</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 border rounded-lg text-sm ${showAdvanced ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 hover:bg-slate-50"}`}>
            ⚙️ {t("search.advanced")}
          </button>
          <PermissionGate permissions={perms} required="case:create">
            <button onClick={() => router.push("/dashboard/requests/create")} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">{t("requests.createNew")}</button>
          </PermissionGate>
        </div>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("table.status")}</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option value="">{t("search.all")}</option>
                {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("table.category")}</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option value="">{t("search.all")}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("table.assignee")}</label>
              <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option value="">{t("search.all")}</option>
                {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={filterSlaOverdue} onChange={(e) => setFilterSlaOverdue(e.target.checked)} className="rounded" />
                <span>🚨 {t("search.slaOverdueOnly")}</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("search.dateFrom")}</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("search.dateTo")}</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("search.clear")}</button>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-slate-400">{t("search.results")}: {filtered.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-3">{t("table.code")}</th><th className="pb-3 pr-3">{t("table.item")}</th>
                <th className="pb-3 pr-3">{t("table.location")}</th><th className="pb-3 pr-3">{t("table.category")}</th>
                <th className="pb-3 pr-3">{t("table.status")}</th><th className="pb-3 pr-3">{t("table.assignee")}</th>
                <th className="pb-3 pr-3">SLA</th><th className="pb-3 pr-3">{t("table.date")}</th><th className="pb-3">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isOverdue = r.slaDeadline && ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","REJECTED"].includes(r.status) && new Date(r.slaDeadline) < new Date();
                return (
                  <tr key={r.id} className={`border-t border-slate-100 ${isOverdue ? "bg-red-50" : ""}`}>
                    <td className="py-3 pr-3">{r.code}</td>
                    <td className="py-3 pr-3"><button onClick={() => viewDetail(r.id)} className="text-indigo-600 hover:underline">{r.title}</button></td>
                    <td className="py-3 pr-3">{r.location}</td>
                    <td className="py-3 pr-3">{t(`category.${r.category}`)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 pr-3">{r.assignee?.name || "-"}</td>
                    <td className="py-3 pr-3 text-xs">
                      {r.slaDeadline ? (
                        <span className={isOverdue ? "text-red-600 font-bold" : "text-slate-500"}>
                          {new Date(r.slaDeadline).toLocaleDateString("th-TH")}
                          {isOverdue && " ⚠️"}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-3 pr-3">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => viewDetail(r.id)} className="px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50">📋</button>
                        {r.status === "PENDING" && (<>
                          <PermissionGate permissions={perms} required="case:assign">
                            <button onClick={() => { setSelectedId(r.id); setAssignOpen(true); }} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">{t("action.assign")}</button>
                            <button onClick={() => handleSelfAssign(r.id)} className="px-2 py-1 bg-indigo-500 text-white rounded text-xs">{t("action.selfAssign")}</button>
                          </PermissionGate>
                          <PermissionGate permissions={perms} required="case:cancel">
                            <button onClick={() => { setSelectedId(r.id); setCancelOpen(true); }} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">{t("action.cancel")}</button>
                          </PermissionGate>
                        </>)}
                        {(r.status === "ASSIGNED" || r.status === "REJECTED") && (
                          <PermissionGate permissions={perms} required="case:resolve">
                            <button onClick={() => { setSelectedId(r.id); setResolveOpen(true); }} className="px-2 py-1 bg-green-500 text-white rounded text-xs">{t("action.resolve")}</button>
                          </PermissionGate>
                        )}
                        {r.status === "RESOLVED" && (
                          <PermissionGate permissions={perms} required="case:approve">
                            <button onClick={() => handleApprove(r.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">{t("action.approve")}</button>
                            <button onClick={() => { setSelectedId(r.id); setRejectOpen(true); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs">{t("action.reject")}</button>
                          </PermissionGate>
                        )}
                        {r.status === "APPROVED" && (
                          <PermissionGate permissions={perms} required="case:complete">
                            <button onClick={() => handleComplete(r.id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">{t("action.complete")}</button>
                          </PermissionGate>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-slate-400">{t("requests.noData")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{detailItem.code}</span>
                  <StatusBadge status={detailItem.status} />
                  {detailItem.slaDeadline && new Date(detailItem.slaDeadline) < new Date() && ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","REJECTED"].includes(detailItem.status) && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">⚠️ SLA Overdue</span>
                  )}
                </div>
                <h3 className="text-lg font-bold">{detailItem.title}</h3>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5 bg-slate-50 rounded-lg p-4">
              <div><span className="text-slate-400 text-xs block">{t("caseDetail.location")}</span><span className="font-medium">{detailItem.location}</span></div>
              <div><span className="text-slate-400 text-xs block">{t("caseDetail.category")}</span><span className="font-medium">{t(`category.${detailItem.category}`)}</span></div>
              <div><span className="text-slate-400 text-xs block">{t("caseDetail.creator")}</span><span className="font-medium">{detailItem.creator?.name || "-"}</span></div>
              <div><span className="text-slate-400 text-xs block">{t("caseDetail.assignee")}</span><span className="font-medium">{detailItem.assignee?.name || "-"}</span></div>
              <div><span className="text-slate-400 text-xs block">{t("caseDetail.createdDate")}</span><span className="font-medium">{new Date(detailItem.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span></div>
              {detailItem.slaDeadline && <div><span className="text-slate-400 text-xs block">SLA Deadline</span><span className="font-medium">{new Date(detailItem.slaDeadline).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span></div>}
            </div>
            {detailItem.detail && <div className="text-sm mb-4 p-3 bg-blue-50 rounded-lg"><span className="text-blue-600 text-xs font-semibold block mb-1">{t("caseDetail.detail")}</span>{detailItem.detail}</div>}
            {(detailItem.rootCause || detailItem.resolution) && (
              <div className="text-sm mb-4 p-3 bg-green-50 rounded-lg space-y-1">
                <span className="text-green-600 text-xs font-semibold block mb-1">{t("caseDetail.result")}</span>
                {detailItem.rootCause && <div><span className="text-slate-500">{t("caseDetail.rootCause")}:</span> {detailItem.rootCause}</div>}
                {detailItem.resolution && <div><span className="text-slate-500">{t("caseDetail.resolution")}:</span> {detailItem.resolution}</div>}
              </div>
            )}
            {detailItem.cancelReason && <div className="text-sm mb-4 p-3 bg-orange-50 rounded-lg"><span className="text-orange-600 text-xs font-semibold block mb-1">{t("caseDetail.cancelReason")}</span>{detailItem.cancelReason}</div>}
            {detailItem.rejectReason && <div className="text-sm mb-4 p-3 bg-red-50 rounded-lg"><span className="text-red-600 text-xs font-semibold block mb-1">{t("caseDetail.rejectReason")}</span>{detailItem.rejectReason}</div>}
            {detailItem.history && detailItem.history.length > 0 && (
              <div className="mt-5">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5">📋 {t("caseDetail.history")}</h4>
                <div className="relative pl-6">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {detailItem.history.map((h) => {
                    const actionStyle: Record<string, { icon: string; color: string }> = {
                      CREATED: { icon: "📝", color: "bg-slate-500" }, ASSIGNED: { icon: "👤", color: "bg-blue-500" },
                      RESOLVED: { icon: "🔧", color: "bg-green-500" }, APPROVED: { icon: "✅", color: "bg-emerald-500" },
                      REJECTED: { icon: "❌", color: "bg-red-500" }, COMPLETED: { icon: "🎉", color: "bg-green-600" },
                      CANCELLED: { icon: "🚫", color: "bg-orange-500" },
                    };
                    const style = actionStyle[h.action] || { icon: "📌", color: "bg-slate-400" };
                    return (
                      <div key={h.id} className="relative mb-4 last:mb-0">
                        <div className={`absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full ${style.color} flex items-center justify-center text-[10px] z-10`}><span>{style.icon}</span></div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{t(`historyAction.${h.action}`)}</span>
                            <span className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                          <div className="text-xs text-slate-500">{t("common.by")} {h.user?.name || t("common.system")}</div>
                          {h.comment && <div className="text-xs text-slate-600 mt-1 bg-white rounded px-2 py-1.5 border border-slate-100">{h.comment}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RequestModal open={createOpen} initial={null} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} onAssign={handleAssign} />
      <CancelModal open={cancelOpen} onClose={() => setCancelOpen(false)} onCancel={handleCancel} />
      <ResolveModal open={resolveOpen} onClose={() => setResolveOpen(false)} onResolve={handleResolve} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onReject={handleReject} />
    </>
  );
}

export default function RequestsPage() {
  return <Suspense><RequestsContent /></Suspense>;
}
