# Handoff — Voyager Ventures, Phase 7 resumes at Gate 7.5 (gravitational waves)

Written 2026-11-27, after Gate 7.4. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 7 and Encyclopedia tables), `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§22–§25 are Gates 7.1–7.4), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` (sections Phase 7 and Encyclopedia), `SCIENTIFIC_RELATIONSHIPS.md`, and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7_GATE4.md` and the earlier handoffs hold the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State:**
- Phases 1–6 are complete.
- Phase 7 is approved by the user "as proposed" (gates 7.1–7.5). Gates 7.1–7.4 are done, plus the inserted mobile fix and encyclopedia Gate E.1.
- Gate 7.4 is committed and pushed to `main` (63c1c5f). **It is not yet deployed:** `vercel deploy --prod` was blocked by the Claude Code permission classifier in the Gate 7.4 session, so the user was asked to run it. Before starting 7.5, check whether production serves the current `dist/assets/index-*.js`; if it does not, deploy (or ask the user to), then run the full browser suite against production and add "Gate 7.4 verified against production: 64/64 passed" (or the real result) to `BUILD_LOG.md`.

**Next:** Gate 7.5 (gravitational waves), unless the user asks for the next encyclopedia pass first. Stop for user review at the Phase 7 boundary, after Gate 7.5.

**Counts:** 532 science tests (Vitest), 64 browser tests (Playwright, 7 spec files), 32 dataset manifests, 117 Source-index entries.

## What Gate 7.4 added

| Item | What | Code / data |
|---|---|---|
| `#/cosmic/darkmatter?tab=overview\|galaxies\|lensing\|clusters\|cosmic` (+ `yd yb q g`, `c ml`, `a r`, `rate=emp`) | Fixed colour key on every tab: observed (gold), visible matter under Newtonian gravity (green), model with dark matter (violet). Overview table of five probes; SPARC g_obs vs g_bar and V_obs²/V_bar²; Bullet Cluster apertures, visible mass vs κ̄, M/L_I slider; Coma masses by component and Jeans σ_los (stars + gas vs full model) for the four Table 1 fits, with the paper's printed numbers beside the recomputed ones; Planck matter budget, BBN vs CMB Ω_b h², TT spectrum | `src/modes/cosmic/universe/DarkMatterView.tsx`, `darkmatter.ts`, `src/core/physics/darkMatter.ts` |
| Data | `dark-matter`: Clowe et al. 2006 Table 2 and quotes; Łokas & Mamon 2003 mass model (eqs. 1–12, Table 1, results); Cooke et al. 2018 eqs. 9–14. Coma's measured σ profile is a figure only and is **not** bundled | `datasets/astronomical/dark-matter.json`, adapter `scripts/ingestion/curated-dark-matter.ts` |
| Navigation | *Universe ▾* now also has *Dark-matter evidence* | `src/ui/TopBar.tsx`, `src/App.tsx` |
| Registry | `context:dark-matter`: observed-with lensing (clowe-2006) and the CMB (planck-2018-vi); explains `galaxy:milky-way` (bland-hawthorn-gerhard-2016); part-of cosmic expansion | `registry.ts` |
| Sources | `clowe-2006`, `lokas-mamon-2003`, `cooke-2018` | `sources.ts` |
| Tests | 26 science tests (`tests/science/darkMatter.test.ts`); e2e test 70 in `tests/e2e/phase7.spec.ts` | |

Not done in 7.4 (candidates): X-ray cluster gas fractions (e.g. Vikhlinin et al. 2006, Mantz et al.), Zwicky 1937, weak-lensing masses of other clusters, a κ map or X-ray image of the Bullet Cluster (image licence not checked), MOND / radial-acceleration fits (Phase 14.6).

## Encyclopedia rules (user decisions, 2026-11-26)

- **Never written by Claude.** Entries are verbatim excerpts with a credit line, link and licence. Omitted sentences are marked […] and counted.
- **Sources.** Open and public-domain sources are preferred. Short attributed quotations from copyrighted sources are also allowed (the user chose this over open-only). Wikipedia was not chosen.
- **UI.**
  - A collapsible corner menu (📖) holds the whole encyclopedia.
  - When an item is selected, its panel gets a collapsible *About* section.
  - The source line sits directly under the bio heading (user request).
- **Wavelength matching.** Entries are matched only through bundled band conventions (ISO 21348, ITU-R V.431). Excerpts never set band limits.
- **Next passes.** Elements, molecules and celestial objects, which show as "coming soon" today.
  - Check each source's licence and robots.txt before use.
  - Candidates: PubChem element and compound descriptions (each record carries its own source and licence), NASA Science planet pages, ESA, OpenStax.
  - Add a `datasets/encyclopedia/<category>.json` file, flip the category's status in `CATEGORIES`, and show `EncyclopediaBio` in the element, molecule and body panels.

## Standing user rules (unchanged)

1. **Source index.**
   - Every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note. Use `authorBio: null` if the note is unverified; never guess.
   - Add `datasets: [...]` for each manifest and `sources: [ids]` on records.
   - Check DOIs with Crossref. Read affiliations from the paper's first page (arXiv PDF + Swift PDFKit).
2. **Never invent scientific values.**
   - Unknown values show as "unknown".
   - Every value carries a provenance class, and every model states its validity limits (`src/core/physics/modules.ts`).
   - Explanatory text must be sourced.
   - Store each published value with its interval type (1σ / 68 % / 90 %).
