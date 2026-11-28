# Handoff — end of Phase 23 (2026-11-28)

## ▶ RESUME HERE

**State:** Phases 11–23 are complete, committed and pushed to `main` (last commit `f5523c9`). Working tree clean. **Nothing deployed since Phase 10 / the universe-map pass** — the user runs the deploy:

```
! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures
```

**Work was held at the user's request** at the start of Phase 24. Two Phase 24 research agents were stopped before writing any notes (no `research/SOURCE_NOTES_PHASE24*.md` exists). The end-of-Phase-23 full browser suite was stopped after 14 passing tests; **run it first** when resuming (last complete run: 128/128 at the end of Phase 21; all Phase 22–23 browser tests 135–138 pass individually).

**Next:** Phase 24 — Human impact & future climate (METEOROLOGY_EXPANSION_BRIEF.md §8 and §9), then Phase 25 (environmental sandbox, §10) and Phase 26 (validation and optimisation). The user's standing instruction: build without asking; commit and push per gate; no deploy (user deploys).

### Phase 24 plan (not started)
- 24.1 Human activities: Global Carbon Budget (ESSD, CC BY), EPA inventory / global sector shares, EDGAR (JRC, CC BY), methane sources (NOAA GML html), aviation, cement (Andrew 2019 ESSD), land use, waste heat vs greenhouse forcing, water use (USGS), ozone recovery dates (WMO/NOAA 2022), life-cycle emissions per kWh (open source e.g. UNECE 2021), carbon capture (DOE), climate-intervention uncertainty (OSTP 2023). Data centres already covered (`lbnl-2025-datacentre`).
- 24.2 Future climate: NCA5 (2023) scenario/warming-level projections and abrupt changes, NOAA 2022 Sea Level Rise Technical Report scenarios (0.3–2.0 m by 2100), ocean pH projections, definitions (forecast vs projection vs scenario, statistical vs physics models, ESMs, ensembles — GFDL/GISS/NCAR/Climate.gov), climate sensitivity. Never present projections as outcomes; always show scenario + range.
- Re-launch the two research agents with the briefs in the conversation (rules file: `/tmp/vv-research/p20/RULES.md` — recreate from the source-index and off-limits memories if /tmp was cleared).

## Conventions (unchanged)
- `export PATH=~/.local/node/bin:$PATH` first. Checks: `npm run typecheck`, `npx vitest run --maxWorkers=4`, `npm run data:validate`, `npm run build` (before e2e — it serves dist), `npx playwright test --config tests/e2e/playwright.config.ts phaseNN -g "NNN "`. Never build while a full suite runs. Restore unrelated screenshots after runs (`git checkout -- screenshots/...`).
- **Gate commits on vitest passing** (Gate 23.3 slipped through with a failing sources test; fixed in `f5523c9`).
- Sources: add via `/tmp/vv-research/p18/addsrc.py`-style helper (citation > 20 chars; https URL; authorBio null unless verified). In views compute `SourceLinks` ids outside JSX when conditional (the scanner misreads ternaries).
- Registry ids must be unique per route (`ROUTE_CONFLICTS` test).
- Top bar must fit at 1440 px: Meteorology uses menus **Atmosphere ▾ / Weather ▾ / Climate ▾** plus the **Other worlds** chip; assert `fits(page)` in new tests.
- Every view: Explore / Understand / Research depth switch (`src/ui/Depth.tsx`); every value quoted or labelled derived/illustrative; disagreements shown with both values; never invent values (e.g. Katrina track was replaced by the report's dated stages).
- Verify research-agent transcriptions of formulas on page images (Rayleigh κ = 5ν/2 had been misread).

## What exists (Meteorology, Phases 20–23)
| Route | Content |
|---|---|
| `#/meteorology` | USSA 1976 structure, layers, composition |
| `/air` | humidity, stability |
| `/radiation` | energy budget, absorption bands, CO₂ forcing (AGGI), ozone, aerosols |
| `/motion` | Coriolis, convection, clouds, rain, water cycle, circulation |
| `/atlas` | 19 global grids (NOAA PSL + NASA GIBS; NEO decommissioned) on map/globe |
| `/storms` | storm laboratory (NHC/NSSL/NWS; Katrina, Andrew, Moore 1999, 1993, 1995) |
| `/climates` | NOAA normals for 16 stations, Köppen (Peel 2007) |
| `/records` | NOAAGlobalTemp 1850–2025 |
| `/planets` | other worlds (NSSDCA atmospheres, comparison engine, internal heat) |
| `/iceages` | 800 kyr CO₂, Antarctic T, Berger & Loutre orbits |
| `/deeptime` | 4.6 Ga timeline, twenty events, proxies |
| `/oceans` | conveyor, ENSO (RONI/ONI), ocean heat & pH (HOT), sea ice, biomes |

Counts: 1,062 science tests; browser tests numbered to 138; ~520 sources. Full index: STATUS_REPORT.md (section 1 lists the one permission denial — a research agent's PSL metadata request; nothing missing as a result).

## Blocked / off-limits hosts added this run
www.ipcc.ch (copyright page 403 → IPCC not used), www.noaa.gov/jetstream (403), journals.ametsoc.org (403), AOML (403), JPL www/voyager/descanso (403), pluto.jhuapl.edu (robots), nature.com (robots disallow ClaudeBot), figshare (bot challenge), Smithsonian (robots), IMCCE (IP blocked), GISTEMP tables and NCEI `/data*` and GML `/webdata/` (robots), NASA NEO (decommissioned), ozonewatch (TLS), spc.noaa.gov (robots), gpm.nasa.gov (504).
