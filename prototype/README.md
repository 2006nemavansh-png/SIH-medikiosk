# MediKiosk Prototype

Plain HTML/CSS/JS — no build step, no npm install. Just open `index.html` in a browser
(or run a local static server if you need Web Speech API / file access to behave, e.g.
`npx serve` or `python -m http.server` from this folder).

Flow: `index.html` → `module-d-consent` → `module-a-history` → `module-b-documents` → `module-c-summary`

Patient data is passed between screens via `localStorage` (see `shared/state.js`) —
no backend, no database, for demo purposes only.

## Who owns what
- **Sparsh** — `module-d-consent/` (ABHA/consent mock screens)
- **Ditya** — `module-a-history/` (voice + touch history, branching questions)
- **Arush** — `module-b-documents/` (OCR upload/scan, field extraction)
- **Vansh** — `module-c-summary/` (merges A + B into the physician summary)
- **Manya** — `shared/style.css` and overall look/feel across all screens
- **Parth** — research (competitive landscape, ABDM/DPDPA compliance, feasibility) — not building prototype code

Put test images for OCR in `assets/sample-docs/` (create the folder — not committed yet).

Each module reads/writes the same patient object via `getPatient()` / `updatePatient()`
from `shared/state.js` — check that file for the expected shape before changing fields.
