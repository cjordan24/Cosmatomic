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

## 2026-11-26 — Phase 4, Gate 4.3 (crystal lattices and materials)
Adapter `materials.ts`: 10 transcribed crystal cells; JANAF Cp/S tables resolved through the JANAF element indexes; refractiveindex.info YAML (9); NIST fluid isobars (6); IACS and Malmberg–Maryott point standards. Engine `crystal.ts` (density, coordination, packing, d-spacings, absences, plane polygons) and `materials.ts` (dispersion formulas 1–5, interpolation, validity guards). `#/atomic/materials` view: instanced 3D supercells 1–4³, unit cell, nearest-neighbour bonds, (hkl) planes, Bragg table, property panel with unknowns, and the shared `LinePlot` (axis quantity and unit mandatory). Eleven new Source-index entries, with every DOI checked against Crossref.
Findings: COD robots.txt disallows all crawling and AMCSD now serves a bot wall, so both were respected and the cells hand-transcribed from NBS Circular 539. The scans had no `pdftoppm`, so their OCR text was read with a Swift/PDFKit script, and every value is cross-checked by recomputing the NBS X-ray density (all < 0.15 %). JANAF Ti/O₂Ti(cr) has two tables (rutile and anatase), now filtered by name. The (hkl) polygon missed plane-coincident corners at edge ends (failed test, fixed). Water n_D sources differ by 3×10⁻⁴, so the tolerance is documented rather than tightened. The coordination readout showed only d_min (now shows the range). Refractive-index conditions are stated per record.

