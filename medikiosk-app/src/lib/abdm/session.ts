import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/session";
import type { AbhaProfile } from "@/lib/abdm/client";

const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

/**
 * Upserts the ABHA profile into `patients`, creates a `patient_sessions` row,
 * and sets the session cookie. Shared by the OTP and QR verification routes.
 */
export async function establishPatientSession(profile: AbhaProfile): Promise<{ patientId: string }> {
  const { data: existing, error: lookupError } = await supabase
    .from("patients")
    .select("id")
    .eq("abha_number", profile.abhaNumber)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to look up patient: ${lookupError.message}`);
  }

  let patientId = existing?.id as string | undefined;

  if (!patientId) {
    const { data: inserted, error: insertError } = await supabase
      .from("patients")
      .insert({ abha_number: profile.abhaNumber, abha_address: profile.abhaAddress })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to create patient: ${insertError.message}`);
    }
    patientId = inserted.id;
  }

  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const { error: sessionError } = await supabase.from("patient_sessions").insert({
    id: sessionId,
    patient_id: patientId,
    abha_number: profile.abhaNumber,
    expires_at: expiresAt,
  });

  if (sessionError) {
    throw new Error(`Failed to create session: ${sessionError.message}`);
  }

  await setSessionCookie({ sessionId, patientId: patientId as string, abhaNumber: profile.abhaNumber });

  return { patientId: patientId as string };
}
