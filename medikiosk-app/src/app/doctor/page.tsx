"use client";

import { useState } from "react";

interface DiagnosisPill {
  id: string;
  label: string;
  selected: boolean;
}

const initialDiagnoses: DiagnosisPill[] = [
  { id: "migraine", label: "Acute Migraine without Aura", selected: true },
  { id: "tension", label: "Tension-type Headache", selected: false },
  { id: "cluster", label: "Cluster Headache", selected: false },
  { id: "sinusitis", label: "Acute Sinusitis", selected: false },
];

const transcripts = {
  en: "“Doctor, I have had a severe throbbing headache on the right side for three days, feeling nauseous and sensitive to light.”",
  hi: "“Sir, mujhe teen din se daayein sar mein bohot tez dard ho raha hai, ulti jaisa lagta hai aur roshni se pareshani hoti hai.”",
};

const queueItems = [
  {
    token: "T-105",
    name: "Sunita Sharma",
    tag: "High Fever",
    tagColor: "text-tertiary",
    dotColor: "bg-tertiary",
    meta: "Walk-in • 10m ago",
    detail: "38y • Female",
    extra: "Temp: 102.4 °F",
    extraColor: "text-secondary",
  },
  {
    token: "T-106",
    name: "Rajiv Singh",
    tag: "Scheduled Follow-up",
    tagColor: "text-primary",
    dotColor: "",
    meta: "Wait: 15m",
    detail: "52y • Male",
    extra: "Post-Op Knee Check",
    extraColor: "text-on-surface-variant",
  },
  {
    token: "T-107",
    name: "Priya Patel",
    tag: "Routine Check",
    tagColor: "text-secondary",
    dotColor: "",
    meta: "Wait: 22m",
    detail: "29y • Female",
    extra: "Hypertension Vitals",
    extraColor: "text-on-surface-variant",
  },
  {
    token: "T-108",
    name: "Meera Joshi",
    tag: "New Patient",
    tagColor: "text-on-surface-variant",
    dotColor: "",
    meta: "Wait: 31m",
    detail: "61y • Female",
    extra: "Allergic Rash & Cough",
    extraColor: "text-on-surface-variant",
  },
];

