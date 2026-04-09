"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import th from "@/locales/th.json";
import en from "@/locales/en.json";

// Add new languages here — just import the JSON and add to this map
const locales: Record<string, Record<string, unknown>> = { th, en };

export const SUPPORTED_LANGUAGES = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  // Add more: { code: "ja", label: "日本語" },
];

type I18nContextType = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: "th",
  setLang: () => {},
  t: (key: string) => key,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key
    }
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("th");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && locales[saved]) setLangState(saved);
  }, []);

  const setLang = useCallback((newLang: string) => {
    if (locales[newLang]) {
      setLangState(newLang);
      localStorage.setItem("lang", newLang);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = locales[lang] || locales["th"];
      const result = getNestedValue(dict as Record<string, unknown>, key);
      if (result !== key) return result;
      // Fallback to Thai
      return getNestedValue(locales["th"] as Record<string, unknown>, key);
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
