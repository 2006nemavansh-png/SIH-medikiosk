"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AbhaSession {
  patientId: string;
  abhaNumber: string;
  visitId: string;
}

/**
 * Guards a page behind ABHA identification: redirects to /identify when
 * no valid session cookie is present. Returns the session once resolved.
 */
export function useAbhaSession() {
  const router = useRouter();
  const [session, setSession] = useState<AbhaSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/abha/session")
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          router.replace("/identify");
          return;
        }
        const data = await res.json();
        setSession(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/identify");
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
