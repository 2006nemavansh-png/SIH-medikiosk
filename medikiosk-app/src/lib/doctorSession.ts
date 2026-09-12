import { cookies } from "next/headers";

const DOCTOR_SESSION_COOKIE_NAME = "medikiosk_doctor_session";
const DOCTOR_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hour shift

export interface DoctorSessionPayload {
  doctorId: string;
  name: string;
}

export async function setDoctorSessionCookie(payload: DoctorSessionPayload): Promise<void> {
  const store = await cookies();
  store.set(DOCTOR_SESSION_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DOCTOR_SESSION_MAX_AGE_SECONDS,
  });
}

export async function getDoctorSessionCookie(): Promise<DoctorSessionPayload | null> {
  const store = await cookies();
  const raw = store.get(DOCTOR_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DoctorSessionPayload;
  } catch {
    return null;
  }
}

export async function clearDoctorSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(DOCTOR_SESSION_COOKIE_NAME);
}
