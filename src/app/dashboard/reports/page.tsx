"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { useI18n } from "@/lib/i18n";
import { exportPDF, exportExcel } from "@/lib/exportUtils";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; status: string; createdAt: string;
  assignee?: { name: string } | null; creator?: { name: string };
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  useEffect(() => { fetch("/api/requests").then((r) => r.json()).then(setRequests); }, []);

  // Filter
  const filtered = requests.filter((r) => {
    const d = new Date(r.createdAt);
    if (filterYear && d.getFullYear().toString() !== filterYear) return false;
    if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
    return true;
  });

  const total = filtered.length;
  const completed = filtered.filter((r) => r.status === "COMPLETED").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  // Group by category
  const grouped: Record<string, { total: number; done: number; pending: number }> = {};
  filtered.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = { total: 0, done: 0, pending: 0 };
    grouped[r.category].total++;
    if (r.status === "COMPLETED") grouped[r.category].done++;
    if (r.status === "PENDING") grouped[r.category].pending++;
  });
  const topCat = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)[0];

  // Group by status
  const statusCount: Record<string, number> = {};
  filtered.forEach((r) => { statusCount[r.status] = (statusCount[r.status] || 0) + 1; });

  // Charts
  const statusChartData = {
    labels: Object.keys(statusCount).map((s) => t(`status.${s}`)),
    datasets: [{ data: Object.values(statusCount), backgroundColor: ["#f59e0b", "#3b82f6", "#0ea5e9", "#8b5cf6", "#22c55e", "#ef4444", "#10b981", "#94a3b8"] }],
  };
  const catChartData = {
    labels: Object.keys(grouped).map((c) => t(`category.${c}`)),
    datasets: [{ label: t("reports.count"), data: Object.values(grouped).map((v) => v.total), backgroundColor: ["#6366f1", "#06b6d4", "#f43f5e", "#eab308", "#8b5cf6"] }],
  };

  // Years for filter
  const years = [...new Set(requests.map((r) => new Date(r.createdAt).getFullYear()))].sort((a, b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(2000, i).toLocaleString("th-TH", { month: "long" }) }));

  // Export
  const handleExportPDF = () => {
    const title = `${t("reports.title")} ${filterYear}${filterMonth ? `-${filterMonth.padStart(2, "0")}` : ""}`;
    const headers = [t("table.code"), t("table.item"), t("table.location"), t("table.category"), t("table.status"), t("table.date")];
    const rows = filtered.map((r) => ({
      code: r.code, title: r.title, location: r.location,
      category: t(`category.${r.category}`), status: t(`status.${r.status}`),
      date: new Date(r.createdAt).toLocaleDateString("th-TH"),
    }));
    exportPDF(title, headers, rows, ["code", "title", "location", "category", "status", "date"]);
  };

  const handleExportExcel = () => {
    const title = `${t("reports.title")} ${filterYear}${filterMonth ? `-${filterMonth.padStart(2, "0")}` : ""}`;
    const headers = [t("table.code"), t("table.item"), t("table.location"), t("table.category"), t("table.status"), t("table.assignee"), t("table.date")];
    const rows = filtered.map((r) => ({
      code: r.code, title: r.title, location: r.location,
      category: t(`category.${r.category}`), status: t(`status.${r.status}`),
      assignee: r.assignee?.name || "-",
      date: new Date(r.createdAt).toLocaleDateString("th-TH"),
    }));
    exportExcel(title, headers, rows, ["code", "title", "location", "category", "status", "assignee", "date"]);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("reports.title")}</h2>
        <p className="text-sm text-slate-500">{t("reports.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("reports.year")}:</label>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("reports.month")}:</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
            <option value="">{t("reports.allMonths")}</option>
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={handleExportPDF} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center gap-1">📄 Export PDF</button>
          <button onClick={handleExportExcel} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-1">📊 Export Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📊" value={total} label={t("reports.total")} />
        <StatCard icon="✅" value={`${rate}%`} label={t("reports.completionRate")} />
        <StatCard icon="🏷️" value={topCat ? t(`category.${topCat[0]}`) : "-"} label={t("reports.topCategory")} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">{t("reports.statusChart")}</h3>
          <div className="max-w-[260px] mx-auto">
            <Doughnut data={statusChartData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">{t("reports.categoryChart")}</h3>
          <Bar data={catChartData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">{t("reports.byCategoryTitle")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase">
              <th className="pb-3 pr-4">{t("table.category")}</th><th className="pb-3 pr-4">{t("reports.count")}</th>
              <th className="pb-3 pr-4">{t("reports.done")}</th><th className="pb-3">{t("reports.pendingCount")}</th>
            </tr></thead>
            <tbody>
              {Object.entries(grouped).map(([cat, v]) => (
                <tr key={cat} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{t(`category.${cat}`)}</td>
                  <td className="py-3 pr-4">{v.total}</td><td className="py-3 pr-4">{v.done}</td><td className="py-3">{v.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
