import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDoctorSessionCookie } from "@/lib/doctorSession";

/**
 * OPD queue for the doctor dashboard: every visit that isn't finished yet,
 * oldest check-in first, with its patient's demographics attached.
 */
export async function GET() {
  const doctorSession = await getDoctorSessionCookie();
  if (!doctorSession) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("visits")
    .select(
      "id, status, chief_complaint, is_finished, created_at, patients(id, name, gender, year_of_birth, abha_number)"
    )
    .neq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const currentYear = new Date().getFullYear();
  const queue = (data || []).map((visit: any, index: number) => ({
    id: visit.id,
    token: `T-${100 + index}`,
    status: visit.status,
    chiefComplaint: visit.chief_complaint,
    isFinished: visit.is_finished,
    createdAt: visit.created_at,
    patient: {
      id: visit.patients?.id,
      name: visit.patients?.name || "Unknown Patient",
      gender: visit.patients?.gender,
      age: visit.patients?.year_of_birth ? currentYear - visit.patients.year_of_birth : null,
      abhaNumber: visit.patients?.abha_number,
    },
  }));

  return NextResponse.json({ queue });
}
