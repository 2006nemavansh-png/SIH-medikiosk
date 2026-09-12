"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, ensureAnonymousSession } from '@/lib/supabase';

interface DocumentRecord {
  documentType: string;
  keyFindings: string;
  timestamp: string;
  isError?: boolean;
}

export default function DocumentScanner() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      setIsScanning(true);

      try {
        const response = await fetch('/api/ai/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data }),
        });

        if (response.ok) {
          const data = await response.json();
          const newRecord = { ...data, timestamp: new Date().toLocaleDateString() };
          setRecords(prev => [...prev, newRecord]);

          // Save to Supabase if visitId is present
          const visitId = typeof window !== 'undefined' ? localStorage.getItem('currentVisitId') : null;
          if (visitId) {
            await ensureAnonymousSession();
            await supabase.from('documents').insert({
              visit_id: visitId,
              document_type: data.documentType,
              key_findings: data.keyFindings,
              extracted_text: data.extractedText
            });
          }
        } else {
          console.error('Failed to parse document');
          setRecords(prev => [...prev, {
            documentType: 'Unrecognized Document',
            keyFindings: 'The AI could not read this document. Please try a clearer scan.',
            timestamp: new Date().toLocaleDateString(),
            isError: true,
          }]);
        }
      } catch (error) {
        console.error('API Error:', error);
        setRecords(prev => [...prev, {
          documentType: 'Upload Failed',
          keyFindings: 'Could not reach the AI service. Please try again.',
          timestamp: new Date().toLocaleDateString(),
          isError: true,
        }]);
      } finally {
        setIsScanning(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAudioBtn = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      speakText("Upload prior medical documents such as a prescription, lab report, or discharge summary for instant AI extraction.");
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="bg-[#F5F1E8] font-body-md text-on-background min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F5F1E8]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-full transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[28px] text-[#8C8680]">arrow_back</span>
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface">Medical Documents</span>
          </div>
          <button
            onClick={handleAudioBtn}
            className="h-12 px-4 rounded-full bg-[#A8C69F] text-[#3E3A36] flex items-center gap-2 font-label-lg text-label-lg shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">{isPlaying ? 'pause_circle' : 'volume_up'}</span>
            <span>Listen</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-10 bg-[#F5F1E8] px-margin-mobile">
        <div className="flex flex-col w-full max-w-2xl mx-auto gap-6 py-6">

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-lg text-label-lg text-on-surface-variant">Step 3 of 4</span>
              <span className="font-label-sm text-label-sm text-[#A8C69F] font-medium">75%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-[#A8C69F] rounded-full w-3/4 transition-all duration-500"></div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2">
              Upload Medical Records
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Add any prescriptions, lab reports, or discharge summaries. Our AI will read them automatically for the doctor.
            </p>
          </div>

          {/* Upload dropzone */}
          <label className="relative w-full rounded-[8px] border-2 border-dashed border-[#D9D3CC] bg-[#FFFCF5] hover:bg-[#FFFCF5]/70 hover:border-[#A8C69F] transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <input accept="image/*,.pdf" capture="environment" className="hidden" type="file" onChange={handleFileSelect} disabled={isScanning} />
            <div className="w-16 h-16 rounded-full bg-(--color-primary-container) flex items-center justify-center">
              {isScanning ? (
                <span className="material-symbols-outlined text-[32px] text-(--color-on-primary-container) animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[32px] text-(--color-on-primary-container)">upload_file</span>
              )}
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {isScanning ? 'Analyzing document…' : 'Tap to scan or upload a document'}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {isScanning ? 'This usually takes a few seconds' : 'PDF, JPG, or PNG — camera or file'}
              </p>
            </div>
          </label>

          {/* Attached records */}
          <div className="bg-[#FFFCF5] border border-[#D9D3CC] rounded-[8px] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Attached Records</h2>
              <span className="font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-full bg-(--color-primary-container) text-(--color-on-primary-container)">
                {records.length} added
              </span>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-6 font-body-md text-body-md text-on-surface-variant">
                No documents added yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {records.map((rec, i) => (
                  <div key={i} className="bg-white rounded-[8px] border border-[#D9D3CC] p-3.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.isError ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-(--color-primary-container) text-(--color-on-primary-container)'}`}>
                        <span className="material-symbols-outlined text-[22px]">{rec.isError ? 'error' : 'description'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-lg text-label-lg text-on-surface truncate">{rec.documentType}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant truncate">{rec.timestamp} · {rec.keyFindings}</p>
                      </div>
                    </div>
                    <button
                      className="w-10 h-10 rounded-lg text-[#8C8680] hover:bg-surface-container hover:text-[#BA1A1A] flex items-center justify-center transition-colors flex-shrink-0"
                      type="button"
                      onClick={() => setRecords(records.filter((_, idx) => idx !== i))}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assistance note */}
          <div className="bg-[#FFFCF5] border border-[#D9D3CC] rounded-[8px] p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-(--color-primary-container) text-(--color-on-primary-container) flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">Need help scanning?</p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Kiosk desk staff can help scan physical copies of your records.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push('/summary')}
              className="w-full sm:flex-1 min-h-[56px] rounded-full bg-surface-container text-on-surface flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-sm active:bg-surface-container-highest transition-colors"
              type="button"
            >
              Skip this step
            </button>
            <button
              onClick={() => router.push('/summary')}
              className="w-full sm:flex-[2] min-h-[56px] rounded-full bg-[#A8C69F] text-[#3E3A36] flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md active:scale-[0.98] transition-transform"
              type="button"
            >
              Continue to Summary
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
