export default function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
