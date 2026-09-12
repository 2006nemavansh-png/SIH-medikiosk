import { NextResponse } from "next/server";
import { getDoctorSessionCookie } from "@/lib/doctorSession";

export async function GET() {
  const session = await getDoctorSessionCookie();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ doctorId: session.doctorId, name: session.name });
}