## 2026-11-26 — Phase 4, Gate 4.4 (phase behaviour and intermolecular forces)
Adapter `phases.ts` (IAPWS coefficients, WebBook saturation tables and the CO₂ phase-change page, Rahman LJ parameters). `phase.ts`: boundaries, classification and coexistence states. `lj.ts`: periodic LJ MD with time-based stepping. `#/atomic/phases` has a clickable log-p diagram with a probe giving coexisting-phase densities, sound speeds and latent heat; `#/atomic/phases/lj` has a live 3D LJ fluid with g(r), the LJ potential and observables. Seven new Source-index entries (Crossref-verified).
Findings: (1) The IAPWS saturation release has no text layer, so pages were rendered with PDFKit and read from the image; the coefficients are confirmed by the 373.124 K boiling-point test and by agreement with IAPWS-95 to 0.05 %. (2) **Modelling bug caught by a test:** the water melting curve was treated as single-valued, and the ice Ih and ice III/V branches overlap in T. It is now multi-branch, and the pressure-melted liquid band is classified correctly. (3) The WebBook `SatT` query ignores its T range and samples linearly in pressure (a 74 K gap at low T, which made the probe's saturation pressure 0.24 % wrong); `SatP` gives uniform-T sampling. (4) The CO₂ critical row was dropped (undefined properties at the critical point) and the TRC triple-point regex missed collapsed table cells; both fixed. (5) A comment containing "U*/N" terminated a block comment. (6) The LJ control panel was nested inside the centre stage and overlapped the plots. (7) The boiling-point probe now reports coexistence rather than "liquid".

## 2026-11-26 — Phase 4, Gate 4.5 (shared wave physics engine and wave laboratory)
`src/core/physics/waves/{waves,media}.ts` (analytic models, packets and dispersion, Doppler, Courant-checked FD, media with sourced speeds). `#/spectral/lab` offers 9 demonstrations with URL-held configuration, slow-motion time scale, step and reset, 3D transverse/longitudinal rendering, snapshot and probe plots with axis quantities, 2D canvas interference and Doppler, and save to the notebook. The Experiment record is now a discriminated union with a legacy migration. SPECTRAL was added to the mode switch with an amber theme, and the Waves module to the engine registry.
Findings: (1) A constant for the molar mass of air needed a source. The 1976 Standard Atmosphere scan has no usable text, and the WebBook has no air fluid, so M is now *derived* from the NSSDC composition already in the app (28.966 g/mol). (2) The longitudinal view first rendered as a solid bar because the particles were too dense; it is now a 61 × 7 particle grid with compression colouring, and the camera distance is fixed. (3) The instantaneous two-source field hid the nodal lines, so a time-averaged intensity view was added.

## 2026-11-26 — Phase 4, Gate 4.6 (Spectral Mode: electromagnetic atlas)
First, a live re-check of Gate 4.5 against production: 42/42 passed. New `src/core/physics/em/em.ts`: photon relations, a vacuum plane wave with polarisation and CIE handedness, Poynting flux, and Planck/Wien/Stefan–Boltzmann derived from h, c and k. New dataset `spectral/em-bands.json` (adapter `em-bands.ts`), with band edges transcribed by hand from:
- ITU-R V.431-9 (official .docx text);
- the CIE S 017:2020 e-ILV terms;
- the ISO 21348 summary table (rendered with PDFKit and read as an image);
- Rogalski & Chrzanowski (2014) Table 1.

`#/spectral` is now the atlas, with four views: a log spectrum with one row per convention plus a visible-colour comparison (Illustrative), a 3D E/B/k plane wave, a blackbody view and NIST lines. `#/spectral/lab` keeps the Wave Lab. Also: Atlas/Wave lab chips; `wave:em-visible`, `wave:em-ultraviolet` and `context:sunlight` are now routable; the element spectrum links to the atlas; the Electromagnetic module is now `partial`; five new Source-index entries (DOIs and URLs checked); 26 new science tests (303 total) and e2e test 49 (43 total).

Findings:
1. iso.org serves a Cloudflare bot wall, so ISO 20473 could not be read. It is listed as *not available* rather than filled from secondary sources. The ISO 21348 values come from the summary table published by Space Environment Technologies. The live copy is behind a bot check, so the 2016 Internet Archive copy was used.
2. The Lyman-α example was first typed in as 121.567 nm. That is the measured fine-structure blend, not the model value. Derived examples are now computed at run time and stored as null.
3. **A test caught a clash between conventions:** the 511 keV annihilation photon (λ = Compton wavelength, 2.43 pm) is a "gamma ray" by origin, but it falls in ISO 21348's *hard X-ray* category, which is defined by wavelength alone. The UI now explains this instead of hiding it.
4. Two of my test expectations were wrong (50 Hz is ITU SLF, not ELF; 0.1 m is UHF); the data were right.
5. The CIE column of the lines table printed "visible", which is not a CIE band name. It now prints "—".
6. The 1000-unit-wide SVGs rendered with unreadable text and are now drawn at their real width.
7. The Hellwig 1970 hydrogen 21 cm paper and the Hölzer 1997 Cu Kα paper are paywalled, so those examples were dropped rather than quoted from memory.

## 2026-11-26 — Phase 4, Gate 4.7 (FIELDS foundation, cross-mode links, four-portal landing)
New `src/core/fields/fields.ts` with one `FieldLayer` interface and four layers (gravity potential, Coulomb point charges, plane-wave Eₓ, analytic heat diffusion from NIST fluid data). New Fields explorer at `#/spectral/fields` (frame selector, per-layer toggle in the URL, opacity, inputs, legends, probe readout, full metadata); the Cosmic sandbox potential map now uses the shared gravity layer and gained an opacity slider. The relationship registry gained element/spectrum, Sun/Planck-model, material/optical and material/acoustic entities and edges, rendered in both directions by `RelatedLinks` in the element view, Sun panel, material card, atlas (Lines, Blackbody, material readout; material selection now in the URL as `mat=`) and Wave lab. Landing page: SPECTRAL portal (live plane wave from `planeE`/`planeB`) and a greyed-out CELLULAR portal ("Coming soon", not a button or link), 2×2 on desktop and stacked on mobile. Two new Source-index entries (OpenStax University Physics 2; Carslaw & Jaeger 1959). New docs: FIELDS_ARCHITECTURE.md, SCIENTIFIC_RELATIONSHIPS.md, SPECTRAL_MODE_SPEC.md, BIOLOGIC_MODE_SPEC.md. 20 new science tests (323 total) and e2e tests 50–53 (47 total); Phase 1 screenshots 01 and 18 regenerated for the new landing page.

Findings:
1. The `log10-magnitude` display transform returned values below 0 for magnitudes smaller than both range ends (caught by a test); transforms now clamp to [0, 1].
2. A dipole test probe sat on the bisector where E_y = 0, giving 0/0; moved off-axis.
3. Optical relationship edges first cited the refractiveindex.info database rather than the primary dispersion paper; they now cite the paper with the record's DOI (tested).
4. Playwright will not click an `aria-disabled` element; the CELLULAR test uses a forced click to show that a real click does nothing.
5. The OUP page for Carslaw & Jaeger returned an empty 202 response; the edition and publisher were confirmed from the Open Library record instead.
6. Screenshot review: the atom cloud and plane wave sat behind their titles in the 2×2 layout (scenes shifted right), and the mobile subtitle wrapped into the atom cloud (hidden on narrow screens).

## 2026-11-26 — Phase 5, Gate 5.1 (nearby-star catalogue)
New adapter `nearby-stars.ts` with three datasets:
- the 10 pc sample (Reylé et al. 2021, 2023 update): 562 objects with per-value bibcodes;
- CNS5 within 20 pc: 2 986 objects with resulting G and G−RP;
- the Mamajek / Pecaut & Mamajek dwarf sequence.

New science module `star-systems/stars.ts`: parallax distance with 1σ interval, absolute magnitude, κμ/ϖ tangential velocity, ICRS→galactic Hipparcos matrix, spectral-type parser, class V calibration with refusals, and a 10 pc ↔ CNS5 cross-match.

New view `#/cosmic/stars`:
- a 3D map in parsecs with the Sun at the origin, galactic or ICRS frame (in the URL), rings, drop lines and labels;
- the CNS5 20 pc layer (in the URL);
- type filters and a system list by distance;
- an object panel showing every value with an ADS link to its original reference, derived quantities, the calibration labelled as a typical value, system members and planets.

Also: Cosmic chips (Solar system · Nearby stars · Sandbox); the "Stellar neighbourhood" scale level is now interactive; a Stellar physics module was added to the engine registry; six Source-index entries (Reylé 2021, Golovin 2023, Pecaut & Mamajek 2013, Gaia EDR3, Liu et al. 2011, VizieR), with DOIs checked on Crossref and affiliations read from the papers' first pages. 24 new science tests (347 total) and e2e test 54.

Findings:
1. CDS Strasbourg (VizieR, SIMBAD) was offline after a cybersecurity incident. Its notice lists official mirrors, and the Harvard CfA VizieR mirror serves the same catalogues. The SIMBAD mirror's robots.txt disallows automated access, so SIMBAD was not used.
2. The Gaia archive documentation returned only a placeholder page, so the galactic matrix comes from Liu et al. (2011), which quotes the Hipparcos matrix and the pole values.
3. The catalogue's object-type codes (*, LM, BD, WD, Planet) and its G_CODE convention were confirmed from the paper text (arXiv PDF read with PDFKit). Its authors state that estimated G values are not for scientific use, so they are shown as estimates only.
4. **A test caught a cross-match error:** CNS5 lists α Cen AB as one Hipparcos entry, and matching α Cen A to it would have given the star its pair's magnitude. Component matches to combined entries are now refused.
5. Two of my test expectations were wrong (Proxima M_G is 13.41, not 11.41; the Hipparcos matrix is orthonormal only to 1e-10). The data were right.
6. Screenshot review: the epoch printed as "2,000", the toolbar wrapped, labels crowded the centre, and systems were named after their first member (Proxima rather than α Cen). Now the epoch prints as J2000.0, frame names are shorter, fewer systems are labelled, and the list uses the brightest member and the system name.

## 2026-11-26 — Phase 5, Gate 5.2 (stellar classes and HR diagrams)
First, a live re-check of Gate 5.1 against production: 48/48 passed. New `hr.ts`: Stefan–Boltzmann radius lines, a luminosity scaling from measured absolute magnitude, HR and CMD points with refusals and flags, a Hipparcos-converted-G consistency check, and an MK class summary. New shared `ScatterPlot` (mandatory axis quantities and units, reversible and log axes, explicit ticks, click to select). New view `#/cosmic/stars/hr` with three tabs:
- an observed colour–magnitude diagram of 2 610 CNS5 stars to 20 pc;
- a luminosity–temperature diagram of 306 stars within 10 pc, with the IAU Sun;
- a spectral-class table.

Each tab links to the star map and back. The `G−V` column was added to the dwarf-sequence dataset. Source-index entry: OpenStax *Astronomy 2e* (authors and affiliations from openstax.org). 10 new science tests (357 total) and e2e test 55.

Findings:
1. **Data discrepancy found by a cross-check:** CNS5's Hipparcos-converted G for Sirius A (−1.06) is 0.39 mag fainter than its catalogue V plus the A1 V G−V colour predicts. The theoretical diagram therefore places stars too bright for Gaia with Johnson V. The CMD keeps the CNS5 value and shows a warning.
2. The bolometric zero point (IAU 2015 B2) is not needed: scaling from the calibration row cancels it, so no new constant was introduced.
3. Explanatory sentences about class criteria were checked against the textbook text before use. An unsourced remark about core hydrogen burning was removed.
4. Screenshot review: the log temperature axis showed only "1e4", so explicit ticks were added at 2 000–10 000 K.
