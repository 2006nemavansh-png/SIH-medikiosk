# Manya — Roadmap (AgriDirect / SIH1637)

**Owns:** Mobile App + Web Dashboard (solo) — the largest single-person code volume on the team.
**Difficulty of your components:** #5 (Mobile, moderate) and #6 (Web Dashboard, moderate-easy, highest visual payoff per hour) on the team's ranking — lower conceptual difficulty than algorithms/ingestion, but high volume, and you're carrying two tracks alone.

> **CURRENT FOCUS: Phase 0 only.** Skip straight to that section below —
> Phase 1/2 is post-qualification, not now.

---

## Immediate next action
- No individually-assigned "immediate action" item from the plan, but start
  scoping the mobile navigation shell now — Phase 0 explicitly wants skeleton
  + navigation only, no features yet, so this is low-risk work to get ahead on
  before the internal round even completes.

## Phase 0 — Internal Round (pitch-first, no full build)
- **Mobile app skeleton + navigation shell only.** Do not build features yet —
  Phase 0 is judged on the deck, not working code.
- If time allows: support R5 on Figma/clickable mockups of the 3 key screens
  (farmer listing, buyer sourcing-plan card, pooled-shipment tracking). The
  **explainability card** is the single most important visual in the whole
  pitch — it's the one screen that shows soil + pooling + backhaul + ratings
  working together at a glance.

## Phase 1 — Post-Qualification Build

### Track C — Mobile (Android-first, React Native/Expo)
1. Farmer flow: register → list crop (post + pre-harvest) → see reference price
2. Buyer flow: request crop/qty/deadline → view ranked sourcing plans → commit
3. Negotiation chat: text first, then voice notes (`expo-av`)
4. Bhashini/IndicTrans2 translation integration
5. Two-sided rating flow after delivery
6. **Test on real mid-range Android devices, not just emulator** — this is
   called out explicitly because emulator-only testing is a common trap

### Track D — Web Dashboard (React + Vite + Tailwind, Leaflet/OSM)
1. Leaflet map: farmer clusters, pool formation, truck routes
2. Sourcing plan comparison view
3. Admin: dispute queue, flagged transactions

## Phase 2 — Grand Finale (36h)
- Hours 26–32 (demo polish, explainability card, seeded full-chain scenario)
  are explicitly yours + R5 + R1 — this is where your two tracks come together
  into the actual demo narrative.
- No new features after hour 14 — feature-freeze applies to you as much as backend/algorithms.

## Watch for
- **You're the team's largest single-person workload** — mobile + dashboard
  alone is a known, flagged imbalance. Once Parth's DevOps front-load is done
  (a few days into Phase 1), he's slated to move onto mobile to help carry
  this. If that handoff doesn't happen, raise it — don't just absorb both
  tracks silently.
- If a 6th member joins and is strong, the plan is to put them on web
  dashboard specifically to free you for mobile. Advocate for this if
  recruiting stalls.
