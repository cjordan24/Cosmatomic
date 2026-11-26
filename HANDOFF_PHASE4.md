# Handoff — Voyager Ventures, start of Phase 4 (Chemical & Material Science)

Written 2026-11-26 at the end of Phase 3. Read this first, then `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md`, `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` and the tail of `BUILD_LOG.md`.

> **Phase 4 is complete** (Gate 4.7 = commit 54ddae8, deployed, 47/47 browser tests passed live). **Read HANDOFF_PHASE5.md instead.** Everything below is history.

## ▶ RESUME HERE (after Gate 4.6) — superseded

**State:** Gates 4.1–4.6 are done, committed, pushed and deployed. Gate 4.5's live re-run passed 42/42 at the start of this session. Gate 4.6 is commit `b88c85a`, deployed and verified live (43/43). The next step is **Gate 4.7**.

**Counts:** 303 science tests (Vitest), 43 browser tests (Playwright), 18 dataset manifests, 65 Source-index entries (the earlier "63" was a miscount; it was 60 before Gate 4.6).

**Gate 4.6 notes for 4.7:**
- `src/core/physics/em/em.ts` already has `planeE`/`planeB` (the analytic plane wave for the FIELDS layer), `planckLambda`/`planckNu`, `peakWavelength` and `MU0`.
- The atlas lives at `src/modes/spectral/atlas/` (`bands.ts`, `SpectralAtlas.tsx`). Its URL state is `lambda` (vacuum m), `tab` (wave | blackbody | lines), `pol`, `T` and `spec`.
- Already linked: Element → spectrum → atlas (`#/spectral?tab=lines&spec=H%20I`); Sun 5772 K blackbody (`context:sunlight` → `#/spectral?tab=blackbody&T=5772`); Material n(λ) in the atlas right panel. For 4.7, formalise these as registry relationships and add the reverse links.
- ISO 20473 is deliberately *not available* (iso.org bot wall). Don't fill it from secondary sources.

**What is left in Phase 4:**
1. ~~**Gate 4.6, Spectral Mode and the EM atlas.**~~ Done (spec kept below for reference). `#/spectral` currently renders the Wave Lab, so make it the atlas and keep `#/spectral/lab`. Contents:
   - log navigation by frequency, wavelength and energy;
   - an EM band dataset with *named conventions*: ITU-R V.431 radio bands ELF…THF; ISO 20473 and CIE IR-A/B/C for infrared, plus an industry NIR/SWIR/MWIR/LWIR scheme; ISO 21348 for UV, X-ray and gamma. Verify each value from the source document, the way the IAPWS pages were read;
   - photon energy E = hf = hc/λ from CODATA;
   - a 3D vacuum plane wave with E ⊥ B ⊥ k, B₀ = E₀/c, and linear, circular and elliptical polarisation;
   - visible-colour comparison (label the colours Illustrative; perceived colour ≠ one wavelength);
   - representative radio, IR and UV examples;
   - NIST lines from `datasets/atomic/spectra-nist.json` on the spectrum, linked from ElementView.
   
   Required tests: vacuum wavelength, photon energy, E/B relation, band mapping per convention, and frequency-dependent material data (refractiveindex records). Also enable the registry entities `wave:em-visible`, `wave:em-ultraviolet` and `context:sunlight`, which currently have `route: null` in `src/shared/scientific-relationships/registry.ts`, and add a Spectral chip "Atlas" in `TopBar.tsx`.
