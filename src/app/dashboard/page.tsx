"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { useI18n } from "@/lib/i18n";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface RequestItem {
  id: number; code: string; title: string; location: string;
  category: string; status: string; createdAt: string;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    fetch("/api/requests").then((r) => r.json()).then(setRequests);
  }, []);

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const assigned = requests.filter((r) => r.status === "ASSIGNED").length;
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const resolved = requests.filter((r) => r.status === "RESOLVED").length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;
  const cancelled = requests.filter((r) => r.status === "CANCELLED").length;
  const recent = requests.slice(0, 5);

  // Status chart
  const statusData = {
    labels: [t("status.PENDING"), t("status.ASSIGNED"), t("status.IN_PROGRESS"), t("status.RESOLVED"), t("status.COMPLETED"), t("status.CANCELLED")],
    datasets: [{
      data: [pending, assigned, inProgress, resolved, completed, cancelled],
      backgroundColor: ["#f59e0b", "#3b82f6", "#0ea5e9", "#8b5cf6", "#22c55e", "#94a3b8"],
    }],
  };

  // Category chart
  const catCount: Record<string, number> = {};
  requests.forEach((r) => { catCount[r.category] = (catCount[r.category] || 0) + 1; });
  const catLabels = Object.keys(catCount).map((c) => t(`category.${c}`));
  const catData = {
    labels: catLabels,
    datasets: [{
      label: t("dashboard.total"),
      data: Object.values(catCount),
      backgroundColor: ["#6366f1", "#06b6d4", "#f43f5e", "#eab308", "#8b5cf6"],
    }],
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-sm text-slate-500">{t("dashboard.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📋" value={total} label={t("dashboard.total")} />
        <StatCard icon="⏳" value={pending} label={t("dashboard.pending")} />
        <StatCard icon="🔄" value={assigned + inProgress} label={t("dashboard.inProgress")} />
        <StatCard icon="✅" value={completed} label={t("dashboard.completed")} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">{t("dashboard.statusChart")}</h3>
          <div className="max-w-[280px] mx-auto">
            <Doughnut data={statusData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">{t("dashboard.categoryChart")}</h3>
          <Bar data={catData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">{t("dashboard.recentTitle")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-4">{t("table.code")}</th><th className="pb-3 pr-4">{t("table.item")}</th>
                <th className="pb-3 pr-4">{t("table.location")}</th><th className="pb-3 pr-4">{t("table.status")}</th>
                <th className="pb-3">{t("table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{r.code}</td><td className="py-3 pr-4">{r.title}</td>
                  <td className="py-3 pr-4">{r.location}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">{t("dashboard.noData")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
