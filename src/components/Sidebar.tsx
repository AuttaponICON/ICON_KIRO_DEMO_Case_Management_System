"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Permission, hasPermission } from "@/lib/permissions";
import { useI18n } from "@/lib/i18n";

interface NavItem { href: string; labelKey: string; icon: string; permission: Permission; }
interface NavGroup { labelKey: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    labelKey: "sidebar.groupMain",
    items: [
      { href: "/dashboard", labelKey: "sidebar.dashboard", icon: "📊", permission: "menu:dashboard" },
      { href: "/dashboard/requests", labelKey: "sidebar.requests", icon: "📝", permission: "menu:requests" },
      { href: "/dashboard/reports", labelKey: "sidebar.reports", icon: "📈", permission: "menu:reports" },
    ],
  },
  {
    labelKey: "sidebar.groupAdmin",
    items: [
      { href: "/dashboard/admin/users", labelKey: "sidebar.users", icon: "👥", permission: "menu:admin" },
      { href: "/dashboard/admin/roles", labelKey: "sidebar.roles", icon: "🔑", permission: "menu:admin" },
      { href: "/dashboard/admin/categories", labelKey: "sidebar.categories", icon: "🏷️", permission: "menu:admin" },
      { href: "/dashboard/admin/master-data", labelKey: "sidebar.masterData", icon: "📋", permission: "menu:admin" },
    ],
  },
  {
    labelKey: "sidebar.groupLogs",
    items: [
      { href: "/dashboard/admin/interface-logs", labelKey: "sidebar.interfaceLogs", icon: "📡", permission: "menu:admin" },
      { href: "/dashboard/admin/login-logs", labelKey: "sidebar.loginLogs", icon: "🔐", permission: "menu:admin" },
    ],
  },
  {
    labelKey: "sidebar.groupSettings",
    items: [
      { href: "/dashboard/settings", labelKey: "sidebar.settings", icon: "⚙️", permission: "menu:settings" },
    ],
  },
];

interface Props { user: { name: string; role: string; permissions: string[] }; }

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg text-lg">☰</button>
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-slate-800 text-white flex flex-col transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 text-lg font-bold border-b border-white/10 flex items-center gap-2">🔧 {t("app.name")}</div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => hasPermission(user.permissions, item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.labelKey} className="mb-1">
                <div className="px-5 py-2 text-[10px] uppercase tracking-wider text-white/30 font-semibold">{t(group.labelKey)}</div>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-5 py-2 text-sm transition ${isActive ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                      <span>{item.icon}</span> {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">{user.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-white/50">{user.role}</div>
          </div>
          <button onClick={handleLogout} className="text-white/50 hover:text-white text-lg" title={t("sidebar.logout")}>🚪</button>
        </div>
      </aside>
    </>
  );
}
