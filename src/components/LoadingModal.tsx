"use client";

export default function LoadingModal({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-white/70 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">กำลังโหลด...</p>
      </div>
    </div>
  );
}
