"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { t, Lang, TranslationKey } from "@/lib/translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  tr: (key) => t.ar[key] as string,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = localStorage.getItem("naqlgo_lang") as Lang | null;
    if (stored === "ar" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("naqlgo_lang", lang);
  }, [lang]);

  const tr = (key: TranslationKey): string => t[lang][key] as string;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
