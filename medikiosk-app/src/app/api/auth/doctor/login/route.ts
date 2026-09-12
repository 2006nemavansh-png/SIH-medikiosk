import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setDoctorSessionCookie } from "@/lib/doctorSession";

// Mocked doctor credentials for this prototype — replace with a real
// identity provider (e.g. HPR/HPID via ABDM) before production use.
const DOCTOR_USERNAME = process.env.DOCTOR_USERNAME || "doctor";
const DOCTOR_PASSWORD = process.env.DOCTOR_PASSWORD || "doctor123";
const DOCTOR_NAME = process.env.DOCTOR_NAME || "Dr. Arvind Sharma";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username !== DOCTOR_USERNAME || password !== DOCTOR_PASSWORD) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await setDoctorSessionCookie({ doctorId: randomUUID(), name: DOCTOR_NAME });

  return NextResponse.json({ name: DOCTOR_NAME });
}
