# Parth — Roadmap (AgriDirect / SIH1637)

**Owns:** DevOps (solo, front-loaded) — #8 (easiest, one-time setup cost) on the team's difficulty ranking, but you'll have spare capacity within days and are slated to move onto mobile after.

---

## Immediate next action
- **Repo scaffold, Docker, `.env`/`.gitignore`, CI.** This is called out as an
  immediate action in the build plan — get it done early since everything else
  (backend, algorithms, ingestion) will build on top of it.

## Phase 0 — Internal Round (pitch-first, no full build)
- No individually-critical Phase 0 deliverable — this phase is dominated by
  the pitch/deck work (R1) and algorithm/mockup screenshots (Vansh/Arush, R5).
  Use this window to get the repo, Docker, and CI scaffolding in place so
  Phase 1 doesn't stall on infra day one.

## Phase 1 — Post-Qualification Build

### DevOps
1. Docker + docker-compose for local dev
2. CI via GitHub Actions
3. Deployment targets: Railway/Render/Fly.io for backend, Vercel for the dashboard
4. Supabase Storage or Cloudflare R2 for voice notes / crop photos, **encrypted at rest**
5. `.env` + `.gitignore` enforced from commit one — no secrets in the repo

### After infra is up — move to Mobile (supporting Manya)
- Manya owns mobile + web dashboard alone, the largest single-person code
  volume on the team. Once your DevOps front-load clears (expected within
  days), plan to shift onto mobile to rebalance that load. Don't wait to be
  asked — check in with Manya once CI/Docker are stable.

## Phase 2 — Grand Finale (36h)
- Hours 0–4: environment setup, seed demo data, smoke-test every service end
  to end — this is your window, since it's infra-shaped work.
- Hours 20–26: security pass (auth, PII exposure, input validation) — if no
  dedicated security owner has emerged by then, this likely falls partly to
  you given your infra/DevOps context. Confirm ownership before the finale,
  not during it.
- No new features after hour 14.

## Watch for
- **Security ownership is still unassigned** (6th member TBD). The plan's own
  fallback suggestion is to fold security into your DevOps track if a strong
  6th member doesn't materialize, since you'll already own infra and a
  security review pass needs codebase context. Push for a decision on this
  early — "security becomes a slide with nothing behind it" is a named team
  risk, and it lands on you by default if unresolved.
