"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "hi";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  speak: (text: string, lang?: Lang) => void;
  isTranslating: boolean;
  setIsTranslating: (value: boolean) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const VOICE_TAG: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("preferredLanguage");
      if (stored === "hi" || stored === "en") {
        setLangState(stored);
      }
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("preferredLanguage", next);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "en" ? "hi" : "en";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("preferredLanguage", next);
      }
      return next;
    });
  }, []);

  const speak = useCallback((text: string, overrideLang?: Lang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_TAG[overrideLang ?? lang];
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, speak, isTranslating, setIsTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
