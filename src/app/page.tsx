"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="text-center text-4xl mb-3">🔧</div>
        <h1 className="text-xl font-bold text-center">ระบบแจ้งซ่อม</h1>
        <p className="text-center text-slate-500 text-sm mb-6">Maintenance Request System</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">ชื่อผู้ใช้</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </form>
        <p className="text-center text-xs text-slate-400 mt-5">ทดสอบ: admin / 1234</p>
      </div>
    </div>
  );
}
