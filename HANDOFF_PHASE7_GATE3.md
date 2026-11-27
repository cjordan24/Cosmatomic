# Handoff — Voyager Ventures, Phase 7 resumes at Gate 7.3 (CMB)

Written 2026-11-27, after Gate 7.2. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 7 and Encyclopedia tables), `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§22 is Gate 7.1, §23 is Gate 7.2), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` (sections Phase 7 and Encyclopedia), `SCIENTIFIC_RELATIONSHIPS.md`, and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7_GATE2.md` and the earlier handoffs hold the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State:**
- Phases 1–6 are complete.
- Phase 7 is approved by the user "as proposed" (gates 7.1–7.5). Gates 7.1 and 7.2 are done, plus the inserted mobile fix and encyclopedia Gate E.1.
- Everything is committed to `main`, pushed and deployed. See the end of `BUILD_LOG.md` for the last production run of the full browser suite.

**Next:** Gate 7.3 (CMB), unless the user asks for the next encyclopedia pass first. Stop for user review at the Phase 7 boundary, after Gate 7.5.

**Counts:** 488 science tests (Vitest), 62 browser tests (Playwright, 7 spec files), 30 dataset manifests, 108 Source-index entries.

## What Gate 7.2 added

| Item | What | Code / data |
|---|---|---|
| `#/cosmic/ladder?tab=overview\|parallax\|cepheids\|trgb\|sne\|h0&sel=&P=&oh=&m=&at=lmc\|n4258\|m101\|n0105&tip=&MB=&sn=&ref=` | Overview of the rungs on one log-distance axis; parallax precision of the 10 pc sample and the three anchors; Leavitt-law and TRGB calculators; the 42 SH0ES calibrator SNe Ia and H₀ from M⁰_B; H₀ forest plot (SH0ES 2022, CCHP 2021, CCHP 2025, Planck with and without BAO), derived Δ/σ and the teams’ statements quoted verbatim | `src/modes/cosmic/universe/LadderView.tsx`, `ladder.ts`, `src/core/physics/distanceLadder.ts` |
| Data | `distance-ladder` (manually transcribed): Riess et al. 2022 eq. 1, eq. 5, Table 5 row 1, Table 6; Freedman 2021 Table 3; Freedman et al. 2025 abstract (erratum ApJ 993, 252 **not read**, flagged); Pietrzyński et al. 2019; Reid et al. 2019. “±” stored as “1σ (implied)” | `datasets/astronomical/distance-ladder.json`, adapter `curated-distance-ladder.ts` |
| Navigation | *Universe ▾* now has *Expansion* and *Distance ladder*. The H₀ tab links to the Expansion view with H₀ = 73.04 | `src/ui/TopBar.tsx`, `src/App.tsx` |
| Registry | `context:distance-ladder` explains `context:cosmic-expansion` (riess-2022); `galaxy:milky-way` part-of the ladder | `registry.ts` |
| Sources | `riess-2022`, `freedman-2021`, `freedman-2025`, `pietrzynski-2019`, `reid-2019` | `sources.ts` |
| Tests | 17 science tests (`tests/science/ladder.test.ts`); e2e test 68 in `tests/e2e/phase7.spec.ts` | |

Not done in 7.2 (candidates): an encyclopedia “Distance ladder” entry (OpenStax *Astronomy 2e* ch. 19 is CC BY 4.0 and allowed by robots.txt, but would need a new category); the Pantheon+ Hubble-flow table (licence not checked).

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
     - COD, AMCSD, iso.org and the SIMBAD CfA mirror.
     - The NASA Exoplanet Archive: its robots.txt disallows Anthropic agents by name.
     - export.arxiv.org: its robots.txt disallows all agents.
     - Springer link.springer.com PDFs: JavaScript bot wall.
   - Fine:
     - arxiv.org `/abs` and `/pdf` (crawl-delay 15 s) and the Crossref API.
     - The VizieR CfA mirror, exoplanet.eu, OpenStax and SPARC.
     - esahubble.org, esawebb.org and eso.org/public.
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

**7.3 CMB.**
- The FIRAS blackbody: `fixsen-2009` is in the Source index, and the Spectral atlas has the 2.72548 K curve.
- T(z) = T₀(1+z), linked to Planck’s z∗ = 1089.80 (about 2970 K).
- A published power spectrum, only if its licence allows. The Planck Legacy Archive has not been checked.

**7.4 Dark-matter evidence explorer.** Rotation curves (6.4), lensing (6.3), cluster dynamics and the CMB (Ω_c h² is bundled), with models clearly separated from observations.

**7.5 Gravitational waves.** GWOSC event parameters; check its terms and robots.txt first. GW150914 is already a compact-object record.

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. The ones most relevant now:

- **Distance ladder:**
  - Published relations applied to user inputs; the SH0ES global fit and its covariances are not reproduced.
  - The 277 Hubble-flow SNe and the CCHP TRGB host distances are not bundled.
  - Δ/σ assumes independent Gaussian errors; each team’s statement is quoted beside it.
  - CCHP 2025 erratum unread (IOPscience robots.txt).
- **Cosmology:**
  - Homogeneous FLRW background only, with w = −1.
  - Radiation is massless at all z, and the 0.06 eV neutrino counts as matter.
  - Hogg eq. 19 is refused for closed models.
  - The distance modulus has no k-corrections.
- **Encyclopedia:** radiation only (NASA, 2010 text as published); the *About* section appears only in the Spectral atlas.
- **Earlier phases:** Schwarzschild-only relativity; point-lens lensing; NFW fit with fixed Υ; 4 of 21 white dwarfs within 10 pc have masses; Voyager 2 at Neptune about 15 % too far; VGFF-1 qualitative.
