"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useAbhaSession } from "@/hooks/useAbhaSession";

const ui = {
  en: {
    title: "Symptom Checker",
    listen: "Listen",
    intakeProgress: "Intake Progress",
    ayushMode: "AYUSH Mode",
    emergency: "Emergency",
    thinking: "Thinking...",
    pleaseWait: "Please wait...",
    quickSelect: "Quick Select",
    skip: "Skip",
    clear: "Clear",
    continueLabel: "Continue",
    speechNotSupported: "Speech recognition not supported in this browser",
  },
  hi: {
    title: "लक्षण जांच",
    listen: "सुनें",
    intakeProgress: "जानकारी की प्रगति",
    ayushMode: "आयुष मोड",
    emergency: "आपातकाल",
    thinking: "सोच रहे हैं...",
    pleaseWait: "कृपया प्रतीक्षा करें...",
    quickSelect: "त्वरित चयन",
    skip: "छोड़ें",
    clear: "साफ़ करें",
    continueLabel: "जारी रखें",
    speechNotSupported: "इस ब्राउज़र में वाक् पहचान समर्थित नहीं है",
  },
};

const defaultQuestion = {
  en: {
    normal: {
      questionTitle: "What seems to be the problem today?",
      questionSubtitle: "Speak clearly or select from the options below.",
      options: [
        { id: "chest_pain", label: "Chest Pain", icon: "favorite" },
        { id: "fever", label: "Fever / Chills", icon: "sick" },
        { id: "cough", label: "Cough / Cold", icon: "pulmonology" },
        { id: "stomach", label: "Stomach Pain", icon: "local_hospital" },
      ],
    },
    ayush: {
      questionTitle: "What is your main health concern? (AYUSH Mode)",
      questionSubtitle: "Speak clearly or select from the options below.",
      options: [
        { id: "chest_pain", label: "Chest Pain", icon: "favorite" },
        { id: "fever", label: "Fever / Chills", icon: "sick" },
        { id: "cough", label: "Cough / Cold", icon: "pulmonology" },
        { id: "stomach", label: "Stomach Pain", icon: "local_hospital" },
      ],
    },
  },
  hi: {
    normal: {
      questionTitle: "आज आपकी समस्या क्या लगती है?",
      questionSubtitle: "स्पष्ट रूप से बोलें या नीचे दिए गए विकल्पों में से चुनें।",
      options: [
        { id: "chest_pain", label: "सीने में दर्द", icon: "favorite" },
        { id: "fever", label: "बुखार / ठंड लगना", icon: "sick" },
        { id: "cough", label: "खांसी / सर्दी", icon: "pulmonology" },
        { id: "stomach", label: "पेट दर्द", icon: "local_hospital" },
      ],
    },
    ayush: {
      questionTitle: "आपकी मुख्य स्वास्थ्य समस्या क्या है? (आयुष मोड)",
      questionSubtitle: "स्पष्ट रूप से बोलें या नीचे दिए गए विकल्पों में से चुनें।",
      options: [
        { id: "chest_pain", label: "सीने में दर्द", icon: "favorite" },
        { id: "fever", label: "बुखार / ठंड लगना", icon: "sick" },
        { id: "cough", label: "खांसी / सर्दी", icon: "pulmonology" },
        { id: "stomach", label: "पेट दर्द", icon: "local_hospital" },
      ],
    },
  },
};

