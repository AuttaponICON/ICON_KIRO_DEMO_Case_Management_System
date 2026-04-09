"use client";

import { useState } from "react";

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-indigo-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">ตั้งค่า</h2>
        <p className="text-sm text-slate-500">ตั้งค่าระบบแจ้งซ่อม</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-6">
        <div>
          <h4 className="font-semibold mb-3">การแจ้งเตือน</h4>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">แจ้งเตือนทางอีเมล</div><div className="text-xs text-slate-500">รับการแจ้งเตือนเมื่อมีการอัปเดตสถานะ</div></div>
              <Toggle />
            </div>
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">แจ้งเตือนในระบบ</div><div className="text-xs text-slate-500">แสดงการแจ้งเตือนบนหน้าจอ</div></div>
              <Toggle />
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">ทั่วไป</h4>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">ภาษา</div><div className="text-xs text-slate-500">เลือกภาษาที่ใช้แสดงผล</div></div>
              <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option>ไทย</option><option>English</option>
              </select>
            </div>
            <div className="flex justify-between items-center py-3">
              <div><div className="text-sm font-medium">จำนวนรายการต่อหน้า</div><div className="text-xs text-slate-500">กำหนดจำนวนรายการที่แสดงในตาราง</div></div>
              <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option>10</option><option>25</option><option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
