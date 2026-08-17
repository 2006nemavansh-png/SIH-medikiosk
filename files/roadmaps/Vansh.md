# Vansh — Roadmap (AgriDirect / SIH1637)

**Owns:** Algorithms (with Arush) · Backend (with Ditya) · Voice/Translation (with Ditya)
**Difficulty of your components:** #1 (Algorithms, hardest) and #3 (Backend, hard) on the team's ranking — you're on the critical path.

---

## Immediate next action
- **Wire the crop compatibility matrix into the pool clusterer** — it currently
  still uses `crop_type ==` for co-loading decisions. The matrix already exists
  in the notebook (§11); the clusterer just isn't using it yet. Real
  constraints are physical (ethylene emitters like banana/apple/tomato ripen
  sensitive produce; onion/garlic taint mild produce; temperature bands
  differ). This is also a strong domain-knowledge signal for judges.

## Phase 0 — Internal Round (pitch-first, no full build)
- Help get the pooling + sourcing algorithms running on **seeded data**
  (notebook §5, §12 already have working reference code — extend and clean,
  don't rewrite).
- Produce screenshots of real algorithm output for the deck — this is the
  single highest-leverage artifact you can hand R1 (pitch owner).
- Don't over-build here. Phase 0 exit criteria are about the deck, not a
  working system.

## Phase 1 — Post-Qualification Build

### Track B — Algorithms
1. Pool clusterer with crop compatibility matrix wired in (your immediate task above)
2. Time-window dispatch: fire pool at capacity threshold OR crop-specific shelf-life deadline, whichever comes first — even at partial load
3. Backhaul matcher **with truck assignment tracking** — current toy version lets one truck match two pools simultaneously; this is a known bug, fix before any demo (Arush owns this specifically, but you'll be building alongside)
4. Sourcing ranker: `score = 0.40·cost + 0.20·soil + 0.15·reliability + 0.10·freshness + 0.15·pool_synergy`
   - Rank on **landed cost** (ask + freight), not asking price — this is the core insight that makes the sourcing algorithm and logistics engine one system
   - Don't drop `pool_synergy` in refactoring — it's the mechanical link between pooling and sourcing
5. Plan bundling (greedy knapsack, top 3 distinct plans) + explainability card payload — highest demo-value-per-hour item in the whole build
6. Expose all of the above as clean API endpoints

### Track A — Backend (with Ditya)
1. PostgreSQL + PostGIS full schema (notebook §4)
2. Auth: Phone + OTP, JWT short-lived access + refresh, strict role separation (farmer/buyer/driver/admin)
3. Core APIs: listings, negotiation, orders, ratings
4. Agmarknet ingestion → `market_reference_price`
5. **Pre-cache all external data — zero live government API calls in the demo path.** This removes the single most likely on-stage failure mode.

### Voice/Translation (with Ditya)
- Bhashini (GoI) integration for STT/translation/TTS, IndicTrans2 as open-source offline fallback
- Text translation first, voice notes second (build priority order: listing → pooling → backhaul → ratings → translation → voice → pre-harvest)
- This track is severable — cut second if time runs out. The logistics engine (pooling/backhaul) is not cuttable.

## Phase 2 — Grand Finale (36h)
- Hour 14–20 is integration: your algorithms must actually **drive** the app, not sit beside it. This is where isolated algorithm work either pays off or becomes dead weight — protect the weekly integration checkpoints in Phase 1 so this isn't a scramble.
- No new features after hour 14.

## Watch for
- You're one of three people (with Ditya, Arush) carrying four of the hardest components across the team — a known load imbalance. If backend or voice/translation starts slipping, flag it early rather than absorbing it silently.
- Algorithms built in isolation and never wired into the app is the team's #1 named risk. Weekly integration checkpoints from week one of Phase 1, no exceptions.
