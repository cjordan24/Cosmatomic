# Handoff — Voyager Ventures, start of Phase 6 (Deep Space & Invisible Gravity)

Written 2026-11-26 at the end of Phase 5. Read this first, then `DEVELOPMENT_ROADMAP.md`, `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§13–16 are Phase 5), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md`, `SCIENTIFIC_RELATIONSHIPS.md`, `FIELDS_ARCHITECTURE.md` and the tail of `BUILD_LOG.md`. `HANDOFF_PHASE5.md` and `HANDOFF_PHASE4.md` keep the older history; the essentials are repeated here.

## ▶ RESUME HERE

**State:** Phases 1–5 are complete. Phase 5 is Gates 5.1–5.5; each gate was committed, pushed, deployed and checked against production with the full browser suite (5.5 result in BUILD_LOG). **Phase 6 has not started. The user reviews each phase before the next begins: do not start Phase 6 until they say so.**

**Counts at the end of Phase 5:** 371 science tests (Vitest), 52 browser tests (Playwright), 22 dataset manifests, 75 Source-index entries.

## What Phase 5 added (where to look)

| Route | What | Code |
|---|---|---|
| `#/cosmic/stars?sel=&frame=galactic\|icrs&bg=1` | 3D map of the 10 pc sample (562 objects, 354 systems) + CNS5 to 20 pc; per-value ADS references; derived d, M, v_t; class V calibration; Planck model per star | `src/modes/cosmic/star-systems/{stars.ts,StarScene.tsx,StarsView.tsx}` |
| `#/cosmic/stars/hr?d=cmd\|hr\|classes&sel=&cls=` | observed CMD (2 610 stars), luminosity–temperature (306 stars + IAU Sun), MK class table with line links | `hr.ts`, `HrView.tsx`, shared `ScatterPlot` in `src/ui/plots.tsx` |
| `#/cosmic/stars/planets?sys=&pl=` | 85 planets / 48 systems, exoplanet.eu elements with σ, face-on orbits, mass–period diagram, Kepler/JD checks | `exoplanets.ts`, `PlanetsView.tsx` |
| registry | `star:<seq>` (registered at run time when the catalogue loads), `stellar-class:O…M`, Sun → class G and → 28 photospheric elements | `starRegistry.ts`, `src/shared/scientific-relationships/registry.ts` |

Datasets: `astronomical/{nearby-stars-10pc,cns5-20pc,mamajek-dwarf-sequence,exoplanets-10pc}.json` (adapters `scripts/ingestion/{nearby-stars,exoplanets}.ts`).

## Landing page: four portals (carry forward)

ATOMIC · COSMIC · SPECTRAL are live; CELLULAR stays greyed out with "Coming soon" until Biologic Mode (Phase 11), then becomes a live portal (scene, tagline, ENTER, transition, route, e2e test, screenshot). Every future *environment* gets a matching portal; sub-views inside a mode (like the Phase 5 star views) do not. Details: `src/modes/landing/Landing.tsx`, tests `phase1.spec.ts` 01/18, `phase4.spec.ts` 50/53.

## Standing user rules

1. **Source Index:** every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` for each manifest and `sources: [ids]` on records. Check DOIs with `curl https://api.crossref.org/works/<doi>`, read affiliations from the paper's first page (arXiv PDF + Swift PDFKit), fetch every URL (A&A DOIs answer 403 to curl; Crossref is the check). `tests/science/sources.test.ts` enforces coverage.
2. **Never invent scientific values.** Unknown shows as "unknown". Every value carries a provenance class (Observed / Derived / Simulated / Illustrative / Hypothetical); models state validity limits (`src/core/physics/modules.ts`). Explanatory sentences are sourced too (Phase 5 checked them against OpenStax text before use).
3. **Standing authorisation:** after each gate, commit to `main`, push, `vercel deploy --prod`, run the browser suite against production. Report at each phase boundary and stop for review.
4. Respect robots.txt, bot walls and rate limits. Off-limits: COD (robots), AMCSD (bot wall), iso.org (Cloudflare), **SIMBAD CfA mirror (robots disallows all)**, **NASA Exoplanet Archive (robots disallows Anthropic agents by name — do not use)**. Fine: NIST WebBook (crawl-delay 5), CODATA (3), JANAF, IAPWS, refractiveindex.info, VizieR CfA mirror (2 s), exoplanet.eu, arXiv PDFs, OpenStax.
5. No API keys in client code; no paid infrastructure or new external services without explicit approval (Vercel Hobby and GitHub approved). Never fabricate screenshots. No dependency on "Lodestar Digital Studio".
6. New relationships go through the registry (`SCIENTIFIC_RELATIONSHIPS.md`): sourced edges, `RelatedLinks` both directions (`limit`/`first` props for long lists), planned entities have no route. New fields go through `FieldLayer` (`FIELDS_ARCHITECTURE.md`).

## Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24; `node` is NOT on the default PATH
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate
```

- No Python: adapters in TypeScript under `scripts/ingestion/`, run with `node --experimental-strip-types`, through `scripts/ingestion/lib/ingest.ts` (`fetchText` with rate limits and cache in `datasets/.cache`; `writeDataset` writes manifest + sha256). Re-running an adapter from cache rewrites `retrievedAt`; revert timestamp-only manifest changes (`git checkout -- datasets/manifests/<x>`).
- **CDS Strasbourg was offline (cybersecurity incident, Nov 2026).** VizieR works through the official mirror `https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=…&-out.max=unlimited&-out=…`. The ESA Gaia archive documentation pages served only a placeholder.
- PDFs: `swift /path/pdftext.swift file.pdf` (PDFKit `page(at:).string`); render to PNG for scans.
- Git: cjordan24 / cjordan24@users.noreply.github.com; `GIT_TERMINAL_PROMPT=0 git push origin HEAD:main`. Commit trailer:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
  ```
- Deploy: `npx vercel deploy --prod --yes --project voyager-ventures` (uploads the **working tree**: stash unrelated uncommitted work first). Live test: build `tests/e2e/playwright.live.config.ts` with `sed` (base URL → https://voyager-ventures.vercel.app, delete the `webServer` block), run it (≈ 9 min, background), delete it, then `git checkout -- screenshots`.
- Full e2e runs regenerate earlier phases' screenshots: `git checkout -- screenshots/phase-0{1,2,3,4}` before committing. Running the browser suite and Vitest at the same time can time out the VGFF force-field test (passes alone).
- Playwright: `aria-disabled` elements need `click({ force: true })`; `getByLabel` needs `{ exact: true }` when labels share a prefix ("Astrometry" / "Derived astrometry"); option accessible names concatenate cells without spaces ("Proxima CenM5.5" → use the exact name); KV numbers are formatted with thousands separators ("2,930 K").

## Stack gotchas (unchanged)

React 19, TS 5.9, Vite 8, three 0.187, R3F 9, drei 10, Zustand 5, Vitest 5, Playwright 1.65 (SwiftShader). Don't use drei `<Html>` (use `src/rendering/labels.tsx`; `Billboard` is fine). Hash routes in `src/shared/router.ts`, lazy views in `src/App.tsx`, chips in `src/ui/TopBar.tsx` (Cosmic: Solar system · Nearby stars · HR diagram · Exoplanets · Sandbox). New views use `center-stage` between `left-panel` and `right-panel`. Plots: `LinePlot`/`ScatterPlot` with quantity + unit axis labels. Simulations step in simulated time with chunking-independence tests. Don't use perl with `|` delimiters on code containing `|`; never write `*/` inside a block comment; complex edits via Edit or a node script with exact-match `replace` that throws on a miss.

## Phase 6 — proposed gates (re-assess before starting)

Placeholders exist under `src/modes/cosmic/` (galaxies, nebulae, black-holes, universe). Roadmap scope: nebulae, galaxies, compact objects, black holes, relativity foundations, lensing, JWST/Hubble galleries, rotation curves, first dark-matter halo models.

1. **6.1 Relativity foundations:** Schwarzschild metric quantities (r_s, photon sphere, ISCO, gravitational redshift, time dilation) as a new `relativistic` physics module with validity limits; tests against textbook closed forms. Keep the Newtonian solver out of strong fields.
2. **6.2 Compact objects and black holes:** white dwarfs from the 10 pc sample (link existing records), neutron-star and black-hole parameters only from cited measurements (e.g. EHT M87*/Sgr A* papers; check licences); a black-hole view with the 6.1 quantities.
3. **6.3 Gravitational lensing:** point-lens equations (Einstein radius, magnification), an interactive lens plane; cite a textbook or review.
4. **6.4 Galaxies and rotation curves:** Milky Way structure parameters with sources; rotation curves from published tables (check VizieR/SPARC licence) against a baryons-only Newtonian model and a cited halo model (NFW, Navarro–Frenk–White 1996/97), labelled as models.
5. **6.5 Nebulae and image galleries:** only images with clear licences (NASA/ESA/STScI usage policies; credit lines); no fabricated imagery. Cross-links to the Spectral atlas (emission lines H α, [O III]) and to elements.

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md` (Phase 5 section). Notable: star positions not propagated in time; class V calibrations only (no luminosity classes in the catalogue); CNS5 Hipparcos-converted G can be off for the brightest stars (Sirius A +0.39 mag, flagged); exoplanet elements are a compilation (per-field references on exoplanet.eu pages), 4 invalid periastron times flagged, 3 planets without elements; stellar spectra are Planck models only. Older: Voyager 2 at Neptune ~15 % too far (JPL coarse trajectory); VGFF-1 qualitative; RDKit ~7 MB; ISO 20473 not available; FIELDS layers analytic only.
