# Handoff — Voyager Ventures, Phase 7 resumes at Gate 7.4 (dark-matter evidence)

Written 2026-11-27, after Gate 7.3. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 7 and Encyclopedia tables), `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§22 is Gate 7.1, §23 is Gate 7.2, §24 is Gate 7.3), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` (sections Phase 7 and Encyclopedia), `SCIENTIFIC_RELATIONSHIPS.md`, and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7_GATE3.md`, `HANDOFF_PHASE7_GATE2.md` and the earlier handoffs hold the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State:**
- Phases 1–6 are complete.
- Phase 7 is approved by the user "as proposed" (gates 7.1–7.5). Gates 7.1, 7.2 and 7.3 are done, plus the inserted mobile fix and encyclopedia Gate E.1.
- Everything is committed to `main`, pushed and deployed. See the end of `BUILD_LOG.md` for the last production run of the full browser suite.

**Next:** Gate 7.4 (dark-matter evidence explorer), unless the user asks for the next encyclopedia pass first. Stop for user review at the Phase 7 boundary, after Gate 7.5.

**Counts:** 506 science tests (Vitest), 63 browser tests (Playwright, 7 spec files), 31 dataset manifests, 114 Source-index entries.

## What Gate 7.3 added

| Item | What | Code / data |
|---|---|---|
| `#/cosmic/cmb?tab=spectrum\|history\|power&T=&err=1&gal=1&z=&m=&l=&axis=lin` | Spectrum: 43 FIRAS points on Planck’s law, T slider and presets, residuals, χ², best-fit T, Wien peaks, μ/y limits, temperature-scale note. Temperature: CO and PKS 1830−211 measurements against T₀(1+z) with the β band, full history with Planck epochs, T/peaks/age at any z. Power spectrum: Planck TT band powers on the best fit with residuals, band at any ℓ, C_ℓ, peaks, θ∗ against r∗/D_M(z∗) | `src/modes/cosmic/universe/CmbView.tsx`, `cmb.ts`, `src/core/physics/cmb.ts` |
| Data | `cmb`: LAMBDA FIRAS file (= Fixsen et al. 1996 Table 4, 43/43 rows checked); Planck Legacy Archive R3.01 TT low-ℓ, binned and best-fit theory (IRSA mirror; **CC BY-NC 3.0 IGO**, credit “ESA, Planck Collaboration”); Noterdaeme et al. 2011 Table 1 and Muller et al. 2013 transcribed; T₀ from Fixsen 2009. The adapter checks the Planck binning against the theory spectrum | `datasets/astronomical/cmb.json`, adapter `scripts/ingestion/cmb.ts` (cache `datasets/.cache/cmb/`) |
| Navigation | *Universe ▾* now has *Expansion*, *Distance ladder* and *Cosmic microwave background*. Links to the Spectral atlas blackbody and the Expansion view | `src/ui/TopBar.tsx`, `src/App.tsx` |
| Registry | `context:cmb`; expansion ↔ CMB (explains, both ways: noterdaeme-2011, planck-2018-vi); CMB emits `wave:em-microwave` (fixsen-1996) | `registry.ts` |
| Sources | `fixsen-1996`, `lambda-firas`, `planck-2018-v`, `planck-pla`, `noterdaeme-2011`, `muller-2013` | `sources.ts` |
| Tests | 18 science tests (`tests/science/cmb.test.ts`); e2e test 69 in `tests/e2e/phase7.spec.ts` | |

Not done in 7.3 (candidates): TE/EE spectra and the CMB lensing spectrum (same archive and licence); a CMB sky-map image (ESA image licence not checked); atomic-carbon and S-Z T(z) points; an encyclopedia entry for the CMB.

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

## Remaining Phase 7 gates (re-assess before starting)

**7.4 Dark-matter evidence explorer.** Rotation curves (6.4), lensing (6.3), cluster dynamics and the CMB (Ω_c h² is bundled; the Planck TT spectrum and best fit are now bundled in `cmb`), with models clearly separated from observations.

**7.5 Gravitational waves.** GWOSC event parameters; check its terms and robots.txt first. GW150914 is already a compact-object record.

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. The ones most relevant now:

- **Distance ladder:**
  - Published relations applied to user inputs; the SH0ES global fit and its covariances are not reproduced.
  - The 277 Hubble-flow SNe and the CCHP TRGB host distances are not bundled.
  - Δ/σ assumes independent Gaussian errors; each team’s statement is quoted beside it.
  - CCHP 2025 erratum unread (IOPscience robots.txt).
- **CMB:**
  - Diagonal errors only (FIRAS and Planck covariances not bundled); χ² at T₀ = 2.72548 K is ≈ 4000 because FIRAS errors exclude the absolute scale (explained in the view).
  - T(z) measured only to z = 2.69 in the bundle; beyond that it is an extrapolation.
  - TT only; the best fit is Planck’s (no BAO), not computed here.
  - Planck data are non-commercial (CC BY-NC 3.0 IGO).
- **Cosmology:**
  - Homogeneous FLRW background only, with w = −1.
  - Radiation is massless at all z, and the 0.06 eV neutrino counts as matter.
  - Hogg eq. 19 is refused for closed models.
  - The distance modulus has no k-corrections.
- **Encyclopedia:** radiation only (NASA, 2010 text as published); the *About* section appears only in the Spectral atlas.
- **Earlier phases:** Schwarzschild-only relativity; point-lens lensing; NFW fit with fixed Υ; 4 of 21 white dwarfs within 10 pc have masses; Voyager 2 at Neptune about 15 % too far; VGFF-1 qualitative.
