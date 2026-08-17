# AgriDirect (SIH1637) — Build Plan

> Read `memory.md` first for context and reasoning. This file is the
> implementation plan.

---

## 1. Architecture

```
┌─────────────────┐   ┌──────────────────┐
│  Farmer App     │   │  Buyer App       │
│  (React Native) │   │  (React Native)  │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │  REST + WebSocket
         ┌──────────▼───────────┐      ┌────────────────────┐
         │   FastAPI Backend    │◄─────┤  Web Dashboard     │
         ├──────────────────────┤      │  (React + Leaflet) │
         │ • listings           │      └────────────────────┘
         │ • negotiation/chat   │
         │ • ratings            │
         │ • pooling/matching   │ ◄── core differentiator
         │ • sourcing ranker    │
         │ • translation gateway│
         │ • voice (STT/TTS)    │
         └──────────┬───────────┘
                    │
     ┌──────────────┼──────────────┬─────────────────┐
     │              │              │                 │
┌────▼─────┐  ┌─────▼──────┐  ┌────▼──────┐  ┌───────▼────────┐
│ Postgres │  │   Redis    │  │ Bhashini/ │  │ Pre-cached:    │
│ +PostGIS │  │  (cache,   │  │IndicTrans2│  │ Agmarknet,     │
│          │  │ rate limit)│  │           │  │ SHC, NBSS soil │
└──────────┘  └────────────┘  └───────────┘  └────────────────┘
```

**Why PostGIS:** pooling, sourcing, and soil lookups are all genuinely
geospatial. Hand-rolling distance/polygon math costs days.

**Why Python end to end:** the algorithm layer shares the FastAPI runtime — no
serialization overhead between API and matching engine.

---

## 2. Tech Stack

### Mobile (Android-first)
- React Native (Expo, dev-client)
- React Navigation · Zustand
- `expo-av` — voice note recording
- Leaflet via WebView or `react-native-maps` with **OSM tiles** (no Google
  Maps billing)

### Web Dashboard
- React + Vite · TailwindCSS
- **Leaflet.js + OpenStreetMap** — clusters, pool formation, truck routes
- Recharts — price trends

### Backend
- **FastAPI** (Python)
- **PostgreSQL + PostGIS**
- SQLAlchemy + Alembic
- **Redis** — cached external data, rate limiting
- FastAPI BackgroundTasks (Celery only if needed) — pool formation, dispatch
  deadlines

### Algorithms
- GeoPandas + Shapely — shapefile processing, spatial ops
- scikit-learn — clustering utilities
- **OR-Tools** — VRP/bin-packing at scale (greedy is fine for hackathon; cite
  OR-Tools as the scaling path)

### Language & Voice
- **Bhashini** (GoI) — STT, translation, TTS. Free and government-aligned
- **IndicTrans2** (AI4Bharat) — open-source offline fallback

### External Data (all free)
| Source | Provides |
|---|---|
| Agmarknet | Mandi price reference |
| Soil Health Card (soilhealth.dac.gov.in / data.gov.in) | Village-level pH, N/P/K, texture |
| NBSS&LUP | Soil type/texture polygons (shapefiles → PostGIS) |
| Bhuvan (ISRO) | Soil & land-use WMS layers |

> **Rule: pre-cache everything. Zero live external calls in the demo path.**

