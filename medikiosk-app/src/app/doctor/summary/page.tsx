"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompletion } from "ai/react";
import { useLanguage } from "@/lib/i18n";
import { useDoctorSession } from "@/hooks/useDoctorSession";

const ui = {
  en: {
    brand: "MediKiosk",
    subtitle: "Doctor View: Clinical Summary",
    heading: "Generated H&P Note",
    synthesizing: "Synthesizing...",
    failed: "Failed to generate the clinical summary:",
    generating: "Generating summary...",
    print: "Print",
    back: "Back to Dashboard",
    noVisit: "No visit selected. Open this page from a patient in the doctor dashboard.",
  },
  hi: {
    brand: "मेडीकियोस्क",
    subtitle: "डॉक्टर व्यू: क्लिनिकल सारांश",
    heading: "जनरेटेड H&P नोट",
    synthesizing: "सारांश तैयार हो रहा है...",
    failed: "क्लिनिकल सारांश बनाने में विफल:",
    generating: "सारांश तैयार किया जा रहा है...",
    print: "प्रिंट करें",
    back: "डैशबोर्ड पर वापस जाएं",
    noVisit: "कोई विज़िट चयनित नहीं है। इस पृष्ठ को डॉक्टर डैशबोर्ड से किसी मरीज़ के लिए खोलें।",
  },
};

function DoctorSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const { session, isChecking } = useDoctorSession();
  const { lang } = useLanguage();
  const t = ui[lang];
  const [hasStarted, setHasStarted] = useState(false);
  const prevLangRef = useRef(lang);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/summary",
  });

  useEffect(() => {
    if (!session || !visitId || hasStarted) return;
    setHasStarted(true);

    fetch(`/api/doctor/visits/${visitId}`)
      .then((res) => res.json())
      .then((data) => {
        complete("", { body: { chatHistory: data.chatHistory || [], documents: data.documents || [], lang } });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, visitId, hasStarted, complete]);

  // Regenerate the note in the newly selected language whenever the global language changes.
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    if (!hasStarted || !visitId) return;

    fetch(`/api/doctor/visits/${visitId}`)
      .then((res) => res.json())
      .then((data) => {
        complete("", { body: { chatHistory: data.chatHistory || [], documents: data.documents || [], lang } });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  if (isChecking) return null;

  return (
    <main className="flex-1 flex flex-col relative min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#D9D3CC] bg-white sticky top-0 z-50 shrink-0 shadow-sm">
        <div>
          <h1 className="font-display text-[20px] font-bold text-(--color-on-surface)">{t.brand}</h1>
          <p className="font-label text-[14px] text-(--color-on-surface-variant)">{t.subtitle}</p>
        </div>
        <button
          onClick={() => router.push("/doctor")}
          className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t.back}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-[#D9D3CC] shadow-md rounded-[16px] p-8 flex flex-col">
          {!visitId ? (
            <p className="text-gray-500 italic">{t.noVisit}</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">clinical_notes</span>
                  {t.heading}
                </h2>
                {isLoading && (
                  <span className="text-blue-600 font-semibold flex items-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined">psychiatry</span>
                    {t.synthesizing}
                  </span>
                )}
              </div>

              <div className="prose prose-blue max-w-none text-gray-700">
                {error ? (
                  <p className="text-red-600 font-semibold">
                    {t.failed} {error.message}
                  </p>
                ) : completion ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(completion) }} />
                ) : (
                  <p className="text-gray-400 italic">{t.generating}</p>
                )}
              </div>

              {!isLoading && completion && (
                <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end gap-4">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">print</span>
                    {t.print}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DoctorSummaryPage() {
  return (
    <Suspense fallback={null}>
      <DoctorSummaryContent />
    </Suspense>
  );
}

// Very basic markdown formatter for bolding and lists
function formatMarkdown(text: string) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2 text-gray-800">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}
