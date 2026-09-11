import { NextRequest, NextResponse } from "next/server";
import { resolveQrPayload } from "@/lib/abdm/client";
import { establishPatientSession } from "@/lib/abdm/session";

export async function POST(req: NextRequest) {
  const { qrPayload } = await req.json();

  if (!qrPayload || typeof qrPayload !== "string") {
    return NextResponse.json({ error: "qrPayload is required" }, { status: 400 });
  }

  try {
    const profile = resolveQrPayload(qrPayload);
    const { patientId } = await establishPatientSession(profile);
    return NextResponse.json({ patientId, abhaNumber: profile.abhaNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read ABHA QR code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
