# SIH1637 — AgriDirect · Team Workplan

**Team size:** 6 (SIH standard)
**Skills available:** Backend/API · Mobile/Frontend · ML/Data/Algorithms · DevOps/Security
**Current state:** Nothing built
**Immediate target:** Internal college round → then Grand Finale

> **CURRENT FOCUS: Phase 0 only.** Pre-qualification. Phase 1/2 sections below
> are reference for later, not active work.

---

## Strategic Framing (read this first)

The internal college round is judged on **the idea and the presentation**, not
on working code. Most teams lose here by building for three weeks and walking
in with a weak deck.

So the sequencing is deliberate:

- **Phase 0** — everyone contributes to the pitch. Build work starts in
  parallel but the deck is the deliverable.
- **Phase 1** — only after qualifying, full build.
- **Phase 2** — finale execution.

**Security is not one person's task.** It's a cross-cutting concern with a
designated owner who reviews every track. This project touches farmer PII,
land coordinates, voice recordings, and (conceptually) money — that's a real
attack surface, and most competing teams will have thought about none of it.

---

## Role Division

| # | Role | Owns | Primary skill |
|---|---|---|---|
| **R1** | **Team Lead / Pitch Owner** | Deck, narrative, judge Q&A, submission logistics, timeline enforcement | Communication + domain |
| **R2** | **Backend / API Lead** | FastAPI services, PostgreSQL+PostGIS schema, auth, API contracts | Backend |
| **R3** | **Algorithms Lead** | Pooling clusterer, backhaul matcher, sourcing ranker, crop-soil scoring | ML/Data |
| **R4** | **Mobile Lead** | React Native app — farmer + buyer flows, listing, negotiation UI | Mobile |
| **R5** | **Frontend / UX + Data Integrations** | Admin/buyer web dashboard, Leaflet maps, Agmarknet + soil data ingestion | Frontend + data |
| **R6** | **DevOps / Security Lead** | Deployment, CI, **threat model, security review across all tracks** | DevOps/Security |

**Notes on the split:**
- R3 is the differentiator role. The pooling + sourcing algorithms are what
  separate this from every other marketplace submission — protect this person's
  time from general full-stack firefighting.
- R6 is not idle before deployment matters. In Phase 0 they own the threat
  model and security slide; in Phase 1 they review each track's work.
- R1 must not be a full-time coder. Owning the pitch, the narrative, and Q&A
  prep is a real job, especially with judges from an agricultural sciences
  background who will probe domain assumptions.

---

## Phase 0 — Internal Round (target: qualify)

**Deliverable: a presentation, plus a clickable prototype if time allows.**

| Owner | Task |
|---|---|
| **R1** | Build the deck. Idea/Solution, Problem Resolution, USP, Tech Stack, Impact. Write the judge Q&A brief. Rehearse team on the logistics loopholes (notebook §10) |
| **R3** | Get the pooling + sourcing algorithms running on seeded data (notebook §5, §12 already have working code — extend and clean). Produce **screenshots of real output** for the deck |
| **R5** | Figma/clickable mockup of the 3 key screens: farmer listing, buyer sourcing-plan card, pooled-shipment tracking. The **explainability card** (§13) is the single most important visual |
| **R2** | Draft the API contract + DB schema (design only, no full implementation). Feeds the architecture slide |
| **R4** | Mobile app skeleton + navigation shell. Do **not** build features yet |
| **R6** | **Threat model document** — what data we hold, who can attack it, what breaks. Produces the security slide (see Security Scope below) |

**Phase 0 exit criteria:**
- Deck complete and rehearsed twice, end to end
- Every member can answer any question about any slide
- At least one screenshot of a real algorithm output in the deck
- Security slide exists — most teams won't have one

---

## Phase 1 — Post-Qualification Build

Parallel tracks. Weekly integration checkpoint, no exceptions.

