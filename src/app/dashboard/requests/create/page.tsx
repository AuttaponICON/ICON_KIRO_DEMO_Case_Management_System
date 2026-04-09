"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface CatConfig { id: number; key: string; name: string; icon: string; subCategories: { id: number; name: string; slaDays: number }[]; }

interface FileItem { id: string; name: string; type: string; size: number; preview: string | null; }

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CreateCasePage() {
  const { t } = useI18n();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CatConfig[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((data) => {
      setCategories(data);
      if (data.length > 0) setCategoryKey(data[0].key);
    });
    // Pre-fill reporter from logged-in user
    fetch("/api/auth/me").then((r) => r.json()).then((u) => {
      if (u.name) setReporterName(u.name);
    });
  }, []);

  const selectedCat = categories.find((c) => c.key === categoryKey);
  const subCategories = selectedCat?.subCategories || [];

  // Reset sub when category changes
  useEffect(() => {
    if (subCategories.length > 0) setSubCategory(subCategories[0].name);
    else setSubCategory("");
  }, [categoryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    newFiles.forEach((file) => {
      const id = Math.random().toString(36).slice(2);
      let preview: string | null = null;
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        preview = URL.createObjectURL(file);
      }
      setFiles((prev) => [...prev, { id, name: file.name, type: file.type, size: file.size, preview }]);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    return "📎";
  };

  const handleSubmit = async () => {
    if (!title || !location || !categoryKey) return;
    setSaving(true);
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, detail, category: categoryKey, subCategory, location,
          priority, reporterName, reporterPhone,
          attachments: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        }),
      });
      router.push("/dashboard/requests");
    } finally {
      setSaving(false);
    }
  };

  const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
    LOW: { label: t("priority.LOW"), color: "border-slate-300 bg-slate-50 text-slate-600", icon: "🟢" },
    MEDIUM: { label: t("priority.MEDIUM"), color: "border-amber-300 bg-amber-50 text-amber-700", icon: "🟡" },
    HIGH: { label: t("priority.HIGH"), color: "border-orange-300 bg-orange-50 text-orange-700", icon: "🟠" },
    CRITICAL: { label: t("priority.CRITICAL"), color: "border-red-300 bg-red-50 text-red-700", icon: "🔴" },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1">← {t("createCase.back")}</button>
        <h2 className="text-xl font-bold">{t("createCase.title")}</h2>
        <p className="text-sm text-slate-500">{t("createCase.subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Case Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">📋 {t("createCase.sectionInfo")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.caseTitle")} <span className="text-red-500">*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required
                placeholder={t("createCase.caseTitlePlaceholder")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.caseDetail")}</label>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={4}
                placeholder={t("createCase.caseDetailPlaceholder")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {/* Section 2: Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">🏷️ {t("createCase.sectionCategory")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.catLv1")} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button key={cat.key} onClick={() => setCategoryKey(cat.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition ${categoryKey === cat.key ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold" : "border-slate-200 hover:bg-slate-50"}`}>
                    <span className="text-lg">{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.catLv2")}</label>
              {subCategories.length > 0 ? (
                <div className="space-y-1.5">
                  {subCategories.map((sub) => (
                    <button key={sub.id} onClick={() => setSubCategory(sub.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition ${subCategory === sub.name ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold" : "border-slate-200 hover:bg-slate-50"}`}>
                      <span>{sub.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">SLA {sub.slaDays}d</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-4">{t("createCase.noSubCat")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Location & Priority */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">📍 {t("createCase.sectionLocation")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t("table.location")} <span className="text-red-500">*</span></label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} required
                placeholder={t("modal.locationPlaceholder")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.priority")}</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => {
                  const cfg = priorityConfig[p];
                  return (
                    <button key={p} onClick={() => setPriority(p)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition ${priority === p ? cfg.color + " font-semibold border-2" : "border-slate-200 hover:bg-slate-50"}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Reporter */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">👤 {t("createCase.sectionReporter")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.reporterName")}</label>
              <input value={reporterName} onChange={(e) => setReporterName(e.target.value)}
                placeholder={t("createCase.reporterNamePlaceholder")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t("createCase.reporterPhone")}</label>
              <input value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {/* Section 5: Attachments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">📎 {t("createCase.sectionAttach")}</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm text-slate-500">{t("createCase.dropzone")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("createCase.dropzoneHint")}</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} className="hidden" />

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  {f.preview && f.type.startsWith("image/") ? (
                    <img src={f.preview} alt={f.name} className="w-12 h-12 rounded object-cover" />
                  ) : f.preview && f.type.startsWith("video/") ? (
                    <video src={f.preview} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <span className="text-2xl">{getFileIcon(f.type)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-slate-400">{formatSize(f.size)}</div>
                  </div>
                  <button onClick={() => removeFile(f.id)} className="text-slate-400 hover:text-red-500 text-lg">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t("action.close")}</button>
          <button onClick={handleSubmit} disabled={saving || !title || !location || !categoryKey}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
            {saving ? t("createCase.saving") : t("createCase.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
