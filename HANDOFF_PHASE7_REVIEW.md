# Handoff — Voyager Ventures, Phase 7 complete: stop for user review

Written 2026-11-27, after Gate 7.5. Read this first, then `DEVELOPMENT_ROADMAP.md`, `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§22–§26 are Gates 7.1–7.5), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` (Phase 7 and Encyclopedia sections), `SCIENTIFIC_RELATIONSHIPS.md` and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7_GATE5.md` and the earlier handoffs hold the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State:**
- Phases 1–7 are complete. Phase 7 (gates 7.1–7.5) was approved by the user “as proposed”; the inserted mobile fix and encyclopedia Gate E.1 are also done.
- **This is the Phase 7 boundary: stop and report to the user for review.** Do not start Phase 8 (or the next encyclopedia pass) until the user says so. A pasted handoff on its own is not approval.
- **Production deploy:** `vercel deploy --prod` was blocked by the Claude Code auto-mode permission classifier in both the Gate 7.4 and Gate 7.5 sessions, despite the standing authorisation. Check whether production serves the current `dist/assets/index-*.js`; if it does not, ask the user to run `! npx vercel deploy --prod --yes --project voyager-ventures` (or to allow it), then run the full browser suite against production and record the result in `BUILD_LOG.md`.

**Counts:** 560 science tests (Vitest), 65 browser tests (Playwright, 7 spec files), 33 dataset manifests, 126 Source-index entries.

## What Gate 7.5 added

| Item | What | Code / data |
|---|---|---|
| `#/cosmic/gw?tab=catalog\|chirp\|gw170817` (+ `ev rel`, `m1 m2 d flo`, `lag D`) | Catalog: m₁–m₂ (log) of 282 events coloured by release, release filters, cumulative detections by date (from the event names); each event with 90 % intervals, derived detector-frame 𝓜, M − M_f, ISCO frequency, z(d_L) in the catalog cosmology and in Planck 2018; GW150914 2016 vs GWTC-2.1. Chirp: leading-order waveform to the ISCO (last 40 cycles), f vs t_c − t, inspiral quantities, and the “basic physics of GW150914” numbers beside the same formulas. GW170817: Δv/v_EM vs assumed emission lag with the published bounds, standard-siren H₀ beside Planck 2015/SH0ES 2016 (quoted) and Planck 2018/SH0ES 2022 (Distance ladder view) | `src/modes/cosmic/universe/GwView.tsx`, `gw.ts`, `src/core/physics/gravitationalWaves.ts`, `redshiftAtLuminosityDistance` in `cosmology.ts` |
| Data | `gravitational-waves`: GWOSC event API `eventapi/jsonfull/GWTC/` (391 events, 282 with parameters; CC BY 4.0), the basic-physics paper’s GW150914 estimates, GW170817 GRB delay/bounds and standard-siren values | `datasets/astronomical/gravitational-waves.json`, adapter `scripts/ingestion/gwosc.ts` (cache `datasets/.cache/gwosc/`) |
| Navigation | *Universe ▾* now also has *Gravitational waves* | `src/ui/TopBar.tsx`, `src/App.tsx` |
| Registry | `context:gravitational-waves`: GW150914 remnant observed with it; explains the Hulse–Taylor decay; expansion explains the (1 + z) mass scaling and is observed with the standard siren; observed with gamma rays (GRB 170817A) | `registry.ts` |
| Sources | `gwosc`, `gwtc-1`, `gwtc-2.1`, `gwtc-3`, `gwtc-5`, `gwtc-5-intro`, `abbott-2017-basic-physics`, `abbott-2017-grb`, `abbott-2017-h0` | `sources.ts` |
| Module | Relativistic v1.1.0: GW solvers and validity limits | `modules.ts` |
| Tests | 28 science tests (`tests/science/gravitationalWaves.test.ts`); e2e test 71 in `tests/e2e/phase7.spec.ts` | |

Not done in 7.5 (candidates): marginal candidates, sky maps, strain data and noise curves, population/rate results, posterior samples, later standard-siren H₀ values, post-Newtonian or IMR waveforms (Phase 14.5 advanced relativity).

## Phase 7 summary for the review

| Gate | View | Main sources |
|---|---|---|
| 7.1 | Expansion and distances `#/cosmic/universe` | Planck 2018 VI Table 2; Hogg 1999 |
| 7.2 | Distance ladder `#/cosmic/ladder` | Riess et al. 2022; Freedman 2021, 2025; Pietrzyński 2019; Reid 2019 |
| 7.3 | CMB `#/cosmic/cmb` | FIRAS (Fixsen 1996, NASA LAMBDA); Planck 2018 PLA; Noterdaeme 2011; Muller 2013 |
| 7.4 | Dark-matter evidence `#/cosmic/darkmatter` | SPARC; Clowe 2006; Łokas & Mamon 2003; Cooke 2018 |
| 7.5 | Gravitational waves `#/cosmic/gw` | GWOSC (GWTC-1 → GWTC-5.0); LIGO/Virgo basic physics 2017; GW170817 GRB and H₀ papers |

## Encyclopedia rules (user decisions, 2026-11-26)

