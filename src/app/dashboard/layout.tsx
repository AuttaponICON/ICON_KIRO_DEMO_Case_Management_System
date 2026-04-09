"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useIdleTimeout } from "@/lib/useIdleTimeout";

interface UserData {
  name: string;
  role: string;
  permissions: string[];
}

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  const handleIdle = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/?expired=1");
  }, [router]);

  useIdleTimeout(handleIdle, IDLE_TIMEOUT_MS);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => router.push("/"));
  }, [router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">Loading...</p></div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 md:ml-60 p-6">{children}</main>
    </div>
  );
}
