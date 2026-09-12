"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DoctorSession {
  doctorId: string;
  name: string;
}

/**
 * Guards a page behind doctor login: redirects to /doctor/login when no
 * valid doctor session cookie is present. Returns the session once resolved.
 */
export function useDoctorSession() {
  const router = useRouter();
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/doctor/session")
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          router.replace("/doctor/login");
          return;
        }
        const data = await res.json();
        setSession(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/doctor/login");
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { session, isChecking };
}
