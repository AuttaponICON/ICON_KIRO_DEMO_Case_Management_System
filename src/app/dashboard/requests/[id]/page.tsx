"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";
import PermissionGate from "@/components/PermissionGate";
import AssignModal from "@/components/AssignModal";
import CancelModal from "@/components/CancelModal";
import ResolveModal from "@/components/ResolveModal";
import RejectModal from "@/components/RejectModal";
import LoadingModal from "@/components/LoadingModal";

interface HistoryItem { id: number; action: string; comment: string | null; createdAt: string; user?: { name: string }; }
interface CaseDetail {
  id: number; code: string; title: string; location: string; category: string; subCategory?: string;
  detail: string | null; status: string; priority?: string;
  reporterName?: string | null; reporterPhone?: string | null;
  attachments?: { name: string; type: string; size: number }[];
  rootCause: string | null; resolution: string | null;
  cancelReason: string | null; rejectReason: string | null;
  slaDeadline?: string; createdAt: string;
  creator?: { name: string }; assignee?: { name: string } | null;
  history?: HistoryItem[];
}

const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
  LOW: { label: "Low", color: "bg-slate-100 text-slate-600", icon: "🟢" },
  MEDIUM: { label: "Medium", color: "bg-amber-100 text-amber-700", icon: "🟡" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700", icon: "🟠" },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700", icon: "🔴" },
};

const actionStyle: Record<string, { icon: string; color: string }> = {
  CREATED: { icon: "📝", color: "bg-slate-500" }, ASSIGNED: { icon: "👤", color: "bg-blue-500" },
  RESOLVED: { icon: "🔧", color: "bg-green-500" }, APPROVED: { icon: "✅", color: "bg-emerald-500" },
  REJECTED: { icon: "❌", color: "bg-red-500" }, COMPLETED: { icon: "🎉", color: "bg-green-600" },
  CANCELLED: { icon: "🚫", color: "bg-orange-500" },
};

