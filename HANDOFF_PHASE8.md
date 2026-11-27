# Handoff — Voyager Ventures, Phase 8 (Unified Scale & Relationships)

Written 2026-11-27 after Gate 8.1. Conventions, standing rules, commands and the robots.txt lists are unchanged: read `HANDOFF_PHASE7_REVIEW.md` for them, then `DEVELOPMENT_ROADMAP.md` (Phase 8 gates), `SCIENTIFIC_MODELS.md` §27 and the end of `BUILD_LOG.md`.

## ▶ RESUME HERE

- Phase 8 was approved by the user on 2026-11-27 (“proceed as planned”). Gates: 8.1 scale navigator (**done**) · 8.2 relationship explorer `#/relations` · 8.3 integrated spectroscopy `#/spectral/compare` · 8.4 shared instruments · 8.5 unified notebook · 8.6 pathways. Encyclopedia E.2 follows 8.3. Stop at the Phase 8 boundary for review.
- **Deploy:** Claude Code’s classifier blocks `vercel deploy`, even when the user asks. Ask the user to run `! export PATH=~/.local/node/bin:$PATH && npx vercel deploy --prod --yes --project voyager-ventures`, then verify the bundle and run the live suite.
- Next: Gate 8.2. The registry API is in `src/shared/scientific-relationships/registry.ts` (`allEntities`, `allRelationships`, `relationshipsFrom/To`); star entities register at run time (`starRegistry.ts`).

**Counts:** 575 science tests, 66 browser tests (8 spec files), 33 dataset manifests, 127 Source-index entries.

## Gate 8.1

| Item | Where |
|---|---|
| `#/scale?z=<log10 m>&sel=<id>` | `src/modes/scale/ScaleView.tsx`; reference lengths in `src/modes/scale/references.ts` |
| Source | `codata-2022` (proton rms charge radius, NIST now serves CODATA 2022) |
| Level change | `cluster` level interactive → `#/cosmic/darkmatter?tab=clusters` |
| Tests | `tests/science/scale.test.ts` (15); e2e test 72 in `tests/e2e/phase8.spec.ts` |
