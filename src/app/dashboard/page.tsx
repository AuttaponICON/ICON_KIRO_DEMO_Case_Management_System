"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  slaDeadline?: string;
  assignee?: { name: string } | null;
  assigneeId?: number | null;
}

interface DrillDown {
  title: string;
  items: RequestItem[];
}

export default function DashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const [dashSearch, setDashSearch] = useState("");
  const [dashFilterStatus, setDashFilterStatus] = useState("");
  const [dashFilterCat, setDashFilterCat] = useState("");
  const [showDashSearch, setShowDashSearch] = useState(false);

  useEffect(() => {
    fetch("/api/requests").then((r) => r.json()).then(setRequests);
  }, []);

  // Apply dashboard search filter
  const dashFiltered = requests.filter((r) => {
    if (dashSearch) {
      const q = dashSearch.toLowerCase();
      if (!(r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q))) return false;
    }
    if (dashFilterStatus && r.status !== dashFilterStatus) return false;
    if (dashFilterCat && r.category !== dashFilterCat) return false;
    return true;
  });

  const total = dashFiltered.length;
  const pending = dashFiltered.filter((r) => r.status === "PENDING").length;
  const assigned = dashFiltered.filter((r) => r.status === "ASSIGNED").length;
  const inProgress = dashFiltered.filter((r) => r.status === "IN_PROGRESS").length;
  const completed = dashFiltered.filter((r) => r.status === "COMPLETED").length;
  const cancelled = dashFiltered.filter((r) => r.status === "CANCELLED").length;
  const resolved = dashFiltered.filter((r) => r.status === "RESOLVED").length;
  const recent = dashFiltered.slice(0, 5);

  const now = new Date();
  const activeStatuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
  const overdueItems = dashFiltered.filter((r) =>
    activeStatuses.includes(r.status) && r.slaDeadline && new Date(r.slaDeadline) < now
  );

  // Workload
  const workload: Record<string, { name: string; count: number }> = {};
  dashFiltered.filter((r) => activeStatuses.includes(r.status) && r.assignee?.name).forEach((r) => {
    const name = r.assignee!.name;
    if (!workload[name]) workload[name] = { name, count: 0 };
    workload[name].count++;
  });
  const workloadSorted = Object.values(workload).sort((a, b) => b.count - a.count);

  // Status chart data + click
  const statusKeys = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "COMPLETED", "CANCELLED"];
  const statusCounts = [pending, assigned, inProgress, resolved, completed, cancelled];
  const statusData = {
    labels: statusKeys.map((s) => t(`status.${s}`)),
    datasets: [{ data: statusCounts, backgroundColor: ["#f59e0b", "#3b82f6", "#0ea5e9", "#8b5cf6", "#22c55e", "#94a3b8"] }],
  };
  const onStatusClick = (_e: unknown, elements: { index: number }[]) => {
    if (elements.length > 0) {
      const idx = elements[0].index;
      const key = statusKeys[idx];
      setDrillDown({ title: t(`status.${key}`), items: dashFiltered.filter((r) => r.status === key) });
    }
  };

  // Category chart data + click
  const catKeys = Object.keys(dashFiltered.reduce<Record<string, boolean>>((acc, r) => { acc[r.category] = true; return acc; }, {}));
  const catCounts = catKeys.map((k) => dashFiltered.filter((r) => r.category === k).length);
  const catData = {
    labels: catKeys.map((c) => t(`category.${c}`)),
    datasets: [{ label: t("dashboard.total"), data: catCounts, backgroundColor: ["#6366f1", "#06b6d4", "#f43f5e", "#eab308", "#8b5cf6"] }],
  };
  const onCatClick = (_e: unknown, elements: { index: number }[]) => {
    if (elements.length > 0) {
      const idx = elements[0].index;
      const key = catKeys[idx];
      setDrillDown({ title: t(`category.${key}`), items: dashFiltered.filter((r) => r.category === key) });
    }
  };

  // Workload chart data + click
  const workloadData = {
    labels: workloadSorted.map((w) => w.name),
    datasets: [{ label: t("dashboard.activeCases"), data: workloadSorted.map((w) => w.count), backgroundColor: "#6366f1" }],
  };
  const onWorkloadClick = (_e: unknown, elements: { index: number }[]) => {
    if (elements.length > 0) {
      const idx = elements[0].index;
      const person = workloadSorted[idx];
      if (person) {
        setDrillDown({
          title: `${person.name} — ${t("dashboard.activeCases")}`,
          items: dashFiltered.filter((r) => activeStatuses.includes(r.status) && r.assignee?.name === person.name),
        });
      }
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-sm text-slate-500">{t("dashboard.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

      {/* Dashboard Search */}
      <div className="col-span-full bg-white rounded-xl shadow-sm p-4 mb-2">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input value={dashSearch} onChange={(e) => setDashSearch(e.target.value)} placeholder={t("search.placeholder")}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
          <button onClick={() => setShowDashSearch(!showDashSearch)}
            className={`px-3 py-2 border rounded-lg text-sm ${showDashSearch ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 hover:bg-slate-50"}`}>
            ⚙️ {t("search.advanced")}
          </button>
        </div>
        {showDashSearch && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center">
            <select value={dashFilterStatus} onChange={(e) => setDashFilterStatus(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
              <option value="">{t("table.status")}: {t("search.all")}</option>
              {["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","APPROVED","REJECTED","COMPLETED","CANCELLED"].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
            </select>
            <select value={dashFilterCat} onChange={(e) => setDashFilterCat(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm">
              <option value="">{t("table.category")}: {t("search.all")}</option>
              {["ELECTRICAL","PLUMBING","AC","BUILDING","OTHER"].map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
            </select>
            <button onClick={() => { setDashSearch(""); setDashFilterStatus(""); setDashFilterCat(""); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("search.clear")}</button>
            <span className="text-xs text-slate-400 ml-auto">{dashFiltered.length} / {requests.length}</span>
          </div>
        )}
      </div>
        <StatCard icon="📋" value={total} label={t("dashboard.total")} />
        <StatCard icon="⏳" value={pending} label={t("dashboard.pending")} />
        <StatCard icon="🔄" value={assigned + inProgress} label={t("dashboard.inProgress")} />
        <StatCard icon="✅" value={completed} label={t("dashboard.completed")} />
        <StatCard icon="🚨" value={overdueItems.length} label={t("dashboard.overdue")} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-1">{t("dashboard.statusChart")}</h3>
          <p className="text-xs text-slate-400 mb-3">{t("dashboard.clickToView")}</p>
          <div className="max-w-[260px] mx-auto">
            <Doughnut data={statusData} options={{
              plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } },
              onClick: onStatusClick,
            }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-1">{t("dashboard.categoryChart")}</h3>
          <p className="text-xs text-slate-400 mb-3">{t("dashboard.clickToView")}</p>
          <Bar data={catData} options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            onClick: onCatClick,
          }} />
        </div>
      </div>

      {/* Workload */}
      {workloadSorted.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold mb-1">{t("dashboard.workloadChart")}</h3>
          <p className="text-xs text-slate-400 mb-3">{t("dashboard.clickToView")}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Bar data={workloadData} options={{
                indexAxis: "y" as const,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                onClick: onWorkloadClick,
              }} />
            </div>
            <div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 uppercase"><th className="pb-2 pr-3">{t("table.assignee")}</th><th className="pb-2 pr-3">{t("dashboard.activeCases")}</th><th className="pb-2"></th></tr></thead>
                <tbody>
                  {workloadSorted.map((w) => (
                    <tr key={w.name} className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                      onClick={() => setDrillDown({ title: `${w.name} — ${t("dashboard.activeCases")}`, items: dashFiltered.filter((r) => activeStatuses.includes(r.status) && r.assignee?.name === w.name) })}>
                      <td className="py-2 pr-3 font-medium">{w.name}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${Math.min(w.count * 30, 100)}%` }} />
                          <span className="text-xs font-semibold">{w.count}</span>
                        </div>
                      </td>
                      <td className="py-2 text-xs text-indigo-600">{t("requests.detail")} →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SLA Overdue */}
      {overdueItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-red-500">
          <h3 className="font-semibold mb-4 text-red-600">🚨 {t("dashboard.overdueTitle")} ({overdueItems.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-3 pr-3">{t("table.code")}</th><th className="pb-3 pr-3">{t("table.item")}</th>
                <th className="pb-3 pr-3">{t("table.assignee")}</th><th className="pb-3 pr-3">{t("table.status")}</th>
                <th className="pb-3 pr-3">SLA</th><th className="pb-3">{t("dashboard.overdueDays")}</th>
              </tr></thead>
              <tbody>
                {overdueItems.map((r) => {
                  const days = Math.ceil((now.getTime() - new Date(r.slaDeadline!).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={r.id} className="border-t border-slate-100 cursor-pointer hover:bg-red-50"
                      onClick={() => router.push(`/dashboard/requests?search=${r.code}`)}>
                      <td className="py-2 pr-3">{r.code}</td>
                      <td className="py-2 pr-3 text-indigo-600">{r.title}</td>
                      <td className="py-2 pr-3">{r.assignee?.name || "-"}</td>
                      <td className="py-2 pr-3"><StatusBadge status={r.status} /></td>
                      <td className="py-2 pr-3 text-xs">{new Date(r.slaDeadline!).toLocaleDateString("th-TH")}</td>
                      <td className="py-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{days} {t("dashboard.days")}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">{t("dashboard.recentTitle")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase">
              <th className="pb-3 pr-4">{t("table.code")}</th><th className="pb-3 pr-4">{t("table.item")}</th>
              <th className="pb-3 pr-4">{t("table.location")}</th><th className="pb-3 pr-4">{t("table.status")}</th>
              <th className="pb-3">{t("table.date")}</th>
            </tr></thead>
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

      {/* Drill-Down Modal */}
      {drillDown && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{drillDown.title} ({drillDown.items.length})</h3>
              <button onClick={() => setDrillDown(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            {drillDown.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-3 pr-3">{t("table.code")}</th><th className="pb-3 pr-3">{t("table.item")}</th>
                    <th className="pb-3 pr-3">{t("table.location")}</th><th className="pb-3 pr-3">{t("table.status")}</th>
                    <th className="pb-3 pr-3">{t("table.assignee")}</th><th className="pb-3 pr-3">SLA</th>
                    <th className="pb-3">{t("table.date")}</th>
                  </tr></thead>
                  <tbody>
                    {drillDown.items.map((r) => {
                      const isOverdue = r.slaDeadline && activeStatuses.includes(r.status) && new Date(r.slaDeadline) < now;
                      const overdueDays = isOverdue ? Math.ceil((now.getTime() - new Date(r.slaDeadline!).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <tr key={r.id} className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${isOverdue ? "bg-red-50" : ""}`}
                          onClick={() => { setDrillDown(null); router.push(`/dashboard/requests?search=${r.code}`); }}>
                          <td className="py-2 pr-3 font-mono text-xs">{r.code}</td>
                          <td className="py-2 pr-3 text-indigo-600">{r.title}</td>
                          <td className="py-2 pr-3">{r.location}</td>
                          <td className="py-2 pr-3"><StatusBadge status={r.status} /></td>
                          <td className="py-2 pr-3">{r.assignee?.name || "-"}</td>
                          <td className="py-2 pr-3 text-xs">
                            {r.slaDeadline ? new Date(r.slaDeadline).toLocaleDateString("th-TH") : "-"}
                            {isOverdue && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">+{overdueDays}d</span>}
                          </td>
                          <td className="py-2 pr-3 text-xs">{new Date(r.createdAt).toLocaleDateString("th-TH")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">{t("dashboard.noData")}</p>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setDrillDown(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("action.close")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
