import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/abdm/client";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "ABHA number or address is required" }, { status: 400 });
  }

  try {
    const result = await requestOtp(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
