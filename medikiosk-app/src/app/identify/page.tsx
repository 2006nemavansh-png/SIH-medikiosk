"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Tab = "qr" | "manual";
type ManualStep = "enter-id" | "enter-otp";

export default function IdentifyPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("qr");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Manual entry state
  const [step, setStep] = useState<ManualStep>("enter-id");
  const [abhaId, setAbhaId] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");

  // QR scan state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState("");

  const formatAbhaInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    const parts = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10), digits.slice(10, 14)].filter(Boolean);
    return parts.join("-");
  };

  const handleRequestOtp = async () => {
    if (!consent || !abhaId) return;
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/abha/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: abhaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setTxnId(data.txnId);
      setStep("enter-otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return;
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/abha/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      router.push("/history");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const submitQrPayload = useCallback(
    async (qrPayload: string) => {
      if (!consent) return;
      setError("");
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/abha/verify-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrPayload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not read ABHA QR code");
        router.push("/history");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setIsLoading(false);
      }
    },
    [consent, router]
  );

  useEffect(() => {
    if (tab !== "qr") return;
    let cancelled = false;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const { default: jsQR } = await import("jsqr");
        const tick = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data) {
                submitQrPayload(code.data);
                return;
              }
            }
          }
          scanFrameRef.current = requestAnimationFrame(tick);
        };
        scanFrameRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setCameraError("Camera access is unavailable. Please use manual entry instead.");
      }
    };

    startScanning();

    return () => {
      cancelled = true;
      if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [tab, submitQrPayload]);

  const stepNumber = tab === "manual" && step === "enter-otp" ? 2 : 1;
  const progressPct = tab === "manual" ? (step === "enter-otp" ? 66 : 33) : 33;

  return (
    <div className="bg-[#F5F1E8] font-body-md text-on-background min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F5F1E8]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-full transition-colors"
              onClick={() => router.push("/")}
            >
              <span className="material-symbols-outlined text-[28px] text-[#8C8680]">arrow_back</span>
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface">Patient Identification</span>
          </div>
          <button className="h-12 px-4 rounded-full bg-[#A8C69F] text-[#3E3A36] flex items-center gap-2 font-label-lg text-label-lg shadow-md active:scale-95 transition-transform">
            <span className="material-symbols-outlined">volume_up</span>
            <span>Listen</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 bg-[#F5F1E8] relative px-margin-mobile pb-10">
        <div className="px-margin-mobile pt-4 pb-2 sticky top-0 bg-[#F5F1E8]/95 backdrop-blur z-20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-lg text-label-lg text-on-surface-variant">Step {stepNumber} of 2</span>
            <span className="font-label-sm text-label-sm text-[#A8C69F] font-medium">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D48C70] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center py-6">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2">Verify with ABHA</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
            Scan your ABHA QR code or enter your ABHA number to continue.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-highest rounded-full p-1 mb-6">
          <button
            onClick={() => setTab("qr")}
            className={`flex-1 h-12 rounded-full font-label-lg text-label-lg transition-colors ${
              tab === "qr" ? "bg-[#A8C69F] text-[#3E3A36] shadow-md" : "text-on-surface-variant"
            }`}
          >
            Scan QR
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`flex-1 h-12 rounded-full font-label-lg text-label-lg transition-colors ${
              tab === "manual" ? "bg-[#A8C69F] text-[#3E3A36] shadow-md" : "text-on-surface-variant"
            }`}
          >
            Enter ABHA ID
          </button>
        </div>

        {tab === "qr" && (
          <div className="bg-[#FFFCF5] border border-[#D9D3CC] rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="w-64 h-64 bg-surface-variant rounded-lg relative overflow-hidden mb-4">
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#A8C69F]"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#A8C69F]"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#A8C69F]"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#A8C69F]"></div>
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#FFFCF5] px-4">
                  <p className="font-label-sm text-on-surface-variant text-center">{cameraError}</p>
                </div>
              )}
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
              Align the ABHA QR code within the frame
            </p>
          </div>
        )}

        {tab === "manual" && (
          <div className="bg-[#FFFCF5] border border-[#D9D3CC] rounded-xl shadow-sm p-6 flex flex-col gap-4">
            {step === "enter-id" && (
              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-label-lg text-on-background" htmlFor="abha-input">
                  ABHA Number
                </label>
                <input
                  id="abha-input"
                  inputMode="numeric"
                  maxLength={17}
                  placeholder="00-0000-0000-0000"
                  value={abhaId}
                  onChange={(e) => setAbhaId(formatAbhaInput(e.target.value))}
                  className="w-full h-[64px] bg-surface-container-low text-on-surface font-headline-md text-headline-md px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8C69F] focus:bg-[#FFFCF5] transition-all"
                />
              </div>
            )}

            {step === "enter-otp" && (
              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-label-lg text-on-background" htmlFor="otp-input">
                  Enter the 6-digit OTP sent to your registered mobile
                </label>
                <input
                  id="otp-input"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full h-[64px] bg-surface-container-low text-on-surface font-headline-md text-headline-md px-4 rounded-lg tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-[#A8C69F] focus:bg-[#FFFCF5] transition-all"
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Demo mode: use OTP <span className="font-semibold">123456</span>
                </p>
              </div>
            )}

            {error && <p className="font-label-sm text-label-sm text-[#ba1a1a]">{error}</p>}

            <button
              onClick={step === "enter-id" ? handleRequestOtp : handleVerifyOtp}
              disabled={
                isLoading || !consent || (step === "enter-id" ? abhaId.length < 17 : otp.length !== 6)
              }
              className={`w-full h-[56px] rounded-full flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md transition-transform text-[#3E3A36] ${
                isLoading || !consent || (step === "enter-id" ? abhaId.length < 17 : otp.length !== 6)
                  ? "bg-gray-300 opacity-70"
                  : "bg-[#A8C69F] active:scale-[0.98]"
              }`}
            >
              <span>{step === "enter-id" ? "Send OTP" : "Verify & Proceed"}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {step === "enter-otp" && (
              <button
                onClick={() => setStep("enter-id")}
                className="font-label-sm text-label-sm text-on-surface-variant underline underline-offset-4"
              >
                Change ABHA number
              </button>
            )}
          </div>
        )}

        {/* Consent Toggle */}
        <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-4 mt-6">
          <div className="relative inline-flex items-center cursor-pointer mt-1">
            <input
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="sr-only peer"
              id="consent-toggle"
              type="checkbox"
            />
            <label htmlFor="consent-toggle" className="cursor-pointer block w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A8C69F]"></label>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-label-lg text-label-lg text-on-background cursor-pointer" htmlFor="consent-toggle">
              Data Sharing Consent
            </label>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              I agree to share my health records with this facility for treatment purposes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
