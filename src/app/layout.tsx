import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบแจ้งซ่อม",
  description: "Maintenance Request System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-slate-100 text-slate-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
