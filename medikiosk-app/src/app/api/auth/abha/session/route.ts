import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/session";

export async function GET() {
  const session = await getSessionCookie();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    patientId: session.patientId,
    abhaNumber: session.abhaNumber,
    visitId: session.visitId,
  });
}