export default function CaseDetailPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CaseDetail | null>(null);
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [caseRes, meRes] = await Promise.all([fetch(`/api/requests/${id}`), fetch("/api/auth/me")]);
    if (caseRes.ok) setData(await caseRes.json());
    if (meRes.ok) { const me = await meRes.json(); setPerms(me.permissions || []); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action: string, body: Record<string, unknown> = {}) => {
    setLoading(true);
    await fetch(`/api/requests/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await load();
  };

  if (!data) return <LoadingModal show={true} />;

  const isOverdue = data.slaDeadline && ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","REJECTED"].includes(data.status) && new Date(data.slaDeadline) < new Date();
  const overdueDays = isOverdue ? Math.ceil((new Date().getTime() - new Date(data.slaDeadline!).getTime()) / 86400000) : 0;
  const pCfg = priorityConfig[data.priority || "MEDIUM"] || priorityConfig.MEDIUM;

  return (
    <div className="max-w-3xl mx-auto">
      <LoadingModal show={loading} />

      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-indigo-600 mb-2">← {t("createCase.back")}</button>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{data.code}</span>
          <StatusBadge status={data.status} />
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${pCfg.color}`}>{pCfg.icon} {t(`priority.${data.priority || "MEDIUM"}`)}</span>
          {isOverdue && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">⚠️ SLA +{overdueDays}d</span>}
        </div>
        <h2 className="text-xl font-bold mt-2">{data.title}</h2>
      </div>

      {/* Workflow Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-2">
        {data.status === "PENDING" && (<>
          <PermissionGate permissions={perms} required="case:assign">
            <button onClick={() => setAssignOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">👤 {t("action.assign")}</button>
            <button onClick={() => doAction("assign", { assigneeId: 0, comment: "Self" }).then(() => fetch("/api/auth/me").then(r => r.json()).then(me => doAction("assign", { assigneeId: me.id, comment: "รับเรื่องเอง" })))} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600">🙋 {t("action.selfAssign")}</button>
          </PermissionGate>
          <PermissionGate permissions={perms} required="case:cancel">
            <button onClick={() => setCancelOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600">🚫 {t("action.cancel")}</button>
          </PermissionGate>
        </>)}
        {(data.status === "ASSIGNED" || data.status === "REJECTED") && (
          <PermissionGate permissions={perms} required="case:resolve">
            <button onClick={() => setResolveOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">🔧 {t("action.resolve")}</button>
          </PermissionGate>
        )}
        {data.status === "RESOLVED" && (
          <PermissionGate permissions={perms} required="case:approve">
            <button onClick={() => doAction("approve")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">✅ {t("action.approve")}</button>
            <button onClick={() => setRejectOpen(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">❌ {t("action.reject")}</button>
          </PermissionGate>
        )}
        {data.status === "APPROVED" && (
          <PermissionGate permissions={perms} required="case:complete">
            <button onClick={() => doAction("complete")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">🎉 {t("action.complete")}</button>
          </PermissionGate>
        )}
        {["COMPLETED","CANCELLED"].includes(data.status) && <span className="text-sm text-slate-400 py-2">{t("status." + data.status)}</span>}
      </div>

      <div className="space-y-6">
        {/* Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">📋 {t("createCase.sectionInfo")}</h3>
          <div className="space-y-3 text-sm">
            <div><span className="text-slate-400 text-xs block">{t("createCase.caseTitle")}</span><span className="font-medium">{data.title}</span></div>
            {data.detail && <div><span className="text-slate-400 text-xs block">{t("createCase.caseDetail")}</span><span>{data.detail}</span></div>}
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">🏷️ {t("createCase.sectionCategory")}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400 text-xs block">{t("createCase.catLv1")}</span><span className="font-medium">{t(`category.${data.category}`)}</span></div>
            {data.subCategory && <div><span className="text-slate-400 text-xs block">{t("createCase.catLv2")}</span><span className="font-medium">{data.subCategory}</span></div>}
          </div>
        </div>

        {/* Location & Priority */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">📍 {t("createCase.sectionLocation")}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400 text-xs block">{t("table.location")}</span><span className="font-medium">{data.location}</span></div>
            <div><span className="text-slate-400 text-xs block">{t("createCase.priority")}</span><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${pCfg.color}`}>{pCfg.icon} {t(`priority.${data.priority || "MEDIUM"}`)}</span></div>
            <div><span className="text-slate-400 text-xs block">SLA Deadline</span><span className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>{data.slaDeadline ? new Date(data.slaDeadline).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span></div>
            <div><span className="text-slate-400 text-xs block">{t("caseDetail.createdDate")}</span><span className="font-medium">{new Date(data.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span></div>
          </div>
        </div>

        {/* Reporter */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">👤 {t("createCase.sectionReporter")}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400 text-xs block">{t("caseDetail.creator")}</span><span className="font-medium">{data.creator?.name || "-"}</span></div>
            <div><span className="text-slate-400 text-xs block">{t("table.assignee")}</span><span className="font-medium">{data.assignee?.name || "-"}</span></div>
            {data.reporterName && <div><span className="text-slate-400 text-xs block">{t("createCase.reporterName")}</span><span className="font-medium">{data.reporterName}</span></div>}
            {data.reporterPhone && <div><span className="text-slate-400 text-xs block">{t("createCase.reporterPhone")}</span><span className="font-medium">{data.reporterPhone}</span></div>}
          </div>
        </div>

        {/* Attachments */}
        {data.attachments && data.attachments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">📎 {t("createCase.sectionAttach")}</h3>
            <div className="space-y-2">
              {data.attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="text-lg">{f.type.startsWith("image/") ? "🖼️" : f.type.startsWith("video/") ? "🎬" : "📄"}</span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {(data.rootCause || data.resolution) && (
          <div className="bg-green-50 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-green-700">🔧 {t("caseDetail.result")}</h3>
            <div className="space-y-2 text-sm">
              {data.rootCause && <div><span className="text-green-600 text-xs block">{t("caseDetail.rootCause")}</span>{data.rootCause}</div>}
              {data.resolution && <div><span className="text-green-600 text-xs block">{t("caseDetail.resolution")}</span>{data.resolution}</div>}
            </div>
          </div>
        )}
        {data.cancelReason && <div className="bg-orange-50 rounded-xl shadow-sm p-6"><h3 className="font-semibold mb-2 text-orange-700">🚫 {t("caseDetail.cancelReason")}</h3><p className="text-sm">{data.cancelReason}</p></div>}
        {data.rejectReason && <div className="bg-red-50 rounded-xl shadow-sm p-6"><h3 className="font-semibold mb-2 text-red-700">❌ {t("caseDetail.rejectReason")}</h3><p className="text-sm">{data.rejectReason}</p></div>}

        {/* History */}
        {data.history && data.history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">📋 {t("caseDetail.history")}</h3>
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" />
              {data.history.map((h) => {
                const s = actionStyle[h.action] || { icon: "📌", color: "bg-slate-400" };
                return (
                  <div key={h.id} className="relative mb-4 last:mb-0">
                    <div className={`absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full ${s.color} flex items-center justify-center text-[10px] z-10`}><span>{s.icon}</span></div>
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

      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} onAssign={(assigneeId, comment) => { doAction("assign", { assigneeId, comment }); }} />
      <CancelModal open={cancelOpen} onClose={() => setCancelOpen(false)} onCancel={(reason) => { doAction("cancel", { reason }); }} />
      <ResolveModal open={resolveOpen} onClose={() => setResolveOpen(false)} onResolve={(rootCause, resolution) => { doAction("resolve", { rootCause, resolution }); }} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onReject={(reason) => { doAction("reject", { reason }); }} />
    </div>
  );
}
