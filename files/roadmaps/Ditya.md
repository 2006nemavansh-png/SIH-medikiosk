# Ditya — Roadmap (AgriDirect / SIH1637)

**Owns:** Data Ingestion (with Arush) · Backend (with Vansh) · Voice/Translation (with Vansh)
**Difficulty of your components:** #2 (Data Ingestion) on the team's ranking — "very hard and universally underestimated." You're on the critical path.

---

## Immediate next action
- **Verify soil data resolution** (Soil Health Card / NBSS&LUP). Check in week
  one whether the polygons are farm-level or only taluka-level. If coarse, the
  farm-level provenance claim in the pitch doesn't hold — reframe honestly as
  *district-level provenance indication* rather than let a domain judge
  puncture an overclaim.

## Phase 0 — Internal Round (pitch-first, no full build)
- No specific Phase 0 deliverable assigned to you individually beyond feeding
  data context to R5 (frontend) for the mockups and to R1 for the deck. Use
  this phase to do the soil-data resolution check above — it changes what the
  pitch can honestly claim.

## Phase 1 — Post-Qualification Build

### Data Ingestion (lead, with Arush consulting)
- Load government shapefiles (NBSS&LUP soil polygons, Soil Health Card
  pH/N-P-K/texture, Bhuvan WMS layers) into PostGIS.
- **Expect real pain here**: inconsistent projections, CRS mismatches, broken
  geometries are the norm with government shapefiles, not the exception. Budget
  time accordingly — this is the step most teams underestimate.
- Get point-in-polygon lookup working against `soil_polygons` — this gates the
  soil suitability score, which gates the sourcing ranker, which gates the
  explainability card. Everything downstream waits on this.
- Agmarknet ingestion → `market_reference_price`, pre-cached (never live).
- **Rule: pre-cache everything.** Zero live external calls in the demo path —
  this removes the single most likely cause of a demo dying on stage.

### Track A — Backend (with Vansh)
1. PostgreSQL + PostGIS full schema
2. Auth: Phone + OTP, JWT, role separation
3. Core APIs: listings, negotiation, orders, ratings
4. Redis caching layer for all external data

### Voice/Translation (with Vansh)
- Bhashini integration, IndicTrans2 fallback
- Second-priority feature — severable if the team falls behind schedule

## Phase 2 — Grand Finale (36h)
- Hours 0–4: smoke-test ingestion pipeline end to end with seeded demo data —
  this is where a broken shapefile load would surface, and it needs to surface
  early, not at hour 30.
- No new features after hour 14.

## Watch for
- **You're serially blocking Arush** — ingestion gates algorithms, and Arush
  sits on both. If ingestion slips, it cascades directly into his critical
  path. Lead ingestion decisively; let Arush consult rather than co-drive, so
  he isn't blocked waiting on decisions that could be made faster solo.
- You're one of three people (with Vansh, Arush) carrying four of the hardest
  components across the team. Flag load problems early.