2. **Gate 4.7, FIELDS foundation and cross-mode links.** A minimal field-layer interface (quantity, units, frame, resolution, source, transform, fidelity, validity, provenance) covering:
   - the existing sandbox gravity potential (`cosmic/sandbox/instruments.tsx`);
   - a point-charge Coulomb field using CODATA ε₀;
   - the analytic plane wave;
   - a derived temperature field (e.g. analytic heat diffusion using JANAF/fluid data);
   - a layer toggle and opacity UI.

   Three relationships to build: Element → atomic spectrum → Spectral; Sun (IAU 2015 nominal T_eff = 5772 K, already a source entry) → Planck spectrum → Spectral; Material → optical/acoustic properties → Spectral (the Wave Lab media and refractive index). Also: new docs `SPECTRAL_MODE_SPEC.md`, `FIELDS_ARCHITECTURE.md`, `BIOLOGIC_MODE_SPEC.md`, `SCIENTIFIC_RELATIONSHIPS.md`; and the spec-required mobile-layout screenshot.

   **Landing page: four portals (user request, 2026-11-26).** The intro page (`src/modes/landing/Landing.tsx`, route `#/`) has two live portals, ATOMIC and COSMIC. Add **SPECTRAL** as a third live portal and **CELLULAR** as a fourth, **greyed-out** portal.
   - **SPECTRAL portal → `#/spectral` (the atlas). It works exactly like ATOMIC and COSMIC:**
     - a `<button className="portal spectral …">` with its own live `<Viewport>` scene, the title, a tagline, "ENTER →", and the same zoom/fade transition through `enter(m)` with the reduced-motion shortcut;
     - scene: a small animated E/B plane wave reusing `planeE`/`planeB` from `src/core/physics/em/em.ts`, optionally over a thin log-spectrum band strip. No new physics or values;
     - tagline "waves, frequencies, radiation and energy" (matches README), in the amber theme of the SPECTRAL mode switch and `.mode-spectral`.
   - **CELLULAR portal: greyed out, not clickable (user decision, 2026-11-26).** Biologic Mode is Phase 11.
     - Same card size and position style as the others, but visibly disabled: desaturated/greyed, reduced opacity, no hover lift, `cursor: default`.
     - Title "CELLULAR", with the text **"Coming soon"** directly beneath the title.
     - Not a link: render it as a non-interactive element (e.g. `<div className="portal cellular disabled" aria-disabled="true">`), not a button. No route, no `ENTER →`, no transition, and no `#/cellular` page or TopBar mode yet.
     - Scene: either static, or the glucose molecule (`pubchem-5793`, real coordinates from `molecules.json`) shown greyed out. Don't invent biology; any caption text needs a Source-index entry, so a plain "Coming soon" is preferred.
     - Screen readers: give it an accessible name such as "Cellular mode, coming soon".
   - **Layout:**
     - Desktop: a 2×2 grid (ATOMIC · COSMIC / SPECTRAL · CELLULAR) or four columns. All four must fit at 1440×900 without scrolling.
     - Mobile (390×844): stacked, with CELLULAR last. Update `.landing`/`.portal` CSS in `src/ui/theme.css`.
     - The footer line (`landing-foot`) must describe the three live scenes and their data provenance.
     - Pause portal scenes that are off-screen if performance suffers on SwiftShader.
   - **Tests:**
     - Update `tests/e2e/phase1.spec.ts` tests `01` (landing + zoom into Atomic) and `18` (mobile landing) for the new layout.
     - Add a Phase 4 test that enters SPECTRAL from the landing page (URL `#/spectral`). It must also check that CELLULAR shows "Coming soon", is not a button/link, and leaves the URL unchanged when clicked.
     - Regenerate `01-landing.png` and `18-mobile-landing.png`. This is the one case where Phase 1 screenshots *should* change; commit them, and update their description strings.
   - **Docs:** README mode table (add SPECTRAL to the landing description; CELLULAR listed as "coming soon"), BUILD_LOG, and `BIOLOGIC_MODE_SPEC.md` (state that the landing portal exists, greyed out, until Phase 11).
   - **Carry forward:** `HANDOFF_PHASE5.md` must repeat this: *the landing page has four portals; CELLULAR stays greyed out with "Coming soon" under its title until Biologic Mode is built (Phase 11). At that point it becomes a live portal like the others (live scene, tagline, ENTER, transition, route, e2e test, screenshot). Every future environment must also get a matching intro portal.*
3. **Phase 4 close-out.** Write `HANDOFF_PHASE5.md`; update the roadmap, README and memory; give the user a plain-language report (summary, gate checklist, screenshots in `screenshots/phase-04/INDEX.md`, validation results, new sources, test counts, limitations, deployment status, revised roadmap). Then **stop for review** before Phase 5.

