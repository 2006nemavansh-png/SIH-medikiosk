/**
 * Mock ABDM (Ayushman Bharat Digital Mission) client.
 *
 * This mirrors the shape of the real ABDM v3 gateway APIs so a production
 * integration can be dropped in later by rewriting the bodies of these
 * functions only — nothing else in the app should need to change.
 *
 * Real endpoints this stands in for (ABDM Sandbox, https://sandbox.abdm.gov.in):
 *   - POST /v3/enrollment/request/otp        -> requestOtp
 *   - POST /v3/enrollment/enrol/byAadhaar     -> verifyOtp
 *   - POST /v3/profile/login/verify           -> verifyOtp (existing ABHA login path)
 *   - ABHA QR payload format (JSON embedded in the QR code)  -> resolveQrPayload
 *
 * Auth to the real gateway needs a session token obtained via
 * POST /v0.5/sessions using ABDM_CLIENT_ID / ABDM_CLIENT_SECRET.
 */

const ABDM_BASE_URL = process.env.ABDM_BASE_URL || "https://healthidsbx.abdm.gov.in";
const ABDM_CLIENT_ID = process.env.ABDM_CLIENT_ID || "";
const ABDM_CLIENT_SECRET = process.env.ABDM_CLIENT_SECRET || "";

export interface AbhaProfile {
  abhaNumber: string;
  abhaAddress: string;
  name: string;
  gender: "M" | "F" | "O";
  yearOfBirth: number;
}

export interface RequestOtpResult {
  txnId: string;
}

const MOCK_OTP = "123456";

function normalizeAbhaNumber(id: string): string {
  return id.replace(/[^0-9]/g, "").padStart(14, "0").slice(-14);
}

function fakeProfileFor(id: string): AbhaProfile {
  const digits = normalizeAbhaNumber(id);
  return {
    abhaNumber: `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`,
    abhaAddress: `patient${digits.slice(-4)}@sbx`,
    name: "Demo Patient",
    gender: "O",
    yearOfBirth: 1990,
  };
}

/**
 * Mock of POST /v3/enrollment/request/otp.
 * Real call would hit `${ABDM_BASE_URL}/v3/enrollment/request/otp` with the
 * gateway session token and { scope: ["abha-login"], loginHint: "abha-number" | "abha-address", loginId }.
 */
export async function requestOtp(idOrAddress: string): Promise<RequestOtpResult> {
  if (!idOrAddress || idOrAddress.trim().length === 0) {
    throw new Error("ABHA number or address is required");
  }
  // Simulate network latency of the real gateway call.
  await new Promise((resolve) => setTimeout(resolve, 300));
  const txnId = `mock-txn-${Buffer.from(idOrAddress).toString("hex").slice(0, 16)}-${Date.now()}`;
  return { txnId };
}

/**
 * Mock of POST /v3/profile/login/verify.
 * Real call would hit `${ABDM_BASE_URL}/v3/profile/login/verify` with { txnId, otp }.
 */
export async function verifyOtp(txnId: string, otp: string): Promise<AbhaProfile> {
  if (!txnId) {
    throw new Error("Missing transaction id");
  }
  if (otp !== MOCK_OTP) {
    throw new Error("Invalid OTP");
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Recover a stable fake identity from the txnId's embedded hex fragment.
  const idFragment = txnId.split("-")[2] || "0000";
  return fakeProfileFor(idFragment);
}

/**
 * Parses the standard ABHA QR payload (a JSON string encoded in the QR code)
 * containing fields like hidn (ABHA number), hid (ABHA address), name, gender, dob.
 */
export function resolveQrPayload(qrText: string): AbhaProfile {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(qrText);
  } catch {
    throw new Error("Unrecognized ABHA QR code");
  }

  const abhaNumberRaw = String(parsed.hidn || parsed.abhaNumber || "");
  if (!abhaNumberRaw) {
    throw new Error("QR code does not contain an ABHA number");
  }

  const digits = normalizeAbhaNumber(abhaNumberRaw);
  return {
    abhaNumber: `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`,
    abhaAddress: String(parsed.hid || parsed.abhaAddress || `patient${digits.slice(-4)}@sbx`),
    name: String(parsed.name || "Demo Patient"),
    gender: (parsed.gender as AbhaProfile["gender"]) || "O",
    yearOfBirth: parsed.dob ? Number(String(parsed.dob).split(/[-/]/).pop()) : 1990,
  };
}

// Referenced for future real-integration wiring; unused while mocked.
void ABDM_BASE_URL;
void ABDM_CLIENT_ID;
void ABDM_CLIENT_SECRET;
