"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, ensureAnonymousSession } from '@/lib/supabase';

export default function DocumentScanner() {
  const router = useRouter();
  const [scanState, setScanState] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      setPreviewImage(base64Data);
      setScanState('scanning');
      
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
          
          setScanState('results');
        } else {
          console.error('Failed to parse document');
          setRecords(prev => [...prev, {
             documentType: 'Unknown Document',
             keyFindings: 'Error parsing document with AI',
             timestamp: new Date().toLocaleDateString()
          }]);
          setScanState('results');
        }
      } catch (error) {
        console.error('API Error:', error);
        setRecords(prev => [...prev, {
             documentType: 'Unknown Document',
             keyFindings: 'Error connecting to AI service',
             timestamp: new Date().toLocaleDateString()
        }]);
        setScanState('results');
      }
    };
    reader.readAsDataURL(file);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  
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
      speakText("Scan Prior Medical Records. Align prescription, lab report, or discharge summary within the camera frame for instant AI extraction.");
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
         window.speechSynthesis.cancel();
      }
    }
  };

  return (
    <div className="bg-[#fff8f4] font-['Noto_Serif'] text-[#1e1b18] min-h-screen flex flex-col antialiased">
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#fff8f4]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#a8c69f]/40 flex items-center justify-center text-[#4a6545]">
              <span className="material-symbols-outlined text-[26px]">local_hospital</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Noto_Serif'] font-bold text-xl tracking-tight text-[#1e1b18] leading-none">MediKiosk</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-[#8a4f37] tracking-widest uppercase mt-1">Care Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Listen to page instructions" onClick={handleAudioBtn} className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full bg-[#efe7e1] hover:bg-[#e9e1db] text-[#1e1b18] flex items-center gap-2 transition-colors" type="button">
              <span className="material-symbols-outlined text-[#8a4f37] text-[22px]">{isPlaying ? 'pause_circle' : 'volume_up'}</span>
              <span className="font-['Plus_Jakarta_Sans'] text-sm font-semibold tracking-wide">Listen</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#4a6545] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 bg-[#fff8f4] min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 space-y-6">
          
          <div className="bg-[#faf2ec] rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#8a4f37] tracking-wider uppercase">
                Step 3 of 4: Medical Documents
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-medium text-[#434840]">75% Complete</span>
            </div>
            <div className="w-full bg-[#e9e1db] rounded-full h-2 overflow-hidden">
              <div className="bg-[#4a6545] h-2 rounded-full w-3/4 transition-all duration-500"></div>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8c69f]/40 text-[#395334] text-xs font-['Plus_Jakarta_Sans'] font-medium mb-1">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>Instant AI Extraction</span>
            </div>
            <h1 className="font-['Noto_Serif'] text-2xl md:text-3xl font-bold text-[#1e1b18] tracking-tight leading-tight">
              Scan Prior Medical Records <br className="hidden sm:inline"/>
              <span className="font-normal text-[#434840] text-xl md:text-2xl font-serif">/ दस्तावेज़ स्कैन करें</span>
            </h1>
            <p className="font-['Noto_Serif'] text-sm md:text-base text-[#434840] leading-relaxed">
              Align prescription, lab report, or discharge summary within the camera frame for instant AI extraction.
            </p>
          </div>

          <button onClick={handleAudioBtn} className={`w-full min-h-[56px] px-4 py-3 rounded-xl flex items-center justify-between text-[#1e1b18] transition-all shadow-sm group ${isPlaying ? 'bg-[#ccebc2]/50' : 'bg-[#f4ece6] hover:bg-[#efe7e1]'}`} type="button">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffb193]/60 text-[#8a4f37] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">{isPlaying ? 'pause_circle' : 'volume_up'}</span>
              </div>
              <div className="text-left">
                <p className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#1e1b18]">{isPlaying ? 'Speaking...' : 'Tap to listen to instructions'}</p>
                <p className="font-['Noto_Serif'] text-xs text-[#434840]">निर्देश सुनने के लिए यहाँ छुएँ (Hindi / English)</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#4a6545]">
              <span className="material-symbols-outlined text-[20px]">{isPlaying ? 'pause_circle' : 'play_circle'}</span>
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">{isPlaying ? 'Pause' : 'Play'}</span>
            </div>
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
            
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#33302c] rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
              {scanState === 'scanning' || scanState === 'results' ? (
                <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="Scanned Document" />
              ) : (
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsvxJHmNW6yTcOak2A1zGQp-Ydtx654SQfriCnMNpp9UFuwVSBHouKY8n8qqAxfkMUTODxOpkBKHNU8mGip1dSoaSRece0C2WFV7ZzM0C_5oN0541E3UOXwz4crfhPGyJLwTiafToBBvsTMekfs0s8UCHud10EiNn4nW88o-ktlm8BAnFnnOc2a4-9ADNxh5DkO0sQX_rXhSYrUuoWekES66fpA-wbf1Ve2FNCXKZDb64VZdJJnjfh" className="absolute inset-0 w-full h-full object-cover opacity-35" alt="Placeholder" />
              )}
              
              {scanState === 'scanning' && (
                 <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#a8c69f] to-transparent shadow-[0_0_12px_#a8c69f] animate-[ping_2s_infinite] pointer-events-none"></div>
              )}
              
              <div className="absolute inset-6 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-tl-lg bg-transparent shadow-none" style={{boxShadow: '-4px -4px 0 0 #a8c69f'}}></div>
                  <div className="w-8 h-8 rounded-tr-lg bg-transparent shadow-none" style={{boxShadow: '4px -4px 0 0 #a8c69f'}}></div>
                </div>
                <div className="self-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[#ccebc2] text-4xl opacity-75">crop_free</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 rounded-bl-lg bg-transparent shadow-none" style={{boxShadow: '-4px 4px 0 0 #a8c69f'}}></div>
                  <div className="w-8 h-8 rounded-br-lg bg-transparent shadow-none" style={{boxShadow: '4px 4px 0 0 #a8c69f'}}></div>
                </div>
              </div>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#33302c]/80 backdrop-blur-md text-[#f7efe9] font-['Plus_Jakarta_Sans'] text-xs font-medium flex items-center gap-2 shadow-sm">
                <span className={`w-2 h-2 rounded-full bg-[#a8c69f] ${scanState === 'scanning' ? 'animate-ping' : ''}`}></span>
                <span>{scanState === 'scanning' ? 'Analyzing with AI...' : 'Align document within frame'}</span>
              </div>
              
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#33302c]/75 text-[#f7efe9] font-['Plus_Jakarta_Sans'] text-[11px] font-medium tracking-wide">
                HD 1080p • Auto-Detect
              </div>
            </div>

            <div className="bg-[#faf2ec] rounded-xl p-3 flex items-center justify-around sm:justify-center sm:gap-10">
              <button className="min-w-[56px] min-h-[56px] rounded-full bg-[#f4ece6] flex flex-col items-center justify-center text-[#434840] hover:bg-[#efe7e1] transition-colors" type="button">
                <span className="material-symbols-outlined text-[24px]">flash_on</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] mt-0.5">Flash</span>
              </button>
              
              <label className="min-w-[72px] min-h-[72px] rounded-full bg-[#4a6545] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#a8c69f] text-[#395334] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">document_scanner</span>
                </div>
                <input accept="image/*,.pdf" className="hidden" type="file" onChange={handleFileSelect} />
              </label>
              
              <button className="min-w-[56px] min-h-[56px] rounded-full bg-[#f4ece6] flex flex-col items-center justify-center text-[#434840] hover:bg-[#efe7e1] transition-colors" type="button">
                <span className="material-symbols-outlined text-[24px]">flip_camera_ios</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] mt-0.5">Switch</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-center text-[#434840] font-['Plus_Jakarta_Sans'] text-xs">
              <span className="material-symbols-outlined text-[#8a4f37] text-[18px]">mic</span>
              <span>Tap the camera button to capture your document, or upload from gallery.</span>
            </div>

            <div className="pt-2">
              <label className="w-full min-h-[56px] cursor-pointer rounded-xl bg-[#efe7e1] hover:bg-[#e9e1db] transition-colors px-4 py-3 flex items-center justify-center gap-3 text-[#1e1b18] font-['Plus_Jakarta_Sans'] text-sm font-semibold">
                <span className="material-symbols-outlined text-[#4a6545] text-[24px]">cloud_upload</span>
                <span>Upload File from Device (PDF, JPG, PNG)</span>
                <input accept="image/*,.pdf" className="hidden" type="file" onChange={handleFileSelect} />
              </label>
            </div>
          </div>

          <div className="bg-[#faf2ec] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4a6545] text-[22px]">verified</span>
                <h2 className="font-['Noto_Serif'] text-lg font-bold text-[#1e1b18]">Attached Records</h2>
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ccebc2] text-[#082007]">
                {records.length} Ready for Doctor
              </span>
            </div>

            <div className="space-y-2.5">
              {records.length === 0 ? (
                <div className="text-center py-4 text-sm text-[#434840]">No records attached yet.</div>
              ) : (
                records.map((rec, i) => (
                  <div key={i} className="bg-white rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-[#a8c69f]/30 text-[#4a6545] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[26px]">prescriptions</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1e1b18] truncate">{rec.documentType}</p>
                          <span className="px-2 py-0.5 rounded-full bg-[#ccebc2] text-[#082007] font-['Plus_Jakarta_Sans'] text-[10px] font-semibold">Scanned</span>
                        </div>
                        <p className="font-['Noto_Serif'] text-xs text-[#434840] truncate">{rec.timestamp} • {rec.keyFindings}</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/30 flex items-center justify-center transition-colors" type="button" onClick={() => setRecords(records.filter((_, idx) => idx !== i))}>
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#f4ece6] rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#a8c69f] text-[#395334] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1e1b18]">Need Kiosk Assistance?</p>
              <p className="font-['Noto_Serif'] text-xs text-[#434840] leading-relaxed">
                Hospital Sahayak desk staff can help scan hard copies of previous discharge summaries without leaving your place.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button onClick={() => router.push('/summary')} className="w-full sm:flex-1 min-h-[56px] px-6 py-3 rounded-xl bg-[#efe7e1] hover:bg-[#e9e1db] text-[#1e1b18] font-['Plus_Jakarta_Sans'] text-base font-semibold flex items-center justify-center gap-2 transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">redo</span>
              <span>Skip this step</span>
            </button>
            <button onClick={() => router.push('/summary')} className="w-full sm:flex-1 min-h-[56px] px-6 py-3 rounded-xl bg-[#4a6545] hover:bg-[#395334] text-white font-['Plus_Jakarta_Sans'] text-base font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" type="button">
              <span>Continue to Summary</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
      
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#fff8f4]/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-20 px-4 max-w-md mx-auto">
          <a href="/" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] px-3 py-1.5 rounded-xl text-[#434840] hover:text-[#1e1b18] transition-colors">
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs">Home</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] px-3 py-1.5 rounded-xl transition-colors text-[#4a6545] bg-[#ccebc2]/40 font-semibold">
            <span className="material-symbols-outlined text-[24px]">description</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs">Documents</span>
          </a>
          <a href="/profile" className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] px-3 py-1.5 rounded-xl text-[#434840] hover:text-[#1e1b18] transition-colors">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