**Hard-won conventions from this session:**
- **Source Index (user rule):** every new value needs an entry in `src/shared/sources/sources.ts`, with a `datasets: [...]` link for each manifest and `sources: [ids]` on records. Check each DOI with `curl https://api.crossref.org/works/<doi>` (title, authors, year) and fetch each URL. A bio states only verified affiliations, otherwise `authorBio: null`. `tests/science/sources.test.ts` enforces coverage.
- Don't scrape sites whose robots.txt or bot walls forbid it: COD (robots disallow) and AMCSD (bot wall) are off-limits. The NIST WebBook (crawl-delay 5), CODATA (3), JANAF, IAPWS and refractiveindex.info (GitHub raw, CC0) are fine.
- **Reading scanned PDFs without poppler:** the Swift PDFKit scripts in the session scratchpad are gone, so recreate them. Text extraction is `PDFDocument(url:).page(at:).string`; page rendering is `page.draw(with:.mediaBox,to:)` into an NSImage, saved as PNG, then read with the Read tool.
- WebBook fluid tool: `Type=SatP` gives saturation rows evenly spaced in T; `SatT` ignores the T range. `Action=Data&Wide=on` returns TSV.
- Full e2e runs regenerate Phase 1–3 screenshots: run `git checkout -- screenshots/phase-01 screenshots/phase-02 screenshots/phase-03` before committing. Only `screenshots/phase-04/` changes.
- Avoid perl substitutions with `|` as the delimiter on code that contains `|` (they corrupted TopBar once). Never write `*/` inside a block comment (`U*/N` broke a build).
- New views use the `center-stage` area between `left-panel` and `right-panel`, and must not nest a `right-panel` inside `center-stage`. Plots use `src/ui/LinePlot` (`xLabel` and `yLabel` must name the quantity and unit).
- Simulations step in simulated time with a carried remainder (`advance`/`advanceFD`), and each has a chunking-independence test.

## 0. Expanded Phase 4 (added 2026-11-26)
The user replaced the 4-gate plan with an expanded directive: Phase 4 is now **Gates 4.1–4.7** (reactions, thermochemistry, crystals and materials, phases, wave engine, Spectral Mode, FIELDS plus cross-mode links), and Phases 9–14 were added. See DEVELOPMENT_ROADMAP.md for the gate table and live status. The standing authorisation and conventions below still apply. Stop at the Phase 4 boundary and write HANDOFF_PHASE5.md.

**Progress:** Gates 4.1–4.5 done. **New standing user rule:** every item must cite accredited sources registered in the Source Index (`src/shared/sources/sources.ts`, `#/sources`) with a link and a verified author note; never guess a biography.

## 1. Current state

- Phases 1–3 complete. Last commit `7afd436` ("Phase 3 Gates 3.3-3.4 … Phase 3 complete"), working tree clean, pushed to `origin main` (https://github.com/cjordan24/Cosmatomic).
- Production: https://voyager-ventures.vercel.app. Deployed from that commit; the full browser suite (33 tests) passed against production.
- Local: 125 scientific tests (Vitest) and 33 browser tests (Playwright) pass.
- `src/modes/atomic/reactions/` exists as an **empty placeholder** for Phase 4. Empty placeholders are also reserved under `src/modes/cosmic/` (star-systems, galaxies, nebulae, black-holes, universe) for Phases 5–7.

## 2. Standing authorisation from the user (keep honouring it)

> "continue through the next gates for this program and continue to update in github, pushing to vercel after each major gate or gates are finished"

So after each gate: commit to `main`, push, run `vercel deploy --prod`, then run the browser suite against production. Report to the user at each **phase** boundary (the last session stopped after Phase 3 so the user could review).

Non-negotiable constraints from the master spec:
- **Never invent scientific values.** Unknown means "unknown" in the UI. Every value cites its source.
- Every displayed quantity carries a provenance class: Observed / Derived / Simulated / Illustrative / Hypothetical (`src/core/provenance`).
- Model outputs state their validity limits (registry in `src/core/physics/modules.ts`).
- No proprietary code or assets; respect robots.txt, rate limits and attribution; don't mirror archives (cache only what's used, with a manifest + sha256).
- No API keys in client code. No paid infrastructure or new external resources without explicit approval. Vercel Hobby and GitHub are already approved.
- Never fabricate screenshots: they must come from Playwright runs of the real app.
- No dependency on "Lodestar Digital Studio".

## 3. Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24 lives here; `node` is NOT on the default PATH
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev                 # vite (predev copies RDKit into public/vendor, gitignored)
npm run typecheck
npm test                    # vitest: tests/science/*.test.ts
npm run build               # tsc -b && vite build (prebuild copies vendor)
npm run test:e2e            # playwright, starts `vite preview` on :4173 (build first!)
npm run data:validate       # validates datasets/ against their manifests
```

- There is no Python. Write ingestion scripts in TypeScript and run them with `node --experimental-strip-types` (see `scripts/ingestion/lib/ingest.ts`: `fetchText` handles rate limiting, retries and the cache in `datasets/.cache`; `writeDataset` writes the dataset and its manifest + sha256).
- Blender 4.5: `/Applications/Blender.app/Contents/MacOS/Blender` (headless build script: `scripts/blender/build_voyager.py`).
- Git identity (local config): cjordan24 / cjordan24@users.noreply.github.com. Push with `GIT_TERMINAL_PROMPT=0 git push origin main` (the keychain token works).
- Commit trailer (required):
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
  ```
