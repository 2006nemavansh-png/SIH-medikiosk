# Arush — Roadmap (AgriDirect / SIH1637)

**Owns:** Algorithms (with Vansh) · Data Ingestion (with Ditya, consulting role)
**Difficulty of your components:** #1 (Algorithms, hardest) and #2 (Data Ingestion) on the team's ranking. You sit on both halves of the critical path — Ditya's ingestion work blocks your algorithm work, so you are serially exposed to any slip upstream.

---

## Immediate next action
- **Fix truck assignment tracking in the backhaul matcher.** This is a known,
  already-observed bug: in the notebook's §5 output, truck T1 matches to both
  Pool 1 and Pool 2 simultaneously. It's currently a toy-example artifact, but
  it **must** be fixed with proper assignment tracking (a matched truck drops
  out of the candidate pool) before this is ever demoed.

## Phase 0 — Internal Round (pitch-first, no full build)
- Support Vansh in getting the pooling + sourcing algorithms running on seeded
  data (notebook §5, §12) and producing real-output screenshots for the deck.
- Don't over-invest here — Phase 0 is judged on the pitch, not working code.

## Phase 1 — Post-Qualification Build

### Track B — Algorithms (with Vansh)
1. Pool clusterer + crop compatibility matrix (§11) wired in — replaces `crop_type ==`
2. Time-window dispatch logic (capacity threshold OR shelf-life deadline)
3. **Backhaul matcher with truck assignment tracking** — your fix from above,
   now built out properly and tested against multi-pool scenarios
4. Sourcing ranker and plan bundling — support role, Vansh leads
5. Expose algorithm endpoints for backend consumption

### Data Ingestion (consulting to Ditya)
- Ditya leads; you consult. Don't co-drive this — it creates a two-person
  bottleneck on a task that's already gating your own critical path. Answer
  questions fast, but let ingestion decisions move without waiting on you.

## Phase 2 — Grand Finale (36h)
- Hours 14–20 integration: the backhaul matcher's assignment tracking gets
  stress-tested here as the app actually drives it. This is where an
  unresolved double-match bug would surface publicly — make sure it's closed
  well before this window, not during it.
- No new features after hour 14.

## Watch for
- You're the team's single point of critical-path risk: blocked by Ditya's
  ingestion, gating Vansh's downstream algorithm work. If ingestion is late,
  say so immediately rather than absorbing the delay quietly — it compounds.
- Algorithms built in isolation and never wired into the app is the team's #1
  named risk. Insist on the weekly integration checkpoint even when the
  algorithm work feels "not demo-ready yet."
