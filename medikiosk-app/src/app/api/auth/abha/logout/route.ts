import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionCookie, clearSessionCookie } from "@/lib/session";

export async function POST() {
  const session = await getSessionCookie();

  if (session) {
    await supabase.from("patient_sessions").delete().eq("id", session.sessionId);
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
