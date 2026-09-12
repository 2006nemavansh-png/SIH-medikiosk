import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionCookie } from "@/lib/session";

/**
 * Updates the visit tied to the current kiosk session (resolved server-side
 * from the session cookie, never trusted from the client). Used by the
 * symptom-checker flow to persist intake progress in real time so the
 * doctor dashboard can see it from a different device.
 */
export async function PATCH(req: NextRequest) {
  const session = await getSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (Array.isArray(body.chatHistory)) update.chat_history = body.chatHistory;
  if (typeof body.chiefComplaint === "string") update.chief_complaint = body.chiefComplaint;
  if (typeof body.language === "string") update.language = body.language;
  if (typeof body.isFinished === "boolean") update.is_finished = body.isFinished;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("visits").update(update).eq("id", session.visitId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
