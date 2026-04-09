"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";
  const { t, lang, setLang } = useI18n();
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
        setError(data.error || t("login.error"));
        return;
      }
      router.push("/dashboard");
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <select value={lang} onChange={(e) => setLang(e.target.value)}
            className="text-xs px-2 py-1 border border-slate-200 rounded-lg">
            {SUPPORTED_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <div className="text-center text-4xl mb-3">🔧</div>
        <h1 className="text-xl font-bold text-center">{t("app.name")}</h1>
        <p className="text-center text-slate-500 text-sm mb-6">{t("app.subtitle")}</p>
        {expired && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-amber-700 text-xs">{t("login.sessionExpired")}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{t("login.username")}</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder={t("login.usernamePlaceholder")} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("login.password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")} required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
            {loading ? t("login.loading") : t("login.submit")}
          </button>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </form>
        <p className="text-center text-xs text-slate-400 mt-5">{t("login.demo")}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
