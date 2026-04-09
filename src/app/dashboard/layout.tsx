"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface UserData {
  name: string;
  role: string;
  permissions: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => router.push("/"));
  }, [router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">กำลังโหลด...</p></div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 md:ml-60 p-6">{children}</main>
    </div>
  );
}
