// Shared patient record, passed between screens via localStorage.
// Every module reads/writes this one object — no backend needed for the demo.

const STORAGE_KEY = "medikiosk_patient";

function getPatient() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function updatePatient(partial) {
  const current = getPatient();
  const next = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function resetPatient() {
  localStorage.removeItem(STORAGE_KEY);
}

// Shape reference (fill in whatever fields your module produces):
// {
//   consent: { granted: true, abhaId: "..." },              // Module D
//   history: { chiefComplaint, hpi, pastHistory, drugAllergy,
//              family, personal, ros },                      // Module A
//   documents: [{ type, extractedText, fields: {...} }],     // Module B
//   summary: "..."                                            // Module C
// }
