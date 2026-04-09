"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";

interface RequestItem {
  id: number; category: string; status: string;
}

const categoryLabel: Record<string, string> = {
  ELECTRICAL: "ไฟฟ้า", PLUMBING: "ประปา", AC: "แอร์", BUILDING: "อาคาร", OTHER: "อื่นๆ",
};

export default function ReportsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    fetch("/api/requests").then((r) => r.json()).then(setRequests);
  }, []);

  const total = requests.length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  // Group by category
  const grouped: Record<string, { total: number; done: number; pending: number }> = {};
  requests.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = { total: 0, done: 0, pending: 0 };
    grouped[r.category].total++;
    if (r.status === "COMPLETED") grouped[r.category].done++;
    if (r.status === "PENDING") grouped[r.category].pending++;
  });

  const topCat = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)[0];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">รายงาน</h2>
        <p className="text-sm text-slate-500">สรุปข้อมูลการแจ้งซ่อม</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📊" value={total} label="แจ้งซ่อมทั้งหมด" />
        <StatCard icon="✅" value={`${rate}%`} label="อัตราเสร็จสิ้น" />
        <StatCard icon="🏷️" value={topCat ? categoryLabel[topCat[0]] || topCat[0] : "-"} label="ประเภทที่แจ้งมากสุด" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">สรุปตามประเภท</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-4">ประเภท</th><th className="pb-3 pr-4">จำนวน</th>
                <th className="pb-3 pr-4">เสร็จสิ้น</th><th className="pb-3">รอดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, v]) => (
                <tr key={cat} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{categoryLabel[cat] || cat}</td>
                  <td className="py-3 pr-4">{v.total}</td>
                  <td className="py-3 pr-4">{v.done}</td>
                  <td className="py-3">{v.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
