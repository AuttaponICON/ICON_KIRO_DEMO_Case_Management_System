"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";
import RequestModal from "@/components/RequestModal";
import AssignModal from "@/components/AssignModal";
import CancelModal from "@/components/CancelModal";
import ResolveModal from "@/components/ResolveModal";
import RejectModal from "@/components/RejectModal";
import PermissionGate from "@/components/PermissionGate";

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; detail: string; status: string; createdAt: string;
  assignee?: { name: string } | null; creator?: { name: string };
  rootCause?: string | null; resolution?: string | null;
  cancelReason?: string | null; rejectReason?: string | null;
}

interface UserInfo { permissions: string[]; }

const categoryLabel: Record<string, string> = {
  ELECTRICAL: "ไฟฟ้า", PLUMBING: "ประปา", AC: "แอร์", BUILDING: "อาคาร", OTHER: "อื่นๆ",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [user, setUser] = useState<UserInfo>({ permissions: [] });
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [detailItem, setDetailItem] = useState<(RequestItem & { history?: { id: number; action: string; comment: string | null; createdAt: string; user?: { name: string } }[] }) | null>(null);

  const load = useCallback(() => {
    fetch("/api/requests").then((r) => r.json()).then(setRequests);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/auth/me").then((r) => r.json()).then(setUser);
  }, [load]);

  const perms = user.permissions;

  const handleCreate = async (data: { title: string; location: string; category: string; detail: string }) => {
    await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setCreateOpen(false);
    load();
  };

  const handleAssign = async (assigneeId: number, comment: string) => {
    await fetch(`/api/requests/${selectedId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId, comment }) });
    load();
  };

  const handleSelfAssign = async (id: number) => {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    await fetch(`/api/requests/${id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId: me.id, comment: "รับเรื่องเอง" }) });
    // Then move to IN_PROGRESS by resolving later — for now set as ASSIGNED to self
    load();
  };

  const handleCancel = async (reason: string) => {
    await fetch(`/api/requests/${selectedId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    load();
  };

  const handleResolve = async (rootCause: string, resolution: string) => {
    await fetch(`/api/requests/${selectedId}/resolve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rootCause, resolution }) });
    load();
  };

  const handleApprove = async (id: number) => {
    await fetch(`/api/requests/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    load();
  };

  const handleReject = async (reason: string) => {
    await fetch(`/api/requests/${selectedId}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    load();
  };

  const handleComplete = async (id: number) => {
    await fetch(`/api/requests/${id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    load();
  };

  const viewDetail = async (id: number) => {
    const data = await fetch(`/api/requests/${id}`).then((r) => r.json());
    setDetailItem(data);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">แจ้งซ่อม</h2>
        <p className="text-sm text-slate-500">จัดการรายการแจ้งซ่อมทั้งหมด</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">รายการแจ้งซ่อม</h3>
          <PermissionGate permissions={perms} required="case:create">
            <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">+ แจ้งซ่อมใหม่</button>
          </PermissionGate>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-3">รหัส</th><th className="pb-3 pr-3">รายการ</th>
                <th className="pb-3 pr-3">สถานที่</th><th className="pb-3 pr-3">ประเภท</th>
                <th className="pb-3 pr-3">สถานะ</th><th className="pb-3 pr-3">ผู้รับผิดชอบ</th>
                <th className="pb-3 pr-3">วันที่</th><th className="pb-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-3 pr-3">{r.code}</td>
                  <td className="py-3 pr-3">
                    <button onClick={() => viewDetail(r.id)} className="text-indigo-600 hover:underline">{r.title}</button>
                  </td>
                  <td className="py-3 pr-3">{r.location}</td>
                  <td className="py-3 pr-3">{categoryLabel[r.category] || r.category}</td>
                  <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
                  <td className="py-3 pr-3">{r.assignee?.name || "-"}</td>
                  <td className="py-3 pr-3">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.status === "PENDING" && (
                        <>
                          <PermissionGate permissions={perms} required="case:assign">
                            <button onClick={() => { setSelectedId(r.id); setAssignOpen(true); }} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">มอบหมาย</button>
                            <button onClick={() => handleSelfAssign(r.id)} className="px-2 py-1 bg-indigo-500 text-white rounded text-xs">รับเอง</button>
                          </PermissionGate>
                          <PermissionGate permissions={perms} required="case:cancel">
                            <button onClick={() => { setSelectedId(r.id); setCancelOpen(true); }} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">ยกเลิก</button>
                          </PermissionGate>
                        </>
                      )}
                      {(r.status === "ASSIGNED" || r.status === "REJECTED") && (
                        <PermissionGate permissions={perms} required="case:resolve">
                          <button onClick={() => { setSelectedId(r.id); setResolveOpen(true); }} className="px-2 py-1 bg-green-500 text-white rounded text-xs">ส่งผลแก้ไข</button>
                        </PermissionGate>
                      )}
                      {r.status === "RESOLVED" && (
                        <PermissionGate permissions={perms} required="case:approve">
                          <button onClick={() => handleApprove(r.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                          <button onClick={() => { setSelectedId(r.id); setRejectOpen(true); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                        </PermissionGate>
                      )}
                      {r.status === "APPROVED" && (
                        <PermissionGate permissions={perms} required="case:complete">
                          <button onClick={() => handleComplete(r.id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">Complete</button>
                        </PermissionGate>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-400">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{detailItem.code} — {detailItem.title}</h3>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-slate-500">สถานที่:</span> {detailItem.location}</div>
              <div><span className="text-slate-500">ประเภท:</span> {categoryLabel[detailItem.category]}</div>
              <div><span className="text-slate-500">สถานะ:</span> <StatusBadge status={detailItem.status} /></div>
              <div><span className="text-slate-500">ผู้แจ้ง:</span> {detailItem.creator?.name}</div>
              <div><span className="text-slate-500">ผู้รับผิดชอบ:</span> {detailItem.assignee?.name || "-"}</div>
            </div>
            {detailItem.detail && <div className="text-sm mb-3"><span className="text-slate-500">รายละเอียด:</span> {detailItem.detail}</div>}
            {detailItem.rootCause && <div className="text-sm mb-1"><span className="text-slate-500">สาเหตุ:</span> {detailItem.rootCause}</div>}
            {detailItem.resolution && <div className="text-sm mb-1"><span className="text-slate-500">วิธีแก้ไข:</span> {detailItem.resolution}</div>}
            {detailItem.cancelReason && <div className="text-sm mb-1"><span className="text-slate-500">เหตุผลยกเลิก:</span> {detailItem.cancelReason}</div>}
            {detailItem.rejectReason && <div className="text-sm mb-1"><span className="text-slate-500">เหตุผลปฏิเสธ:</span> {detailItem.rejectReason}</div>}
            {detailItem.history && detailItem.history.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">ประวัติ</h4>
                <div className="space-y-2">
                  {detailItem.history.map((h) => (
                    <div key={h.id} className="flex gap-3 text-xs border-l-2 border-indigo-200 pl-3 py-1">
                      <span className="font-semibold text-indigo-600 min-w-[80px]">{h.action}</span>
                      <span className="text-slate-500">{h.user?.name}</span>
                      {h.comment && <span className="text-slate-600">— {h.comment}</span>}
                      <span className="text-slate-400 ml-auto">{new Date(h.createdAt).toLocaleString("th-TH")}</span>
                    </div>
                  ))}
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