- Deploy: `npx vercel deploy --prod --yes --project voyager-ventures` (logged in as lodestar404, team scope "Lodestar").
- Test the live site after deploying:
  ```bash
  sed -e "s#http://localhost:4173#https://voyager-ventures.vercel.app#" -e '/webServer:/,/^  },/d' \
      tests/e2e/playwright.config.ts > tests/e2e/playwright.live.config.ts
  npx playwright test --config tests/e2e/playwright.live.config.ts
  rm tests/e2e/playwright.live.config.ts && git checkout -- screenshots   # live run overwrites screenshots
  ```
  Check the sed output before running. The config's `webServer` block must be removed in full.

## 4. Stack and hard-won gotchas

- React 19, TS 5.9, Vite 8 (rolldown), three 0.187, @react-three/fiber 9, drei 10, Zustand 5, Vitest 5, Playwright 1.65 (Chromium + SwiftShader args), @rdkit/rdkit (WASM, ~7 MB, lazy-loaded in the Lab).
- **Do not use drei `<Html>`.** It caused `removeChild` crashes. Use `src/rendering/labels.tsx` (TextSprite / LabelLayer / Projector / Anchor / Overlay, which already forward wheel events).
- Routing is hash-based (`src/shared/router.ts`). Views are lazy-loaded in `src/App.tsx`. The current routes are:
  - `#/atomic`
  - `#/atomic/element/:Z`
  - `#/atomic/molecules/:id`
  - `#/atomic/lab`
  - `#/cosmic/:focus`
  - `#/cosmic/sandbox`
  - `#/notebook`

  Add Phase 4 routes there, e.g. `#/atomic/reactions`, `#/atomic/materials`. The TopBar chips are in `src/ui/TopBar.tsx`.
- UI primitives: `Panel`, `KV` (value, unit, sig figs; prints "unknown" for null), `ProvenanceBadge` in `src/ui/components`. Styles: `src/ui/theme.css`.
- Persistence: `src/shared/idb.ts` and `notebook.ts`. The Experiment record has `mode: 'gravitational-sandbox'`; widen that union if reactions or MD runs become saveable.
- Simulation state that changes every frame lives in refs and is pushed to three.js in `useFrame`. React re-renders only on a throttled tick (pattern: `MoleculeDynamics.tsx`, `SandboxView.tsx`). Step simulations by wall-clock time, never per frame. A per-frame bug already happened once.
- Throttle heavy canvas work (pattern: `PotentialMap` in `instruments.tsx`, redraws at most every 400 ms).
- Molecular units: Å, fs, u, kcal/mol (`ACC = 4.184e-4`, `KB = 0.0019872043` in `laboratory/md.ts`). The VGFF-1 force field (`laboratory/forcefield.ts`) is **geometry-only and qualitative**. Never present its energies as thermochemistry.
- Molecule records (`datasets/molecular/molecules.json`, 137 from PubChem plus curated ones such as C₆₀) have CID, InChIKey, SMILES and 3D coordinates. Reactions should reference molecules by these ids/InChIKeys so they can open in the existing viewer.
- Tests with live PubChem are in `phase2.spec.ts` (retries: 2). Keep new e2e tests **offline/deterministic**.
- Screenshots: `screenshots/phase-0N/` with `INDEX.md` + `captures.json`, written by that phase's spec file. Copy the pattern from `tests/e2e/phase3.spec.ts`.

## 5. Phase 4 plan (proposed gates; not yet started)

Scope from the roadmap: curated reactions (unsupported → explicit state), thermodynamics, lattices, phases. Do one gate per commit and deploy, in the same order as Phases 2–3.

### Gate 4.1: Curated reaction library + conservation engine
- `datasets/chemistry/reactions.json` (new): about 30–60 curated, balanced reactions: combustion (CH₄, H₂, C₂H₅OH), acid–base, precipitation, synthesis (Haber, contact process), photosynthesis/respiration (net), and atmospheric/ISM chemistry (O₃ formation, H₂ on grains, as net reactions). Each has a citation.
- Engine in `src/modes/atomic/reactions/`:
  - atom balance and charge balance checks (reuse the Hill-formula parser in `molecules.ts`);
  - a stoichiometry solver for user-entered equations (integer null-space).
  - Any reaction that is not in the curated set and can't be verified returns an explicit **`unsupported`** state. It must never invent a product. (The spec requires this.)