### Auth & Security
- **Phone + OTP** (farmers won't manage passwords)
- JWT short-lived access + refresh; strict role separation
  (farmer / buyer / driver / admin)
- argon2 for stored secrets · TLS · rate limiting · parameterised queries
- `.env` + `.gitignore` from commit one

### Infra
- Docker + docker-compose
- Railway / Render / Fly.io (backend) · Vercel (dashboard)
- GitHub + Actions
- Supabase Storage or Cloudflare R2 — voice notes, crop photos, **encrypted at
  rest**

---

## 3. Data Model

Full dataclass definitions in notebook §4. Core tables:

```
farmers        id, name, phone, preferred_language, lat, lng,
               rating_avg, rating_count

buyers         id, name, type, lat, lng, rating_avg, rating_count

crop_listings  id, farmer_id, crop_type, status, expected_harvest_date,
               estimated_quantity_kg, actual_quantity_kg,
               asking_price_per_kg, market_reference_price, photos, lat, lng

pooled_shipments  id, listing_ids[], total_weight_kg,
                  pickup_cluster_centroid, target_delivery_lat/lng,
                  truck_id, status, dispatch_deadline

trucks         id, driver_phone, capacity_kg, status, current_lat/lng,
               home_base_lat/lng, route_polyline, assigned_shipment_id

ratings        id, from_id, to_id, shipment_or_order_id, stars, comment

chat_messages  id, conversation_id, sender_id, original_text,
               original_language, translated_text, voice_note_url,
               voice_transcript

soil_polygons  id, geom (PostGIS), soil_type, ph, texture, source
```

**Status enums:**
- Listing: `pre_harvest` → `available` → `reserved` → `in_transit` →
  `delivered` / `cancelled`
- Truck: `available` / `returning_empty` / `loaded`
- Shipment: `aggregating` → `matched` → `in_transit` → `delivered`

---

## 4. Core Algorithms

Working reference implementations in the notebook — extend, don't rewrite.

### 4.1 Pool formation (notebook §5, §11)
- Cluster listings by geographic proximity + **crop compatibility** (§11
  matrix, not `crop_type ==`)
- Capacity constraint: truck capacity
- **Time-window dispatch:** fire at capacity threshold OR crop-specific
  shelf-life deadline, whichever first — even at partial load
- Max 3–4 stops per pool (driver economics)
- Tighten clustering radius as pool size grows

### 4.2 Backhaul matching (notebook §5)
- Prefer `returning_empty` trucks — cost score weighted ~0.2x vs. dedicated
- Capacity + max detour constraints
- **TODO: truck assignment tracking** — a matched truck must drop out of the
  candidate pool. Current toy version lets one truck match two shipments

### 4.3 Soil suitability (notebook §12)
- Point-in-polygon lookup against `soil_polygons` in PostGIS
- `soil_suitability_score(crop, soil_type, ph)` → 0–1
- Backed by `CROP_SOIL_SUITABILITY` domain table (start 8–10 crops, not 50)

### 4.4 Buyer sourcing ranker (notebook §12)
Three stages:
1. **Filter** — crop match, status/harvest window, radius, not already pooled
2. **Score** —
   ```
   score = 0.40·cost_score      (landed = ask + freight)
         + 0.20·soil_score
         + 0.15·reliability     (farmer rating)
         + 0.10·freshness
         + 0.15·pool_synergy    (near a pool with matched backhaul?)
   ```
3. **Bundle** — greedy knapsack into top 3 distinct sourcing plans meeting
   requested quantity

### 4.5 Explainability card (notebook §13)
Every plan returns a payload rendering as:

> **Plan A — ₹19.40/kg landed · 3 farmers · Dharwad cluster**
> Red loam, pH 6.5 (well suited) · avg rating 4.6 · freight ₹1.40/kg via
> empty-return truck Thursday · harvest in 2 days

**Highest demo-value-per-hour item in the entire build.** Shows soil +
pooling + backhaul + ratings + pre-harvest working together in one glance.

---

## 5. Phased Delivery

### Phase 0 — Internal Round (pitch-first)
Deliverable is **the deck**, not a working app.

- Algorithms running on seeded data, screenshots in the deck
- Clickable mockups: farmer listing, buyer sourcing card, shipment tracking
- API contract + schema drafted (design only)
- Mobile skeleton + navigation shell — no features
- Threat model doc → security slide
- **Exit criteria:** deck rehearsed twice, every member can answer any slide,
  ≥1 real algorithm output screenshot, security slide exists

### Phase 1 — Post-Qualification Build

**Track A — Backend + Data**
1. Postgres + PostGIS, full schema
2. Phone+OTP auth, JWT, role separation
3. Core APIs: listings, negotiation, orders, ratings
4. **Soil shapefiles → PostGIS, point-in-polygon working** (start week one)
5. Agmarknet ingestion → `market_reference_price`
6. Redis caching of all external data

**Track B — Algorithms**
1. Pool clusterer + compatibility matrix wired in
2. Time-window dispatch
3. Backhaul matcher **with assignment tracking**
4. Sourcing ranker
5. Plan bundling + explainability payload
6. Expose as clean endpoints for Track A

**Track C — Mobile**
1. Farmer: register → list (post + pre-harvest) → see reference price
2. Buyer: request → ranked plans → commit
3. Chat: text, then voice notes
4. Bhashini/IndicTrans2 integration
5. Rating flow post-delivery
6. **Test on real mid-range Android, not emulator**

**Track D — Web Dashboard**
1. Leaflet: clusters, pools, truck routes
2. Sourcing plan comparison
3. Admin: dispute queue, flagged transactions

**Track E — Security (continuous)** — see §6

### Phase 2 — Grand Finale (36h)
| Hours | Focus |
|---|---|
| 0–4 | Setup, seed demo data, smoke-test end to end |
| 4–14 | Close track gaps. **Feature freeze at hour 14** |
| 14–20 | Integration — algorithms must *drive* the app, not sit beside it |
| 20–26 | Security audit pass, fix findings |
| 26–32 | Demo polish, explainability card, seeded full-chain scenario |
| 32–36 | Rehearse ×3, Q&A drill, record backup demo video |

**Hard rule: no new features after hour 14.**

---

## 6. Security Scope

Generic "we use JWT" impresses nobody. These are the surfaces that matter for
**this** system:

| Surface | Risk | Control |
|---|---|---|
| **Farmer PII** | Phone + **precise land coordinates**. Land location can enable targeting, coercion, land-grab pressure | Reduced precision for public/non-essential views. Exact location only to a matched, committed buyer/driver |
| **Voice recordings** | Contain price info and personal speech | Explicit consent on first record. Encrypted at rest. Auto-delete after retention window. Never a public bucket |
| **Auth** | Farmers won't manage passwords | Phone+OTP with rate limiting and lockout. Short-expiry JWT + refresh. Farmer must never reach buyer/admin endpoints |
| **Rating manipulation** | Fake transactions inflate reputation; competitor review-bombing | Ratings only from verified completed transactions. One per transaction. Flag statistical anomalies |
| **Pooling abuse** | Farmer inflates quantity for favourable pooling; buyer farms sourcing plans for pricing intel | Weight confirmed at pickup (photo + timestamp + driver co-sign). Rate-limit plan generation per buyer |
| **Payment/escrow** | Not built, but judges will ask | Design the flow (funds held until delivery confirmation). Present as designed-not-implemented |
| **API hardening** | Standard baseline | Input validation, parameterised queries, TLS, rate limiting, no secrets in repo |
| **External data** | Public, low risk — but availability is a demo risk | Pre-cached locally, zero live dependency |

**Pitch deliverable:** one security slide with the threat model. Very few
teams will have one.

---

## 7. Working Practices

- Daily 15-min standup: blocked / doing / done
- **Weekly integration checkpoint** — everything merges and runs together.
  Tracks that only integrate at the end don't integrate
- Git from day one, feature branches, PR review
- Anything touching auth or PII gets a second reviewer
- Demo data **seeded and version-controlled** — never built live
- Everyone reads everyone's code before the finale; judges pick who they ask

---

## 8. Immediate Next Actions

| # | Action | Owner |
|---|---|---|
| 1 | **Verify soil data resolution** (SHC/NBSS). If taluka-level, reframe provenance claim as district-level in the pitch | Ditya |
| 2 | Fix truck assignment tracking in backhaul matcher | Arush |
| 3 | Wire compatibility matrix into pool clusterer (replace `crop_type ==`) | Vansh |
| 4 | Repo scaffold, Docker, `.env`/`.gitignore`, CI | Parth |
| 5 | Confirm 6th member; assign security + pitch ownership | Team |

---

## 9. Top Risks

| Risk | Mitigation |
|---|---|
| Over-building before internal round → weak deck → eliminated early | Phase 0 exit criteria are pitch-first. Enforce |
| Algorithms built in isolation, never wired into the app | Weekly integration checkpoint from Phase 1 week one |
| Soil data too coarse to justify provenance claim | Check week one. Reframe honestly rather than overclaim |
| Government API fails live on stage | Everything pre-cached. Zero live external deps in demo path |
| Ingestion slips and cascades into algorithms (Arush on both) | Ditya leads ingestion; Arush consults. Watch this dependency |
| Manya bottlenecked on mobile + dashboard alone | Move Parth to mobile once infra is up; 6th member to dashboard |
| Security becomes a slide with nothing behind it | Controls implemented in Phase 1, audited hours 20–26 |
| Can't answer domain questions from agri judges | Q&A drill on `memory.md` logistics weaknesses before every round |
