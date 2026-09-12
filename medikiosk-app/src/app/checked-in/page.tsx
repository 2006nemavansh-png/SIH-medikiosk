"use client";

import { useAbhaSession } from "@/hooks/useAbhaSession";
import { useLanguage } from "@/lib/i18n";

const ui = {
  en: {
    brand: "MediKiosk",
    heading: "You're Checked In",
    subtitle: "Your details have been sent to the doctor's queue.",
    body: "Please take a seat in the waiting area. You will be called by your token number when the doctor is ready to see you.",
    home: "Return to Home",
  },
  hi: {
    brand: "मेडीकियोस्क",
    heading: "आप चेक-इन हो चुके हैं",
    subtitle: "आपकी जानकारी डॉक्टर की कतार में भेज दी गई है।",
    body: "कृपया प्रतीक्षा क्षेत्र में बैठें। जब डॉक्टर आपसे मिलने के लिए तैयार होंगे, तो आपको आपके टोकन नंबर से बुलाया जाएगा।",
    home: "होम पर वापस जाएं",
  },
};

export default function CheckedInPage() {
  useAbhaSession();
  const { lang } = useLanguage();
  const t = ui[lang];

  return (
    <main className="min-h-screen bg-[#fff8f4] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#a8c69f]/40 flex items-center justify-center text-[#4a6545]">
          <span className="material-symbols-outlined text-4xl">task_alt</span>
        </div>
        <h1 className="font-['Noto_Serif'] text-2xl font-bold text-[#1e1b18]">{t.heading}</h1>
        <p className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#8a4f37]">{t.subtitle}</p>
        <p className="font-['Noto_Serif'] text-sm text-[#434840] leading-relaxed">{t.body}</p>
        <a
          href="/"
          className="mt-4 w-full min-h-[52px] px-6 py-3 rounded-xl bg-[#4a6545] hover:bg-[#395334] text-white font-['Plus_Jakarta_Sans'] text-base font-bold flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {t.home}
        </a>
      </div>
    </main>
  );
}
