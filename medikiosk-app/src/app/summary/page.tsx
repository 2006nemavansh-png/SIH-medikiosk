"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompletion } from "ai/react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { useAbhaSession } from "@/hooks/useAbhaSession";

const ui = {
  en: {
    brand: "MediKiosk",
    subtitle: "Doctor View: Clinical Summary",
    heading: "Generated H&P Note",
    synthesizing: "Synthesizing...",
    failed: "Failed to generate the clinical summary:",
    generating: "Generating summary...",
    print: "Print",
    saveToEhr: "Save to EHR",
    savedAlert: "Summary saved to EHR successfully!",
  },
  hi: {
    brand: "मेडीकियोस्क",
    subtitle: "डॉक्टर व्यू: क्लिनिकल सारांश",
    heading: "जनरेटेड H&P नोट",
    synthesizing: "सारांश तैयार हो रहा है...",
    failed: "क्लिनिकल सारांश बनाने में विफल:",
    generating: "सारांश तैयार किया जा रहा है...",
    print: "प्रिंट करें",
    saveToEhr: "EHR में सहेजें",
    savedAlert: "सारांश सफलतापूर्वक EHR में सहेजा गया!",
  },
};

export default function DoctorSummaryPage() {
  const router = useRouter();
  const { session } = useAbhaSession();
  const { lang } = useLanguage();
  const t = ui[lang];
  const [documents, setDocuments] = useState<any[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const prevLangRef = useRef(lang);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/summary",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !hasStarted && session?.visitId) {
      setHasStarted(true);
      const visitId = session.visitId;
      const fallbackChatHistoryStr = localStorage.getItem("chatHistory");
      const fallbackChatHistory = fallbackChatHistoryStr ? JSON.parse(fallbackChatHistoryStr) : [];

      Promise.all([
        supabase.from("visits").select("chat_history").eq("id", visitId).maybeSingle(),
        supabase.from("documents").select("*").eq("visit_id", visitId),
      ]).then(([{ data: visit }, { data: docsData }]) => {
        const chatHistory = visit?.chat_history || fallbackChatHistory;
        const docs = docsData || [];
        setDocuments(docs);
        complete("", { body: { chatHistory, documents: docs, lang } });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, hasStarted, session?.visitId]);

  // Regenerate the note in the newly selected language whenever the global language changes.
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    if (!hasStarted) return;

    const chatHistoryStr = typeof window !== "undefined" ? localStorage.getItem("chatHistory") : null;
    const chatHistory = chatHistoryStr ? JSON.parse(chatHistoryStr) : [];
    complete("", { body: { chatHistory, documents, lang } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <main className="flex-1 flex flex-col relative h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#D9D3CC] bg-white sticky top-0 z-50 shrink-0 shadow-sm">
        <div>
          <h1 className="font-display text-[20px] font-bold text-(--color-on-surface)">{t.brand}</h1>
          <p className="font-label text-[14px] text-(--color-on-surface-variant)">{t.subtitle}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-[#D9D3CC] shadow-md rounded-[16px] p-8 flex flex-col">
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
                <button
                  onClick={() => {
                    alert(t.savedAlert);
                    router.push("/");
                  }}
                  className="px-6 py-2 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  {t.saveToEhr}
                </button>
             </div>
          )}
        </div>
      </div>
    </main>
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
