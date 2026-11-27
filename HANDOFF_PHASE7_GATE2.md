# Handoff — Voyager Ventures, Phase 7 resumes at Gate 7.2 (distance ladder)

Written 2026-11-27, after Gate 7.1, the mobile panel fix and the encyclopedia Gate E.1. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 7 and Encyclopedia tables), `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md` (§22 is Gate 7.1), `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` (sections Phase 7 and Encyclopedia), `SCIENTIFIC_RELATIONSHIPS.md`, and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7.md` and the earlier handoffs hold the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State:**
- Phases 1–6 are complete.
- Phase 7 is approved by the user "as proposed" (gates 7.1–7.5). Gate 7.1 is done.
- Two items were inserted at the user's request: a mobile layout fix and Gate E.1 (encyclopedia, radiation). Both are done.
- Everything is committed to `main`, pushed and deployed. The last production run of the full browser suite passed 61/61.

**Next:** Gate 7.2 (distance ladder), unless the user asks for the next encyclopedia pass first. Stop for user review at the Phase 7 boundary, after Gate 7.5.

**Counts:** 471 science tests (Vitest), 61 browser tests (Playwright, 7 spec files), 29 dataset manifests, 103 Source-index entries.

**Last commits:** `28d9174` (build log, E.1 live), `8ba5bb7` (Gate E.1 plus the phone top bar), `b9b3ce9` (mobile panels), `3b9af7f` (Gate 7.1).

## What was added since HANDOFF_PHASE7.md

| Item | What | Code / data |
|---|---|---|
| Gate 7.1 `#/cosmic/universe?tab=distances\|history\|lensing&m=planck18\|eds\|open\|custom&H0=&om=&ol=&z=&M=&zl=&zs=` | ΛCDM distances: D_C, D_L, D_A, light-travel distance, μ and kpc/″. Also lookback time, age t(z), H(z), Ω_i(z), q(z), the onset of acceleration (z = 0.642) and the comoving horizon (14.16 Gpc). The *Cosmological lensing* tab shows D_d, D_s and D_ds from Hogg eq. 19, against the naive D_s − D_d | `src/core/physics/cosmology.ts` (rewritten), `src/modes/cosmic/universe/`, `datasets/astronomical/planck-2018-params.json`, adapter `curated-planck-2018.ts` |
| Planck 2018 | Table 2, column TT,TE,EE+lowE+lensing+BAO, 68 %, 22 values. Ω_r = Ω_m/(1+z_eq); Ω_Λ = 1 − Ω_m − Ω_r | Checked against Planck: model age 13.786 Gyr vs 13.787 ± 0.020 Gyr; D_M(z∗) agrees with r∗/θ∗ to 0.04 % |
| Lensing link | Lensing preset `cosmo`: 10¹¹ M☉ at z = 0.5, source at z = 2, θ_E = 0.63″ | `einsteinRadiusD` in `src/core/physics/lensing.ts` |
| Navigation | New *Universe ▾* menu (*Expansion*). Menu chips no longer append the active section to their label (it moves to a tooltip). In Cosmic and Atomic, the top-bar buttons are icon-only below 1500 px | `src/ui/TopBar.tsx` (`many-chips`), `src/ui/theme.css` |
| Scale ladder | The *Observable universe* level is interactive and opens `#/cosmic/universe?tab=history` | `src/core/scale/scale.ts` |
| Mobile panels | A collapsed panel shrinks to its header; on phones it stays docked at the bottom. On phones, every right panel opens from a floating button labelled with the panel title. A view with its own toggle passes `mobileToggle={false}`; only ElementView does so today | `Panel` in `src/ui/components.tsx`, CSS `.panel-mobile-toggle` |
| Phone top bar | At ≤ 900 px, search becomes an icon that expands on tap. Encyclopedia, Sources, Notebook, Scale and Settings fold into the ☰ menu (`aria-label="More"`). The search glyph has `pointer-events: none` | `src/ui/TopBar.tsx`, `src/ui/theme.css` |
| Gate E.1 encyclopedia | 8 entries quoted verbatim from NASA's *Tour of the Electromagnetic Spectrum* (2010). The 📖 corner drawer is lazy-loaded and can be opened on any route with `?enc=index` or `?enc=<id>`. Each entry starts with a source line under its heading and ends with the full credit and licence. The Spectral atlas readout opens with a collapsible *About this radiation* section | `src/shared/encyclopedia/encyclopedia.ts`, `src/ui/Encyclopedia.tsx`, `datasets/encyclopedia/em-radiation.json`, adapter `encyclopedia-nasa-ems.ts` |