export default function HistoryWizardPage() {
  const router = useRouter();
  const { session } = useAbhaSession();
  const { lang, speak, isTranslating, setIsTranslating } = useLanguage();
  const t = ui[lang];

  const [isAyushMode, setIsAyushMode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isDynamic, setIsDynamic] = useState(false);

  const [questionData, setQuestionData] = useState<any>({
    ...defaultQuestion.en.normal,
    allowMultiple: true,
    isFinished: false,
    redFlagDetected: null,
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const prevLangRef = useRef(lang);

  // Speech Recognition Init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        recognitionRef.current = new SpeechRec();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleUserSubmit(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [messages, isAyushMode, lang]);

  // Instantly translate the on-screen question whenever the global language changes.
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;

    if (!isDynamic) {
      const fallback = defaultQuestion[lang][isAyushMode ? "ayush" : "normal"];
      setQuestionData((prev: any) => ({ ...prev, ...fallback }));
      speak(fallback.questionTitle + ". " + fallback.questionSubtitle);
      return;
    }

    // Re-translate the current AI-generated question in place (does not advance the conversation).
    (async () => {
      setIsTranslating(true);
      try {
        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              questionTitle: questionData.questionTitle,
              questionSubtitle: questionData.questionSubtitle,
              options: questionData.options,
              redFlagDetected: questionData.redFlagDetected,
            },
            targetLang: lang,
          }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setQuestionData((prev: any) => ({ ...prev, ...data }));
          speak((data.questionTitle || "") + ". " + (data.questionSubtitle || ""));
        }
      } catch (error) {
        console.error("Translate error:", error);
      } finally {
        setIsTranslating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert(t.speechNotSupported);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const fetchNextQuestion = async (newMessages: any[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/dynamic-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          isAyushMode,
          lang
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuestionData(data);
        setIsDynamic(true);
        setSelectedOptions([]);

        // Persist intake progress to the visit row so the doctor dashboard
        // can see it live, from any device (not just this kiosk's browser).
        fetch("/api/visits/current", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatHistory: newMessages,
            language: lang,
            isFinished: !!data.isFinished,
            ...(newMessages.length === 2 ? { chiefComplaint: newMessages[1].content } : {}),
          }),
        }).catch((error) => console.error("Failed to save visit progress:", error));

        if (data.isFinished) {
          // Keep localStorage as a fallback for the summary/documents pages.
          localStorage.setItem("chatHistory", JSON.stringify(newMessages));
          router.push("/documents");
        } else {
          speak(data.questionTitle);
        }
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || "Something went wrong while fetching the next question. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to reach the AI service. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = (textContent?: string) => {
    if (isLoading) return;

    let answerText = textContent;
    if (!answerText) {
      if (selectedOptions.length === 0) return;
      const selectedLabels = questionData.options
        .filter((opt: any) => selectedOptions.includes(opt.id))
        .map((opt: any) => opt.label);
      answerText = selectedLabels.join(", ");
    }

    const newMessages = [
      ...messages,
      { role: "assistant", content: questionData.questionTitle },
      { role: "user", content: answerText }
    ];

    setMessages(newMessages);
    fetchNextQuestion(newMessages);
  };

  const toggleOption = (id: string) => {
    if (questionData.allowMultiple) {
      setSelectedOptions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedOptions([id]);
    }
  };

  // 12 messages = 6 questions max. Progress grows up to 100%.
  const progressPct = Math.min(20 + (messages.length * 8), 100);

  return (
    <div className="bg-[#F5F1E8] font-body-md text-on-background min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F5F1E8]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-full transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[28px] text-[#8C8680]">arrow_back</span>
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface">{t.title}</span>
          </div>
          <button
            onClick={() => speak(questionData.questionTitle + ". " + questionData.questionSubtitle)}
            className="h-12 px-4 rounded-full bg-[#A8C69F] text-[#3E3A36] flex items-center gap-2 font-label-lg text-label-lg shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">volume_up</span>
            <span>{t.listen}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 bg-[#F5F1E8] relative px-margin-mobile">
        <div className="flex flex-col w-full h-full relative font-body-md text-on-background bg-[#F5F1E8] min-h-[calc(100vh-80px)] pb-safe">

          <div className="px-margin-mobile pt-4 pb-2 sticky top-0 bg-[#F5F1E8]/95 backdrop-blur z-20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-lg text-label-lg text-on-surface-variant">{t.intakeProgress}</span>
              <span className="font-label-sm text-label-sm text-[#A8C69F] font-medium">{Math.floor(progressPct)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className={`h-full bg-[#D48C70] rounded-full transition-all duration-500 ease-out`} style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          <div className="px-margin-mobile py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer min-w-[48px] min-h-[48px] justify-center">
                <input type="checkbox" className="sr-only peer" checked={isAyushMode} onChange={(e) => {
                  setIsAyushMode(e.target.checked);
                  setMessages([]);
                  setIsDynamic(false);
                  setQuestionData((prev: any) => ({
                    ...prev,
                    ...defaultQuestion[lang][e.target.checked ? "ayush" : "normal"],
                  }));
                }} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[6px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A8C69F]"></div>
              </label>
              <span className="font-label-lg text-label-lg text-on-surface">{t.ayushMode}</span>
            </div>

            {questionData.redFlagDetected && (
              <button className="h-[48px] px-4 rounded-full bg-[#E8B4B8] text-on-error-container flex items-center gap-2 font-label-lg text-label-lg shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                {t.emergency}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-margin-mobile py-8 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[200px] h-[200px] rounded-full bg-primary-container blur-3xl animate-pulse"></div>
            </div>
            <h2 className="font-display-lg-mobile text-display-lg-mobile text-center text-on-surface mb-2 relative z-10 transition-all">
              {isLoading ? t.thinking : isTranslating ? "..." : questionData.questionTitle}
            </h2>
            <p className="font-body-lg text-body-lg text-center text-on-surface-variant mb-10 relative z-10">
              {isLoading ? t.pleaseWait : isTranslating ? "" : questionData.questionSubtitle}
            </p>

            {errorMessage && (
              <div className="w-full max-w-sm mb-6 px-4 py-3 rounded-xl bg-[#E8B4B8]/40 border border-[#E8B4B8] text-center relative z-10">
                <p className="font-label-lg text-label-lg text-[#7A2E2E]">{errorMessage}</p>
              </div>
            )}

            <div className="relative flex items-center justify-center mb-12">
              {isListening && (
                <>
                  <div className="absolute w-[120px] h-[120px] bg-primary-fixed-dim rounded-full animate-ping opacity-50"></div>
                  <div className="absolute w-[140px] h-[140px] bg-primary-fixed rounded-full animate-pulse opacity-30 delay-75"></div>
                </>
              )}
              <button
                onClick={toggleSpeech}
                className={`relative z-10 w-[96px] h-[96px] rounded-full text-[#3E3A36] flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200 ${isListening ? 'bg-red-400' : 'bg-[#A8C69F]'}`}
              >
                <span className="material-symbols-outlined text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
              </button>
            </div>
          </div>

          <div className="px-margin-mobile pb-6 pt-4 bg-[#FFFCF5] rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] relative z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{t.quickSelect}</h3>
              <button className="min-h-[48px] min-w-[48px] flex items-center justify-center text-[#A8C69F] font-label-lg text-label-lg" onClick={() => handleUserSubmit("Skip")}>
                {t.skip}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {!isLoading && !isTranslating && questionData.options?.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex flex-col items-center justify-center p-4 min-h-[96px] rounded-xl shadow-sm border transition-colors text-center focus:outline-none ${selectedOptions.includes(opt.id) ? 'bg-[#A8C69F]/30 border-[#A8C69F]' : 'bg-[#FFFCF5] border-[#D9D3CC] hover:bg-surface-bright'}`}
                >
                  <span className="material-symbols-outlined text-[32px] text-[#D48C70] mb-2">{opt.icon?.toLowerCase() || 'radio_button_unchecked'}</span>
                  <span className="font-label-lg text-label-lg">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 min-h-[56px] rounded-full bg-surface-container text-on-surface flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-sm active:bg-surface-container-highest transition-colors" onClick={() => setSelectedOptions([])}>
                <span className="material-symbols-outlined text-[#8C8680]">replay</span>
                {t.clear}
              </button>
              <button
                onClick={() => handleUserSubmit()}
                disabled={isLoading || selectedOptions.length === 0}
                className={`flex-[2] min-h-[56px] rounded-full text-[#3E3A36] flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md transition-transform ${isLoading || selectedOptions.length === 0 ? 'bg-gray-300 opacity-70' : 'bg-[#A8C69F] active:scale-[0.98]'}`}
              >
                {t.continueLabel}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