- UI at `#/atomic/reactions`: reactant/product cards linked to the molecule viewer; balance status; a provenance badge.
- Tests: every curated reaction conserves atoms and charge; the solver balances known equations; unknown inputs give `unsupported`.

### Gate 4.2: Thermochemistry
- Ingest standard-state data: ΔfH°, S°, Cp° (and ΔfG° where available) at 298.15 K from **NIST Chemistry WebBook** and/or **NIST-JANAF**, cited per species, with uncertainties where given. Check terms of use and rate limits first. If scraping is inappropriate, hand-curate a small table with exact citations instead (the `curated-reference.json` pattern).
- Derived quantities: ΔrH°, ΔrS°, ΔrG°(T) ≈ ΔH − TΔS (state that Cp is assumed constant, or use Shomate coefficients if ingested), K = exp(−ΔG/RT), and an energy-level diagram. The reaction-coordinate shape is **Illustrative** unless measured activation energies with citations exist.
- Tests: Hess's law cycles close; known values (e.g. CH₄ combustion ΔrH° ≈ −890.6 kJ/mol to products H₂O(l)) are reproduced within the stated uncertainty. Use CODATA R from `src/core/constants`.

### Gate 4.3: Crystal lattices & materials
- Unit cells built from cited lattice parameters (CODATA, ICSD-free sources, CRC-style literature values with citations, or Materials Project/COD **only if their licences allow it**: check first, since COD is CC0 and Materials Project is CC-BY):
  - NaCl, CsCl, diamond, graphite, Si, Fe (bcc), Cu (fcc), Mg (hcp), ice Ih, quartz, rutile, perovskite.
- 3D view with an n×n×n supercell, unit-cell edges, coordination polyhedra, (hkl) planes, packing fraction and density computed from the cell and atomic weights. Compare the computed density with the measured density (both shown).
- Materials cards: band gap, bulk modulus, melting point, hardness. Only cited values; otherwise "unknown".
- Tests: computed densities within ~1% of literature; packing fractions are exact (fcc 0.7405, bcc 0.6802, sc 0.5236); Bragg d-spacings.

### Gate 4.4: Phase behaviour & intermolecular interactions
- Phase diagrams for H₂O and CO₂ (and optionally N₂): triple point and critical point from NIST/IAPWS. The coexistence curves use a cited formula (IAPWS-95 saturation equations for water; Clausius–Clapeyron or Antoine with cited coefficients, valid range shown).
- Intermolecular panel: Lennard-Jones / dipole / H-bond. A small LJ fluid MD reusing `md.ts` patterns (argon with cited ε/σ, NVT) shows solid, liquid and gas qualitatively. Label it Simulated + qualitative.
- Tests: the curves pass through the triple and critical points; the Antoine/IAPWS values match tabulated vapour pressures within the stated tolerance.

### Every gate is done when
1. Dataset + manifest are written and pass `npm run data:validate`; `DATA_SOURCES.md` lists the source, licence and access date.
2. Science tests are added and the whole suite is green; typecheck and build are clean.
3. `tests/e2e/phase4.spec.ts` is extended; screenshots go to `screenshots/phase-04/` (INDEX.md + captures.json); the whole e2e suite is green.
4. Docs are updated: `BUILD_LOG.md` (what was done, bugs found and fixed), `SCIENTIFIC_MODELS.md` (equations, validity, fidelity), `KNOWN_LIMITATIONS.md`, `DEVELOPMENT_ROADMAP.md` status table, `README.md` feature list, and `ARCHITECTURE.md` if structure changed.
5. Commit, push, deploy, live e2e run, then restore screenshots (§3).
6. At the end of Phase 4: a plain-language report to the user (what's new, accuracy checks, problems found and fixed, caveats), then stop for review before Phase 5.

## 6. Open caveats carried forward (already in KNOWN_LIMITATIONS.md)
- Voyager 2 at Neptune: closest approach is about 15% too far out (33,700 vs 29,240 km). This comes from JPL's coarse mission-design trajectory for that period.
- VGFF-1 is weak for H₂, O₂, peroxides, P/S oxo-acids and fused rings. One parameter was tuned on two molecules (documented).
- RDKit is about 7 MB, loaded the first time the Lab opens.

## 7. Suggested kickoff prompt for the next session
> Read HANDOFF_PHASE4.md in the project root and continue with Phase 4, Gate 4.1, following its conventions. Commit, push and deploy after each gate, and report to me when Phase 4 is complete.
