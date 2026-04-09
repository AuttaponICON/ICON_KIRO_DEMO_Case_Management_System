"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { useI18n } from "@/lib/i18n";

interface RequestItem { id: number; category: string; status: string; }

export default function ReportsPage() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => { fetch("/api/requests").then((r) => r.json()).then(setRequests); }, []);

  const total = requests.length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

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
        <h2 className="text-xl font-bold">{t("reports.title")}</h2>
        <p className="text-sm text-slate-500">{t("reports.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📊" value={total} label={t("reports.total")} />
        <StatCard icon="✅" value={`${rate}%`} label={t("reports.completionRate")} />
        <StatCard icon="🏷️" value={topCat ? t(`category.${topCat[0]}`) : "-"} label={t("reports.topCategory")} />
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
