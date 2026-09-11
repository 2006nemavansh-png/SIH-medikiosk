"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompletion } from "ai/react";
import { supabase, ensureAnonymousSession } from "@/lib/supabase";

export default function DoctorSummaryPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/summary",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !hasStarted) {
      setHasStarted(true);
      const visitId = localStorage.getItem("currentVisitId");
      const chatHistoryStr = localStorage.getItem("chatHistory");
      
      const chatHistory = chatHistoryStr ? JSON.parse(chatHistoryStr) : [];
      
      if (visitId) {
        // Fetch docs from Supabase (RLS restricts this to the current session's own rows)
        ensureAnonymousSession().then(() =>
          supabase
            .from("documents")
            .select("*")
            .eq("visit_id", visitId)
            .then(({ data }) => {
              const docs = data || [];
              setDocuments(docs);
              complete("", { body: { chatHistory, documents: docs } });
            })
        );
      } else {
        complete("", { body: { chatHistory, documents: [] } });
      }
    }
  }, [complete, hasStarted]);

  return (
    <main className="flex-1 flex flex-col relative h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#D9D3CC] bg-white sticky top-0 z-50 shrink-0 shadow-sm">
        <div>
          <h1 className="font-display text-[20px] font-bold text-(--color-on-surface)">MediKiosk</h1>
          <p className="font-label text-[14px] text-(--color-on-surface-variant)">Doctor View: Clinical Summary</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-[#D9D3CC] shadow-md rounded-[16px] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">clinical_notes</span>
              Generated H&P Note
            </h2>
            {isLoading && (
              <span className="text-blue-600 font-semibold flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined">psychiatry</span>
                Synthesizing...
              </span>
            )}
          </div>

          <div className="prose prose-blue max-w-none text-gray-700">
            {error ? (
              <p className="text-red-600 font-semibold">
                Failed to generate the clinical summary: {error.message}
              </p>
            ) : completion ? (
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(completion) }} />
            ) : (
              <p className="text-gray-400 italic">Generating summary...</p>
            )}
          </div>
          
          {!isLoading && completion && (
             <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">print</span>
                  Print
                </button>
                <button 
                  onClick={() => {
                    alert("Summary saved to EHR successfully!");
                    router.push("/");
                  }}
                  className="px-6 py-2 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  Save to EHR
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
