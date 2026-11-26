# Build log

## 2026-11-25/26 — Phase 1

**Environment.** Bare macOS (Intel) with no Node, Python or git (Xcode CLT absent). Installed official Node.js 24.22.3 LTS to `~/.local/node` (SHA-256 verified against nodejs.org SHASUMS256). Playwright Chromium installed. Blender 4.5.17 LTS (installed by the user mid-build) used headless for 3D assets. Ingestion written in TypeScript (no Python available).

**Data.** Probed and wrote adapters for PubChem (periodic table, PUG View, PUG REST), JPL SSD, JPL Horizons, JPL SBDB, NASA NSSDC. Bugs found and fixed during ingestion:
- `URL.pathname` percent-encoded the space in the project path → switched to `fileURLToPath`.
- `Infinity` serialises to `null` in JSON and `/stable/` matched "p-Unstable" → explicit `stable` flag.
- CIAAW interval abundances (e.g. Li `[0.019, 0.078]`) were parsed as their lower bound → stored as interval + midpoint.
- Nuclide label "235Um" parsed with symbol "Um" (greedy regex) → isomers lost, 123 duplicate ground states → match the known symbol; ingestion now fails on duplicates; regression test added.
- Horizons `format` must not be quoted; JPL Table-1 parser rewritten to pair rows explicitly; satellite table column offsets corrected.

**Validation-driven fixes.**
- Fixed TDB−UTC offset was wrong before 2017 → IERS leap-second table.
- IAU 2015 Mars pole requires periodic terms → IAU 2009 secular pole.
- Uranus obliquity off by 180°−2×97.8° → spin axis = sign(Ẇ)·IAU pole (retrograde rotators).
- Voyager flybys were misplaced by 10⁵–10⁶ km because planets come from Table-1 elements → ingested Horizons encounter ephemerides (planets + moons), blended in; Jupiter/Saturn flybys now within 1 % of NASA values.
- Horizons trajectory sections parsed automatically; UI labels patched-conic / tracking-fit / prediction segments; 1989-08-29 splice documented.
- Hermite sampling densified (5 min) around closest approaches after leave-one-out tests exposed 3 000 km errors at 4-hour spacing.

**UI.** drei `<Html>` threw `removeChild` on Canvas teardown → replaced by sprite labels and a projected DOM label layer. Landing canvases had zero size; toolbars overlapped panels; default camera looked at night sides → sunward default view. Wheel zoom (≈6 %/notch) too slow for 10 decades → zoomSpeed 3 plus `?dist=<km>` deep links; labels swallowed wheel events → forwarded. Global moon-distance exaggeration replaced by a per-system minimal expansion.

**3D assets.** `scripts/blender/build_voyager.py` builds a 2 281-face Voyager from published dimensions → `public/models/voyager.glb` + `assets/blender/voyager.blend` + Eevee preview render.

**Results.** `npm test`: 73/73 scientific tests pass. `npm run test:e2e`: 18/18 browser tests pass with zero page errors; 32 browser screenshots + 1 Blender render in `screenshots/phase-01/` (see INDEX.md). `npm run build`: type-check clean, build < 1 s. `npm run data:validate`: 11/11 datasets verified.

## 2026-11-26 — Deployment + Phase 2, Gate 2.1 (library, search, formats, comparison)

**Deployed Phase 1** to Vercel (team scope "Lodestar", project `voyager-ventures`): https://voyager-ventures.vercel.app — browser smoke test against the live URL passed (all routes render, lazy chunks load, no errors/4xx).

