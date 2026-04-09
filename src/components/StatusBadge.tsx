"use client";

import { useI18n } from "@/lib/i18n";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-sky-100 text-sky-800",
  RESOLVED: "bg-violet-100 text-violet-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const style = statusStyle[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {t(`status.${status}`)}
    </span>
  );
}
