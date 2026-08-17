# memory.md — AgriDirect (SIH1637) Project Context

> Context carried over from the planning conversation. Read this first before
> touching any code. It explains **why** decisions were made, not just what
> they were — the reasoning matters more than the conclusions when things need
> to change.

---

## What we're building

**Problem statement:** SIH1637 — Mobile App for Direct Market Access for Farmers
**Organisation:** Ministry of Agriculture and Farmers Welfare
**Proposed by:** University of Agricultural Sciences, Dharwad + ICAR
**Category:** Software · Agriculture, FoodTech & Rural Development
**Working product name:** AgriDirect

**Stated ask (verbatim scope):** farmers face difficulty accessing markets and
earn less because middlemen sit between them and buyers. Build a mobile app
connecting farmers directly to consumers and retailers, with produce listing,
price negotiation, and transaction management.

That's the entire official statement. It is deliberately vague, and no dataset
is attached.

---

## The single most important thing to understand

**The plain version of this idea is a trap, and we are deliberately not
building it.**

"Marketplace app that removes middlemen" is the most common student project
shape in Indian agri-tech. Dozens of SIH teams will submit it. More
importantly, it has already been tried at scale and largely failed for
smallholders — eNAM (government's own national agri market, running since
2016), DeHaat, Ninjacart, WayCool, Agribazaar. They did not fail for lack of
an app.

They failed on:
- **Aggregation** — one smallholder's 200kg cannot fill a truck
- **Logistics** — direct access is meaningless if delivery doesn't happen
- **Price discovery** — farmers negotiating with zero market information
- **Trust** — no escrow, no accountability between strangers
- **Language/literacy** — text-only apps exclude much of the actual user base

**Our entire differentiation is that we attack those failure points rather
than rebuilding the marketplace layer everyone else builds.**

The one-line pitch: *"Everyone else builds the marketplace — we're solving the
logistics problem that made those marketplaces fail."*

If a design decision ever trades away the logistics layer to make the
marketplace nicer, that is the wrong trade.

---

## Feature set (finalized)

| # | Feature | Why it exists |
|---|---|---|
| 1 | Core listing + negotiation + transaction | Baseline; table stakes |
| 2 | **Voice chat** for negotiation | Literacy/typing barrier for smallholders |
| 3 | **Text translation** across Indian languages | Farmer and buyer often don't share a language |
| 4 | **Two-sided ratings** | Trust between strangers transacting directly |
| 5 | **Truck pooling** — cluster farmers into one truckload | The actual reason similar platforms failed |
| 6 | **Empty-backhaul matching** — use trucks already returning empty | Makes transport cost near-zero; the core USP |
| 7 | **Pre-harvest crop listing** | Price certainty before harvest; forward-contract style |
| 8 | **Soil-aware buyer-side sourcing** | Buyers rank sourcing options by soil provenance + landed cost |

**Build priority:** 1 → 5 → 6 → 4 → 3 → 2 → 7.
Features 5 and 6 are what no competing team will attempt. **Protect those
hours.** Feature 7 is first to cut (most unresolved edge cases). Feature 2
(voice) is second to cut — it's severable; the logistics engine is not.

---

## Key design decisions and their reasoning

### Rank on landed cost, not asking price
₹18/kg from 40km on an empty-return truck beats ₹16/kg from 120km on a
dedicated hire. This single decision is what makes the sourcing algorithm and
the logistics engine **one system** instead of two features sitting next to
each other. The worked example in the notebook (§12) demonstrates this
concretely — the two cheapest asking prices rank worst once freight lands.

### Soil is a provenance signal, not a hard filter
Certain crops genuinely perform better in certain soils (cotton in black
cotton soil, groundnut in sandy loam, rice in clay-heavy alluvial). Buyers
sourcing for quality care about origin. So soil feeds a 0–1 suitability score
in the ranker, not a yes/no filter.

### `pool_synergy` term in the sourcing ranker
A farmer who slots into a pool that *already has a matched empty-return truck*
is dramatically cheaper to source from. This term is how the logistics engine
feeds the sourcing algorithm. Don't drop it during refactoring — it's the
mechanical link between the two halves of the product.

### Crop compatibility matrix, not `crop_type ==`
Real co-loading constraints are physical: ethylene emitters (banana, apple,
tomato) ripen sensitive produce; onion/garlic taint mild produce; temperature
bands differ. Implemented in notebook §11. This is also a strong signal of
domain knowledge to agri-background judges.

### Pre-cache ALL external data — never call government APIs live
Agmarknet, Soil Health Card, NBSS&LUP, Bhuvan. Load soil polygons into PostGIS
as a table and do point-in-polygon lookups. This removes the single most
likely cause of a demo dying on stage — a government API rate-limiting or
timing out mid-presentation.

### Android-first
Target users are on mid-range Android. Web dashboard serves buyers/admin.

---

## Known weaknesses in the logistics model (and our answers)

These will be attacked by judges. Full table in notebook §10. Summary:

1. **Backhaul trucks are opportunistic, not schedulable** → two-tier offer:
   discounted backhaul with flexible 12–24hr window vs. guaranteed dedicated
   hire at normal rate. Farmer chooses; unpredictability becomes a priced
   trade-off.
2. **Pool-filling delay vs. perishability** → hard time-window; auto-dispatch
   at capacity OR crop-specific shelf-life deadline, whichever first, even at
   partial load.
