import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select(
      "id, status, chief_complaint, language, chat_history, is_finished, vitals, diagnosis, prescription, doctor_notes, private_memo, created_at, patients(id, name, gender, year_of_birth, abha_number, abha_address)"
    )
    .eq("id", id)
    .maybeSingle();

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 500 });
  }
  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("visit_id", id)
    .order("created_at", { ascending: false });

  if (docsError) {
    return NextResponse.json({ error: docsError.message }, { status: 500 });
  }

  const currentYear = new Date().getFullYear();
  const patient = visit.patients as any;

  return NextResponse.json({
    id: visit.id,
    status: visit.status,
    chiefComplaint: visit.chief_complaint,
    language: visit.language,
    chatHistory: visit.chat_history || [],
    isFinished: visit.is_finished,
    vitals: visit.vitals || null,
    diagnosis: visit.diagnosis || [],
    prescription: visit.prescription || [],
    doctorNotes: visit.doctor_notes || "",
    privateMemo: visit.private_memo || "",
    createdAt: visit.created_at,
    patient: {
      id: patient?.id,
      name: patient?.name || "Unknown Patient",
      gender: patient?.gender,
      age: patient?.year_of_birth ? currentYear - patient.year_of_birth : null,
      abhaNumber: patient?.abha_number,
      abhaAddress: patient?.abha_address,
    },
    documents: documents || [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.status === "string") update.status = body.status;
  if (body.vitals !== undefined) update.vitals = body.vitals;
  if (Array.isArray(body.diagnosis)) update.diagnosis = body.diagnosis;
  if (Array.isArray(body.prescription)) update.prescription = body.prescription;
  if (typeof body.doctorNotes === "string") update.doctor_notes = body.doctorNotes;
  if (typeof body.privateMemo === "string") update.private_memo = body.privateMemo;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("visits").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
