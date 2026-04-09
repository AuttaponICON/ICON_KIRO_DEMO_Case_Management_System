const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอดำเนินการ", className: "bg-amber-100 text-amber-800" },
  ASSIGNED: { label: "มอบหมายแล้ว", className: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", className: "bg-sky-100 text-sky-800" },
  RESOLVED: { label: "ส่งผลแก้ไขแล้ว", className: "bg-violet-100 text-violet-800" },
  APPROVED: { label: "อนุมัติแล้ว", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "ถูกปฏิเสธ", className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "เสร็จสิ้น", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "ยกเลิก", className: "bg-slate-100 text-slate-600" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