3. **Standing authorisation.** After each gate: commit to `main`, push, run `vercel deploy --prod`, then run the full browser suite against production. Report at each phase boundary and stop for review.
4. **Respect robots.txt, bot walls and rate limits.**
   - Off-limits:
     - iopscience.iop.org: its robots.txt disallows all agents and names Anthropic’s (found in Gate 7.2).
     - wiki.cosmos.esa.int (Planck explanatory supplement): robots.txt disallows all agents (found in Gate 7.3; check robots.txt in a separate command *before* any fetch).
     - COD, AMCSD, iso.org and the SIMBAD CfA mirror.
     - The NASA Exoplanet Archive: its robots.txt disallows Anthropic agents by name.
     - export.arxiv.org: its robots.txt disallows all agents.
     - Springer link.springer.com PDFs: JavaScript bot wall.
   - Fine:
     - arxiv.org `/abs` and `/pdf` (crawl-delay 15 s) and the Crossref API.
     - The VizieR CfA mirror, exoplanet.eu, OpenStax and SPARC.
     - esahubble.org, esawebb.org and eso.org/public.
     - lambda.gsfc.nasa.gov (empty robots.txt), www.cosmos.esa.int (empty robots.txt), irsa.ipac.caltech.edu `.txt` files (disallows only listed paths and binary formats). ESA Space Science Archive data are CC BY-NC 3.0 IGO.
     - science.nasa.gov and nasa.gov: robots.txt allows all agents. Content is generally not subject to U.S. copyright, and NASA must be acknowledged.
5. **No secrets, paid services or fabricated images.** No API keys in client code, and no paid infrastructure or new external services without approval. Never fabricate screenshots or images; use images only with a stated reuse licence and a visible credit.
6. **Shared mechanisms.** New relationships go through the registry (sourced edges, both directions). New fields go through `FieldLayer`.

## Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate
```

**Adapters.**
- Run with `node --experimental-strip-types scripts/ingestion/<x>.ts`.
- Re-running an adapter rewrites `retrievedAt`; revert manifest changes that only touch timestamps.
- The NASA encyclopedia adapter caches pages in `datasets/.cache/nasa-ems/`.

**Typechecking.**
- `npm run build` also typechecks `scripts/` and `tests/`.
- Science tests have no Node types: use `import.meta.glob` (`?raw` / `?inline`), not `node:fs`.
- E2E specs have no DOM types. Pass `page.evaluate` code as a string when it uses `document` or `getComputedStyle`.

**PDFs.** Use `swift pdftext.swift file.pdf [from] [to]` (PDFKit `page(at:).string`). The script is not in the repo; recreate it (about 8 lines).

**Deploy.** Run `npx vercel deploy --prod --yes --project voyager-ventures`. Production can take 20–60 s to serve the new `index-*.js`; compare it with `dist/assets` before starting the live run.

**Live test.**
1. Build `tests/e2e/playwright.live.config.ts` with sed: set the base URL to `https://voyager-ventures.vercel.app` and delete the `webServer` block.
2. Run it in the background (about 10 minutes).
3. Delete the config, then run `git checkout -- screenshots`.

**Cautions while a suite runs.**
- **Do not edit any `*.spec.ts` while a suite is running, local or live.** Playwright loads spec files lazily, so an edited spec runs against the old site.
- **Do not run `npm run build` during a local suite**, because it replaces the `dist` that the suite is serving.

**Screenshots.**
- Full runs regenerate older screenshots. Run `git checkout -- screenshots/phase-0{1,2,3,4,5}` before committing.
- Phase-06 shots were regenerated with the new top bar and are committed.

**Top-bar width check.** Every chip or button added to the top bar can push Scale off-screen at 1440 px (tests 17 and 58 then fail). Measure the bar's rightmost element on each mode route (it must be ≤ 1440).

**Phone layout check.** Check at 390 × 844 with a scratch Playwright script: write a `.cjs` file in the scratchpad, run it with `NODE_PATH=$PWD/node_modules` against `vite preview --port 4174`.

**Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```

## Remaining Phase 7 gate (re-assess before starting)

**7.5 Gravitational waves.** GWOSC event parameters; check its terms and robots.txt first (in a separate command, before any fetch). GW150914 is already a compact-object record.

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. The ones most relevant now:

- **Dark matter:** Newtonian gravity throughout; no modified-gravity fit. Coma σ_los curves are model predictions without bundled data points; spherical, equilibrium, constant-β model; M/L_B recomputes to 361 vs printed ≈ 351. Bullet Cluster: Table 2 apertures only; main κ peak not drawn. BBN vs Planck 2018 is 3.3σ (Cooke et al.'s 2σ is against Planck 2015).
- **CMB:** diagonal errors only; T(z) measured to z = 2.69; TT only; Planck data CC BY-NC 3.0 IGO.
- **Distance ladder:** published relations applied to user inputs; SH0ES global fit not reproduced; CCHP 2025 erratum unread (IOPscience robots.txt).
- **Cosmology:** homogeneous FLRW, w = −1, massless radiation, 0.06 eV neutrino counted as matter.
- **Encyclopedia:** radiation only; the *About* section appears only in the Spectral atlas.
