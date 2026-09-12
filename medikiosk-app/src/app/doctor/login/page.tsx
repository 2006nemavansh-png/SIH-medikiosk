"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/doctor");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Invalid username or password");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-2xl">local_hospital</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-on-surface leading-tight">MediKiosk</h1>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Clinical Suite Login</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-label text-xs font-semibold text-on-surface-variant block mb-1.5">Doctor Username</label>
            <input
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-sm font-label rounded-xl border-none outline-none focus:bg-surface-container transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="font-label text-xs font-semibold text-on-surface-variant block mb-1.5">Password</label>
            <input
              type="password"
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-sm font-label rounded-xl border-none outline-none focus:bg-surface-container transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="font-label text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-label text-sm font-bold hover:opacity-95 disabled:opacity-50 transition-all mt-2"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
