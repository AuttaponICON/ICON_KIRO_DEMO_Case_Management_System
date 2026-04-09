"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import * as XLSX from "xlsx";
import LoadingModal from "@/components/LoadingModal";

interface ImportRow { title: string; location: string; category: string; subCategory: string; priority: string; detail: string; reporterName: string; reporterPhone: string; }

export default function ImportCasePage() {
  const { t } = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const downloadTemplate = () => {
    const template = [{ title: "แอร์ไม่เย็น", location: "ห้อง 301", category: "AC", subCategory: "แอร์ไม่เย็น", priority: "HIGH", detail: "รายละเอียด", reporterName: "ชื่อผู้แจ้ง", reporterPhone: "081-xxx-xxxx" }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "case-import-template.xlsx");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<ImportRow>(ws);
      setRows(data);
      setResult(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0, failed = 0;
    for (const row of rows) {
      try {
        const res = await fetch("/api/requests", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: row.title, location: row.location, category: row.category, subCategory: row.subCategory, priority: row.priority || "MEDIUM", detail: row.detail, reporterName: row.reporterName, reporterPhone: row.reporterPhone }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setResult({ success, failed });
    setImporting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <LoadingModal show={importing} />
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-indigo-600 mb-2">← {t("createCase.back")}</button>
        <h2 className="text-xl font-bold">{t("import.title")}</h2>
        <p className="text-sm text-slate-500">{t("import.subtitle")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold mb-4">1. {t("import.downloadTemplate")}</h3>
        <button onClick={downloadTemplate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">📥 {t("import.downloadBtn")}</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold mb-4">2. {t("import.uploadFile")}</h3>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm text-slate-500">{t("import.dropzone")}</p>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold mb-4">3. {t("import.preview")} ({rows.length} {t("import.rows")})</h3>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate-500 uppercase">
                <th className="pb-2 pr-2">#</th><th className="pb-2 pr-2">Title</th><th className="pb-2 pr-2">Location</th>
                <th className="pb-2 pr-2">Category</th><th className="pb-2 pr-2">Priority</th><th className="pb-2">Reporter</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-1.5 pr-2">{i + 1}</td><td className="py-1.5 pr-2">{r.title}</td>
                    <td className="py-1.5 pr-2">{r.location}</td><td className="py-1.5 pr-2">{r.category}</td>
                    <td className="py-1.5 pr-2">{r.priority}</td><td className="py-1.5">{r.reporterName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleImport} disabled={importing}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {t("import.importBtn")} ({rows.length})
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-3">{t("import.result")}</h3>
          <div className="flex gap-4">
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{result.success}</div><div className="text-xs text-slate-500">{t("logs.success")}</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-red-600">{result.failed}</div><div className="text-xs text-slate-500">{t("logs.failed")}</div></div>
          </div>
          <button onClick={() => router.push("/dashboard/requests")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">{t("import.goToList")}</button>
        </div>
      )}
    </div>
  );
}
