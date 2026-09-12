import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/session";
import type { AbhaProfile } from "@/lib/abdm/client";

const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

/**
 * Upserts the ABHA profile into `patients`, creates a `patient_sessions` row
 * and a `visits` row (this kiosk check-in), and sets the session cookie.
 * Shared by the OTP and QR verification routes.
 */
export async function establishPatientSession(profile: AbhaProfile): Promise<{ patientId: string; visitId: string }> {
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
      .insert({
        abha_number: profile.abhaNumber,
        abha_address: profile.abhaAddress,
        name: profile.name,
        gender: profile.gender,
        year_of_birth: profile.yearOfBirth,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to create patient: ${insertError.message}`);
    }
    patientId = inserted.id;
  } else {
    // Keep demographics fresh in case the ABHA record changed since last visit.
    await supabase
      .from("patients")
      .update({ name: profile.name, gender: profile.gender, year_of_birth: profile.yearOfBirth })
      .eq("id", patientId);
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

  // Each kiosk login is a fresh check-in / OPD queue entry.
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .insert({ patient_id: patientId, status: "waiting" })
    .select("id")
    .single();

  if (visitError) {
    throw new Error(`Failed to create visit: ${visitError.message}`);
  }

  await setSessionCookie({
    sessionId,
    patientId: patientId as string,
    abhaNumber: profile.abhaNumber,
    visitId: visit.id as string,
  });

  return { patientId: patientId as string, visitId: visit.id as string };
}
