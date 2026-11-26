# Handoff — Voyager Ventures, start of Phase 4 (Chemical & Material Science)

Written 2026-11-26 at the end of Phase 3. Read this first, then `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md`, `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md` and the tail of `BUILD_LOG.md`.

## 0. Expanded Phase 4 (added 2026-11-26)
The user replaced the 4-gate plan with an expanded directive: Phase 4 is now **Gates 4.1–4.7** (reactions, thermochemistry, crystals and materials, phases, wave engine, Spectral Mode, FIELDS plus cross-mode links), and Phases 9–14 were added. See DEVELOPMENT_ROADMAP.md for the gate table and live status. The standing authorisation and conventions below still apply. Stop at the Phase 4 boundary and write HANDOFF_PHASE5.md.

**Progress:** Gates 4.1–4.4 done. **New standing user rule:** every item must cite accredited sources registered in the Source Index (`src/shared/sources/sources.ts`, `#/sources`) with a link and a verified author note; never guess a biography.

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