3. **Multi-stop pickup kills driver economics** → cap 3–4 stops per pool, or
   use village-level aggregation points (one stop, also solves weighing).
4. **Weight verification** → certified scale at aggregation point, in-app
   record with photo + timestamp + driver co-sign at pickup and destination.
5. **Crop compatibility** → compatibility matrix (§11).
6. **Shared-load liability** → proportional by weight share, disclosed at
   pool-join. Insurance premium is future work — say so honestly.
7. **E-way bill / GST assume one consignor** → consolidated manifest with
   per-farmer line items. Note most smallholder consignments fall below the
   ₹50,000 e-way bill threshold.
8. **Broker-dominated informal trucking market** → **don't fight brokers,
   onboard them** as supply-side partners monetising dead return legs.
   Pitch line: *"We don't disintermediate the trucking market — we sell empty
   capacity back to it."*
9. **Four-sided cold start** → single-district pilot with deliberate density,
   seed transport via one fleet operator partnership.
10. **Destination separation** → prefer many-farmers→one-buyer pools;
    QR-coded crates and auto-split payment for many-to-many.

### The honest answer to "what breaks this?"
**That sufficient empty backhaul trucks exist on compatible routes at the
times produce is ready.** Everything else has a workaround. If this is wrong,
the cost advantage collapses and we're just another marketplace at normal
freight rates. This is what a pilot exists to test. Give this answer straight
if a judge asks — it reads as credibility, not weakness.

---

## Team

| Component | Owner(s) |
|---|---|
| Algorithms | Vansh, Arush |
| Data Ingestion | Ditya, Arush |
| Backend | Vansh, Ditya |
| Voice/Translation | Vansh, Ditya |
| Mobile App + Web Dashboard | Manya |
| DevOps | Parth |
| Security | **6th member — TBD** |
| Pitch / Team Lead | **Undecided** |

**Open items:** 6th member joining; security and pitch ownership unassigned.

**Known load imbalances (flagged, not yet resolved):**
- Vansh/Ditya/Arush carry four components between them, including the three
  hardest. Arush sits on both algorithms and ingestion — ingestion blocks
  algorithms, so he is serially on the critical path.
- Manya owns both mobile and web dashboard alone — largest single-person code
  volume on the team.
- Parth's DevOps is front-loaded; he'll have capacity within days. Consider
  moving him onto mobile once infra is up.
- **Recruit advice for the 6th member:** if they're strong, put them on web
  dashboard (freeing Manya for mobile) and fold security into Parth's DevOps
  track, since he'll already own infra. Security is a cross-cutting review
  pass — handing it to someone with no codebase context makes it slideware.

---

## Component difficulty ranking (drives sequencing)

1. **Algorithms** — hardest. Stateful coordination across farmers, buyers,
   trucks with deadlines and no clean rollback.
2. **Data Ingestion** — very hard and universally underestimated. Government
   shapefiles have inconsistent projections, CRS mismatches, broken
   geometries. Expect to lose real time to GDAL errors.
3. **Backend** — hard. Spine everything depends on.
4. **Voice/Translation** — hard but severable. Cut first if behind.
5. **Mobile App** — moderate. High volume, low conceptual difficulty.
6. **Web Dashboard** — moderate-easy. Highest visual payoff per hour.
7. **Security** — moderate, but cross-cutting; a review pass over everything.
8. **DevOps** — easiest, one-time setup cost.

**Critical path:** Data Ingestion → Algorithms → Backend → Mobile/Dashboard.

**The trap:** difficulty runs *inverse* to visibility. Mobile and dashboard
show obvious progress so teams build them first, while ingestion and
algorithms — which gate everything — sit untouched until it's too late.
Ingestion and algorithms start day one and stay protected from app work.

---

## Outstanding bugs / TODOs carried over

- **Backhaul matcher lets one truck match two pools simultaneously.** Visible
  in notebook §5 output (T1 matched to both Pool 1 and Pool 2). Toy-example
  artifact, but must be fixed with truck assignment tracking before any demo.
- **Pooling clusterer still uses `crop_type ==`.** The compatibility matrix
  exists in §11 but isn't wired into the clusterer yet.
- **Soil data resolution unverified.** If SHC/NBSS polygons are taluka-level,
  the farm-level provenance claim doesn't hold. **Check this in week one.** If
  coarse, reframe in the pitch as *district-level provenance indication* —
  honest framing beats an overclaim a domain judge can puncture.
- Sourcing plan bundling is greedy; note OR-Tools as the scaling path.

---

## Reference files

| File | Contents |
|---|---|
| `SIH1637_extended_concept.ipynb` | Full concept doc with **runnable** pooling, backhaul matching, crop compatibility, and soil-aware sourcing code. §10 = logistics weaknesses, §11 = compatibility matrix, §12 = sourcing algorithm, §13 = explainability card |
| `plan.md` | Build plan — architecture, data model, phases |
| `workplan.md` | Team workplan — roles, phases, security scope |
| `plan_SIH1707_superseded.md` | Old plan for SIH1707 (geolocation attendance). **Superseded — we pivoted away from this problem statement.** Kept for reference only |

---

## Context notes

- **Internal college round comes first**, then Grand Finale. The internal round
  is judged on the idea presentation, not working code. The trap is building
  for weeks and walking in with a weak deck.
- Judges for this statement are from an agricultural sciences background —
  they will probe domain assumptions, not just the tech.
- Nothing is built yet as of this handoff.
