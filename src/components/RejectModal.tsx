"use client";

import { useState } from "react";

interface Props { open: boolean; onClose: () => void; onReject: (reason: string) => void; }

export default function RejectModal({ open, onClose, onReject }: Props) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">ปฏิเสธ Case</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">เหตุผล</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="ระบุเหตุผลที่ปฏิเสธ" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ยกเลิก</button>
            <button onClick={() => { if (reason) { onReject(reason); onClose(); } }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">ปฏิเสธ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