export default function DoctorDashboardPage() {
  const [showAllergyAlert, setShowAllergyAlert] = useState(true);
  const [transcriptLang, setTranscriptLang] = useState<"en" | "hi">("hi");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [diagnoses, setDiagnoses] = useState(initialDiagnoses);

  const toggleDiagnosis = (id: string) => {
    setDiagnoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <div className="h-20 flex items-center px-8 bg-surface-container gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-2xl">local_hospital</span>
            </div>
            <div>
              <span className="font-headline text-lg font-bold tracking-tight text-on-surface block leading-tight">MediKiosk</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium block">Clinical Suite</span>
            </div>
          </div>
          <div className="px-6 pt-6 pb-2">
            <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold px-3">Clinical Care</span>
          </div>
          <nav className="flex flex-col gap-1.5 px-4">
            <a className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-label text-sm bg-primary-container text-on-primary-container font-semibold transition-all" href="#">
              <span className="material-symbols-outlined text-xl text-primary">clinical_notes</span>
              <span>Today&apos;s Queue</span>
            </a>
            <a className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#">
              <span className="material-symbols-outlined text-xl text-primary">history_edu</span>
              <span>Patient History</span>
            </a>
            <a className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#">
              <span className="material-symbols-outlined text-xl text-primary">verified_user</span>
              <span>ABDM Records &amp; Consent</span>
            </a>
            <a className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#">
              <span className="material-symbols-outlined text-xl text-primary">query_stats</span>
              <span>Reports &amp; Analytics</span>
            </a>
            <a className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#">
              <span className="material-symbols-outlined text-xl text-primary">tune</span>
              <span>Clinic Settings</span>
            </a>
          </nav>
        </div>
        <div className="p-4 mx-4 mb-6 rounded-xl bg-surface-container flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container"></span>
            </div>
            <div>
              <p className="font-label text-xs font-semibold text-on-surface leading-tight">OPD Consultation</p>
              <p className="font-label text-[11px] text-on-surface-variant">Active • Room 104</p>
            </div>
          </div>
          <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-lg">sync_alt</span>
          </button>
        </div>
      </aside>

      <div className="pl-72">
        {/* Header */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-8">
          <div className="w-96">
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none text-xl">search</span>
              <input
                className="w-full h-11 pl-11 pr-4 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-sm font-label rounded-xl border-none outline-none focus:bg-surface-container transition-all"
                placeholder="Search patient by ABHA ID, name, or phone..."
                type="search"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="relative flex items-center justify-center w-11 h-11 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary"></span>
              </button>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl">settings</span>
              </button>
            </div>
            <div className="h-8 w-px bg-surface-variant"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-label text-sm font-semibold text-on-surface leading-tight">Dr. Arvind Sharma</p>
                <p className="font-label text-xs text-on-surface-variant">Senior Physician (General)</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida/AEtjO1VT0QaRUsvtzSLM1_BLgKB8gkLa4IoDOkTvIyWrsahvbYx2786_7HgD8tp2mC_MsZg3iO1kXp_-kE-lJUb01yizCKG3N_UDeVjk24sJt7UolQzryp8ohzllXQ-J2MVu-eSsb4ttju2Sk-qS_653hMMAD_ep6i3Aw9gUS83wEDPaPkcDEdbE5v9Nvaxd7Dc8B9sg0iIWpAPDIoy3FjzK5xa9Tn-Ammq0OV7ui0UiOjjc46IFSPeah0D1TNo"
              />
            </div>
          </div>
        </header>

        <main className="relative pt-20 w-full px-8 bg-surface">
          <div className="flex flex-col w-full pb-12">
            {showAllergyAlert && (
              <div className="mb-6 rounded-xl bg-error-container/85 px-5 py-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-300">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-error/15 flex items-center justify-center shrink-0 text-error">
                    <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-label text-xs uppercase tracking-wider font-bold text-on-error-container">Critical Clinical Alert</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span className="font-label text-xs text-on-error-container/80">Amit Kumar (OPD-104)</span>
                    </div>
                    <p className="font-headline text-sm font-semibold text-on-error-container truncate mt-0.5">
                      Patient has documented severe anaphylactic allergy to <span className="underline decoration-error font-bold">Penicillin &amp; Beta-Lactams</span>. Cross-reference all antibiotic prescriptions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-lg bg-error text-on-error font-label text-xs font-semibold hover:opacity-90 transition-opacity">Acknowledge</button>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-error-container hover:bg-error/10 transition-colors"
                    onClick={() => setShowAllergyAlert(false)}
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-12 gap-6 items-start">
              {/* COLUMN 1: OPD Waitlist */}
              <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface">OPD Waitlist</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed">12 Waiting</span>
                        <span className="font-label text-xs text-on-surface-variant">~8 min/patient</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors" title="Refresh Queue">
                      <span className="material-symbols-outlined text-lg">sync</span>
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-base">filter_list</span>
                    <input
                      className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-xl text-xs font-label text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:bg-surface-container transition-all"
                      placeholder="Filter queue by triage..."
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="p-3.5 rounded-xl bg-primary text-on-primary shadow-md relative overflow-hidden transition-transform duration-200">
                      <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/20 font-label text-xs font-bold tracking-wide">T-104</span>
                          <span className="inline-flex items-center gap-1 font-label text-[11px] font-medium text-primary-fixed">
                            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
                            In Consultation
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-base text-primary-fixed">stethoscope</span>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-headline text-base font-bold leading-tight">Amit Kumar</h3>
                        <p className="font-label text-xs text-primary-fixed-dim mt-0.5">45y • Male • Migraine Flare</p>
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-label text-white/80">
                          <span>ABHA: ...9821-45</span>
                          <span className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-semibold">Checked-in 09:42</span>
                        </div>
                      </div>
                    </div>

                    {queueItems.map((item) => (
                      <div key={item.token} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label font-bold text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded">{item.token}</span>
                            <span className={`font-label text-[11px] font-semibold flex items-center gap-1 ${item.tagColor}`}>
                              {item.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>}
                              {item.tag}
                            </span>
                          </div>
                          <span className="font-label text-[11px] text-on-surface-variant">{item.meta}</span>
                        </div>
                        <h4 className="font-headline text-sm font-semibold text-on-surface">{item.name}</h4>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-label text-on-surface-variant">
                          <span>{item.detail}</span>
                          <span className={`font-medium ${item.extraColor}`}>{item.extra}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 bg-surface-container-high/60 rounded-xl p-3">
                    <div className="flex items-center justify-between font-label text-xs mb-1.5">
                      <span className="text-on-surface-variant font-medium">OPD Session Progress</span>
                      <span className="text-primary font-bold">14 / 26 Completed</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "54%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Center Workspace */}
              <div className="col-span-12 xl:col-span-6 flex flex-col gap-5">
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center font-headline font-bold text-lg text-primary shrink-0 shadow-inner">
                        AK
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label text-xs font-bold">OPD-104</span>
                          <h1 className="font-headline text-2xl font-bold text-on-surface">Amit Kumar</h1>
                          <span className="font-label text-sm text-on-surface-variant">45y • Male</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label text-xs font-medium">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span>ABHA: 91-7643-9821-45</span>
                          </div>
                          <span className="font-label text-xs text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">call</span> +91 98765 43210
                          </span>
                          <span className="font-label text-xs text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span> New Delhi
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-base">support_agent</span>
                        <span>Clarify with Kiosk</span>
                      </button>
                      <button className="h-10 px-3.5 rounded-xl bg-primary text-on-primary hover:opacity-95 font-label text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all">
                        <span className="material-symbols-outlined text-base">task_alt</span>
                        <span>Confirm Diagnosis &amp; Rx</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-on-surface-variant mb-2">
                        <span className="font-label text-xs font-medium uppercase tracking-wider">Blood Pressure</span>
                        <span className="material-symbols-outlined text-lg text-primary">speed</span>
                      </div>
                      <div>
                        <span className="font-headline text-2xl font-bold text-on-surface">120/80</span>
                        <span className="font-label text-xs text-on-surface-variant ml-1">mmHg</span>
                      </div>
                      <span className="mt-1 font-label text-[11px] font-semibold text-primary inline-flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Normal
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-on-surface-variant mb-2">
                        <span className="font-label text-xs font-medium uppercase tracking-wider">Heart Rate</span>
                        <span className="material-symbols-outlined text-lg text-secondary">favorite</span>
                      </div>
                      <div>
                        <span className="font-headline text-2xl font-bold text-on-surface">72</span>
                        <span className="font-label text-xs text-on-surface-variant ml-1">bpm</span>
                      </div>
                      <span className="mt-1 font-label text-[11px] font-semibold text-secondary inline-flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Resting
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-on-surface-variant mb-2">
                        <span className="font-label text-xs font-medium uppercase tracking-wider">Body Temp</span>
                        <span className="material-symbols-outlined text-lg text-on-surface-variant">device_thermostat</span>
                      </div>
                      <div>
                        <span className="font-headline text-2xl font-bold text-on-surface">98.6</span>
                        <span className="font-label text-xs text-on-surface-variant ml-1">°F</span>
                      </div>
                      <span className="mt-1 font-label text-[11px] font-semibold text-on-surface-variant">Afebrile</span>
                    </div>
                    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-on-surface-variant mb-2">
                        <span className="font-label text-xs font-medium uppercase tracking-wider">Oxygen SpO2</span>
                        <span className="material-symbols-outlined text-lg text-primary">air</span>
                      </div>
                      <div>
                        <span className="font-headline text-2xl font-bold text-on-surface">98%</span>
                      </div>
                      <span className="mt-1 font-label text-[11px] font-semibold text-primary">Optimal room air</span>
                    </div>
                  </div>
                </div>

                {/* AI Triage Intake */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                        <span className="material-symbols-outlined text-lg">psychology</span>
                      </div>
                      <h2 className="font-headline text-lg font-bold text-on-surface">AI Kiosk Triage Intake</h2>
                    </div>
                    <span className="font-label text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                      Kiosk Terminal #02 • Voice Assisted
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low mb-4">
                    <span className="font-label text-xs font-bold uppercase tracking-wider text-secondary">Chief Complaint</span>
                    <p className="font-headline text-sm font-semibold text-on-surface mt-1 leading-relaxed">
                      “Severe throbbing headache for last 3 days, localized primarily in the right temporal region, accompanied by mild nausea and photophobia. Patient denies fever, neck rigidity, or visual changes.”
                    </p>

                    <div className="mt-4 pt-3 bg-surface-container rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity"
                            onClick={() => setIsAudioPlaying((prev) => !prev)}
                          >
                            <span className="material-symbols-outlined text-sm">{isAudioPlaying ? "pause" : "play_arrow"}</span>
                          </button>
                          <div className="flex flex-col">
                            <span className="font-label text-xs font-semibold text-on-surface">Kiosk Voice Intake Recording</span>
                            <span className="font-label text-[11px] text-on-surface-variant">Hindi Voice Input • 0:42s</span>
                          </div>
                        </div>
                        <div className="inline-flex p-1 rounded-lg bg-surface-container-high text-xs font-label">
                          <button
                            className={`px-2.5 py-0.5 rounded-md font-semibold ${transcriptLang === "en" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
                            onClick={() => setTranscriptLang("en")}
                          >
                            English
                          </button>
                          <button
                            className={`px-2.5 py-0.5 rounded-md font-semibold ${transcriptLang === "hi" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
                            onClick={() => setTranscriptLang("hi")}
                          >
                            हिन्दी
                          </button>
                        </div>
                      </div>

                      <div className="h-6 flex items-center gap-1 px-1">
                        {[2, 4, 5, 3, 6, 4, 2, 5, 3, 6, 4, 2, 5, 3, 2, 4, 2].map((h, i) => (
                          <span key={i} className="w-1 bg-primary rounded-full" style={{ height: `${h * 4}px`, opacity: 0.4 + (h / 6) * 0.6 }}></span>
                        ))}
                      </div>
                      <p className="font-body text-xs italic text-on-surface-variant bg-surface-container-lowest/70 p-2.5 rounded-lg">
                        {transcripts[transcriptLang]}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-2 text-on-surface font-label text-xs font-bold uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-sm text-secondary">history</span>
                        <span>Past Medical History</span>
                      </div>
                      <p className="font-body text-xs text-on-surface leading-relaxed">
                        • Migraine with aura (diagnosed 2021)<br />
                        • Mild seasonal asthma (no steroid dependency)<br />
                        • No prior hospitalizations or surgical history
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-2 text-on-surface font-label text-xs font-bold uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-sm text-primary">medication</span>
                        <span>Current Medications</span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs font-label text-on-surface">
                        <span className="px-2 py-1 rounded bg-surface-container font-medium">Paracetamol 650mg PRN (Last taken 4h ago)</span>
                        <span className="px-2 py-1 rounded bg-surface-container font-medium">Salbutamol 100mcg MDI (as needed)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Rx Pad */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                      <h2 className="font-headline text-lg font-bold text-on-surface">Diagnosis &amp; e-Prescription Pad</h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-label text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-primary">lock</span>
                      <span>ABDM Signed Rx Session</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="font-label text-xs font-semibold text-on-surface-variant block mb-2">Differential / Provisional Diagnosis</label>
                    <div className="flex flex-wrap gap-2">
                      {diagnoses.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => toggleDiagnosis(d.id)}
                          className={`px-3 py-1.5 rounded-full font-label text-xs transition-colors ${
                            d.selected
                              ? "font-semibold bg-primary text-on-primary"
                              : "font-medium bg-surface-container text-on-surface hover:bg-surface-container-high"
                          }`}
                        >
                          {d.selected ? "✓" : "+"} {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-3.5 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface">Rx Formulation (India Pharmacopoeia)</span>
                      <button className="font-label text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span> Add Drug
                      </button>
                    </div>

                    <div className="bg-surface-container-lowest p-3 rounded-lg mb-2 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary-container/60 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-sm">pill</span>
                        </div>
                        <div>
                          <span className="font-label text-sm font-bold text-on-surface block">Tab. Rizatriptan 10 mg</span>
                          <span className="font-label text-xs text-on-surface-variant">1 tab orally at migraine onset; repeat after 2h if needed (Max 30mg/day)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded bg-surface-container font-label text-xs font-medium">Qty: 6 tabs</span>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest p-3 rounded-lg shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-secondary-container/60 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-sm">medication_liquid</span>
                        </div>
                        <div>
                          <span className="font-label text-sm font-bold text-on-surface block">Tab. Domperidone 10 mg</span>
                          <span className="font-label text-xs text-on-surface-variant">1 tab before meals twice daily for 3 days for associated nausea</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded bg-surface-container font-label text-xs font-medium">Qty: 6 tabs</span>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-label text-xs font-semibold text-on-surface-variant block mb-1">Dietary &amp; Lifestyle Advice / Follow-up Note</label>
                    <textarea
                      className="w-full p-3 rounded-xl bg-surface-container-low text-xs font-label text-on-surface outline-none focus:bg-surface-container transition-all resize-none"
                      placeholder="Advised dark room rest, maintain hydration log, avoid aged cheese and caffeine triggers. Follow-up in 5 days if frequency exceeds twice weekly."
                      rows={2}
                    />
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-variant/40">
                    <div className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">fingerprint</span>
                      <span>Dr. Arvind Sharma (MCI Reg: 48921-A)</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold">Save Draft</button>
                      <button className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:opacity-95 font-label text-xs font-bold shadow-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>Sign &amp; Push to ABHA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: Medical Documents */}
              <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-headline text-base font-bold text-on-surface">Scanned Records</h2>
                      <span className="font-label text-xs text-on-surface-variant">2 Attached via ABDM Locker</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors" title="Print Selected">
                        <span className="material-symbols-outlined text-base">print</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors" title="Fullscreen Document Viewer">
                        <span className="material-symbols-outlined text-base">fullscreen</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low mb-3.5 hover:bg-surface-container transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-20 rounded-lg bg-surface-container-highest overflow-hidden relative shrink-0 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform"
                          alt="Scanned prescription on hospital letterhead"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAsGvFOxVXf5UQX9ng3LuGz6HeP7m7kBf87dXSFs9cCAi5aZFvYgtptwRbG7gsLxb42YVP2uc6_Vm-v6vjXfHbcT4r69LXZw0CJMadvdwEt_-fxv_j47Gslm268W3SEW0L3xaPKFPW-3rPy_f5YqrqEZvyHCwc3wYjubGtzlJ4Q9op4CiAlTK43ZnShzLqJmbMhzDTQRDtwBqfnx_W9b6THqkyVUcEyOS7Jp8jshsX1HAdDl9t2nrj"
                        />
                        <span className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.2 text-[9px] font-label font-bold text-primary rounded">OCR</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">Cardiology OPD</span>
                        </div>
                        <h3 className="font-headline text-xs font-bold text-on-surface mt-1 truncate">Fortis Clinic - Dr. S. Sharma</h3>
                        <p className="font-label text-[11px] text-on-surface-variant mt-0.5">Dated: 14 Aug 2024</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="font-label text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface">Aspirin 75mg</span>
                          <span className="font-label text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface">Atorvastatin 10mg</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] font-label border-t border-surface-variant/30 text-on-surface-variant">
                      <span className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-xs">check_circle</span> OCR Verified
                      </span>
                      <a className="font-semibold text-secondary hover:underline" href="#">Inspect Page 1/2</a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low mb-4 hover:bg-surface-container transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-20 rounded-lg bg-surface-container-highest overflow-hidden relative shrink-0 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform"
                          alt="Laboratory pathology report with tabulated blood test results"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAre07EELZAhIYiV8VeXcwNiTGZKEqOwjshseURM2J6NPpwsirMjCDrYEjUH2Cz8clp0F20Vt7c4v6CsNeHVzFT7FXX-NID4HzhePGjLvxJFf9VnhSuXml-GJYgGsaxLCpbmW2k0yunGJ1yCgXvMQ16QS-s2JQ9bqAZM3Q_9qGaD4KGt-RV8E6bbkzk5XbTTgRo7J_5C7UVNqJEWN0GlCVY5AtPw9ACcGq1FkM42aqNdkBaP4iVURpy"
                        />
                        <span className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.2 text-[9px] font-label font-bold text-secondary rounded">LAB</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">Complete Hemogram</span>
                        </div>
                        <h3 className="font-headline text-xs font-bold text-on-surface mt-1 truncate">Thyrocare Pathology Lab</h3>
                        <p className="font-label text-[11px] text-on-surface-variant mt-0.5">Sampled: 02 Jul 2024</p>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] font-label">
                          <div className="bg-surface-container p-1 rounded">
                            <span className="text-on-surface-variant text-[10px] block">Hb</span>
                            <span className="font-bold text-on-surface">13.5 g/dL</span>
                          </div>
                          <div className="bg-surface-container p-1 rounded">
                            <span className="text-on-surface-variant text-[10px] block">Platelets</span>
                            <span className="font-bold text-on-surface">265 K/uL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] font-label border-t border-surface-variant/30 text-on-surface-variant">
                      <span className="text-primary font-medium">All Param. Within Limit</span>
                      <a className="font-semibold text-secondary hover:underline" href="#">View PDF</a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container text-center">
                    <div className="w-9 h-9 rounded-full bg-primary-container mx-auto mb-2 flex items-center justify-center text-on-primary-container">
                      <span className="material-symbols-outlined text-lg">cloud_sync</span>
                    </div>
                    <h4 className="font-headline text-xs font-bold text-on-surface">Need older records?</h4>
                    <p className="font-label text-[11px] text-on-surface-variant mt-0.5 mb-3">Patient OTP approval needed for accessing prior 5 years linked via ABHA.</p>
                    <button className="w-full py-2 px-3 rounded-xl bg-primary text-on-primary hover:opacity-95 font-label text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      <span>Request ABDM Health Locker</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label text-xs font-bold text-on-surface">Personal Clinical Memo</span>
                      <span className="font-label text-[10px] text-on-surface-variant">Private to you</span>
                    </div>
                    <textarea
                      className="w-full p-2.5 rounded-xl bg-surface-container-low text-xs font-label text-on-surface outline-none focus:bg-surface-container transition-all resize-none placeholder:text-on-surface-variant/60"
                      placeholder="e.g., Patient seemed stressed regarding work screen time. Suggest ergonomic audit."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
