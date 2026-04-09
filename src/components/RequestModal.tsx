"use client";

import { useState, useEffect } from "react";

interface RequestData {
  id?: number; title: string; location: string; category: string; detail: string; status?: string;
}

interface Props {
  open: boolean;
  initial?: RequestData | null;
  onClose: () => void;
  onSave: (data: RequestData) => void;
}

const categories = [
  { value: "ELECTRICAL", label: "ไฟฟ้า" },
  { value: "PLUMBING", label: "ประปา" },
  { value: "AC", label: "แอร์" },
  { value: "BUILDING", label: "อาคาร" },
  { value: "OTHER", label: "อื่นๆ" },
];

export default function RequestModal({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<RequestData>({ title: "", location: "", category: "ELECTRICAL", detail: "" });

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: "", location: "", category: "ELECTRICAL", detail: "" });
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{initial?.id ? "แก้ไขรายการ" : "แจ้งซ่อมใหม่"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">รายการซ่อม</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="เช่น แอร์ไม่เย็น" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">สถานที่</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="เช่น ห้อง 301" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">ประเภท</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">รายละเอียด</label>
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={3} placeholder="อธิบายรายละเอียดเพิ่มเติม"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">ยกเลิก</button>
            <button type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}