### Track A — Backend + Data (R2, R5)
1. PostgreSQL + PostGIS setup, full schema (notebook §4)
2. Auth: **phone + OTP** (farmers won't manage passwords), JWT sessions, role separation (farmer / buyer / driver / admin)
3. Core APIs: listings, negotiation, orders, ratings
4. Load soil shapefiles into PostGIS, point-in-polygon lookup working
5. Agmarknet ingestion → `market_reference_price`
6. **Pre-cache all external data.** Never call government APIs live in a demo

### Track B — Algorithms (R3)
1. Pooling clusterer with crop compatibility matrix (§11), not `crop_type ==`
2. Time-window dispatch logic — capacity threshold OR shelf-life deadline
3. Backhaul matcher **with truck assignment tracking** (current toy version lets one truck match two pools — fix this before demoing)
4. Sourcing ranker: landed cost, soil score, reliability, freshness, pool synergy
5. Plan bundling + explainability card payload
6. Expose all of the above as clean API endpoints for R2 to consume

### Track C — Mobile (R4)
1. Farmer: register → list crop (post + pre-harvest) → see reference price
2. Buyer: request crop/qty/deadline → view ranked sourcing plans → commit
3. Negotiation chat: text first, then voice notes
4. Bhashini/IndicTrans2 translation integration
5. Two-sided rating flow after delivery
6. **Test on real mid-range Android devices**, not just emulator

### Track D — Web Dashboard (R5)
1. Leaflet map: farmer clusters, pool formation, truck routes
2. Sourcing plan comparison view
3. Admin: dispute queue, flagged transactions

### Track E — Security (R6, continuous)
See Security Scope below. Reviews each track at the weekly checkpoint.

---

## Security Scope (R6 owns, everyone implements)

Generic "we use JWT" impresses nobody. These are the surfaces that actually
matter for **this** system:

| Surface | Risk | Control |
|---|---|---|
| **Farmer PII** | Phone numbers + **precise land coordinates** are sensitive — land location can enable targeting, coercion, or land-grab pressure | Store coordinates at reduced precision for non-essential views. Expose exact location only to a matched, committed buyer/driver. Never expose in public listings |
| **Voice recordings** | Negotiation audio contains price info and personal speech | Explicit consent on first record. Encrypt at rest. Auto-delete after configurable retention. Never store raw audio in a public bucket |
| **Auth** | Farmers won't manage passwords; OTP is the realistic path | Phone+OTP with rate limiting and lockout. JWT with short expiry + refresh. Strict role separation — a farmer must never hit a buyer/admin endpoint |
| **Rating manipulation** | Fake transactions to inflate reputation; competitor review-bombing | Ratings only from **completed, verified** transactions. One rating per transaction. Flag statistical anomalies for admin review |
| **Pooling abuse** | Farmer inflates quantity to trigger favourable pooling; buyer games plan generation to extract pricing intel | Weight confirmed at pickup with photo + timestamp + driver co-sign (§10 #4). Rate-limit sourcing-plan generation per buyer |
| **Payment / escrow** | Not built in hackathon, but judges will ask | Design the escrow flow: funds held until delivery confirmation. Present as designed-not-implemented — honest scoping |
| **API hardening** | Standard but must be present | Input validation everywhere, parameterised queries (no string-built SQL), TLS in transit, rate limiting, no secrets in the repo |
| **Government data** | Agmarknet/SHC are public — low risk, but availability is a demo risk | Pre-cached locally. Removes both the rate-limit failure mode and any live-dependency question |

**Deliverable for the pitch:** one security slide showing the threat model and
these controls. Very few teams will have one, and for a platform handling
farmer livelihoods it is a legitimate differentiator, not box-ticking.

---

## Phase 2 — Grand Finale (36 hours)

Assumes Phase 1 delivered a working system. The finale is about **integration,
polish, and demo**, not new features.

| Hours | Focus | Who |
|---|---|---|
| 0–4 | Environment setup, seed demo data, smoke-test every service end to end | All |
| 4–14 | Close gaps in each track; freeze feature scope at hour 14 | R2, R3, R4, R5 |
| 14–20 | **Integration** — the algorithms must actually drive the app, not run beside it | R2 + R3 + R4 |
| 20–26 | Security pass: R6 audits auth, PII exposure, input validation. Fix findings | R6 + owners |
| 26–32 | Demo polish, explainability card, seeded scenario that shows the full chain | R4, R5, R1 |
| 32–36 | Rehearse **three times**. Full Q&A drill. Backup: recorded demo video in case live fails | All, R1 leads |

**Hard rule:** no new features after hour 14. Every hackathon post-mortem says
the same thing.

---

## Standing Practices

- **Daily 15-min standup.** Blocked / doing / done. No status essays.
- **Weekly integration checkpoint in Phase 1.** Everything merges and runs
  together. Tracks that only integrate at the end don't integrate.
- **Git from day one**, feature branches, PR review. R6 reviews anything
  touching auth or PII.
- **No secrets committed.** `.env` + `.gitignore` on commit one.
- **Everyone reads everyone's code before the finale.** Any member must be
  able to explain any screen. Judges pick who they ask.
- **Demo data seeded and version-controlled.** Never build demo data live.

---

## Top Risks

| Risk | Owner | Mitigation |
|---|---|---|
| Over-building before internal round, weak deck, eliminated early | R1 | Phase 0 exit criteria are pitch-first. Enforce it |
| Algorithms built in isolation, never wired into the app | R3 + R2 | Weekly integration checkpoint from Phase 1 week one |
| Soil data too coarse to justify provenance claim | R5 | Check resolution in Phase 1 week one. If coarse, reframe as district-level in the pitch — don't overclaim |
| Government API fails live on stage | R2 | Everything pre-cached. Zero live external dependencies in the demo path |
| Security treated as a checkbox slide with nothing behind it | R6 | Controls implemented in Phase 1, audited hour 20–26 of finale |
| Team can't answer domain questions from agri-background judges | R1 | Q&A drill on notebook §10 loopholes before every round |
