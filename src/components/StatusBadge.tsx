const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอดำเนินการ", className: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "เสร็จสิ้น", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "ยกเลิก", className: "bg-red-100 text-red-800" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
