// Fake patient data standing in for Module A + Module B output, so Module C
// can be built/tested before those screens exist.

const SAMPLE_PATIENT = {
  consent: { granted: true, abhaId: "14-2025-1234-5678" },
  history: {
    chiefComplaint: "chest pain",
    hpi: "started 2 days ago, dull ache, worse on exertion, no radiation",
    pastHistory: "hypertension, diagnosed 2019",
    drugAllergy: "penicillin allergy",
    family: "father had MI at age 55",
    personal: "non-smoker, occasional alcohol",
    ros: "no fever, no cough, no breathlessness at rest"
  },
  documents: [
    {
      type: "prescription",
      extractedText: "Tab. Atorvastatin 10mg OD\nTab. Amlodipine 5mg OD",
      fields: {}
    }
  ]
};
