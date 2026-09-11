"use client";

import { useLanguage } from "@/lib/i18n";

export default function TranslateButton() {
  const { lang, toggleLang, isTranslating } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      disabled={isTranslating}
      aria-label={lang === "en" ? "Translate to Hindi" : "Translate to English"}
      className="fixed bottom-24 right-4 z-[70] min-w-[56px] min-h-[56px] px-4 rounded-full bg-[#3E3A36] text-white flex items-center gap-2 shadow-lg active:scale-95 transition-transform touch-manipulation disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[22px]">
        {isTranslating ? "progress_activity" : "translate"}
      </span>
      <span className="font-label-lg text-sm font-semibold whitespace-nowrap">
        {isTranslating ? "..." : lang === "en" ? "हिन्दी" : "English"}
      </span>
    </button>
  );
}
