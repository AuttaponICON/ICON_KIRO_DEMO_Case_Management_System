"use client";

import { useState, useEffect } from "react";

interface User { id: number; name: string; roleName: string; }
interface Props { open: boolean; onClose: () => void; onAssign: (assigneeId: number, comment: string) => void; }

export default function AssignModal({ open, onClose, onAssign }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [assigneeId, setAssigneeId] = useState<number>(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) fetch("/api/users/members").then((r) => r.json()).then((data) => { setUsers(data); if (data.length) setAssigneeId(data[0].id); });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">มอบหมายงาน</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">เลือกผู้รับผิดชอบ</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.roleName})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">หมายเหตุ</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ยกเลิก</button>
            <button onClick={() => { onAssign(assigneeId, comment); onClose(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">มอบหมาย</button>
          </div>
        </div>
      </div>
    </div>
  );
}
