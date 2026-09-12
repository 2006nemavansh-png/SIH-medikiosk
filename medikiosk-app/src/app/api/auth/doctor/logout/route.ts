import { NextResponse } from "next/server";
import { clearDoctorSessionCookie } from "@/lib/doctorSession";

export async function POST() {
  await clearDoctorSessionCookie();
  return NextResponse.json({ success: true });
}
