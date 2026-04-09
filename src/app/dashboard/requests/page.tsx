"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";
import RequestModal from "@/components/RequestModal";

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; detail: string; status: string; createdAt: string;
}

const categoryLabel: Record<string, string> = {
  ELECTRICAL: "ไฟฟ้า", PLUMBING: "ประปา", AC: "แอร์", BUILDING: "อาคาร", OTHER: "อื่นๆ",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RequestItem | null>(null);

  const load = useCallback(() => {
    fetch("/api/requests").then((r) => r.json()).then(setRequests);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: { id?: number; title: string; location: string; category: string; detail: string }) => {
    if (data.id) {
      await fetch(`/api/requests/${data.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    load();
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
          <button onClick={() => { setEditing(null); setModalOpen(true); }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
            + แจ้งซ่อมใหม่
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-4">รหัส</th><th className="pb-3 pr-4">รายการ</th>
                <th className="pb-3 pr-4">สถานที่</th><th className="pb-3 pr-4">ประเภท</th>
                <th className="pb-3 pr-4">สถานะ</th><th className="pb-3 pr-4">วันที่</th>
                <th className="pb-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{r.code}</td>
                  <td className="py-3 pr-4">{r.title}</td>
                  <td className="py-3 pr-4">{r.location}</td>
                  <td className="py-3 pr-4">{categoryLabel[r.category] || r.category}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 pr-4">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                  <td className="py-3 flex gap-1">
                    <button onClick={() => { setEditing(r); setModalOpen(true); }}
                      className="px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50">แก้ไข</button>
                    <button onClick={() => handleDelete(r.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">ลบ</button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <RequestModal
        open={modalOpen}
        initial={editing ? { id: editing.id, title: editing.title, location: editing.location, category: editing.category, detail: editing.detail || "" } : null}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </>
  );
}