**Registry additions:**
- Entities: `context:cosmic-expansion`, plus `wave:em-spectrum`, `wave:em-radio`, `wave:em-microwave`, `wave:em-infrared`, `wave:em-xray` and `wave:em-gamma`.
- Edge: `context:cosmic-expansion` explains `context:gravitational-lensing` (source `hogg-1999`).

**Source-index additions:** `planck-2018-vi`, `hogg-1999` and `nasa-tour-ems`. `carroll-1997` now also cites chapter 8.

**Browser tests:**

| Test | Covers |
|---|---|
| 64 | Expansion page |
| 65 | Mobile panels |
| 66 | Encyclopedia |
| 67 | Phone top bar |

All are in `tests/e2e/phase7.spec.ts`; tests 65 and 67 are in its `mobile` describe block at 390 × 844.

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

**7.2 Distance ladder.**
- Steps: parallax (linked to the 10 pc sample), Cepheid period–luminosity, TRGB and SNe Ia, all from cited tables. SPARC's distance methods already name these.
- Show local H₀ against Planck. Planck's H₀ = 67.66 ± 0.42 is bundled, and its paper reports the SH0ES values (e.g. 73.52 ± 1.62). Quote the H₀ tension from primary papers, with interval types.
- Candidate sources: the Riess et al. SH0ES papers and Freedman et al. (CCHP TRGB) on arXiv. Check access first.
- Add a menu item under *Universe ▾*.
- Consider an encyclopedia "Distance ladder" entry, but only if a citable explanatory source is found.

**7.3 CMB.**
- The FIRAS blackbody: `fixsen-2009` is in the Source index, and the Spectral atlas has the 2.72548 K curve.
- T(z) = T₀(1+z), linked to Planck's z∗ = 1089.80 (about 2970 K).
- A published power spectrum, only if its licence allows. The Planck Legacy Archive has not been checked.

**7.4 Dark-matter evidence explorer.** Rotation curves (6.4), lensing (6.3), cluster dynamics and the CMB (Ω_c h² is bundled), with models clearly separated from observations.

**7.5 Gravitational waves.** GWOSC event parameters; check its terms and robots.txt first. GW150914 is already a compact-object record.

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. The ones most relevant now:

- **Cosmology:**
  - Homogeneous FLRW background only, with w = −1.
  - Radiation is massless at all z, and the 0.06 eV neutrino counts as matter.
  - Hogg eq. 19 is refused for closed models.
  - The distance modulus has no k-corrections.
- **Encyclopedia:**
  - The text is quoted as NASA published it in 2010, including the rounded 380–700 nm visible range and the 5,500 °C solar surface.
  - NASA's 12 cm oven example counts as radio under ISO 21348, so the atlas shows a *See also: Microwaves* link there.
  - The *About* section appears only in the Spectral atlas so far.
- **Earlier phases:**
  - Relativity is Schwarzschild only.
  - Lensing is point-lens only, with Euclidean distances inside the Galaxy.
  - The NFW fit holds Υ fixed.
  - Only 4 of the 21 white dwarfs within 10 pc have masses.
  - Voyager 2 at Neptune is about 15 % too far.
  - VGFF-1 is qualitative.
