import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/abdm/client";
import { establishPatientSession } from "@/lib/abdm/session";

export async function POST(req: NextRequest) {
  const { txnId, otp } = await req.json();

  if (!txnId || !otp) {
    return NextResponse.json({ error: "txnId and otp are required" }, { status: 400 });
  }

  try {
    const profile = await verifyOtp(txnId, otp);
    const { patientId } = await establishPatientSession(profile);
    return NextResponse.json({ patientId, abhaNumber: profile.abhaNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
