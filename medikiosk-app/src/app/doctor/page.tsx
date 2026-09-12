"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctorSession } from "@/hooks/useDoctorSession";

interface QueuePatient {
  id: string;
  name: string;
  gender: string | null;
  age: number | null;
  abhaNumber: string | null;
}

interface QueueItem {
  id: string;
  token: string;
  status: "waiting" | "in_consultation" | "completed";
  chiefComplaint: string | null;
  isFinished: boolean;
  createdAt: string;
  patient: QueuePatient;
}

interface Vitals {
  bp?: string;
  hr?: string;
  temp?: string;
  spo2?: string;
}

interface DocumentRecord {
  id: string;
  document_type: string;
  key_findings: string;
  extracted_text: string;
  created_at: string;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface VisitDetail {
  id: string;
  status: "waiting" | "in_consultation" | "completed";
  chiefComplaint: string | null;
  language: string | null;
  chatHistory: ChatMessage[];
  isFinished: boolean;
  vitals: Vitals | null;
  diagnosis: string[];
  prescription: { drug: string; instructions: string }[];
  doctorNotes: string;
  privateMemo: string;
  createdAt: string;
  patient: QueuePatient & { abhaAddress: string | null };
  documents: DocumentRecord[];
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { session: doctorSession, isChecking: isCheckingDoctorSession } = useDoctorSession();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingVisit, setIsLoadingVisit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [vitals, setVitals] = useState<Vitals>({});
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [prescription, setPrescription] = useState<{ drug: string; instructions: string }[]>([]);
  const [newDrug, setNewDrug] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [privateMemo, setPrivateMemo] = useState("");

  const loadQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const res = await fetch("/api/doctor/queue");
      if (res.ok) {
        const { queue } = await res.json();
        setQueue(queue);
      }
    } catch (error) {
      console.error("Failed to load queue:", error);
    } finally {
      setIsLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (doctorSession) loadQueue();
  }, [doctorSession, loadQueue]);

  const selectVisit = useCallback(async (id: string) => {
    setSelectedId(id);
    setIsLoadingVisit(true);
    try {
      const res = await fetch(`/api/doctor/visits/${id}`);
      if (res.ok) {
        const data: VisitDetail = await res.json();
        setVisit(data);
        setVitals(data.vitals || {});
        setDiagnosis(data.diagnosis || []);
        setPrescription(data.prescription || []);
        setDoctorNotes(data.doctorNotes || "");
        setPrivateMemo(data.privateMemo || "");

        if (data.status === "waiting") {
          await fetch(`/api/doctor/visits/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_consultation" }),
          });
          setVisit((prev) => (prev ? { ...prev, status: "in_consultation" } : prev));
          loadQueue();
        }
      }
    } catch (error) {
      console.error("Failed to load visit:", error);
    } finally {
      setIsLoadingVisit(false);
    }
  }, [loadQueue]);

  const addDiagnosis = () => {
    if (!newDiagnosis.trim()) return;
    setDiagnosis((prev) => [...prev, newDiagnosis.trim()]);
    setNewDiagnosis("");
  };

  const removeDiagnosis = (idx: number) => {
    setDiagnosis((prev) => prev.filter((_, i) => i !== idx));
  };

  const addDrug = () => {
    if (!newDrug.trim()) return;
    setPrescription((prev) => [...prev, { drug: newDrug.trim(), instructions: newInstructions.trim() }]);
    setNewDrug("");
    setNewInstructions("");
  };

  const removeDrug = (idx: number) => {
    setPrescription((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveVisit = async (status?: "completed") => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/doctor/visits/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals,
          diagnosis,
          prescription,
          doctorNotes,
          privateMemo,
          ...(status ? { status } : {}),
        }),
      });
      if (res.ok) {
        if (status === "completed") {
          setSelectedId(null);
          setVisit(null);
          loadQueue();
        } else {
          setVisit((prev) => (prev ? { ...prev, vitals, diagnosis, prescription, doctorNotes, privateMemo } : prev));
        }
      }
    } catch (error) {
      console.error("Failed to save visit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/doctor/logout", { method: "POST" });
    router.replace("/doctor/login");
  };

  const waitingQueue = queue.filter((q) => q.id !== selectedId);

  if (isCheckingDoctorSession || !doctorSession) {
    return null;
  }

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
          <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" onClick={loadQueue}>
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
              </button>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl">settings</span>
              </button>
            </div>
            <div className="h-8 w-px bg-surface-variant"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-label text-sm font-semibold text-on-surface leading-tight">{doctorSession.name}</p>
                <p className="font-label text-xs text-on-surface-variant">Senior Physician (General)</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-label text-xs font-bold">
                {doctorSession.name
                  .replace(/^Dr\.?\s*/i, "")
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="relative pt-20 w-full px-8 bg-surface">
          <div className="flex flex-col w-full pb-12">
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* COLUMN 1: OPD Waitlist */}
              <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface">OPD Waitlist</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed">
                          {queue.filter((q) => q.status === "waiting").length} Waiting
                        </span>
                      </div>
                    </div>
                    <button
                      className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                      title="Refresh Queue"
                      onClick={loadQueue}
                    >
                      <span className={`material-symbols-outlined text-lg ${isLoadingQueue ? "animate-spin" : ""}`}>sync</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {visit && (
                      <div className="p-3.5 rounded-xl bg-primary text-on-primary shadow-md relative overflow-hidden transition-transform duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/20 font-label text-xs font-bold tracking-wide">
                              {queue.find((q) => q.id === visit.id)?.token || "—"}
                            </span>
                            <span className="inline-flex items-center gap-1 font-label text-[11px] font-medium text-primary-fixed">
                              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
                              In Consultation
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-base text-primary-fixed">stethoscope</span>
                        </div>
                        <div className="mt-2">
                          <h3 className="font-headline text-base font-bold leading-tight">{visit.patient.name}</h3>
                          <p className="font-label text-xs text-primary-fixed-dim mt-0.5">
                            {visit.patient.age ? `${visit.patient.age}y` : "—"} • {visit.patient.gender || "—"}
                          </p>
                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-label text-white/80">
                            <span>ABHA: {visit.patient.abhaNumber || "—"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {waitingQueue.length === 0 && !isLoadingQueue && (
                      <p className="font-label text-xs text-on-surface-variant text-center py-6">No patients waiting.</p>
                    )}

                    {waitingQueue.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectVisit(item.id)}
                        className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label font-bold text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded">{item.token}</span>
                            <span className="font-label text-[11px] font-semibold flex items-center gap-1 text-on-surface-variant">
                              {item.status === "in_consultation" && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                              {item.status === "in_consultation" ? "In Consultation" : "Waiting"}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-headline text-sm font-semibold text-on-surface">{item.patient.name}</h4>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-label text-on-surface-variant">
                          <span>
                            {item.patient.age ? `${item.patient.age}y` : "—"} • {item.patient.gender || "—"}
                          </span>
                          <span className="font-medium truncate max-w-[110px]">{item.chiefComplaint || "Intake in progress"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Center Workspace */}
              <div className="col-span-12 xl:col-span-6 flex flex-col gap-5">
                {!visit ? (
                  <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">person_search</span>
                    <p className="font-headline text-base font-semibold text-on-surface">
                      {isLoadingVisit ? "Loading patient…" : "Select a patient from the queue"}
                    </p>
                    <p className="font-label text-xs text-on-surface-variant">Their intake, vitals, and documents will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center font-headline font-bold text-lg text-primary shrink-0 shadow-inner">
                            {visit.patient.name
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h1 className="font-headline text-2xl font-bold text-on-surface">{visit.patient.name}</h1>
                              <span className="font-label text-sm text-on-surface-variant">
                                {visit.patient.age ? `${visit.patient.age}y` : "—"} • {visit.patient.gender || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label text-xs font-medium">
                                <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                <span>ABHA: {visit.patient.abhaNumber || "—"}</span>
                              </div>
                              {visit.patient.abhaAddress && (
                                <span className="font-label text-xs text-on-surface-variant flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">alternate_email</span> {visit.patient.abhaAddress}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        <VitalInput label="Blood Pressure" unit="mmHg" value={vitals.bp} onChange={(v) => setVitals((p) => ({ ...p, bp: v }))} icon="speed" placeholder="120/80" />
                        <VitalInput label="Heart Rate" unit="bpm" value={vitals.hr} onChange={(v) => setVitals((p) => ({ ...p, hr: v }))} icon="favorite" placeholder="72" />
                        <VitalInput label="Body Temp" unit="°F" value={vitals.temp} onChange={(v) => setVitals((p) => ({ ...p, temp: v }))} icon="device_thermostat" placeholder="98.6" />
                        <VitalInput label="Oxygen SpO2" unit="%" value={vitals.spo2} onChange={(v) => setVitals((p) => ({ ...p, spo2: v }))} icon="air" placeholder="98" />
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
                        <div className="flex items-center gap-2">
                          <span className="font-label text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                            {visit.isFinished ? "Intake Complete" : "Intake In Progress"}
                          </span>
                          <a
                            href={`/doctor/summary?visitId=${visit.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-label text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">clinical_notes</span>
                            View AI Summary
                          </a>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low mb-4">
                        <span className="font-label text-xs font-bold uppercase tracking-wider text-secondary">Chief Complaint</span>
                        <p className="font-headline text-sm font-semibold text-on-surface mt-1 leading-relaxed">
                          {visit.chiefComplaint || "No chief complaint captured yet."}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-container-low max-h-64 overflow-y-auto">
                        <div className="flex items-center gap-2 text-on-surface font-label text-xs font-bold uppercase tracking-wider mb-2">
                          <span className="material-symbols-outlined text-sm text-secondary">forum</span>
                          <span>Full Intake Transcript</span>
                        </div>
                        {visit.chatHistory.length === 0 ? (
                          <p className="font-body text-xs text-on-surface-variant">No transcript recorded.</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {visit.chatHistory.map((msg, i) => (
                              <div key={i} className={`text-xs font-body leading-relaxed ${msg.role === "assistant" ? "text-on-surface-variant" : "text-on-surface font-medium pl-3 border-l-2 border-primary"}`}>
                                <span className="font-label font-bold uppercase text-[10px] mr-1.5">{msg.role === "assistant" ? "Kiosk:" : "Patient:"}</span>
                                {msg.content}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diagnosis & Rx Pad */}
                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                          <h2 className="font-headline text-lg font-bold text-on-surface">Diagnosis &amp; e-Prescription Pad</h2>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="font-label text-xs font-semibold text-on-surface-variant block mb-2">Differential / Provisional Diagnosis</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {diagnosis.map((d, idx) => (
                            <button
                              key={idx}
                              onClick={() => removeDiagnosis(idx)}
                              className="px-3 py-1.5 rounded-full font-label text-xs font-semibold bg-primary text-on-primary flex items-center gap-1"
                            >
                              {d} <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-surface-container-low px-3 py-2 rounded-xl text-xs font-label text-on-surface outline-none focus:bg-surface-container"
                            placeholder="Add a diagnosis..."
                            value={newDiagnosis}
                            onChange={(e) => setNewDiagnosis(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addDiagnosis()}
                          />
                          <button onClick={addDiagnosis} className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold">
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-xl p-3.5 mb-4">
                        <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface block mb-2">Rx Formulation</span>

                        {prescription.map((rx, idx) => (
                          <div key={idx} className="bg-surface-container-lowest p-3 rounded-lg mb-2 shadow-2xs flex items-center justify-between gap-3">
                            <div>
                              <span className="font-label text-sm font-bold text-on-surface block">{rx.drug}</span>
                              <span className="font-label text-xs text-on-surface-variant">{rx.instructions}</span>
                            </div>
                            <button onClick={() => removeDrug(idx)} className="text-on-surface-variant hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        ))}

                        <div className="flex flex-col md:flex-row gap-2 mt-2">
                          <input
                            className="flex-1 bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-label text-on-surface outline-none focus:bg-surface-container"
                            placeholder="Drug (e.g. Tab. Paracetamol 500mg)"
                            value={newDrug}
                            onChange={(e) => setNewDrug(e.target.value)}
                          />
                          <input
                            className="flex-1 bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-label text-on-surface outline-none focus:bg-surface-container"
                            placeholder="Instructions"
                            value={newInstructions}
                            onChange={(e) => setNewInstructions(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addDrug()}
                          />
                          <button onClick={addDrug} className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold whitespace-nowrap">
                            Add Drug
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="font-label text-xs font-semibold text-on-surface-variant block mb-1">Dietary &amp; Lifestyle Advice / Follow-up Note</label>
                        <textarea
                          className="w-full p-3 rounded-xl bg-surface-container-low text-xs font-label text-on-surface outline-none focus:bg-surface-container transition-all resize-none"
                          placeholder="Advised dark room rest, maintain hydration log..."
                          rows={2}
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                        />
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-variant/40">
                        <div className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary text-base">fingerprint</span>
                          <span>Dr. Arvind Sharma (MCI Reg: 48921-A)</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={isSaving}
                            onClick={() => saveVisit()}
                            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold disabled:opacity-50"
                          >
                            {isSaving ? "Saving…" : "Save Draft"}
                          </button>
                          <button
                            disabled={isSaving}
                            onClick={() => saveVisit("completed")}
                            className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:opacity-95 font-label text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">send</span>
                            <span>Sign &amp; Push to ABHA</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* COLUMN 3: Medical Documents */}
              <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-headline text-base font-bold text-on-surface">Scanned Records</h2>
                      <span className="font-label text-xs text-on-surface-variant">
                        {visit ? `${visit.documents.length} Attached` : "No patient selected"}
                      </span>
                    </div>
                  </div>

                  {!visit || visit.documents.length === 0 ? (
                    <p className="font-label text-xs text-on-surface-variant text-center py-6">No documents scanned for this visit.</p>
                  ) : (
                    visit.documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-xl bg-surface-container-low mb-3.5 hover:bg-surface-container transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                            {doc.document_type || "Document"}
                          </span>
                        </div>
                        <p className="font-label text-[11px] text-on-surface-variant mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                        <p className="font-body text-xs text-on-surface mt-1.5 leading-relaxed">{doc.key_findings}</p>
                      </div>
                    ))
                  )}

                  <div className="mt-4 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label text-xs font-bold text-on-surface">Personal Clinical Memo</span>
                      <span className="font-label text-[10px] text-on-surface-variant">Private to you</span>
                    </div>
                    <textarea
                      className="w-full p-2.5 rounded-xl bg-surface-container-low text-xs font-label text-on-surface outline-none focus:bg-surface-container transition-all resize-none placeholder:text-on-surface-variant/60"
                      placeholder="e.g., Patient seemed stressed regarding work screen time."
                      rows={2}
                      value={privateMemo}
                      onChange={(e) => setPrivateMemo(e.target.value)}
                      disabled={!visit}
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

function VitalInput({
  label,
  unit,
  value,
  onChange,
  icon,
  placeholder,
}: {
  label: string;
  unit: string;
  value?: string;
  onChange: (v: string) => void;
  icon: string;
  placeholder: string;
}) {
  return (
    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
      <div className="flex items-center justify-between text-on-surface-variant mb-2">
        <span className="font-label text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <input
          className="font-headline text-xl font-bold text-on-surface bg-transparent outline-none w-full min-w-0"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <span className="font-label text-xs text-on-surface-variant">{unit}</span>
      </div>
    </div>
  );
}
