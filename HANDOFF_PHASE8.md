# Handoff — Voyager Ventures, Phase 8 (Unified Scale & Relationships)

Written 2026-11-27 after Gate 8.1. Conventions, standing rules, commands and the robots.txt lists are unchanged: read `HANDOFF_PHASE7_REVIEW.md` for them, then `DEVELOPMENT_ROADMAP.md` (Phase 8 gates), `SCIENTIFIC_MODELS.md` §27 and the end of `BUILD_LOG.md`.

## ▶ RESUME HERE

- Phase 8 was approved by the user on 2026-11-27 (“proceed as planned”). Gates: 8.1 scale navigator (**done**) · 8.2 relationship explorer `#/relations` (**done**) · 8.3 integrated spectroscopy `#/spectral/compare` · 8.4 shared instruments · 8.5 unified notebook · 8.6 pathways. Encyclopedia E.2 follows 8.3. Stop at the Phase 8 boundary for review.
- **Deploy:** Claude Code’s classifier blocks `vercel deploy`, even when the user asks. Ask the user to run `! export PATH=~/.local/node/bin:$PATH && npx vercel deploy --prod --yes --project voyager-ventures`, then verify the bundle and run the live suite.
- Deploys of 8.1 and 8.2 were skipped at the user’s request; production still serves Gate 7.5. Ask before deploying again.
- Next: Gate 8.3 (integrated spectroscopy `#/spectral/compare`), then encyclopedia E.2.

**Counts:** 585 science tests, 67 browser tests (8 spec files), 33 dataset manifests, 127 Source-index entries.

## Gate 8.1

| Item | Where |
|---|---|
| `#/scale?z=<log10 m>&sel=<id>` | `src/modes/scale/ScaleView.tsx`; reference lengths in `src/modes/scale/references.ts` |
| Source | `codata-2022` (proton rms charge radius, NIST now serves CODATA 2022) |
| Level change | `cluster` level interactive → `#/cosmic/darkmatter?tab=clusters` |
| Tests | `tests/science/scale.test.ts` (15); e2e test 72 in `tests/e2e/phase8.spec.ts` |

## Gate 8.2

| Item | Where |
|---|---|
| `#/relations?tab=map\|path\|links\|planned&e=&depth=&from=&to=&types=&q=&stars=1` | `src/modes/relations/RelationsView.tsx`; queries in `src/shared/scientific-relationships/graph.ts` |
| Entry points | 🔗 in the top bar and ☰ menu; “map ↗” in every *Related across modes* list |
| Tests | `tests/science/relations.test.ts` (10); e2e test 73 |
