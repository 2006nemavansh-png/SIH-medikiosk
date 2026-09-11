"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WelcomePage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<"en" | "hi">("en");
  const [isLoading, setIsLoading] = useState(false);
  const audioPulseRef = useRef<HTMLDivElement>(null);

  const handleAudioPrompt = () => {
    if (audioPulseRef.current) {
      audioPulseRef.current.classList.remove("opacity-0");
      const animation = audioPulseRef.current.animate(
        [
          { transform: "scale(1)", opacity: 0.5 },
          { transform: "scale(1.5)", opacity: 0 },
        ],
        {
          duration: 800,
          easing: "ease-out",
          iterations: 2,
        }
      );
      animation.onfinish = () => {
        if (audioPulseRef.current) {
          audioPulseRef.current.classList.add("opacity-0");
        }
      };
    }
  };

  const handleProceed = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", selectedLang);
    }
    router.push("/history"); // Proceeding directly to history in this simplified Next.js version
  };

  return (
    <main className="flex-1">
      <div className="flex flex-col w-full min-h-full px-[var(--spacing-margin-mobile)] pb-[var(--spacing-margin-desktop)] gap-[var(--spacing-stack-gap)] relative overflow-hidden">
        
        {/* Hero Illustration */}
        <div className="w-full aspect-[4/3] max-h-[300px] rounded-[8px] bg-(--color-surface-container) shadow-sm flex items-center justify-center overflow-hidden shrink-0 mt-[var(--spacing-margin-mobile)] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover absolute inset-0 z-0"
            alt="A warm, approachable AI medical assistant in a modern Indian hospital setting."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcqjQTrvBcIKh_BWzIZp5qymIT9dItjV1Gk9ky0-mHCfgZV8VKYrRaSshzg2gVOmbne2pgCZBAMJSXefdRYZQOVHMpY30E_6YX4eQE_nhcnZLzmlW9Z8efuADasr2zdLE4k7iEvnhrmdjSeKMp78j9_LROo1PkVYBfMttB2OXE_GLk3SkwDV_iZQfprenQrO9v5owSi6DaEFn4X90sbfzABhyyciIiNgS5z7-OgFLa__C3Q2bl1PI7"
          />
          {/* Ambient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-10"></div>
        </div>

        {/* Header & Audio Prompt */}
        <div className="flex flex-col gap-[var(--spacing-unit)] items-center text-center relative z-20 -mt-[var(--spacing-stack-gap)]">
          <h1 className="font-display-lg-mobile text-[var(--text-display-lg-mobile)] font-bold text-(--color-on-surface) drop-shadow-sm">
            Welcome / स्वागत है
          </h1>
          <p className="font-body-lg text-[var(--text-body-lg)] text-(--color-on-surface-variant) max-w-[280px]">
            Please select your preferred language to begin.
          </p>

          {/* Audio Button */}
          <button
            onClick={handleAudioPrompt}
            className="mt-[var(--spacing-unit)] h-[56px] px-6 rounded-[8px] bg-[#A8C69F] text-[#3E3A36] flex items-center gap-2 shadow-md relative overflow-hidden group active:scale-95 transition-transform touch-manipulation"
          >
            <div ref={audioPulseRef} className="absolute inset-0 bg-white/20 rounded-[8px] opacity-0"></div>
            <span
              className="material-symbols-outlined relative z-10 text-[28px] text-[#8C8680]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
            <span className="relative z-10 font-label-lg text-[var(--text-label-lg)] whitespace-nowrap">
              Listen to Instructions
            </span>
          </button>
        </div>

        {/* Language Selection Grid */}
        <div className="flex flex-col gap-[var(--spacing-unit)] w-full">
          <LanguageButton
            lang="en"
            icon="A"
            primaryLabel="English"
            selectedLang={selectedLang}
            onClick={() => setSelectedLang("en")}
          />
          <LanguageButton
            lang="hi"
            icon="अ"
            primaryLabel="हिन्दी"
            secondaryLabel="Hindi"
            selectedLang={selectedLang}
            onClick={() => setSelectedLang("hi")}
          />
        </div>

        {/* Bottom Actions & Consent */}
        <div className="flex flex-col gap-[var(--spacing-stack-gap)] mt-auto pt-[var(--spacing-stack-gap)] w-full">
          <p className="text-center font-body-md text-[var(--text-body-md)] text-(--color-on-surface-variant) px-4">
            By proceeding, you agree to our <button className="text-(--color-primary) font-bold active:opacity-70">consent guidelines</button>.
          </p>
          <button
            onClick={handleProceed}
            className="w-full h-[64px] bg-[#A8C69F] text-[#3E3A36] rounded-[8px] flex items-center justify-center gap-2 shadow-md active:shadow-sm active:scale-[0.99] transition-all touch-manipulation"
          >
            <span className="font-headline-md text-[var(--text-headline-md)] font-semibold">Start / शुरू करें</span>
            <span
              className="material-symbols-outlined text-[28px] text-[#3E3A36]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

function LanguageButton({
  lang,
  icon,
  primaryLabel,
  secondaryLabel,
  selectedLang,
  onClick,
}: {
  lang: string;
  icon: string;
  primaryLabel: string;
  secondaryLabel?: string;
  selectedLang: string;
  onClick: () => void;
}) {
  const isSelected = selectedLang === lang;

  return (
    <button
      onClick={onClick}
      className={`w-full h-[80px] rounded-[8px] flex items-center px-[var(--spacing-gutter)] gap-[var(--spacing-gutter)] text-left transition-all active:scale-[0.98] touch-manipulation border ${
        isSelected
          ? "bg-(--color-primary-container) shadow-md border-[#D9D3CC]"
          : "bg-[#FFFCF5] shadow-sm border-[#D9D3CC]"
      }`}
    >
      <div
        className={`w-[48px] h-[48px] shrink-0 rounded-[8px] flex items-center justify-center text-[24px] ${
          isSelected ? "bg-(--color-surface-container-lowest) shadow-sm" : "bg-(--color-surface-container-low)"
        }`}
      >
        {icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`font-headline-md text-[var(--text-headline-md)] font-semibold truncate ${
            isSelected ? "text-(--color-on-primary-container)" : "text-(--color-on-surface)"
          }`}
        >
          {primaryLabel}
        </span>
        {secondaryLabel && (
          <span className="font-label-sm text-[var(--text-label-sm)] font-medium text-(--color-on-surface-variant) truncate">
            {secondaryLabel}
          </span>
        )}
      </div>
      <span
        className={`material-symbols-outlined shrink-0 ${
          isSelected ? "text-(--color-primary)" : "text-[#8C8680]"
        }`}
        style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
      >
        {isSelected ? "check_circle" : "chevron_right"}
      </span>
    </button>
  );
}