**Library:** curated list → 137 PubChem records (+ H₂, NO, C₆₀ = 140), all 20 amino acids, nucleobases, sugars, lipids, neurochemicals, vitamins, drugs, 30+ interstellar species (McGuire 2022 census). PubChem computed descriptors added. C₆₀ constructed exactly from gas-phase electron-diffraction bond lengths.
**Formats:** XYZ / MOL / SDF / PDB import + export; covalent-radius connectivity inference.
**Search:** in-browser PubChem client (CORS verified), rate-limited, throttling-aware, IndexedDB cache; user library persisted in IndexedDB.
**Comparison view:** side-by-side 3D + descriptors + bond statistics.
**Bugs caught by validation/screenshots:** Hill formula ignored net charge (acetylcholine⁺); MW tolerance must follow PubChem's reported precision; numeric formatter rounded PubChem CIDs (123591 → "123,600"); adapter cache key ignored the property list (stale responses without descriptors).
**RDKit-JS evaluation:** BSD-3, 7.4 MB WASM; provides sanitisation/SMILES/InChI/molblock but **no** 3D embedding or force fields → adopt (lazy) for validation in Gate 2.2; write own force field for Gate 2.3.

## 2026-11-26 — Phase 2, Gate 2.2 (laboratory builder + validation)
Builder (pure, unit-tested operations) with undo/redo, 9 tools, element palette, add-hydrogens, load-from-library, local persistence; strict mode vs experimental sandbox. In-house valence model + RDKit-JS (lazy, vendored at build time) as two independent validators; canonical SMILES/InChIKey; live PubChem identity by InChIKey; save to IndexedDB library; MOL/XYZ export.
Cross-validation: RDKit InChIKeys from our coordinates reproduce PubChem's connectivity layer for all 137 records; full-key mismatches (9) are all stereocentres PubChem leaves undefined — asserted explicitly.
Bug caught by the browser test: invisible bond hit-targets intercepted clicks meant for atoms behind them → only present for bond-level tools.

## 2026-11-26 — Phase 2, Gate 2.3 (geometry optimisation)
VGFF-1 force field + L-BFGS in a Web Worker with live progress and energy plot; optimised geometries labelled Simulated.
Validation-driven findings: (1) torsion gradient had the middle-atom terms of the opposite sign convention — caught by finite-difference test, fixed; (2) bond lengths ignored hybridisation and resonance (systematic −0.06…−0.08 Å vs MMFF for C–O/C–N next to sp² carbons) → Cordero hybrid carbon radii for heavy-atom single bonds + one resonance constant calibrated on two experimental molecules (documented as calibration, not validation); (3) hybrid radii must not apply to C–H. Result: 91 % of 133 organic molecules within 0.04 Å of MMFF; experimental small-molecule geometries reproduced.

## 2026-11-26 — Phase 2, Gate 2.4 (measured spectra + isotope comparison) — Phase 2 complete
NIST ASD adapter (33 spectra incl. D I and astrophysical ions); spectrum diagram with emission/absorption views, transition table, and model-vs-NIST residuals; spectroscopic ion stages selectable; nuclide half-life chart.
Findings: ASD rejects some column combinations ("Invalid Column Setting") and has no observed wavelengths for forbidden nebular lines (Ritz only) → request observed + Ritz and flag; ranking by intensity/A silently dropped the astrophysically key forbidden lines → always keep M1/E2 lines from low levels; race in the orbital-sample hook (stale worker results indexed against a new orbital list → "reading 'o'") fixed by keying results to their request.
Physics checks against measurement: Balmer lines ≤ 0.01 nm, He II 468.6 nm ≤ 0.02 nm, H–D isotope shift ≤ 0.002 nm.

## 2026-11-26 — Phase 3, Gate 3.1 (gravitational sandbox)
Explore / Experiment / Compare environments; Yoshida-4 and leapfrog integrators; real presets from the ephemeris; textbook presets; editing (mass, add/remove), collisions, Lagrange points, escape velocities, conservation diagnostics, ephemeris divergence.
Findings: Earth seeded without the Moon must be the Earth–Moon barycentre (0.008 au/yr error otherwise); L-points scale with the instantaneous distance (perihelion in January); the speed control assumed 60 fps (wrong under load) → wall-clock-accurate stepping with achieved-rate readout; trails sampled per frame drew polygons at high speed → sampled in simulated time; in-place mass edits gave the system net momentum → re-centre on the barycentre after edits.