- **Never written by Claude.** Entries are verbatim excerpts with a credit line, link and licence. Omitted sentences are marked […] and counted.
- **Sources.** Open and public-domain sources are preferred. Short attributed quotations from copyrighted sources are also allowed. Wikipedia was not chosen.
- **UI.** A collapsible corner menu (📖) holds the encyclopedia; a selected item’s panel gets a collapsible *About* section; the source line sits directly under the bio heading.
- **Wavelength matching** only through bundled band conventions (ISO 21348, ITU-R V.431). Excerpts never set band limits.
- **Next passes.** Elements, molecules and celestial objects (“coming soon” today). Check each source’s licence and robots.txt first. Candidates: PubChem descriptions, NASA Science planet pages, ESA, OpenStax. Add `datasets/encyclopedia/<category>.json`, flip the category’s status in `CATEGORIES`, and show `EncyclopediaBio` in the element, molecule and body panels.

## Standing user rules (unchanged)

1. **Source index.** Every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` per manifest and `sources: [ids]` on records. Check DOIs with Crossref; read affiliations from the paper’s first page (arXiv PDF + Swift PDFKit).
2. **Never invent scientific values.** Unknown values show as “unknown”. Every value carries a provenance class; every model states its validity limits (`src/core/physics/modules.ts`). Explanatory text must be sourced. Store each published value with its interval type.
3. **Standing authorisation.** After each gate: commit to `main`, push, run `vercel deploy --prod`, then run the full browser suite against production. Report at each phase boundary and stop for review.
4. **Respect robots.txt, bot walls and rate limits.**
   - Off-limits: iopscience.iop.org; wiki.cosmos.esa.int; COD, AMCSD, iso.org and the SIMBAD CfA mirror; the NASA Exoplanet Archive; export.arxiv.org; Springer link.springer.com PDFs.
   - Fine: arxiv.org `/abs` and `/pdf` (crawl-delay 15 s) and the Crossref API; the VizieR CfA mirror, exoplanet.eu, OpenStax and SPARC; esahubble.org, esawebb.org, eso.org/public; lambda.gsfc.nasa.gov, www.cosmos.esa.int, irsa.ipac.caltech.edu `.txt` files; science.nasa.gov and nasa.gov.
   - **New in Gate 7.5:** gwosc.org — robots.txt disallows `/catalog/`, `/archive/`, `/timelinejson/`, `/timeline/*/`, `/fast/`, `/join/`, `/loscdata/archive/` and the per-event data directories (`/GW150914data/` etc.); `/eventapi/`, `/apidocs/`, `/acknowledge(ment)/` and the release pages (`/GWTC-5.0/` etc.) are allowed. Data CC BY 4.0; cite the open-data papers.
5. **No secrets, paid services or fabricated images.** No API keys in client code; no paid infrastructure or new external services without approval. Images only with a stated reuse licence and visible credit.
6. **Shared mechanisms.** New relationships go through the registry (sourced edges, both directions). New fields go through `FieldLayer`.

## Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate
npx playwright test --config tests/e2e/playwright.config.ts -g "71 gravitational"   # one e2e test
```

- Adapters: `node --experimental-strip-types scripts/ingestion/<x>.ts`. Re-running rewrites `retrievedAt`; revert manifest changes that only touch timestamps. Caches live in `datasets/.cache/` (git-ignored).
- `npm run build` also typechecks `scripts/` and `tests/`. Science tests have no Node types (use `import.meta.glob`). E2E specs have no DOM types (pass `page.evaluate` code as a string).
- PDFs: `swift pdftext.swift file.pdf [from] [to]` (PDFKit `page(at:).string`); not in the repo, recreate it (about 8 lines).
- Deploy: `npx vercel deploy --prod --yes --project voyager-ventures`; production takes 20–60 s to serve the new `index-*.js`; compare with `dist/assets` before the live run.
- Live test: build `tests/e2e/playwright.live.config.ts` with sed (base URL `https://voyager-ventures.vercel.app`, delete the `webServer` block), run in the background (about 10 min), then delete the config and `git checkout -- screenshots`.
- While a suite runs: do not edit any `*.spec.ts` and do not run `npm run build`.
- Full runs regenerate older screenshots: run `git checkout -- screenshots/phase-0{1,2,3,4,5}` before committing.
- Top-bar width at 1440 px: the rightmost element must be ≤ 1440 (tests 17 and 58). Phone layout: check at 390 × 844 with a scratch Playwright `.cjs` against `vite preview --port 4174`. Panels render `aria-label={title}`, not an `id`; give `<dl>` labels names that differ from their panel’s title.

**Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. Most relevant for the review:
- **Gravitational waves:** medians only (no posterior samples), so combinations of medians are approximate; 109 events without parameters; GWOSC SNR ≠ paper SNR; leading-order chirp only (no merger/ringdown, spins or detector response); GWTC-5.0 papers are preprints.
- **Dark matter:** Newtonian gravity throughout; no modified-gravity fit; Coma σ_los curves are model predictions without bundled data points.
- **CMB:** diagonal errors only; TT only; Planck data CC BY-NC 3.0 IGO.
- **Distance ladder:** published relations applied to user inputs; SH0ES global fit not reproduced; CCHP 2025 erratum unread (IOPscience robots.txt).
- **Cosmology:** homogeneous FLRW, w = −1, massless radiation.
- **Encyclopedia:** radiation only; the *About* section appears only in the Spectral atlas.