## 2026-11-26 — Phase 3, Gate 3.2 (molecular dynamics foundations)
Velocity-Verlet MD on VGFF-1 with Maxwell–Boltzmann start, NVE/Berendsen, equipartition temperature; "Dynamics" mode in the molecule viewer (ref-driven animation, live T/E traces).
Finding: a fixed NVE energy threshold was the wrong test — symplectic integrators fluctuate ∝ dt² without drifting; the test now checks dt² scaling and absence of drift. The oscillator-period test independently validates the kcal/mol-Å-u-fs unit conversion.

## 2026-11-26 — Phase 3, Gates 3.3 + 3.4 (instruments, notebook) — Phase 3 complete
Orbital analyser (state → elements, round-trip tested), measurement tool, vector and potential-map overlays computed from the live state; IndexedDB notebook with save/list/restore/restart, JSON/CSV export, screenshots.
Finding: restarting from the preset's original state would silently drop mid-run edits → every edit now becomes the initial-conditions checkpoint (reproducibility test added).

## 2026-11-26 — Phase 4 (expanded scope), Gate 4.1 (reactions and conservation)
Scope reconciled with the expanded master directive (Phase 4 is now seven gates, and Phases 9–14 plus the Spectral, Biologic and FIELDS systems were added to DEVELOPMENT_ROADMAP.md). The repository matched HANDOFF_PHASE4.md: HEAD b3d8f5d, 125 science and 33 browser tests.
Built: curated reaction dataset (52, via `writeDataset`), a species/formula parser (groups, hydrates, charges, phases, photon/third body), an exact rational null-space balancer, and equation analysis with explicit states. Also the `#/atomic/reactions` view (equation, species cards linked to the 3D viewer, conservation table, balancer), a "Reactions" section in the molecule viewer, reactions in universal search, and the scientific-relationship registry (reaction → process/context edges; Biologic entities registered as *planned* with no route).
Findings: links to Spectral pages that don't exist yet were caught during screenshot review; they stay as plain text until Gate 4.6. A perl one-liner using `|` as the delimiter corrupted the TopBar type union and was fixed by hand.
User requirement added mid-gate: every item must cite accredited sources listed in an on-site index with links and author notes. Built the Source Index (`src/shared/sources/sources.ts`, `#/sources`, a 📚 button in the top bar, per-record links) covering all Phase 1–4 sources (31 entries). Verification found that two IAU resolution PDFs and a Wiley page had moved (now replaced), and that an Open Library id written from memory pointed to an unrelated book; Crossref confirmed the title, authors and year of all 19 DOIs. Integrity test added.

## 2026-11-26 — Phase 4, Gate 4.2 (thermochemistry)
Adapter `thermochemistry.ts`: 150 CODATA Key Values + 17 NIST WebBook species (fixed selection rule, per-value reference). Engine for ΔrH°/ΔrS°/ΔrG°(T)/K, shared energy/measurement interfaces with a conservation ledger, ThermoPanel (temperature slider, Derived-level energy diagram with an Illustrative path, per-species sourced table), and Source Index entries for CODATA, the WebBook, NIST-JANAF and Manion 2002 (DataCite and Crossref DOIs verified).
Findings: (1) CODATA writes charges sign-first ("+2"), and qualified states ("cr,graphite", "aq,undissoc.") were silently dropped, including C(graphite) and CO₂(aq). Both are now handled, and the qualifier is kept as the name. (2) WebBook values such as "-84." lost their uncertainty because the regex required a digit after the point. (3) NIST "AVG" rows give their basis in the comment column. (4) Glucose has only ΔcH°, so ΔfH° is derived (−1271.04 vs NIST −1271.1). (5) An adapter interface named `Record` shadowed TypeScript's `Record<>`. (6) The new Sources button made the top-bar chips wrap at 1440 px (fixed), and the diagram title overlapped the level labels (moved to a caption).
