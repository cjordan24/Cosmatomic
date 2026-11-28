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

## 2026-11-26 — Phase 5, Gate 5.3 (exoplanets)
First, a live re-check of Gate 5.2 against production: 49/49 passed. New adapter `exoplanets.ts`: the 85 planets of the 10 pc census matched to the exoplanet.eu catalogue (82 matched). New `exoplanets.ts` science module:
- IAU-nominal unit conversions and best-available mass, with the minimum-mass flag;
- a Kepler third-law check, a periastron-JD plausibility check and e/i range checks;
- face-on orbit geometry.

New view `#/cosmic/stars/planets`:
- 48 planetary systems by distance;
- an orbit diagram with ±1σ bands on a and an optional Mercury–Jupiter overlay (JPL elements);
- a mass–period diagram of all planets against the Solar System (NASA fact sheet);
- an element table with uncertainties, checks and links to exoplanet.eu and the ADS system reference.

Also: the star map links to the planets view; IAU 2015 B3 nominal GM_J, R_eJ and R_eE added to the constants (read from Prša et al. 2016, Table 1); Source-index entry for exoplanet.eu (Schneider et al. 2011, Crossref-verified, affiliations from arXiv:1106.0586). 8 new science tests (365 total) and e2e test 56.

Findings:
1. **Access decision:** the NASA Exoplanet Archive's robots.txt disallows Anthropic agents (ClaudeBot, anthropic-ai, Claude-Web) by name. It was not queried. exoplanet.eu has no robots restrictions and its content is CC BY 4.0.
2. **Data errors caught by a test:** four periastron times in the compilation are not valid Julian dates (Proxima b 245813.5, Teegarden's Star c, HD 20794 b, GJ 849 b). They are shown as unknown, with a warning.
3. Name matching needed host-plus-letter fallbacks (Lalande 21185 b is HD 95735 b; GJ 393 b is BD+01 2447 b) and apostrophe handling ("Teegarden's b"). Three planets stay unmatched rather than being guessed (one letter differs and one is disputed).
4. Screenshot review: the Solar System overlay forced a 1.7 au view that shrank close-in systems, and Earth's orbit was missing (JPL lists the Earth–Moon barycentre). The view now always includes Mercury but no more, and Earth is drawn.

## 2026-11-26 — Phase 5, Gate 5.4 (stellar spectra and thermal radiation)
The registry gained `star` and `stellar-class` entity kinds. Class O–K → NIST line spectra edges follow OpenStax §17.3, and the Sun's class is checked against the same text ("the spectral class assigned to the Sun is G2"). New `starRegistry.ts` registers about 470 stars on catalogue load (star → class, star → Planck model). Star panel: a thermal-radiation section with a normalised Planck plot (380/750 nm marked), λ_max and σT⁴, an atlas button and the class's typical lines. Spectral atlas: the blackbody tab shows reverse links for any registered temperature (6 shown, originating star first) and loads the catalogue when opened with `star=`. The class table has a line column and highlighting from `cls=`. RelatedLinks gained `limit`/`first` and the verbs *absorbs* and *member of*. 4 new science tests (369 total) and e2e test 57.

Findings:
1. A 2930 K star peaks at 989 nm, in the near infrared. The panel marks the visible range so this is visible at a glance; it is not stated as a "colour".
2. Screenshot review: the atlas listed every star sharing a temperature (30 or more for common M subtypes), so the list is now capped with "… and N more". The Planck plot's peak label was clipped (y range raised). Empty-string labels on reference lines gave duplicate React keys (now labelled 380/750).

## 2026-11-26 — Phase 5, Gate 5.5 (cross-links and portal check)
First, a live re-check of Gate 5.4 against production: 51/51 passed. Changes:
- Registry: body:sun → stellar-class:G (OpenStax: "the spectral class assigned to the Sun is G2") and body:sun → element:Z for the 28 transcribed Asplund et al. (2009) photospheric abundances.
- Sun panel: related links without the composition edges, a composition strip (each element links to its atomic view, log ε shown) and buttons to the HR diagram and the star map. Element views filter the duplicate composition edge and keep their existing Sun line.
- Universal search: nearby stars and exoplanets, with the catalogue loaded lazily on the first query of two or more characters.

Landing page checked: unchanged, with four portals (stars live inside COSMIC, as planned). The scale ladder's *Stellar neighbourhood* level routes to the star map. 2 new science tests (371 total) and e2e test 58.

Findings:
1. The element view already had a hand-wired "present in the solar photosphere" line. The new edge would have duplicated it in RelatedLinks, so it is filtered there.
2. The search index was static. Making it depend on a lazily loaded catalogue keeps the 330 kB star chunk out of every other page.

Gate 5.5 verified against production: 52/52 passed. Phase 5 complete.

## 2026-11-26 — Phase 6, Gate 6.1 (relativity foundations)
New relativistic physics module `src/core/physics/relativity.ts` (status *partial*, v1.0.0, with validity limits in the module registry) and the view `#/cosmic/relativity` (chip *Relativity*), with four tabs:
- **Radii & clocks:** static and orbiting clock rates, exact and weak-field redshift, and horizon, photon sphere and ISCO drawn to scale, plus a probe radius.
- **Orbits:** massive and photon effective potentials, GR against Newtonian, with circular orbits that merge at the ISCO.
- **Light paths:** numerically integrated null geodesics, with capture below 3√3 GM/c².
- **Weak-field tests:** Mercury 42.98″ per century, solar-limb deflection 1.751″, solar and terrestrial redshift, and a Lorentz-factor calculator.

Masses: Sun and Earth (IAU nominal), a hypothetical 10 M☉ hole and any user mass. Values inside a body's surface or the horizon are refused. New Source-index entries: Carroll (1997) lecture notes (arXiv:gr-qc/9712019; formulas checked in the PDF text, ch. 7), Narayan & Bartelmann (1996) (arXiv:astro-ph/9606001, eq. 7 and the 1.″7 example), OpenStax University Physics 3 §5.3. The plot component gained legend placement. A new source test checks every `SourceLinks` id in the code. 22 new science tests (393 total) and e2e test 59.

Findings:
1. The first deflection test failed by 11 %: the exit-point interpolation had the wrong sign. After the fix the ODE was still 0.74 % above 2r_s/b at b = 200 r_s. That is the real second-order term (≈ 15π/16 · m/b), not an error, so the test now uses an independent quadrature of the orbit equation (agreement 0.2 %) and bounds the excess.
2. Carroll's "R☉ = 10⁶ GM☉" (7.31) is an order of magnitude only (exact ratio 4.71 × 10⁵); the test checks the exact ratio.
3. Access decision: Ashby (2003) on GPS relativity is hosted by Springer, which served a JavaScript bot challenge, so it was not used and the GPS check was dropped.

## 2026-11-26 — Phase 6, Gate 6.2 (compact objects and black holes)
First, a live re-check of Gate 6.1 against production: 53/53 passed.

New view `#/cosmic/compact` (chip *Black holes*) and the curated dataset `compact-objects.json` (11 objects). The view has:
- a mass–radius diagram against the horizon and photon-sphere lines, with the Sun for scale;
- a table and per-object panel with the published values, their interval types and sources;
- quantities derived with the Gate 6.1 module;
- two checks against independent measurements: Sirius B's predicted 80.0 km/s redshift against the measured 80.65 ± 0.77 km/s, and the Sgr A* and M87* shadows against the EHT rings.

Integration:
- The star panel shows the measured masses of white dwarfs, or "unknown".
- Sirius B links to the H I spectrum.
- Neutron stars and black holes are registry entities.
- Measured objects are presets in the Relativity view.

There are 12 new Source-index entries, with every DOI checked on Crossref and every arXiv abstract fetched. New: a stacked key–value layout. 12 new science tests (405 total) and e2e test 60.

Findings:
1. **Interval types differ.** GW150914 quotes 90 % credible intervals, the NICER papers 68 % (16–84 % quantiles) and the timing and astrometric papers 1σ. The dataset stores the interval type per value, and the UI labels it.
2. **The M87* mass is circular for a shadow test.** The EHT's 6.5 × 10⁹ M☉ is derived from the ring itself, so the shadow check uses the stellar-dynamics mass (6.2 × 10⁹ → 37.8 µas; EHT quotes 37.6). The gas-dynamics mass gives 21.3 µas, as the paper states.
3. **Wrong paper caught.** The arXiv number first used for "Riley 2021" (2105.06979) is actually Miller et al. 2021, a different analysis of the same J0740 data. The dataset cites Miller et al. explicitly and notes that the two analyses disagree.
4. **Access:** four searches were sent to export.arxiv.org before its robots.txt was checked; it disallows all agents. It was not used again. Papers were then fetched only from arxiv.org/pdf and /abs, which robots.txt allows, at its 15 s crawl-delay, and searched through Crossref.
5. **White dwarfs are not duplicated.** They are the same objects as the `star:<seq>` entities, so they get no separate `compact-object` entity (rule 3 of SCIENTIFIC_RELATIONSHIPS).

## 2026-11-26 — Phase 6, Gate 6.3 (gravitational lensing)
First, a live re-check of Gate 6.2 against production: 52/52 for Phases 1–5, then 2/2 for tests 59–60. Tests 59–60 first failed because `phase6.spec.ts` was edited (new Gravity menu) while the live run was in progress, and Playwright loaded the edited spec against the old site. They passed when re-run against production with the spec as committed for 6.2.

New module `src/core/physics/lensing.ts` (part of the relativistic module) and the view `#/cosmic/lensing`, with three tabs:
- **Lens plane:** inverse ray shooting of a draggable circular source, with the Einstein ring and the point-source images, magnifications, image separation and centroid shift.
- **Microlensing light curves:** after Narayan & Bartelmann's Fig. 9, with the Einstein time for each lens.
- **Stein 2051 B deflection:** the HST astrometric-microlensing measurement of Sahu et al. (2017). Its θ_E = 31.53 mas and relative parallax reproduce the published 0.675 M☉.

Stein 2051 B (GJ 169.1 B in the 10 pc sample) now links to the lensing view through the registry, and its compact-object record cites Sahu et al. directly. New Source-index entry: Sahu et al. 2017 (Science; Crossref-verified; affiliations from the arXiv PDF). The Cosmic chips were grouped into two menus, because eight chips overflowed the top bar at 1440 px. 13 new science tests (418 total) and e2e test 61.

Findings:
1. **Top-bar overflow.** With Relativity, Black holes and Lensing added, the Search and Sources buttons overlapped (screenshot 61a, first run). The new `ChipMenu` groups related sections and shows the active one in its label.
2. **Test unit slip.** A first test computed π_rel in µas instead of mas; the code was right. The distance form and the parallax form of θ_E now agree to 10⁻⁶.
3. **VGFF timeout.** The VGFF-1 conformer test now has an explicit 30 s timeout. The new CPU-heavy Phase 6 tests (photon-path integrations) run in parallel workers and pushed this compute-bound test past Vitest’s 5 s default in every full run (it passes alone).

## 2026-11-26 — Phase 6, Gate 6.4 (galaxies and rotation curves)
First, a live re-check of Gate 6.3 against production: 55/55 passed.

New view `#/cosmic/galaxies` (chip *Galaxies*) with two tabs:
- **SPARC rotation curves:** all 175 galaxies, filterable by quality. Each shows the observed curve with errors, the gas, disc and bulge contributions, and the Newtonian baryon sum with adjustable Υ. A least-squares NFW halo is fitted (labelled as a model fit), and its χ² is compared with baryons alone.
- **Milky Way:** the Eilers et al. rotation curve, Θ₀ at the Sun, a stars-only Keplerian lower bound and the adopted Galactic parameters.

New datasets: `sparc-galaxies` (adapter) and `milky-way` (transcribed). Registry: galaxy:milky-way, with the Sun and Sgr A* located in it. The scale ladder's *Galaxies* level is now interactive. LinePlot gained error bars. New Source-index entries, all Crossref-verified with affiliations from the arXiv PDFs: SPARC (Lelli et al. 2016), NFW 1996 and 1997, Bland-Hawthorn & Gerhard 2016, Eilers et al. 2019. 15 new science tests (433 total) and e2e test 62.

Findings:
1. **SPARC rows are not aligned to the byte ranges in their own headers.** The first parse put NGC 3198's distance in the wrong column. The adapter now splits on whitespace (names and reference lists contain no spaces) and throws on any row with the wrong number of fields.
2. **A G unit slip was caught.** kpc had been written in metres instead of km, which would have made G 1000× too small. A test now pins G = 4.301 × 10⁻⁶ kpc (km/s)²/M☉.
3. **The build failed while the unit tests passed.** `npm run build` also typechecks the ingestion scripts, and a spread in the SPARC adapter lost its record type. The first e2e attempt therefore ran against the previous build.
4. **NGC 3198** (the classic case) with Υ_disk = 0.5: χ²/N = 759 for baryons alone and 1.39 with an NFW halo (c ≈ 9.4, V₂₀₀ ≈ 112 km/s, M₂₀₀ ≈ 4.5 × 10¹¹ M☉). This illustrates the missing-mass problem; it is not a measurement of dark matter.

## 2026-11-26 — Phase 6, Gate 6.5 (nebulae and image gallery)
First, a live re-check of Gate 6.4 against production: 56/56 passed.

New view `#/cosmic/nebulae` (chip *Nebulae*):
- a gallery of seven CC BY 4.0 images (ESA/Hubble ×4, ESA/Webb ×1, ESO/EHT ×2), each with its verbatim credit line, licence and publisher link;
- five nebula records with type, distance (approximate values marked) and emission-line links into the Spectral atlas;
- the EHT images of M87* and Sgr A*, which also appear in the Black holes panel.

New datasets: `gallery-images` (images stored under `public/images/gallery`, SHA-256 recorded) and `nebulae` (transcribed). Registry: `nebula:*` entities that emit H I / N II / O III and lie in the Milky Way. New Source-index entries: Menten et al. 2007, ESA/Hubble, ESA/Webb and ESO/EHT image archives. The OpenStax entry now also cites §20.2 and §22.4. 6 new science tests (439 total) and e2e test 63.

Findings:
1. **Licences checked at the source.** ESA/Hubble's and ESA/Webb's copyright pages state CC BY 4.0 with clear and visible credit. ESO's states CC BY 4.0 for images and captions. esahubble.org and esawebb.org have no robots.txt.
2. **Conflicting distances on one page.** The ESA/Hubble Orion page says "1,500 light-years" in its text and "1400 light years" in its metadata. The record uses the peer-reviewed VLBA parallax (414 ± 7 pc, Menten et al. 2007) instead. The Ring Nebula's 2000 ly (OpenStax) and 2500 ly (ESA) are both stated.
3. **An unverified claim removed before commit.** A draft author note called ESO "one of the EHT partners"; this was not checked, so it was removed.
4. **Typecheck of tests.** Science tests are typechecked without Node types, so the image-integrity test reads the files through Vite's `?inline` import and hashes them with Web Crypto.

Gate 6.5 verified against production: 57/57 passed. Phase 6 complete.

## 2026-11-26 — Phase 7, Gate 7.1 (expansion and distances)
The user approved Phase 7 as proposed (gates 7.1–7.5).

The cosmology module was rebuilt on the FLRW foundation. It adds radiation (a⁻⁴, Carroll ch. 8), integration in ln(1+z) (Simpson's rule), age t(z), H(z), Ω_i(z), q(z), the acceleration onset, the comoving particle horizon, the distance modulus, kpc per arcsec, and the lens–source angular-diameter distance (Hogg eq. 19).

New view `#/cosmic/universe` (menu *Universe ▾ → Expansion*) with three tabs:
- **Distances:** D_C, D_L, D_A and light-travel distance to z = 1100, with values at any z.
- **Expansion history:** a(t), Ω_m, Ω_r and Ω_Λ against 1 + z with the Planck epochs, ȧ(z) showing the acceleration onset, an epoch table and the full Planck parameter table.
- **Cosmological lensing:** D_d, D_s and D_ds against the incorrect D_s − D_d, and the point-mass θ_E.

Presets: Planck 2018 (Derived), and Einstein–de Sitter, open and custom models (Hypothetical).

Other changes:
- **Dataset:** `planck-2018-params` (22 values, manually transcribed from Table 2 of arXiv:1807.06209v4).
- **Lensing view:** a new z_l = 0.5, z_s = 2 preset that uses cosmological distances.
- **Registry:** `context:cosmic-expansion` explains `context:gravitational-lensing`.
- **Scale ladder:** the *Observable universe* level is interactive.
- **Source index:** new entries Planck 2018 VI (DOI checked on Crossref; corresponding authors and affiliations from the PDF) and Hogg 1999 (affiliation from the PDF). The Carroll entry now also cites chapter 8.

21 new science tests (460 total) and e2e test 64.

Findings:
1. **Radiation matters at high z only, and its value checks out.** Planck does not tabulate Ω_r, so it is taken from z_eq: Ω_r = Ω_m/(1+z_eq) = 9.18 × 10⁻⁵. Photons alone from T₀ = 2.7255 K (CODATA σ) times 1 + 0.2271 N_eff give the same value to within 1 %. With Ω_r, the model reproduces Planck's age (13.786 against 13.787 ± 0.020 Gyr) and D_M(z∗) = r∗/θ∗ to 0.04 %. Without it the D_M match worsens to 0.5 %.
2. **The old integrator was inaccurate at high z.** Simpson's rule on a linear z grid (n = 2000) had steps of Δz ≈ 0.5 out to z = 1090. Integrating in ln(1+z) keeps the EdS analytic error below 10⁻⁷ up to z = 1000.
3. **Three of my own expected values were wrong; the code was right.** The acceleration onset is z = 0.642, not ≈ 0.63. The 10¹¹ M☉ ring is 0.63″, not ≈ 0.8″. Dropping radiation shifts D_M(z∗) by 0.5 %, not 1.6 %. The tests now pin computed values with independent cross-checks: the closed form (2Ω_Λ/Ω_m)^⅓ − 1, the ratio √(D_ds/(D_s − D_d)), and the Planck mismatch.
4. **Top-bar overflow again.** The fifth Cosmic group pushed Scale and Settings off-screen at 1440 px. Menu chips no longer append the active section to their label; it moves to a tooltip. In Cosmic below 1500 px the Sources, Notebook and Scale buttons show icons only, with aria-labels so their accessible names do not change.
5. **Access:** arxiv.org /pdf was used for Planck 2018 VI, Hogg 1999 and Carroll 1997, one request at a time, at least 15 s apart. Crossref was used for the DOI. export.arxiv.org was not used.

## 2026-11-26 — Mobile panel fix (between Gates 7.1 and 7.2)
First, a live re-check of Gate 7.1 against production: 58/58 passed.

The user reported from a phone that collapsing a panel left a blank box. Cause: on screens ≤ 900 px the bottom panels have a fixed height (40 % or 46 %). Collapsing hid only the panel body, so the empty frame stayed. Desktop left panels, pinned top and bottom, had the same problem.

Changes:
- **Collapsed panels shrink to their header.** On phones they stay docked at the bottom; on desktop they stay at the top.
- **Right panels can be opened on phones.** Right panels are hidden on phones, and only the element view (Diagrams) and the solar system (Objects) had a button to open them. 19 views had no way to show their right panel on a phone.
  - `Panel` now renders a floating button for every right panel on phones, labelled with the panel title.
  - Views with their own toggle opt out with `mobileToggle={false}`.
  - The button never appears on desktop.

New e2e test 65 checks, at 390 × 844, that the Expansion results panel opens and closes, that the collapsed control panel is under 60 px high and still at the bottom, and that the element view has no second toggle.

## 2026-11-26 — Gate E.1 (encyclopedia: radiation)
First, a live re-check of the mobile panel fix against production: 59/59 passed.

The user asked for an encyclopedia, because the app's goal is learning and a wavelength without an explanation teaches little. The user's decisions:
- entries are cited excerpts, never text written by Claude;
- open sources plus short attributed quotations from copyrighted sources are allowed;
- it is built as its own gate before 7.2, with radiation first.

What was built:
- **Data:** `encyclopedia-em-radiation`, 8 entries quoted verbatim from NASA's *Tour of the Electromagnetic Spectrum* (Science Mission Directorate, 2010).
  - robots.txt allows all agents. The NASA Media Usage Guidelines say NASA content is generally not subject to U.S. copyright and that NASA must be acknowledged.
  - The adapter takes the article body mechanically, keeps NASA's own citation line (with the retrieval date filled in), and checks that every kept passage occurs verbatim in the page.
- **Matching:** entries are matched to a wavelength only through bands already bundled (ISO 21348 top-level categories; ITU-R V.431 up to EHF for long radio waves).
- **UI:**
  - 📖 Encyclopedia in the top bar opens a corner drawer, lazy-loaded at 52 kB (`?enc=index` or `?enc=<id>`). It has search, categories (Elements, Molecules and Celestial objects marked *coming soon*), See also links and a jump to a typical wavelength.
  - The Spectral atlas readout starts with a collapsible *About this radiation* section showing the first section of each matching entry, with *Read more*.
- **Registry:** 6 new `wave:*` entities.
- **Source index:** `nasa-tour-ems`.

11 new science tests (471 total) and e2e tests 66–67.

Findings:
1. **Picture references.** The NASA pages often say "the image below". A blanket "below/above" rule also removed real content ("positioned above Earth's atmosphere"). The final rule drops only sentences that name a picture together with a position word, "this image", false-colour descriptions or caption questions. A reviewed per-page list catches the rest, including sentences left dangling once a picture sentence is removed. Each gap is marked […] and counted.
2. **Conventions disagree on microwaves.** NASA's 12 cm oven example is "radio" in ISO 21348, whose microwave category is 1–15 mm. The atlas follows the bundled conventions and offers *See also: Microwaves*. Likewise 1 pm is ISO's gamma/X-ray edge and counts as X-ray, so the gamma example is 0.1 pm.
3. **Bundle size.** Importing the registry and band data into the top bar added 138 kB to the main chunk. The drawer is now lazy-loaded, and the main chunk is back to 1403 kB.
4. **The phone top bar overflowed.** It needed 617 px in a 390 px screen; the user's screenshots showed cut-off icons. On phones, search becomes an icon that expands when tapped, and the five action buttons fold into a ☰ menu. The search glyph had been swallowing taps on the narrow input, so it now ignores pointer events.
5. **The citation goes next to the bio (user request).** Every entry, in the About section and in the drawer, now opens with a source line directly under its heading: the page title linked to NASA, the series, the publisher and year, and the Source-index entry. The full credit and licence remain at the end. Test 66 checks that the source line sits above the first quotation.
6. **The desktop top bar overflowed in Atomic.** The new Encyclopedia button pushed it to 1593 px at 1440, and two earlier tests (17 and 58) could no longer reach the Scale button. Atomic now uses the same icon-only buttons below 1500 px as Cosmic. Every route measured ≤ 1431 px.


Gate E.1 verified against production: 61/61 passed.

## 2026-11-27 — Gate 7.2 (distance ladder)
New view `#/cosmic/ladder` (*Universe ▾ → Distance ladder*) with six tabs: Overview, Parallax, Cepheids, TRGB, Supernovae and H₀.

What was built:
- **Data:** `distance-ladder`, manually transcribed from five papers (arXiv PDFs, ≥ 15 s apart; DOIs checked on Crossref; affiliations from each first page):
  - SH0ES 2022 (Riess et al., ApJL 934, L7): eq. 1, eq. 5, Table 5 row 1, and Table 6 (42 calibrator SNe Ia in 37 hosts), copied from the PDF text and checked row by row (m − μ = M to 0.002 mag);
  - Freedman 2021 (ApJ 919, 16): TRGB zero-point Table 3 and H₀;
  - Freedman et al. 2025 (ApJ 985, 203): H₀ from HST + JWST;
  - Pietrzyński et al. 2019 (Nature 567, 200): LMC distance;
  - Reid, Pesce & Riess 2019 (ApJL 886, L27): NGC 4258 distance.
- **Physics:** `src/core/physics/distanceLadder.ts` (distance modulus, parallax, Leavitt law, TRGB, H₀ from M⁰_B and a_B, quadrature, tension). The Cosmological module is now v1.1.0.
- **View:**
  - Overview: one clickable rung per method on a shared log-distance axis, from the 10 pc sample to the Hubble flow, with the CMB shown as a separate route.
  - Parallax: σϖ/ϖ against distance for the 10 pc sample, the anchors table with derived μ.
  - Cepheids and TRGB: calculators that turn an apparent magnitude into μ and a distance, with "place it at" presets (LMC, NGC 4258, M101, NGC 105).
  - Supernovae: the 42 calibrators against m = μ + M⁰_B, an M⁰_B slider that recomputes H₀, and Hubble-flow predictions.
  - H₀: a forest plot of SH0ES, CCHP and Planck; a derived Δ/σ table; each team's own statement quoted verbatim; a link to the Expansion view with H₀ = 73.04.
- **Registry:** `context:distance-ladder` explains `context:cosmic-expansion`; `galaxy:milky-way` is part of the ladder.
- **Source index:** `riess-2022`, `freedman-2021`, `freedman-2025`, `pietrzynski-2019`, `reid-2019`.

17 new science tests (488 total) and e2e test 68.

Findings:
1. **The published numbers reproduce.** Eq. 5 with Table 5's baseline M⁰_B and a_B gives 73.04 and 5 log H₀ = 9.318, as printed in §5. The LMC distance gives μ = 18.477, the value SH0ES adopt. CCHP's adopted TRGB zero point equals the inverse-variance mean of its four geometric calibrations to 0.002 mag.
2. **One of my own expected values had the wrong sign.** I expected Planck's lower H₀ to need a fainter supernova. It needs a brighter one: M⁰_B 0.166 mag more negative, since intrinsically brighter supernovae at the same apparent magnitude are farther away. The code was right; the test and the view text were corrected.
3. **The tension depends on how it is computed.** With independent Gaussian errors, SH0ES against Planck 67.4 ± 0.5 is 4.9σ; SH0ES quote 5.0σ from the difference in 5 log H₀. The view shows the simple Δ/σ as derived and quotes each team's statement: SH0ES report a 5σ difference, CCHP find no statistically significant one.
4. **Access:** IOPscience hosts the CCHP 2025 erratum (ApJ 993, 252). Its robots.txt disallows all automated agents and names Anthropic's, so the erratum was not read and the value carries a visible flag. One landing-page request was made before the robots.txt check; its content was discarded. Added to the off-limits list.
5. **Overview layout.** The first version drew captions inside one SVG; they were clipped at the right edge and unreadable on phones. Each rung is now an HTML button with a wrapping caption above its bar.


Gate 7.2 verified against production: 62/62 passed.

## 2026-11-27 — Gate 7.3 (cosmic microwave background)
New view `#/cosmic/cmb` (*Universe ▾ → Cosmic microwave background*) with three tabs: Spectrum, Temperature and Power spectrum.

What was built:
- **Data:** `cmb` (adapter `scripts/ingestion/cmb.ts`):
  - the FIRAS monopole spectrum from NASA LAMBDA, which is Table 4 of Fixsen et al. (1996). All 43 rows match the arXiv PDF text;
  - the Planck 2018 TT power spectrum from the Planck Legacy Archive (IRSA mirror): ℓ = 2–29 unbinned, 83 bins at ℓ ≥ 30, and the best-fit base-ΛCDM theory spectrum;
  - T(z) measurements transcribed from Noterdaeme et al. (2011) Table 1 (five CO absorbers, z = 1.73–2.69) and Muller et al. (2013) (5.08 ± 0.10 K at z = 0.89).
- **Physics:** `src/core/physics/cmb.ts`:
  - B_ν per wavenumber in MJy/sr, and residuals and χ² of FIRAS about any T, with the χ²-minimising T;
  - T(z) = T₀(1+z)^(1−β);
  - C_ℓ ↔ D_ℓ and the peaks of the best fit.
  - The Cosmological module is now v1.2.0.
- **View:**
  - Spectrum: the FIRAS points (errors × 400 or × 1) on Planck’s law with a T slider and presets (2.72548, 2.725, 2.728 K, best fit), residuals, χ², Wien peaks, the μ and y limits, and a note on the temperature scale.
  - Temperature: the measurements against T₀(1+z) with the fitted β band; the full history to z = 10⁵ with Planck’s epochs; at any z, T, both Wien peaks and the age; links to the Spectral atlas blackbody and the Expansion view.
  - Power spectrum: Planck band powers on the best fit with residuals (log or linear ℓ), the band at any ℓ, C_ℓ, peaks, and θ∗ beside r∗/D_M(z∗) from the Expansion model.
- **Registry:** `context:cmb`. Expansion explains the CMB, the CMB explains expansion, and the CMB emits microwaves.
- **Source index:** `fixsen-1996`, `lambda-firas`, `planck-2018-v`, `planck-pla`, `noterdaeme-2011`, `muller-2013`; `fixsen-2009` now also feeds `cmb`.

18 new science tests (506 total) and e2e test 69.

Findings:
1. **The Planck licence allows the power spectrum, non-commercially.** ESA’s *Terms and Conditions for the use of data in the ESA Space Science Archives* put the data under CC BY-NC 3.0 IGO, with the credit line “ESA, Planck Collaboration”; commercial use needs ESA’s authorisation. The view and the Source index state both. (OpenStax CC BY-NC-SA was already in the index.)
2. **An access mistake, handled like the IOPscience case.** wiki.cosmos.esa.int (the Planck explanatory supplement) has `Disallow: /` for all agents. One page was fetched in the same command as the robots.txt check, before the result was read. It was discarded and is not cited; units and binning come from Planck 2018 V on arxiv.org. The host is now on the off-limits list.
3. **LAMBDA’s intensity column uses older constants.** Column 2 (“2.725 K BB + residual”) differs from Planck’s law with CODATA 2018 constants by up to 7.6 kJy/sr; with CODATA 1986 constants the difference falls to ≤ 0.8 kJy/sr. Every point is still well inside its 1σ (≥ 10 kJy/sr). The view rebuilds intensities from the published residuals with the bundled constants.
4. **FIRAS constrains the shape, not the absolute temperature.** The χ² minimum is 2.725015 K (χ² 45 for 42 d.o.f.; published 46/40 with the Galaxy and distortion terms), the scale the residuals were published on. At 2.72548 K the χ² is ≈ 4000, because the per-point errors exclude the absolute calibration. The view says this and quotes Fixsen et al. on how the temperature is set.
5. **The Planck files reproduce each other.** The binned ℓ_b equal the ℓ(ℓ+1)-weighted mean multipole of each bin (Planck 2018 V eq. 22) to 5 × 10⁻⁶. The binned best-fit column equals the theory spectrum binned the same way to 4 × 10⁻⁹. The adapter fails if either check breaks.
6. **Adiabatic cooling checks out.** T₀(1 + 0.88582) = 5.140 K, the 5.14 K Muller et al. quote; all six measurements lie within 1.5σ of T₀(1+z).
7. **Phone layout.** The first tab labels (“Power spectrum (Planck)”) overflowed at 390 px; they are now Spectrum, Temperature and Power spectrum. Top bar at 1440 px: rightmost element at 1431 px.


Gate 7.3 verified against production: 63/63 passed.

## 2026-11-27 — Gate 7.4 (dark-matter evidence)
New view `#/cosmic/darkmatter` (*Universe ▾ → Dark-matter evidence*) with five tabs: Overview, Galaxies, Lensing, Clusters and Cosmic. Every tab uses the same colour key: the observation (gold), the visible matter alone under Newtonian gravity (green), and a model with dark matter (violet).

What was built:
- **Data:** `dark-matter` (adapter `scripts/ingestion/curated-dark-matter.ts`), transcribed from the arXiv PDF text:
  - Clowe et al. (2006), the Bullet Cluster: Table 2 (X-ray gas mass, stellar mass and mean κ in four 100 kpc apertures), the peak offsets and quotations;
  - Łokas & Mamon (2003), the Coma cluster: the stellar, gas and dark-matter mass model (eqs. 1–12), Table 1 and the published results;
  - Cooke, Pettini & Steidel (2018): primordial D/H, η₁₀ and the BBN baryon density (eqs. 9–14).
- **Physics:** `src/core/physics/darkMatter.ts`:
  - g = V²/R, V²R/G and the mass discrepancy;
  - the generalised halo profile normalised at Δ_c ρ_crit;
  - the Coma model and the spherical Jeans equation projected to σ_los;
  - sky offsets.
  - The Cosmological module is now v1.3.0.
- **View:**
  - Overview: a table of five lines of evidence (SPARC, the Milky Way, the Bullet Cluster, Coma, BBN + CMB).
  - Galaxies: g_obs against g_bar at 3389 SPARC radii with the visible-matter line, and V_obs²/V_bar² along a chosen curve, with Υ sliders.
  - Lensing: a schematic of the four apertures with the subcluster κ peak; bars of visible mass against κ̄; an M/L_I slider; distances recomputed with the Expansion model.
  - Clusters: Coma masses by component, and σ_los for stars + gas against the full model for the four Table 1 fits, beside the paper’s printed numbers.
  - Cosmic: the Planck matter budget, BBN against the CMB baryon density (switchable reaction rate) and the TT spectrum with its best fit.
- **Registry:** `context:dark-matter`. It is observed with lensing and the CMB, explains the Milky Way mass budget, and is part of the expansion background.
- **Source index:** `clowe-2006`, `lokas-mamon-2003`, `cooke-2018` (DOIs checked with Crossref; affiliations from each paper’s first page).

26 new science tests (532 total) and e2e test 70.

Findings:
1. **The Coma model reproduces the paper.** Recomputed from the printed equations: total mass 1.41 × 10¹⁵ M☉ at r_v = 2.74 Mpc (printed 1.4 × 10¹⁵ and 2.7 Mpc); galaxies, gas and dark matter 1.8, 13.0 and 85.2 % (printed 2, 13 and 85 %); total-mass r_v 2.93 Mpc (2.9); 1.65 × 10¹⁵ inside 3.6 Mpc ((1.6 ± 0.5) × 10¹⁵). M/L_B recomputes to 361 against the printed ≈ 351 (3 %).
2. **Galaxy speeds need the dark matter.** With the published model, the E-S0 galaxies have σ_los ≈ 790–1050 km/s. Stars and gas alone would hold them at 170–335 km/s, under 45 % of that. The measured profile appears only in the paper’s figures, so the view shows these as model curves without data points and quotes the authors (“the velocity dispersion profile is well reproduced”).
3. **The Bullet Cluster numbers are consistent with the text.** Clowe et al.’s 4.413 kpc/″ is reproduced by the Expansion model with their cosmology (4.4130). The BCG separation from Table 2 is 721 kpc (stated 0.72 Mpc). The subcluster’s visible mass is 1.8× larger at the gas (stated “a factor of 2”), while its κ̄ is 10× smaller there.
4. **The BBN–CMB comparison depends on the Planck release.** Cooke et al. quote 2σ against Planck 2015 (reproduced: 2.1σ). Against the Planck 2018 value bundled here, the same BBN number is 3.3σ away with independent Gaussian errors; with their empirical d(p,γ)³He rate it is 0.2σ. The view shows both and labels which Planck release each comparison uses.
5. **One position was left out rather than guessed.** The main-cluster κ peak is given relative to the “northern” and “southern” BCGs, and Table 2 does not say which BCG it lists, so only the subcluster peak is drawn.
6. **Access:** arxiv.org `/pdf` only (three PDFs, 16 s apart) and the Crossref API. No new off-limits hosts.
7. **Layout:** top bar at 1440 px: rightmost element at 1431 px. At 390 px nothing overflows (scroll width 390 on every tab).

## Phase 7, Gate 7.5: gravitational waves (`#/cosmic/gw`), 2026-11-27

Before starting: production still served the pre-7.4 bundle (`index-ChcjBNsZ.js` against local `index-B7O7TXVr.js`). `vercel deploy --prod` was blocked again by the Claude Code auto-mode permission classifier, so Gates 7.4 and 7.5 both await a production deploy by the user.

What was built:
- **Data:** `gravitational-waves` (adapter `scripts/ingestion/gwosc.ts`):
  - one request to the GWOSC Event Portal API `eventapi/jsonfull/GWTC/` (robots.txt read first: `/eventapi/` allowed, `/catalog/` and `/archive/` disallowed; data CC BY 4.0). 391 confident events in GWTC-1 (1), GWTC-2.1 (54), GWTC-3 (35), GWTC-4.1 (140) and GWTC-5.0 (161); 282 with parameters. The GWOSC API documentation defines the bounds as the 90 % interval;
  - transcribed from the arXiv PDF text: the LIGO/Virgo “basic physics of GW150914” estimates (Ann. Phys. 2017); the GW170817–GRB 170817A delay and speed bounds (ApJL 848, L13); the standard-siren inputs and H₀ (Nature 551, 85).
- **Physics:** `src/core/physics/gravitationalWaves.ts` (chirp mass, f(t), ḟ, phase, Kepler separation, compactness, ISCO frequency, face-on strain, luminosity, energy and distance estimates, speed-of-gravity relation) and `redshiftAtLuminosityDistance` in `cosmology.ts`. The Relativistic module is now v1.1.0.
- **View:** Catalog (m₁–m₂ by release, cumulative detections, per-event values and derived quantities, GW150914 2016 vs now); Chirp model (waveform to the ISCO, f vs t_c − t, the paper’s numbers beside the same formulas); GW170817 (Δv/v against the assumed emission lag; H₀ comparison).
- **Registry:** `context:gravitational-waves`, with 5 sourced edges (GW150914 remnant, Hulse–Taylor, expansion ×2, gamma rays).
- **Source index:** 9 entries (DOIs checked with Crossref; collaboration names from each paper’s first page).

28 new science tests (560 total) and e2e test 71 (65 total). Local suite: 65/65 passed.

Findings:
1. **GWOSC matches the papers.** 13 values checked by hand against GWTC-1 Table III and GWTC-5.0 Table 3 are identical. The exception is the SNR: GWOSC’s is a different quantity (GW250114_082203: 78.6 against 76.9 in the paper). GW240420_175625 lacks χ_eff in the API.
2. **Every catalog redshift is reproduced.** For all 281 events, z = z(median d_L) in flat ΛCDM with H₀ = 67.9 and Ωm = 0.3065, within the printed rounding. Medians commute with this monotone map.
3. **GW170817’s remnant mass is an upper bound.** The API returns 2.8 with no interval; GWTC-1 prints “≤ 2.8”, so it is stored as a bound.
4. **The basic-physics numbers are reproduced:**

   | Quantity | Recomputed | Paper |
   |---|---|---|
   | separation at 150 Hz | 345 km | 350 km |
   | compactness ratio | 1.70 | 1.7 |
   | energy radiated to there | 2.6 M☉c² | ∼3 |
   | distance from h_max | 300 Mpc | ∼300 |
   | time from 35 Hz to merger | 0.170 s | ≈ 0.15 s visible |
5. **The GW170817 speed bounds are reproduced:** 6.69 × 10⁻¹⁶ and −3.11 × 10⁻¹⁵ (published +7 × 10⁻¹⁶ and −3 × 10⁻¹⁵).
6. **Access:** arxiv.org `/abs` and `/pdf` (16 s apart), gwosc.org (robots.txt read before any fetch) and the Crossref API.
7. **Layout:** at 1440 px the top bar’s rightmost element is at 1431 px. At 390 px nothing overflows (scroll width 390 on every tab).

Phase 7 is complete. Stopping for user review; resume from `HANDOFF_PHASE7_REVIEW.md`.

### Production deploy and live verification (2026-11-27)

- Deployed by the user (`vercel deploy --prod`; the auto-mode classifier blocked it from Claude Code). Deployment `dpl_B7CaTn7B6DZnAC8uU1VDBck63nrQ`, aliased to https://voyager-ventures.vercel.app.
- Production serves `index-Qc9NTZFA.js`, identical to the local `dist/assets` build, so Gates 7.4 and 7.5 are now live (the previous production bundle was `index-ChcjBNsZ.js`, from before Gate 7.4).
- Full browser suite against production: **65/65 passed** (10.1 min).

## Phase 8, Gate 8.1: universal scale navigator (`#/scale`), 2026-11-27

Phase 8 approved by the user (“proceed as planned”): 8.1 scale navigator · 8.2 relationship explorer · 8.3 integrated spectroscopy · 8.4 shared instruments · 8.5 unified notebook · 8.6 pathways; encyclopedia E.2 after 8.3.

1. **View:** `#/scale?z=&sel=` — a powers-of-ten zoom (10⁻¹⁶ to 10²⁷·⁵ m) where every reference in the window is drawn to one linear scale; slider, ÷10/×10, wheel, level jump, a clickable log ruler of the whole range; an object panel with value, interval, provenance, sources and a link to its view. Opened from the Scale navigator (“Open the scale explorer →”).
2. **References (29):** read from bundled datasets and constants (`src/modes/scale/references.ts`). The proton radius was checked on NIST’s CODATA page, which now serves **CODATA 2022** (0.84075(64) fm, not the 2018 0.8414 fm); a `codata-2022` Source-index entry was added (DOI 10.1103/RevModPhys.97.025002 checked on Crossref).
3. **Scale levels:** *Galaxy clusters* is now interactive (Coma tab of the dark-matter view).
4. **Tests:** 575 science (+15, `tests/science/scale.test.ts`), 66 browser (+1: test 72 in `tests/e2e/phase8.spec.ts`). Local full suite 66/66.
5. **Layout:** at 390 px the scale view does not overflow (scroll width 390); labels are placed without overlap.

**Gate 8.1 deploy:** skipped at the user’s request (“Skip deployment and move on to the next step”); production still serves the Gate 7.5 build.

## Phase 8, Gate 8.2: relationship explorer (`#/relations`), 2026-11-27

1. **View:** `#/relations?tab=map|path|links|planned` — neighbourhood map (1–2 steps, centre any entity by search or by clicking), shortest chain of sourced edges between two entities, a filterable table of all edges with sources, and planned entities with their phase. Filters by relationship type; registry statistics; the 10 pc stars on request (`stars=1`).
2. **Graph queries:** `src/shared/scientific-relationships/graph.ts` (pure; nothing is added to the registry). `RelatedLinks` now uses its shared verbs (“observed with”, “located in” instead of the raw type names) and shows “map ↗” into the explorer.
3. **Registry today:** 199 entities (186 available, 13 planned), 140 edges, 27 connected groups (largest 89), 45 unlinked entities. Hydrogen → cosmic expansion is 4 steps (Asplund 2009 → Bland-Hawthorn & Gerhard 2016 → Riess et al. 2022 ×2).
4. **Top bar:** 🔗 *Relationships* added (also in the phone ☰ menu). To keep the 1440 px bar inside the window in Cosmic mode, crowded bars use 6 px gaps and 7 px button padding, and search is at most 306 px wide; rightmost element at 1427 px.
5. **Tests:** 585 science (+10, `tests/science/relations.test.ts`), 67 browser (+1: test 73). Local full suite 67/67.

## Phase 8, Gate 8.3: integrated spectroscopy (`#/spectral/compare`), 2026-11-27

1. **View:** `#/spectral/compare?ax=&lo=&hi=&L=&z=&x=&sel=` — bundled spectra on one log axis of vacuum wavelength, frequency or photon energy (10 nm – 10 cm, presets and zoom). Layers: the 33 NIST ASD line spectra, the Orion and Ring nebula lines at NIST rest wavelengths, blackbodies (Sun 5772 K, every class V T_eff of Pecaut & Mamajek, CMB 2.72548 K), the 43 COBE/FIRAS points and n(λ) of the 9 optical materials. Each layer is labelled *observed* or *model*, with provenance, sources and a link to its registry entity. Clicking reads every layer at one wavelength.
2. **Continuum:** blackbodies and FIRAS share one log y-axis in λB_λ = νB_ν (W m⁻² sr⁻¹), identical on all three axes, so the Sun and the CMB appear on one honest scale.
3. **Redshift:** λ_obs = λ_rest(1 + z), labelled as a transformation; applied to line layers and stellar blackbodies only, intensities unchanged.
4. **Not bundled:** the approved plan listed “NIST molecular IR (Phase 2)”, but no IR or vibrational data exists in the repository; the view lists molecular IR, cool-star molecular bands and an observed solar spectrum as unknown instead of inventing them.
5. **Links:** *Compare* chip in the Spectral sections; on phones the four Spectral sections are now in the ☰ menu (Wave lab and Fields were not reachable from the phone top bar before); “Compare on one axis →” in the atlas lines tab, “Sun and CMB on one axis →” in the blackbody tab, “FIRAS beside the Sun on one axis →” in the CMB view; `instrument:spectral-compare` registered (200 entities, 140 edges, 46 unlinked).
6. **Tests:** 606 science (+21, `tests/science/compare.test.ts`), 68 browser (+1: test 74). Local full suite **68/68** (10.5 min).
7. **Layout:** at 1440 px the Spectral top bar ends at 1436 px; at 390 px the view does not overflow (scroll width 390).

**Gate 8.3 deploy:** not deployed (the user: “Don't deploy, just continue working”). Production still serves the Gate 7.5 build.

## Phase 8, Gate 8.4: shared instruments, 2026-11-27

1. **One interface** (`src/ui/instruments.tsx`, logic in `src/shared/instruments/instruments.ts`): `UnitValue` (a value with a dimension-checked unit menu), `Probe`, `Ruler`, `TimeSeriesView` (plot, n/span/min/max/mean/rms, CSV export with title, provenance, method and sources) and `UnitConverter`.
2. **Where:** Sandbox (probe on the selected body, ruler with relative speed and light time, ΔE/E₀ recorder against simulated years replacing the old step-indexed sparkline), Cosmic (ruler between modelled heliocentric positions), Wave lab (probe position now movable, `px` in the URL; probe readout; y(t) recorder with CSV), Fields (probe with convertible units; click pins a point and the probe measures the distance from it). Unit converter in the Scale navigator (top-bar Scale button, phone ☰ → Scale).
3. **Units:** the chosen unit per dimension is remembered (localStorage) and shared by every view. New registered units: cm, ms, µs, Hz–THz, m/s², gₙ (exact), mV–kV, V/m–MV/m, J/kg, MJ/kg, km²/s² (new dimensions: potential, electric field, specific energy).
4. **Tests:** 617 science (+11, `tests/science/instruments.test.ts`), 69 browser (+1: test 75). Existing selectors kept (“Second body to measure to”, “Light time”, “Field values at the probe point”). Local full suite **69/69** (10.5 min).

**Gate 8.4 deploy:** not deployed (user: continue without deploying).

## Encyclopedia pass E.2 (celestial objects, elements, molecules), 2026-11-27

Split into documented sub-gates (the plan allowed it):
1. **E.2a celestial objects:** 12 entries quoted verbatim from NASA Science “Facts” pages (Sun, Mercury–Neptune, Moon, Pluto, Ceres; robots.txt allows all; 2 s between requests). Mechanical extraction of the CMS article blocks only; every paragraph checked against the page text; Ceres’ “Pop Culture” section left out after review. *About* section in the Cosmic object panel. Adapter `scripts/ingestion/encyclopedia-nasa-solar-system.ts`.
2. **E.2b elements:** all 118 entries quoted verbatim from the Los Alamos National Laboratory periodic table (lanl.gov; robots.txt allows all; reuse notice “The public may copy and use this information without charge, provided that this Notice and any statement of authorship are reproduced on all copies” shown with every entry). Element Stats tables and Fun Facts left out. Jefferson Lab text was **not** used: education.jlab.org’s robots.txt disallows ClaudeBot / anthropic-ai and signals use=reference. Adapter `scripts/ingestion/encyclopedia-lanl-elements.ts`.
3. **E.2c molecules:** 129 of 137 molecules, PubChem PUG View “Record Description” items from openly licensed sources only (ChEBI, CC BY 4.0 confirmed on ChEBI’s About page; NCI Thesaurus as fallback). The text is PubChem’s description built from ChEBI data and is labelled so. Five PubChem→ChEBI mappings to an atom or a class (e.g. hydrogen sulfide → “Sulfur atom”) were rejected; MeSH, DrugBank and CAMEO were excluded for licence reasons. Adapter `scripts/ingestion/encyclopedia-molecules.ts`.
4. **Loading:** radiation and celestial entries are bundled; elements (517 kB, 138 kB gzip) and molecules (128 kB) are separate chunks loaded when an element or molecule view or the encyclopedia drawer opens.
5. **Sources:** `nasa-science-solar-system`, `lanl-periodic-table`, `chebi` (Malik et al. 2025, NAR, DOI 10.1093/nar/gkaf1271 checked on Crossref), `nci-thesaurus` (author note null: not verified). Registry: 436 entities, 140 edges.
6. **Tests:** 623 science (encyclopedia 17, was 8), 70 browser (+1: test 76; test 66 now checks the 118 element entries instead of “coming soon”).

## Phase 8, Gate 8.5: unified notebook, 2026-11-27

1. **Snapshot any view:** 📓 is now a menu (*Open notebook* / *📸 Snapshot this view*, also in the phone ☰ menu; the top bar did not grow). A snapshot stores the route and parameters, view title, every readout shown (`dl` rows with the selected unit; list readouts marked `data-reading`), provenance classes on screen, cited source ids (`data-source` on every source link), live recorder series, a screenshot of the largest canvas, notes, and the Voyager version and commit (build-time `__APP_VERSION__` / `__APP_COMMIT__`).
2. **Notebook:** snapshot cards (Open view, JSON, CSV, Markdown, Delete). Sandbox and wave-lab records are read in the same shape without rewriting, and gain Markdown (and, for waves, CSV) export. *Export all (Markdown)*. Markdown cites every source in full (DOI or URL, licence).
3. **Tests:** +8 science (`tests/science/snapshot.test.ts`), browser test 77; test 38 opens the notebook through the 📓 menu.

## Phase 8, Gate 8.6: pathways, 2026-11-27

1. **View:** `#/relations?tab=pathways&p=&s=`: five curated walks (hydrogen → cosmic expansion; the Sun among the stars; oxygen light from the Ring Nebula to dark matter; the oldest light; gravitational waves and light). Each stop shows the sourced relationship that leads to it and the entity's encyclopedia entry; Previous/Next; all steps with sources.
2. **Rule:** every consecutive pair must be an existing registry edge (either direction); a missing link shows the pathway as broken instead of filling it in. Pathways add no edges.
3. **Tests:** +5 science (`tests/science/pathways.test.ts`), browser test 78.

**Phase 8 complete.** 636 science tests, 72 browser tests (local full suite **72/72**, 12.4 min), 36 manifests, 131 sources. Not deployed (user's instruction). Stopping at the Phase 8 boundary for review.


## Phase 9, Gate 9.1: EM fields & antennas (`#/spectral/antennas`), 2026-11-27

Phase 9 approved by the user (“you have my approval to go ahead with phase nine”); gate plan in `DEVELOPMENT_ROADMAP.md`.
1. **Source:** S. W. Ellingson, *Electromagnetics* Vol. 2 (VT Publishing 2020, CC BY-SA 4.0; DOI checked on Crossref; PDF read from VTechWorks, crawl-delay respected). New Source-index entry `ellingson-2020-vol2`.
2. **Physics** (`src/core/physics/em/antennas.ts`): exact Hertzian-dipole fields (H from eq. 9.61, E from Ampère's law, eq. 9.65), far field of thin filaments by Simpson integration of eq. 9.96 (short and half-wave dipoles), directivity, radiation resistance and effective aperture by integration over the sphere, uniform linear arrays (pattern multiplication), Friis equation.
3. **FIELDS:** new layer `hertzian-dipole` (H out of the plane, E arrows), sampled through `sampleGrid` in the antenna view.
4. **View:** four tabs: near & far field (animated, probe with |E|/|H| → η₀), dipole patterns (E/H-plane polar plots, 3D pattern, numbers beside Ellingson's), arrays (N, d, α; steering and grating lobes), radio link (Friis; Example 10.11 preset). New shared `PolarPlot`.
5. **Checks against the textbook:** short dipole D = 1.5, R_rad = 20π²(L/λ)², A_e = 0.119λ²; half-wave dipole R_rad = 73.08 Ω (≅ 73 Ω), A_e = 0.1306λ² (≈ 0.131λ²), D = 1.641; Example 10.11 −36.5 dBm.
6. **Navigation:** the Spectral bar gains a *Radio ▾* chip menu (also in the phone ☰ menu) and uses the compact `many-chips` style; rightmost top-bar element at 1426 px.
7. **Registry:** `instrument:antennas`, `field:hertzian-dipole` and four sourced edges.
8. **Tests:** 652 science (+16, `tests/science/antennas.test.ts`), 73 browser (+1: test 79 in `tests/e2e/phase9.spec.ts`). Local full suite **73/73** (10.9 min). Layout: 1440 px and 390 px (scroll width 390) checked.

**Gate 9.1 deploy:** not deployed (production still serves the Gate 7.5 build).

## Phase 9, Gate 9.2: RF/wireless atlas (`#/spectral/rf`), 2026-11-27

1. **Dataset** `datasets/spectral/rf-allocations.json` (manifest `rf-allocations`, adapter `scripts/ingestion/curated-rf.ts`), transcribed by hand with a verbatim quote per entry: 47 CFR §§73.14, 73.201, 18.301, 15.247, 15.407 from the eCFR (robots.txt allows `/current/`); IS-GPS-200N and IS-GPS-705J (gps.gov, Distribution A); GPS.gov *Space Segment*; Ludwig & Taylor (2002), JPL DESCANSO *Voyager Telecommunications* (no robots.txt on the host). The planned DSN 810-005 document was not needed: the DESCANSO article gives the Voyager frequencies and design control tables directly. ITU-R P.676 (atmospheric absorption) is not bundled.
2. **View:** allocations on a log frequency axis under the ITU-R V.431 band names; per entry λ, λ/2, hf, ITU band, free-space path loss at a chosen distance, source text, all channel carriers; “Find a frequency”; links into the Friis calculator and the spectrum atlas. *Link budgets* tab: Voyager 2 X-band downlink and S-band uplink tables at DSS-43 (1996-01-01) summed again with the space loss recomputed by Friis (308.18 vs 308.19 dB; 296.18 vs 296.18 dB), the 880/221 turnaround (2113.3125 MHz → 8415.000000 MHz); GPS line-of-sight distance vs elevation and the implied minimum EIRP.
3. **Finding:** the tables print received power as the *mean* of toleranced items, so the sum of design values differs by up to 0.18 dB (uplink: 70 m gain 62.10 dBi design, 61.9 mean). Shown and tested as such.
4. **Registry:** `context:radio-allocations`, `context:gps`, `body:voyager-1`, `body:voyager-2` with 7 sourced edges. Voyager's 3.6 cm X-band and the 6 GHz Friis example are linked to *radio waves*, not *microwaves*, because the app's ISO 21348 microwave category is 1–15 mm (the Gate 9.1 edge was corrected before committing).
5. **Sources:** `ecfr-47-cfr`, `is-gps-200n`, `is-gps-705j`, `gps-gov-space-segment`, `ludwig-taylor-2002`.
6. **Tests:** 663 science (+11, `tests/science/rf.test.ts`), 74 browser (+1: test 80). Local full suite **74/74** (11.8 min).

**Gate 9.2 deploy:** not deployed.

## Phase 9, Gate 9.3: 3D communications room (`#/spectral/room`), 2026-11-27

1. **Dataset** `datasets/spectral/building-materials.json` (manifest `building-materials`, adapter `scripts/ingestion/curated-p2040.ts`): all 38 rows of ITU-R P.2040-4 Table 3 (PDF from `itu.int/dms_pubrec`, a path robots.txt allows). The PDF text layer prints the metal conductivity as “107”; the rendered page shows 10⁷ S/m, which is what is stored. New Source-index entry `itu-r-p2040-4`.
2. **Physics** (`src/core/physics/em/room.ts`): ε′ = a f^b, σ = c f^d, ε″ = 17.98σ/f; R_TE, R_TM from air (eqs. 37a, b) and single-slab R (eqs. 43a, 44); image method for a box (1/7/25/63 paths for 0–3 reflections); vector field carried along each ray with TE/TM splitting; half-wave dipoles at both ends (Ellingson eqs. 9.102, 10.113–10.114). Coverage maps run in a Web Worker (`src/workers/room.worker.ts`); 48 × 48 points with three reflections took 1.3 s on the main thread in a test, so the map is computed off-thread and streamed.
3. **Checks:** Ellingson's air/glass Γ = −0.183 at normal incidence; Brewster angle; |R|² + |T|² = 1 for a lossless slab; transparent walls reproduce Friis with two half-wave dipoles; over a metal floor the two rays equal image theory to 1 % (this pins the TE/TM sign convention).
4. **View:** controls for frequency (ISM presets from 47 CFR §18.301), power, reflections, transmitter/receiver positions and each surface's P.2040 material and thickness; top-view coverage map (click moves the receiver), 3D room with the 16 strongest rays and the map, line cut through the receiver (all paths vs the direct path), receiver probe (coherent, direct, power sum, fading, mean delay, RMS delay spread), strongest-path table, power-delay profile, per-surface ε′, σ and |R|; warning when a material is outside its fitted range.
5. **Registry:** `instrument:comms-room` with three sourced edges.
6. **Tests:** 678 science (+15, `tests/science/room.test.ts`), 75 browser (+1: test 81). Local full suite **75/75** (13.3 min).

**Gate 9.3 deploy:** not deployed.

## Phase 9, Gate 9.4: modulation lab (`#/spectral/modulation`), 2026-11-27

1. **Sources read:** Johnson, *Fundamentals of Electrical Engineering I* (Rice University via Connexions, CC BY 1.0), chapters 5–6 of the LibreTexts edition, fetched by following the “next page” links at the 5 s crawl delay (the LibreTexts page API is disallowed by robots.txt); NIST DLMF release 1.2.8 (§§7.2, 10.2, 10.4, 10.12, 10.23; equation numbers checked on the pages); 47 CFR §73.310 (FM definitions, ±75 kHz = 100 %). New Source-index entries `johnson-fundamentals-ee`, `nist-dlmf`.
2. **Not used:** the AMS host of Cooley & Tukey (1965) disallows ClaudeBot in robots.txt, so the FFT is cited through Johnson §5.9; Harris (1978, IEEE) and Shannon (1948) were not read, so the Hanning window and capacity come from Johnson. Johnson does not treat FM; QAM, Carson's rule and PM were dropped from the plan (roadmap updated).
3. **Physics:** `src/core/physics/signals/dsp.ts` (radix-2 FFT, DFT check, Hanning window ½(1 − cos 2πn/N), amplitude and baseband spectra, spectrogram, aliasing) and `modulation.ts` (AM, FM, J_n series, 99 % FM bandwidth, BPSK/FSK waveforms, seeded Gaussian noise, correlation receiver, Q = ½ erfc(x/√2), capacity).
4. **Source note:** the LibreTexts copy of Johnson §6.17 prints Q(x) with a 1/(2π) prefactor; the unit-normal tail needs 1/√(2π), which the code implements and the tests check by integrating the normal density.
5. **View:** AM/FM tab (waveform, 65 536-point FFT with the predicted lines, sideband table, 99 % bandwidth, over-modulation warning), digital tab (sent/received waveform, decision-statistic histograms, BER curves with measured points), capacity tab (Johnson's 3 kHz / 30 dB example). Registry: `instrument:modulation-lab` with three sourced edges (FM definition, GPS L1 BPSK from IS-GPS-200N §3.2.3, AM band).
6. **Tests:** +19 science (`dsp.test.ts` 9, `modulation.test.ts` 10), browser test 82. The full suite was run once for Gates 9.4 and 9.5 together: **77/77** (14.2 min).

**Gate 9.4 deploy:** not deployed.

## Phase 9, Gate 9.5: acoustic lab (`#/spectral/acoustics`), 2026-11-27

1. **Sources:** OpenStax University Physics Vol. 1 §§17.3, 17.7, 17.8 (eqs. 17.8–17.12, 17.20–17.22, Table 17.2) and College Physics 2e §17.7 (eqs. 17.38–17.39, Table 17.5, Example 17.7); NIST WebBook fluids; the ideal-gas air model. New Source-index entry `openstax-college-physics-2e`.
2. **OpenStax terms:** while reading these pages, the reuse notice was found: the book “may not be used in the training of large language models or otherwise be ingested into large language models or generative AI offerings without OpenStax's prior written permission.” No further OpenStax pages were fetched; recorded in `KNOWN_LIMITATIONS.md` for the owner's decision.
3. **Physics** (`src/core/physics/waves/acoustics.ts`): intensity, inverse square, levels, pressure amplitude, incoherent sums, impedance, intensity reflection coefficient, Doppler, Mach cone; media from NIST fluids, ideal-gas air and Table 17.5.
4. **View:** sound-level map with up to three sources and a listener probe (nearest Table 17.2 row), impedance/boundary tab (Example 17.7 preset), moving-source tab (wavefronts, Mach cone, Doppler; “unknown” ahead of a supersonic source).
5. **Navigation:** the Spectral *Wave lab* chip became a *Waves ▾* menu (Wave lab, Acoustic lab) so the top bar stays at 1426 px; browser test 25 (phase 4) now opens the Wave lab through that menu.
6. **Registry:** `instrument:acoustic-lab` with two sourced edges (sound in water; water's impedance).
7. **Tests:** +9 science (`acoustics.test.ts`), browser test 83; full suite **77/77** together with Gate 9.4.

**Gate 9.5 deploy:** not deployed.

## Phase 9, Gate 9.6: audio synthesis & FFT (`#/spectral/audio`), 2026-11-27

1. **Sources:** Johnson ch. 4 (crawled like ch. 5–6, 5 s apart): §4.3 classic Fourier series and the square wave's coefficients; §5.3, §§5.9–5.10 as in Gate 9.4.
2. **Physics:** `src/core/physics/signals/synthesis.ts` (coefficients by numerical integration, partial sums, Nyquist-limited synthesis); `src/ui/audio.ts` (one shared AudioContext created on the first click, buffers with fades).
3. **View:** Fourier synthesis (5 shapes, up to 60 harmonics, playback, period plot, harmonic bars, FFT, coefficient table), sampling & aliasing (original vs “as sampled” playback, alias frequency), spectrogram (chirp, octave step, square wave, optional 3 s microphone recording kept in the page only). The Wave lab gains *🔊 Listen*.
4. **Registry:** `instrument:audio-lab`, `wave:sound-air` (new entity, routed to the Wave lab).
5. **Tests:** +5 science (`synthesis.test.ts`), browser test 84; full suite **79/79** (13.1 min) together with Gate 9.7.

## Phase 9, Gate 9.7: room acoustics & resonance (`#/spectral/roomacoustics`), 2026-11-27

1. **Sources:** Rayleigh, *The Theory of Sound* Vol. II, 2nd ed. 1896 (Internet Archive `theoryofsound02raylrich`; its metadata says 1894, the title page says 1896) §267; Sabine, *Collected Papers on Acoustics*, 1922 (`collectedpaperso00sabiuoft`). archive.org robots.txt allows `/download/`. The OCR text drops decimal points and equations, so Rayleigh's eqs. (3)–(4) (p. 70) and Sabine's tables (pp. 56, 60) were checked on page images rendered from the scanned PDFs. New Source-index entries `rayleigh-1896`, `sabine-1922`.
2. **Dropped from the plan:** Eyring (1930, JASA; not read), the Helmholtz resonator (Rayleigh §§303–306 equations not yet checked on the scans).
3. **Physics** (`src/core/physics/waves/roomAcoustics.ts`): mode list and shapes, Sabine time and absorbing power with 16 of Sabine's coefficients, 2-D FDTD pressure solver.
4. **View:** modes (dimensions, slice pressure pattern, mode chart, table, play a mode), reverberation (floor/ceiling/wall materials from Sabine's tables, audience, open windows; decay plot), wave simulation (pulse in the floor plan, probe spectrum against the analytic modes). “Same room for radio waves →” opens Gate 9.3 with the same dimensions.
5. **Registry:** `instrument:room-acoustics` with two sourced edges.
6. **Tests:** +7 science (`roomAcoustics.test.ts`), browser test 85; full suite **79/79** (13.1 min) together with Gate 9.6.

### Production deploy and live verification (Phase 9, 2026-11-27)

- Deployed by the user (`vercel deploy --prod`). Deployment `dpl_GFaorS7DN2Ff5CvsAiLvHovZPoSM`, aliased to https://voyager-ventures.vercel.app; production now serves `index-BHFEWWv3.js` (Phases 8 and 9; the previous production bundle was the Gate 7.5 build).
- Full browser suite against production: **78/79** (12.5 min). The one failure is test 77: the notebook export reads “commit unknown”, because the Vercel CLI uploads the files without `.git`, so `git rev-parse` fails during the Vercel build. Fix: `vite.config.ts` now falls back to `VERCEL_GIT_COMMIT_SHA` when it is set; whether the CLI deploy sets it will show on the next deploy.


## OpenStax citations replaced, 2026-11-27

The user asked for replacements of the OpenStax books (their pages forbid ingestion into AI models). No OpenStax page, and no LibreTexts copy of one, was read for this work; every replacement was read at its own site after checking robots.txt.

1. **Chemistry (OpenStax Chemistry 2e → 12 sources):** combustion and formation reactions cite the NIST Chemistry WebBook and the CODATA Key Values; neutralisation Prosen & Goldberg (NBSIR 73-180); K_a of acetic acid (pK 4.756) and K_b of ammonia (pK 9.245 with pK_w 13.99) Goldberg et al. 2002 and Bandura & Lvov 2006; the Daniell cell (0.339 − (−0.762) = 1.101 V) and the permanganate titration Bratsch 1989 and Fowler & Bright 1935; corrosion Romanoff (NBS Circular 579); BaSO₄ and CaCO₃ USGS reports. ΔG° of water electrolysis (237.1 kJ/mol), the neutralisation enthalpy (−55.8 kJ/mol) and K_sp of AgCl (1.8 × 10⁻¹⁰) are derived from the CODATA ΔfH° and S° and are recomputed in a new test file (`tests/science/chemistryConstants.test.ts`, 5 tests). K_a changed from 1.8 to 1.75 × 10⁻⁵ and K_sp from 1.6 to 1.8 × 10⁻¹⁰ to match the new sources.
2. **Acoustics (University Physics Vol. 1 and College Physics 2e → Rayleigh, NASA, NIOSH):** string speed (Rayleigh Vol. I §123), sound needs a medium (§2), Laplace's speed of sound (Vol. II §246) with NASA Glenn's a² = γRT and γ = 1.4; inverse-square spreading (Rayleigh §276, Homick NASA RP-1045); I₀ = 1 pW/m² (NIOSH 98-126); reflection at a fluid boundary (Rayleigh §270 eq. 23, written with Z = ρV); Doppler and Mach angle (NASA Glenn); sonic boom and SR-71 (NASA Dryden fact sheets; Mach 3.2 design cruise replaces the textbook's 2.85). The listener probe now shows Homick's sound pressure levels (50–172 dB) and a sound pressure level re 20 µPa. The tissue and transducer rows (Table 17.5) and Example 17.7 were removed: no open source for those values was found. Browser test 83 now uses a helium → air preset.
3. **Astronomy (Astronomy 2e → IAU OAE Glossary and others):** spectral-class criteria, the Sun's G2 class, the H–R diagram and continuous spectra with absorption lines from the IAU Office of Astronomy for Education glossary (CC BY 4.0); TiO vanishing in L dwarfs (Kirkpatrick et al. 1999); masses along the main sequence (ESA Gaia release); Hα in the Orion Nebula (NASA APOD); H II temperature ≈ 9000 K (Henney 2006; the textbook's 10 000 K is gone); Ring Nebula colours (Hubble Heritage 1999), distance (ESA/Hubble heic1310 “just over 2000 light-years”; O'Dell et al. 2013 740 pc) and planetary-nebula origin (NASA 2013) and name (ESA/Hubble).
4. **Coulomb's law** (University Physics Vol. 2 → Ellingson, *Electromagnetics* Vol. 1 §5.1) and **time dilation** (University Physics Vol. 3 → Einstein 1905 §4, Perrett & Jeffery translation, public domain).
5. **Source index:** six OpenStax entries removed, 26 added (163 entries). DOIs of Einstein 1905, Kirkpatrick 1999 and O'Dell 2013 checked on Crossref. Johnson's *Fundamentals of Electrical Engineering I* stays (an original Rice/Connexions text, CC BY 1.0).
6. **Off-limits found:** kinetics.nist.gov (JANAF online), nemi.gov and the EPA snapshot site, ccrma.stanford.edu, nap.nationalacademies.org, IUPAC Gold Book and webb.nasa.gov disallow AI crawlers; adsabs.harvard.edu disallows /abs/ and /full/; NCBI Bookshelf and PMC served a reCAPTCHA. Peatross & Ware (*Physics of Light and Optics*) is “all rights reserved”; reuse of its content needs the authors' permission.
7. **Tests:** science 723/723 (+5). Browser: the 28 tests of Phases 5–9 that show the changed content pass (tests 57 and 78 expected the old wording and author and were updated); screenshots 55c, 57c, 58b, 63b, 78, 83a and 83b were regenerated.

## Phase 10, Gate 10.1: geometric optics (`#/spectral/optics`), 2026-11-27

Phase 10 approved by the user (“approve phase 10”). The optics textbooks first considered could not be used (OpenStax forbids AI ingestion; Peatross & Ware is all rights reserved), so the phase rests on public-domain classics: Drude's *Theory of Optics* (1902 translation, University of California scan `theooptics00drudrich`; the 1933 reprint `theoryofoptics00drudrich` adds “All rights reserved” and was avoided) and Southall's *Geometrical Optics* (1910). Every formula was read on the page image; I checked Drude pp. 3 and 42 myself.

1. **View:** `#/spectral/optics?tab=refraction|lens|mirror|prism`, opened from a new **Light ▾** menu, which now also holds Compare spectra (the old Compare chip), so the top bar keeps its width. Browser test 74 now opens Compare through that menu.
2. **Physics:** `src/core/physics/optics/geometric.ts`: Snell's law and total reflection (Drude eqs. 1, 3, 6); thin lens (eqs. 22, 25) and mirror (eqs. 12–13); prism deviation and minimum deviation (Southall eqs. 25, 27); exact 2-D ray tracing through spherical surfaces and plane prism faces by the vector laws of refraction and reflection. Indices come from the materials dataset at the chosen wavelength; outside a formula's range the view shows “unknown”.
3. **Checks:** water → air critical angle 48.589° at 589 nm; a fused-silica biconvex lens (r = ±50 mm, 4 mm) has thin-lens f = 54.54 mm and traced paraxial focal length 55.23 mm, with the marginal ray crossing 6.4 mm short of the paraxial one; a 60° fused-silica prism deviates 589 nm light by 33.64° at minimum.
4. **Sources:** `drude-1902`, `southall-1910` (165 Source-index entries). Registry: `instrument:geometric-optics` explains visible light and has-property links to the nine materials with n(λ).
5. **Tests:** science 737/737 (+14, `tests/science/geometricOptics.test.ts`); browser test 86 (new `tests/e2e/phase10.spec.ts`, screenshots `screenshots/phase-10/86a–c`).

## Phase 10, Gate 10.2: wave optics (`#/spectral/waveoptics`), 2026-11-27

1. **View:** `#/spectral/waveoptics?tab=two|slit|grating|film` (Light ▾ → Wave optics).
2. **Physics:** `src/core/physics/optics/wave.ts` from Drude Pt II Sec. I: two-source interference (eqs. 11–13) with the exact path difference; slit (eq. 78); m-slit grating (eq. 85), orders (eq. 86) and resolving power (eq. 88); thin-film phase with the reversal at one face (eqs. 14–17), dark wavelengths found by bisection with the film's n(λ).
3. **Data link:** the grating resolves the two strongest NIST lines of Na I (589.1583 and 589.7558 nm, needing hm ≥ 987) and Hg I (577.12 and 579.23 nm). A 400-line grating with d = 2 µm does not resolve sodium in order 1 and does in order 3.
4. **Fix during the gate:** the first version listed thin-film minima with n at 550 nm while the curve used n(λ), so the marked minima sat a few nm off the curve's zeros; both now use n(λ) (`filmMinimaDispersive`, tested).
5. **Sources:** `huygens-1912` added; Drude's usage extended (166 entries). Registry: `instrument:wave-optics`.
6. **Tests:** science 745/745 (+8, `tests/science/waveOptics.test.ts`); browser test 87 (screenshots 87a–c).

## Phase 10, Gate 10.3: polarisation and optical materials (`#/spectral/polarisation`), 2026-11-27

1. **View:** `#/spectral/polarisation?tab=fresnel|reflection|crystal` (Light ▾ → Polarisation).
2. **Physics:** `src/core/physics/optics/polarisation.ts`: Drude's Fresnel amplitudes (eq. 24), the polarizing angle (eq. 25, p. 246), the Nörrenberg two-reflection law I ∝ cos² α computed from the amplitudes, uniaxial crystals (eqs. 35, 74) and quarter-wave plates (§9). I read Drude pp. 246, 282 and 324 on the page images; p. 246 says the reflected light is “polarized in the plane of incidence”, which the view explains in today's terms (s-polarised).
3. **New dataset:** `datasets/materials/birefringence.json` (39 manifests): ordinary and extraordinary dispersion formulas of calcite and α-quartz (Ghosh 1999), sapphire (Malitson & Dodge 1972) and rutile (DeVore 1951) from the refractiveindex.info database (CC0) on GitHub (raw.githubusercontent.com has no robots.txt). The optic signs agree with Drude (“Quartz is positively, calc-spar negatively, uniaxial”).
4. **Checks:** fused silica at 589 nm: polarizing angle 55.562°, p reflectance there 1.4 × 10⁻⁷ at the nearest 0.1° step; two reflections at α = 60° give 0.25; calcite n_o = 1.65836, n_e = 1.48614, quarter-wave thickness 0.855 µm.
5. **Tests:** science 754/754 (+9, `tests/science/polarisation.test.ts`); browser test 88 (screenshots 88a–b).

## Phase 10, Gate 10.4: spectroscopy (`#/spectral/spectroscopy`), 2026-11-27

1. **View:** `#/spectral/spectroscopy?tab=hydrogen|widths|molecules` (Light ▾ → Spectroscopy).
2. **Physics:** `src/core/physics/optics/spectroscopy.ts`: hydrogenic wavelengths with R_M (NIST Compendium eqs. 1, 2, 30), Bohr's 1913 factor, Doppler FWHM (eq. 40) and Lorentzian shape, diatomic terms and rotation lines (NIST Diatomic Spectral Database eqs. 1–8).
3. **New dataset:** `datasets/molecular/diatomic.json` (40 manifests): ground-state constants of H₂, H³⁵Cl, CO, N₂, O₂ and NO from the NIST WebBook's Huber–Herzberg tables (Mask=1000), fetched at the 5 s crawl delay. The parser drops footnote links and keeps subscripted final digits.
4. **Checks:** computed Balmer lines lie 2.4–4.3 pm above the NIST lines for n ≥ 4 (unresolved fine structure); Hα differs by 9.6 pm because NIST lists the blended line to 0.01 nm; D–H isotope shift of Hα −178.6 pm; Hα Doppler FWHM 46.82 pm at 10 000 K; CO J = 1 ← 0 at 115.2712 GHz from B_0 and D_e.
5. **Left out:** vibration–rotation (P/R) bands and natural widths: no open source for the formulas was found (Herzberg's texts are not open; the NIST J. Res. candidate could not be fetched in this session).
6. **Sources:** `nist-atomic-spectroscopy-compendium`, `bohr-1913`, `nist-diatomic-database` (169 entries); Huber & Herzberg and the WebBook now feed `diatomic`. Registry: `instrument:spectroscopy`.
7. **Tests:** science 765/765 (+11, `tests/science/spectroscopy.test.ts`); browser test 89 (screenshots 89a–b).

## Phase 10, Gate 10.5: thermal radiation and radiative balance (`#/spectral/thermal`), 2026-11-27

1. **View:** `#/spectral/thermal?tab=blackbody|grey|planets` (Light ▾ → Thermal radiation).
2. **Physics:** `src/core/physics/thermal/radiation.ts`: Planck's law, Wien and Stefan–Boltzmann (Planck 1914 eqs. 75–76, 109–111, 276) reusing the CODATA functions of `em.ts`, with σT⁴ checked by numerical integration; Kirchhoff's law (eq. 48) for grey bodies and net exchange; radiative equilibrium T = [S(1 − A)/4εσ]^¼ with NASA's one-fourth rule.
3. **New dataset:** `datasets/astronomical/planet-radiation.json` (41 manifests): Bond albedo, solar irradiance and black-body temperature of ten bodies from the NSSDCA fact sheets (Earth's page is preformatted text, the others tables; both parsed from tag-stripped text).
4. **Finding:** the balance formula reproduces eight printed black-body temperatures within 0.1 K. Earth's 254.0 K corresponds to an albedo of 0.306, not the listed 0.294 (255.1 K), and Pluto's 37.5 K to 0.486, not 0.72 (32.2 K). Both are shown as printed and documented.
5. **Left out:** conduction and convection (no open source read for Fourier's law or heat-transfer coefficients).
6. **Sources:** `planck-1914`, `nasa-earth-energy-budget` (171 entries). Registry: `instrument:thermal-radiation`, linked to infrared, sunlight and ten solar-system bodies.
7. **Tests:** science 771/771 (+6, `tests/science/thermalRadiation.test.ts`); browser test 90 (screenshots 90a–b).

## Phase 10, Gate 10.6: telescopes (`#/spectral/telescopes`), 2026-11-27

1. **View:** `#/spectral/telescopes?tab=airy|resolve|instruments` (Light ▾ → Telescopes).
2. **Physics:** `src/core/physics/optics/telescopes.ts`: Airy's 1835 integral by quadrature, rings by bisection and golden-section search, θ₁ = 1.2197 λ/D, two-star images, Rayleigh's slit criterion, F = N·D and plate scale; a tabulated intensity draws the 2-D images (checked against the integral to 10⁻⁴).
3. **Finding:** Airy's printed table puts the second black ring at n = 7·14 where his integral vanishes at 7.016 (I read p. 287 on the page image); the half light 1·616, first ring 3·832 and bright ring 5·12 at 1/57 agree. The view shows both.
4. **Checks:** Hubble 2.4 m at f/24: 57.6 m and 3.581″/mm (Primer 3.58″/mm); unobstructed FWHM at 500 nm 0.0442″ (Primer 0.043″, measured). JWST uses JDox's stated 131.4 m (f/20 × 6.5 m would give 130 m; the stated focal length implies 6.57 m).
5. **Sources:** `airy-1835`, `rayleigh-scientific-papers-1`, `stsci-hst-primer`, `stsci-jwst-jdox` (175 entries). Registry: `instrument:telescopes`.
6. **Tests:** science 781/781 (+10, `tests/science/telescopes.test.ts`); browser test 91 (screenshots 91a–b).

## Phase 10, Gate 10.7: atmospheric radiation and remote sensing (`#/spectral/atmosphere`), 2026-11-27

1. **View:** `#/spectral/atmosphere?tab=sky|extinction|landsat` (Light ▾ → Atmosphere & remote sensing).
2. **Physics:** `src/core/physics/atmosphere/radiation.ts`: λ⁻⁴ scattering (Rayleigh 1871), Rayleigh's 1899 extinction coefficient (eq. 14) with his inputs and with today's Loschmidt number, air mass sec z and Bouguer's law (NASA TM-82021, AERONET), the Landsat 8–9 bands.
3. **Reproduced:** Rayleigh's 83 km (computed 82.73 km) from λ = 600 nm, μ − 1 = ·0003 and Maxwell's 19 × 10¹⁸ cm⁻³; I read pp. 400–403 on the page images. With n = p/kT the length is 117.0 km.
4. **Landsat:** the USGS band table was read directly from usgs.gov (robots.txt allows; the research agent's copy had come through a summarising fetch); the values match.
5. **Sources:** `rayleigh-scientific-papers-4`, `nasa-tm-82021`, `nasa-aeronet-aod`, `usgs-landsat-bands` (179 entries); Rayleigh vol. I's usage extended to Art. 8. Registry: `instrument:atmosphere`.
6. **Tests:** science 787/787 (+6, `tests/science/atmosphere.test.ts`); browser test 92 (screenshots 92a–b). Full local browser suite at the end of Phase 10: **86/86** (12.1 min).

Phase 10 is complete. Stopping for user review.

### Production deploy and live verification (Phase 10, 2026-11-27)

- Deployed by the user (`vercel deploy --prod`), deployment `dpl_cfnxMyKqKtxHWtKi4LKHFXLzdnm4`; production serves `index-DI7Pn4N4.js` (Vercel builds the bundle itself, so its hash differs from the local build).
- Full browser suite against production: **86/86** (13.2 min). Test 77 now passes in production: the notebook export records the commit through `VERCEL_GIT_COMMIT_SHA`.

## Gate 10.8: universe map (`#/cosmic/map`), 2026-11-27

Requested by the user: “include [galaxies and other objects] in a 3d map based on their approximate locations relative to our solar system … zoom out of the solar system to see our galaxy and beyond.”

1. **View:** `#/cosmic/map?z=&sel=`, from a new **Map** chip in the Cosmic bar and a “Zoom out to the universe →” button in the solar-system body list. The Sandbox chip moved into the Gravity menu (“N-body sandbox”) so the bar keeps its width.
2. **Data:** new dataset `datasets/astronomical/universe-map.json` (42 manifests; adapter `scripts/ingestion/universe-map.ts`): McConnachie's (2012) Local Group catalogue (102 rows) and SIMBAD positions for the 175 SPARC galaxies (all resolved through the SIMBAD names VizieR attaches to SPARC), the five nebulae, Sgr A*, M87, Cygnus X-1 and NGC 4258. The CDS site answers scripts with a “Page unavailable” page; the official VizieR mirror at the CfA (no robots.txt) served everything, one request per second. Distances come from the records already bundled, never from SIMBAD.
3. **Rendering:** one group scaled by 1/R; wheel and slider change log₁₀ R from 10.6 to 27.2; layers fade with scale; points beyond the view fade. Two bugs found on screenshots and fixed: the distance fade first overflowed 32-bit floats (|r|² in metres), and a GLSL comment on a one-line shader commented out the rest of `main()`.
4. **Checks:** the Galactic transform reproduces McConnachie's printed l, b within his 0.1° rounding for 100 galaxies; Leo IV's printed l, b are 1.05° from its own RA/Dec (catalogue inconsistency, documented; RA/Dec used). Sgr A* at l, b ≈ 0; last-scattering sphere 13.9 Gpc.
5. **Sources:** `mcconnachie-2012`, `simbad` (181 entries; DOIs checked on Crossref); VizieR's usage extended.
6. **Tests:** science 793/793 (+6, `tests/science/universeMap.test.ts`); browser test 93 (screenshots 93a–c).

## Interface pass: glass, Spectral wheel, space-age Cosmic, atomic backdrop, fades (2026-11-27)

Requested by the user, taking UI notes from the Lodestar Digital Studio site (ldsbyjordan.vercel.app; its source is bundled in the page, and its stylesheet was read for the glass recipe and the radial-menu layout).

1. **Glass** (`src/ui/theme-glass.css`, loaded after `theme.css`): panels, the top bar, tab switches, hover cards and drop-down menus use the reference's recipe: 12 px blur at 160 % saturation, a diagonal white sheen, an accent glow from the top-left corner, a translucent tint, a white rim and inset highlights. Drop-down submenus use a lighter tint so the page shows through. High-contrast mode keeps opaque surfaces. The top bar's blur sits on a `::before` layer: a blurred element becomes the backdrop root of its children, which had stopped the drop-down menus from blurring the page behind them (seen on the first screenshot).
2. **Fades:** opacity-only fades (no slides, as the reference notes they cost frames on software-rendered browsers) when a view changes (a wrapper keyed by the view, not the full path, so picking a planet or an element does not remount a 3D scene), when panels, tab switches and headings mount, and when a submenu opens. Reduced motion turns them off.
3. **Spectral wheel** (`src/ui/SpectralWheel.tsx`): a glass hub at the bottom of every Spectral page opens a dial with the four groups (Atlas, Waves, Radio, Light) on an inner ring and the chosen group's views on an outer ring; the mouse wheel, the arrow keys or a click spin it. The items are the same as the top-bar menus (moved to `src/ui/navItems.ts`).
4. **Cosmic, space age:** a static starfield and two nebula glows behind the Cosmic pages, HUD corner brackets on the panels, monospace glowing panel titles, a gradient horizon line under the top bar.
5. **Atomic:** the periodic table sits on a faint pattern of outline drawings: a Bohr-style atom, a benzene ring, water, a tetrahedral molecule, electron shells and a lattice (decorative; no data).
6. **Problems found by the full browser suite and fixed:** the first run had 11 failures in 40.6 min. (a) To lay the starfield under the Cosmic pages I had also set the top bar to z-index 1, which put the page over the top-bar drop-down menus (9 tests could not click them); only the stage is lifted now. (b) Two perpetual animations (a starfield twinkle and a drifting atom pattern) repainted large areas under blurred glass every frame and slowed software rendering enough to time out 3D views; both backgrounds are now static (the reference's own notes warn about this). The universe-map label check waits up to 15 s for the first projected frame.
7. **Tests:** science 793/793; full browser suite **87/87** (16.1 min). Phase 10 screenshots regenerated with the new look.
8. **Universe map labels:** labels near the centre of the Local Group view overlapped; the map's label layer now declutters (a label that would overlap one already placed is hidden), placing the selected object first, then by kind (Sun, Galactic Centre, planets, nebulae, Local Group, galaxies, stars) and a curated order of notable objects (Andromeda, Triangulum, the Magellanic Clouds before dwarfs). The selection ring is larger and faces the camera.

### Production deploy and live verification (universe map and interface pass, 2026-11-27)

- Deployed by the user (`vercel deploy --prod`), deployment `dpl_A8EVjaCy5RYH9EmPNTsZgjJdC3Zj`; production serves `index-BQfHlCAA.js` (commit b03ad91 and the earlier Gate 10.8 and interface commits).
- Full browser suite against production: **87/87** (16.6 min).


# Phase 11 — Biologic Foundations (autonomous run through Phases 11–14, approved 2026-11-28)

## Gate 11.1: Biologic Mode and the scale of life (`#/biologic`), 2026-11-28

1. **Mode:** a fourth mode, BIOLOGIC (emerald `#5cf2a6`): route `#/biologic`, a BIOLOGIC button in the mode switch, a Biologic chip row (it grows with each gate), the `.mode-biologic` theme and the document title. The top bar still fits at 1440 px (checked in test 94).
2. **Landing portal:** the greyed-out CELLULAR placeholder (Gate 4.7) became a live **BIOLOGIC** portal, titled to match the mode switch. Its scene is the B-DNA dodecamer **1BNA**: all 486 non-water atoms from the PDB file, coloured by element and turning about the helix axis (the longest principal axis is rotated to the vertical). The first screenshot showed an unreadable cloud overlapping the title; aligning the axis fixed both. Tests 01, 18, 50 and 53 were rewritten for the live portal.
3. **View — scale of life:** 24 sizes from a water molecule to an ant on one log axis (10⁻¹⁰–10⁻² m), in eight category rows, with labels placed in collision-free lanes (the first version overlapped badly at the 640 px stage width). Ranges are bars; other sources for the same thing are faint marks. The panel lists every report with its verbatim quote, page and source, warns when sources disagree, and links to the molecule viewer and to the scale navigator. Shift-click or “compare” gives the ratio of two sizes (ranges count as their geometric mean). The Nanostructures and Microscopic levels of the scale ladder are now *educational* and route here.
4. **Data:** `datasets/biology/life-sizes.json` (adapter `curated-life-sizes.ts`, 21 items), hand-transcribed and checked on the page images of NIGMS *Inside the Cell* (archive.org leaves n8, n12, n21 = pp. 7, 11, 20), the NIGMS and nano.gov pages, the DOE chart (rotated image) and the PDB-101 flyer. `datasets/biology/pdb/*.json` + `pdb-index.json` (adapter `pdb-structures.ts`, 7 entries: 1BNA, 1MBN, 1A6M, 4HHB, 4INS, 1EMA, 1LYZ) from files.rcsb.org (CC0). 44 manifests.
5. **Findings:** NIGMS gives DNA's width as about 2 nm, nano.gov and the DOE chart 2.5 nm; both are shown. The haemoglobin crystal structure 4HHB measures 6.6 × 5.7 × 5.4 nm along its principal axes, agreeing with NIGMS's “roughly 5.5 nanometers wide”. **PubChem's robots.txt now disallows ClaudeBot** (version 2026-10-29): the molecules bundled earlier are kept, nothing new is fetched from PubChem, and ChEBI replaces it for Phase 11. Other sites found closed are listed in KNOWN_LIMITATIONS.
6. **Sources:** `nigms-inside-the-cell`, `nigms-biobeat-organelles-2021`, `nigms-biobeat-nanoparticles-2023`, `nano-gov-how-small`, `doe-scale-of-things-2006`, `pdb101-virus-structures`, `wwpdb`, `drew-1981` (189 entries; the Drew 1981 DOI checked on Crossref). Registry: `instrument:life-atlas`; `structure:mitochondrion` now routes to the atlas and *produces* ATP.
7. **Physics/biology module:** `src/core/biology/structure.ts` (principal-axis extents by cyclic Jacobi, radius of gyration); engine module *Biological* 0.1.0.
8. **Tests:** science 805/805 (+12, `tests/science/life-sizes.test.ts`); browser test 94 (screenshots 94a–c), tests 01, 18, 50, 53 updated.

## Gate 11.2: biomolecules and the genetic code (`#/biologic/molecules`), 2026-11-28

1. **View:** a Biomolecules chip; tabs Amino acids · Nucleic-acid parts · Sugars · Lipids · Genetic code. Molecule tabs show cards (IUPAC symbol or base letter, name, mass), the selected molecule in 3D (the molecule viewer's scene, embedded), its ChEBI description, and for amino acids the IUPAC symbols and their codons. The code tab draws NCBI's table (stops red, possible starts outlined, codons that differ in the other code amber), translates a DNA or RNA sequence in three frames on either strand (default: one strand of 1BNA, marked “not a gene”), and lists the codons per amino acid.
2. **Data:** `datasets/biology/biomolecules.json` (adapter `biomolecules.ts`, 45 manifests): NCBI's Standard and Vertebrate Mitochondrial codes parsed from the printed lines (one request, crawl-delay respected), eight NHGRI glossary definitions verbatim, and IUPAC-IUB Table 5 symbols joined to the bundled amino acids. NCBI's page only pairs 13 three-letter codes with letters (in its “differences” tables), so the full symbol table came from the IUPAC-IUB recommendations (web version by G. P. Moss, no robots.txt; © IUBMB/IUPAC, symbols only).
3. **Checks:** the table reproduces NHGRI's 61 + 3 codons, NCBI's three initiation codons and its four vertebrate-mitochondrial differences; the 1BNA dodecamer is self-complementary.
4. **Screenshots showed two layout bugs, fixed:** the embedded 3D canvas filled the whole panel (its container was not positioned), and a `view-switch` group inside a panel was drawn over the panel title (that class is positioned globally; chips are used instead).
5. **Sources:** `ncbi-genetic-codes`, `iupac-iub-1984` (DOI checked on Crossref), `nhgri-glossary` (192 entries). Registry: `instrument:biomolecules`; 26 sourced edges from the amino acids, bases and sugars.
6. **Tests:** science 817/817 (+12, `tests/science/genetic-code.test.ts`); browser test 95 (screenshots 95a–b).

## Gate 11.3: protein and DNA structures (`#/biologic/proteins`), 2026-11-28

1. **View:** a Structures chip; seven PDB entries in a list; the 3D view draws backbone tubes (C-alpha, or phosphorus for DNA) coloured by the file's HELIX/SHEET records or by chain, or all atoms in element colours, with ligands (haem, zinc, GFP's chromophore, O₂) always as atoms. The panel lists the entry's molecule, organism, method, resolution, deposition date and file keywords, the primary citation, every chain's deposited sequence, derived geometry, and the hetero groups. Haemoglobin links to its place on the scale of life and quotes NIGMS's width.
2. **Data:** the PDB adapter now also keeps COMPND molecules, KEYWDS, HETNAM and SEQRES (re-run from the cache). The seven primary citations' DOIs were checked on Crossref; 1MBN's (Watson 1969, *Progress in Stereochemistry*) has none.
3. **Screenshots:** organism names had lost their capitals and the chromophore's (1R,2R) descriptors had been lower-cased; both are shown as printed now, sizes to one decimal.
4. **Sources:** `watson-1969`, `vojtechovsky-1999`, `fermi-1984`, `baker-1988`, `ormo-1996`, `diamond-1974` (198 entries). Registry: `instrument:proteins` and seven `structure:pdb-*` entities with sourced edges.
5. **Also recorded (user, 2026-11-28):** the Meteorology & Climate brief is saved verbatim (`METEOROLOGY_EXPANSION_BRIEF.md`); order after Phase 14: a Computing & Engineering section (own section, built without a confirmation step; the user corrects it afterwards), then Meteorology.
6. **Tests:** science 825/825 (+8, `tests/science/pdb.test.ts`); browser test 96 (screenshots 96a–c).

## Gate 11.4: cells (`#/biologic/cells`), 2026-11-28

1. **View:** a Cells chip; tab “Eukaryote and prokaryote”: the two cells at one scale with sliders limited to the quoted ranges, clickable parts (membrane, cytoplasm, nucleus, mitochondria, ER, Golgi, lysosomes, ribosomes) with NIGMS and NHGRI definitions, sizes and volume shares, the booklet's comparison table and a volume ratio. Tab “Size and surface”: A, V and A/V of a sphere with the quoted cell sizes marked.
2. **Data:** `datasets/biology/cells.json` (adapter `cells.ts`, 46 manifests): the NIGMS Glossary page (one request; parsed, with link-spacing artefacts closed and stray alphabet headings removed — both seen in the first parse) and seven NHGRI pages, plus *Inside the Cell* quotes checked on the page images (pp. 7, 8, 33; p. 33 confirms “several thousand mitochondria — around 25 percent of the cell’s volume”).
3. **Screenshots showed three bugs, fixed:** the prokaryote's label overlapped the large cell (the drawing now reserves a label column), the scale bar's label collided with the eukaryote caption, and a panel title “Compared with a 1 µm sphere” rendered as “1 MM SPHERE” (the uppercase transform turns µ into M; the title is spelled out). Clicked SVG parts no longer show the browser's square focus ring (keyboard focus keeps a dashed outline).
4. **Sources:** `nigms-glossary` (199 entries); `nhgri-glossary` and `nigms-inside-the-cell` now also feed `cells`. Registry: `instrument:cells` and six new `structure:*` entities; the mitochondrion routes to the Cells view.
5. **Tests:** science 831/831 (+6, `tests/science/cells.test.ts`); browser test 97 (screenshots 97a–b).

## Gate 11.5: membranes and the membrane potential (`#/biologic/membranes`), 2026-11-28

1. **View:** a Membranes chip; tab “Membrane potential”: presets for resting, active and refractory nerve, sliders for P_K, P_Na, P_Cl and temperature, the outside solution from Table 7; a voltage scale with V_m and the K, Na, Cl potentials; V_m against P_Na/P_K between the two limits; Table 7 recomputed beside the observed and printed values; the sea-water potentials against the paper. Tab “Lipid bilayer”: a labelled schematic with NIGMS quotes and links to the bundled lipids.
2. **Data:** `datasets/biology/membranes.json` (adapter `curated-membranes.ts`, 47 manifests): equation (4), the internal concentrations and Table 7 in full, transcribed from the page images (pp. 66–67), and three NIGMS membrane quotes.
3. **Finding:** the paper's numbers reproduce every printed calculation within 1 mV between 14.6 and 21.5 °C (best 17.7 °C), so the temperature is a parameter with that range stated rather than a guessed value.
4. **Screenshots:** the V_m label sat on the V_Na label near the peak of the spike; it now moves to a free row. A test expectation had been guessed (+59.2) instead of computed (+59.3) — fixed, and noted as the lesson the handoff already gives.
5. **Sources:** `hodgkin-katz-1949`, `nigms-biobeat-membranes-2021` (201 entries). Registry: `instrument:membranes`, edges to the cell membrane, cholesterol, sodium and potassium.
6. **Tests:** science 838/838 (+7, `tests/science/membrane.test.ts`); browser test 98 (screenshots 98a–b).

## Gate 11.6: transport and biochemistry (`#/biologic/transport`), 2026-11-28

1. **View:** a Transport item in a new **Cell biology ▾** menu. Tabs: Diffusion (six ICT sugars; times from a ribosome to a centimetre; Fick's equation solved from a thin layer against its exact Gaussian with 300 random walkers, played on demand, not perpetually; cross-checks), Osmosis (π = cRT with van 't Hoff's quote and his R), Enzyme kinetics (Michaelis–Menten with their Fig. 4a k).
2. **Top bar:** with six Biologic chips the bar overflowed at 1440 px (seen on the screenshot: the search box squeezed, the settings button cut off). The chips are now Scale of life · **Molecules ▾** (Biomolecules, Structures) · **Cell biology ▾** (Cells, Membranes, Transport); tests 95–99 open the menus.
3. **Data:** `datasets/biology/transport.json` (adapter `curated-transport.ts`, 48 manifests), all from page images: Fick (Phil. Mag. pp. 30–31), Einstein (tr. 1926 pp. 17, 18, 62), van 't Hoff (p. 491), Michaelis & Menten (p. 344, Fig. 4a), ICT V (pp. 63, 71).
4. **Findings:** Fick prints his equation with a minus sign (the ICT form has none; both shown). Einstein's 1905 example is reproduced (0.795 µm in 1 s). Sucrose's ICT coefficient agrees with Thovert's value quoted by Einstein. van 't Hoff's numbers give PV/T = 845.24, not his printed 845.05. The first solver kept mirrored ghost nodes, which did not conserve the plain sum (+0.9 %); it now moves flux only between cells.
5. **Sources:** `fick-1855`, `einstein-brownian-1926`, `van-t-hoff-1887`, `michaelis-menten-1913`, `ict-1929` (206 entries; four DOIs checked on Crossref, Michaelis–Menten has none). Registry: `instrument:transport`.
6. **Tests:** science 849/849 (+11, `tests/science/transport.test.ts`); browser test 99 (screenshots 99a–b); tests 94–99 pass together.

## Gate 11.7: plants and microorganisms (`#/biologic/plants`), 2026-11-28 — Phase 11 complete

1. **View:** a Plants & microbes chip. Tab Photosynthesis: NIGMS and NASA quotes, the ×6 link to the balanced curated reaction, chlorophyll a and b maxima drawn over a 5772 K black-body model of sunlight, a table of maxima with ε and photon energies, quantum yields. Tab Microorganisms: viruses, bacteria, a red blood cell and plant cells on one log axis with their quotes and definitions.
2. **Data:** `datasets/biology/plants.json` (adapter `curated-plants.ts`, 49 manifests): chlorophyll points and NASA's equations. The `cells` adapter now also parses seven more NIGMS terms and NHGRI's virus and bacteria pages; NHGRI definitions are now taken from the paragraph under each page's “Definition” heading (the bacteria page has no zero-width marker, and some pages add a narration transcript that must not be quoted).
3. **Licence decision:** OMLC's chlorophyll spectra carry no licence, so only the stated maxima (and two red maxima located in the data, labelled as such) are shown; the curves are not bundled.
4. **Screenshots:** the sunlight plot's y-axis began at 0.7 (an exaggerated curve) and the maxima labels collided; the axis now starts at 0 and a colour key replaces the labels. The “Plant cells” label overlapped its bar at the right edge; labels near the edge now sit left of the bar.
5. **Sources:** `omlc-photochemcad` (Du et al. 1998 DOI checked on Crossref), `nasa-carbon-cycle-2011` (208 entries). Registry: `instrument:plants`; `process:photosynthesis` now routes to the view (planned since Phase 4). Glycolysis and respiration stay planned (no open source for the pathway or ATP yield).
6. **Tests:** science 854/854 (+5, `tests/science/plants.test.ts`); browser test 100 (screenshots 100a–b).

**Phase 11 summary:** Biologic Mode with seven views (scale of life, biomolecules and the genetic code, PDB structures, cells, membranes, transport, plants and microbes); 8 new datasets (49 manifests), 27 new Source-index entries (208), science tests 793 → 854, browser tests 94–100. Findings worth keeping: PubChem now refuses ClaudeBot; Hodgkin & Katz's Table 7 is reproduced within 1 mV for 14.6–21.5 °C; Einstein's 1905 example reproduced; van 't Hoff's printed R differs from his own numbers (845.05 vs 845.24); 4HHB's size agrees with NIGMS's 5.5 nm.

### Fix after Gate 11.7 (2026-11-28)

The Gate 11.7 commit went in with three failing science tests (the commit command did not stop on a failing test run; from now on the test result is checked before committing). Causes: (1) **a real bug** — the relationship explorer's `entityMode` knew only Atomic, Cosmic and Spectral, so every Biologic entity since Gate 11.1 was coloured and labelled “Spectral”; a Biologic mode (emerald) is added. (2) Two tests still expected `process:photosynthesis` to be planned; they now expect it to open the Biologic view and check that glycolysis stays planned. (3) The inline-citation scanner read a quoted word inside a ternary in `SourceLinks ids` as a source id; the ids are now named constants. Science 854/854.

### Full browser suite at the end of Phase 11 (2026-11-28)

`npm run test:e2e`: **91 passed, 3 failed** (18.2 min). Two failures were stale expectations (tests 41 and 73 still expected photosynthesis to be a *planned* process; it opens the Biologic plants view since Gate 11.7 — they now check that glycolysis is still planned). One was **a real bug**: with a fourth mode the phone top bar was 442 px wide on a 390 px screen (test 67). On screens up to 900 px the four-button mode switch is now replaced by one menu chip showing the current mode (ATOMIC/COSMIC/SPECTRAL/BIOLOGIC ▾). Tests 18, 41, 53, 67 and 73 re-run: all pass. **94/94** browser tests now pass.

# Phase 12 — Human Anatomy & Physiology

## Gate 12.1: the human body (`#/biologic/body`), 2026-11-28

1. **Research:** two agents (12.1–12.3 and 12.4–12.6); notes in `research/SOURCE_NOTES_PHASE12.md`. **BodyParts3D changed its licence to CC BY 4.0 on 2025-02-27**, which makes a real anatomical model usable. NCI SEER text is free of copyright; NHLBI text is public domain (its images are not); NIDDK text is copyright free.
2. **Model:** `scripts/blender/build_body.py` (Blender 4, headless, 39 s) joins and decimates eleven organs from the 1,258-file “partof” set into `public/models/body-organs.glb` (3.2 MB, lazy-loaded). Two problems found in the data and handled: the FMA “skeletal system” list held eye structures and no leg bones (the skeleton is now chosen by bone names: 202 files, 1.71 m); the lung lists are bronchial trees and vessels only (labelled as such).
3. **View:** a **Body ▾** menu (Human body). Organs coloured by system, click to select, checkboxes to hide, “Isolate selected” frames the organ with the camera (the first screenshot showed a tiny kidney mid-screen). The panel gives quoted facts and the model's own size and volume from the full-resolution headers.
4. **Top bar:** adding the Body menu overflowed the bar at 1440 px (the settings button was cut off on the screenshot); Plants & microbes moved into the Cell biology menu, and test 101 now checks the bar fits.
5. **Data:** `datasets/biology/body.json` (adapter `curated-body.ts`, part lists in `scripts/ingestion/data/`; 50 manifests). Finding: the model's kidney is 10.4 × 5.7 × 4.7 cm, SEER says about 12 × 6 × 3 cm; both shown.
6. **Also:** `src/core/biology/hodgkinHuxley.ts` and its tests landed early (for Gate 12.4); the science test for the body reads the GLB itself (a Node type reference was needed for `tsc -b`, which first broke the build).
7. **Sources:** `bodyparts3d` (Mitsuhashi et al. 2009, DOI checked), `seer-training`, `nhlbi`, `niddk` (212 entries). Registry: `instrument:body` and eleven `structure:organ-*` entities.
8. **Tests:** science 867/867 (+6 body, +7 Hodgkin–Huxley); browser test 101 (screenshots 101a–b); test 100 updated for the moved menu item.

## Gates 12.2–12.3: movement (`#/biologic/movement`) and circulation and breathing (`#/biologic/circulation`), 2026-11-28

Committed together: the two views share one dataset (`physiology`) and one module (`src/core/biology/physiology.ts`).

1. **Views:** Body ▾ gains Movement (Bones · Muscle) and Circulation & breathing (Heart · Flow in tubes · Blood · Lungs). Hill's curve and power with sliders for a/P₀, b/l and the load; a heart-rate slider with cycle length and implied stroke volume; a blood-pressure classifier over NHLBI's table; Poiseuille's D⁴ law with his tube table; a bar chart of where the blood is.
2. **Data:** `datasets/biology/physiology.json` (adapter `curated-physiology.ts`, 51 manifests): SEER and NHLBI quotes checked against the saved pages; Hill's equations and constants and Poiseuille's law and coefficients read on page images.
3. **Findings:** Poiseuille's printed mean k″ (2495,224) is not the mean of his seven printed values (2495.37). Hill's a/P₀ ≈ 0·25 is confirmed twice on the page images (p. 160 directly; p. 161 by the heat P₀x/4).
4. **Screenshots:** the path-of-blood boxes clipped two-word names (now two lines); the NHLBI citation link read “National Heart” (the link shows the author field up to its first comma; NHLBI's field is now “NHLBI”). A units sentence for Poiseuille went beyond the page and was narrowed to what the page states.
5. **Sources:** `hill-1938` (DOI checked on Crossref), `poiseuille-1840` (214 entries). Registry: `instrument:movement`, `instrument:circulation`; `process:muscle-contraction` now routes to the Hill curve.
6. **Tests:** science 875/875 (+8, `tests/science/physiology.test.ts`); browser tests 102–103.

## Gate 12.4: nerves (`#/biologic/nerves`), 2026-11-28

1. **View:** Body ▾ Nerves. Tab Action potential: the Hodgkin–Huxley equations integrated live (RK4, 0.01 ms) with sliders for the stimulus, temperature, ḡ_Na and ḡ_K; plots of −V, the gates and the currents; a threshold preset; Table 3 beside the run. Tab Conduction: eq. (34) with sliders for radius and axoplasm resistivity; Hursh's cat-fibre line; neurons, myelin and the neuron count.
2. **Data:** `datasets/biology/nerves.json` (adapter `curated-nerves.ts`, 52 manifests). The equations, Table 3 and p. 528 were checked by hand on the page images (as were Hursh's p. 136 and the Azevedo abstract on Crossref).
3. **Findings:** V_l = −10·599 mV zeroes the resting current with the printed equations (printed −10·613). The calculated 18·8 m/s is reproduced from the printed fibre.
4. **Caught before commit:** a sentence calling the squid axon unmyelinated and Hursh's fibres myelinated had no source read; replaced by what Hursh's page states (proportional to diameter, square-root and square laws rejected).
5. **Sources:** `hodgkin-huxley-1952`, `hursh-1939`, `azevedo-2009`, `nigms-biobeat-nerve-2022` (218 entries; DOIs checked on Crossref). Registry: `instrument:nerves`.
6. **Tests:** science 879/879 (+4 nerves; the 7 Hodgkin–Huxley tests landed with 12.1); browser test 104.

## Gates 12.5–12.6: organ systems (`#/biologic/systems`), 2026-11-28

Committed together (one view with six tabs, one dataset).

1. **View:** Body ▾ Organ systems: Kidneys · Digestion · Hormones · Blood & lymph · Skin · Reproduction. Quoted facts with “Worked out (derived)” panels; digestion cards link to the amino acids, lipids and sugars.
2. **Data:** `datasets/biology/systems.json` (adapter `curated-systems.ts`, 53 manifests): NIDDK and SEER quotes checked against the saved pages; NIST SP 811 Appendix B.9 read for the quart, cup and pound (nist.gov robots.txt checked first).
3. **Finding:** NIDDK's “about 150 quarts” a day and “about a half cup … every minute” come to 99 and 118 mL/min — the same order, 20 % apart; both shown.
4. **Sources:** `nist-sp811` (219 entries); NIDDK's link label shortened to “NIDDK”. Registry: `instrument:systems`.
5. **Tests:** science 884/884 (+5, `tests/science/systems.test.ts`); browser test 105.

## Gate 12.7: from the body to a molecule (`#/biologic/zoom`), 2026-11-28 — Phase 12 complete

1. **View:** Body ▾ From body to molecule: a log slider (and an on-demand zoom) from 2.4 m to 0.4 nm; the stops listed with their quoted sizes; the right panel quotes the stop in focus and links to its view and to the scale navigator at the same width.
2. **Screenshots caught three problems, fixed:** the first version nested the mitochondrion inside the nucleus (anatomically wrong even as a schematic; side branches now sit in the cytoplasm and recentre the view when chosen); the list showed DNA as 20 nm (the drawn length) instead of its quoted 2 nm width (stops now carry their quoted size); a panel title “A cell (30 µm example)” rendered as “30 MM” — fixed once in the shared Panel component (µ stays lower-case in every title).
3. **Scale ladder:** the Human-scale level (planned since Gate 8.1) is now *educational* and routes to the body.
4. **Tests:** science 888/888 (+4, `tests/science/zoom.test.ts`); browser test 106.

**Phase 12 summary:** Body ▾ menu with seven views (human body in 3D, movement, circulation and breathing, nerves, organ systems, body-to-molecule zoom); a real anatomical model (BodyParts3D, CC BY 4.0) decimated in Blender; Hodgkin–Huxley simulated live; 6 new datasets (53 manifests); 15 new Source-index entries (219); science tests 854 → 888; browser tests 101–106. Findings: Poiseuille's printed mean coefficient, Hodgkin–Huxley's leak potential (−10·599 vs −10·613), NIDDK's two filtration figures 20 % apart, the model kidney against SEER's size.

## Gates 13.1–13.3: senses and signals (`#/biologic/senses`), 2026-11-28

1. **View:** a new Biologic menu, Waves & life ▾ → Senses & signals, with four tabs. *The eye:* NEI's path of light; Gullstrand's reduced eye gives the retinal image of an object; Helmholtz's diffraction circle against pupil size. *Colour:* cone and luminosity peaks on the spectrum. *Hearing:* NIDCD's path of sound, Fletcher & Munson's intensity level, NIDCD's 70/85 dBA. *Heart signals:* Waller (1887), Einthoven's triangle with a draggable heart vector.
2. **Read on page images:** Helmholtz pp. 95, 96, 178, 196, 355; Fletcher & Munson p. 381; Waller p. 229; Einthoven pp. 854, 859. CVRL peaks recomputed from its files (566/541/441, 555, 506 nm).
3. **Findings:** Helmholtz's δ = 0.0122 mm for a 2 mm pupil reproduced exactly. Listing's printed reduced-eye radius 5.1248 mm vs 5.0674 mm from his own focal lengths (ratio exactly 103/77) — both shown.
4. **Sources (+10, 229 entries):** helmholtz-1924, cvrl, stockman-sharpe-2000, nei-how-eyes-work, nei-rods-news, nidcd-how-we-hear, nidcd-noise, fletcher-munson-1933, waller-1887, einthoven-1912 (DOIs checked on Crossref). CVRL serves no HTTPS: its http link is the one documented exception in the source-index test.
5. **Research for 13.4–13.6 saved** (`research/SOURCE_NOTES_PHASE13.md` §B): NIST X-ray tables (SRD 126 — copyrighted compilation: only selected values will be used), FDA ultrasound and MRI guidance, 47 CFR §1.1310 SAR limits, the Gabriel tissue model (IFAC-CNR, free for scientific use), Abbe 1873, de Broglie & Flint 1930, NBS SP 525 tissue sound speeds. Blocked: nibib.nih.gov (robots disallow all), fcc.gov and dtic.mil (403), ecfr.gov (CAPTCHA; govinfo copy used).
6. **Tests:** science 897/897 (+9, `tests/science/senses.test.ts`); browser test 107.

## Gates 13.4–13.7: imaging the body (`#/biologic/imaging`), 2026-11-28 — Phase 13 complete

1. **View:** Waves & life ▾ → Imaging the body, six tabs: Radio & tissue (Gabriel ε′ and σ curves, skin depth, SAR, FCC limits), Microscopes (Abbe; electron wavelength for NCI's 120/200/300 kV microscopes), X-rays (transmission and half-value layers; μ/ρ plot with lead's K edge), Ultrasound (SP 525 table, Rayleigh echo between tissues, echo time, FDA derating), MRI (proton frequency against field, FDA criteria), Compare (all wavelengths on one axis).
2. **Read on page images:** USAF handbook Table 3.4 equation images; Abbe pp. 455–456; de Broglie p. 97; Rayleigh p. 82; SP 525 p. 24.
3. **Findings:** the handbook's 67.52 assumes c = 3 × 10⁸ m/s (67.48 exact); de Broglie's “always small” term is 0.29 at 300 kV; Rayleigh's ·3402 is a truncated ·3403.
4. **Sources (+13, 242 entries):** nist-srd126, ifac-gabriel, gabriel-1996, usaf-rf-dosimetry-1986, cfr-47-1-1310, nbs-sp525, fda-ultrasound-guidance-2023, fda-ultrasound-imaging, fda-mri, fda-mri-significant-risk-2014, abbe-1873, debroglie-1930, nci-nice-cryoem. Licensing: NIST SRD 126 is a copyrighted compilation — 42 values only, with the required notice (flagged for the owner in STATUS_REPORT); de Broglie 1930 is public domain in the US only — equations only.
5. **Screenshots caught two problems, fixed:** overlapping labels in the wavelength chart; the lead curve drawn straight across its K edge (the two edge values are now included).
6. **Tests:** science 915/915 (+18, `tests/science/imaging.test.ts`); browser test 108.

**Phase 13 summary:** a Waves & life ▾ menu with two views (senses and signals; imaging the body) covering vision, colour, hearing, the ECG, radio waves in tissue, microscopes, X-rays, ultrasound and MRI. 23 new sources, all formulas read on page images or in official text; findings where a printed number disagrees with its own data (Listing's radius, the handbook's 67.52, de Broglie's “small” term, Rayleigh's ·3402), and Helmholtz's blur reproduced exactly.

## Gates 14.1–14.3: particles, quantum lab, nuclei (`#/atomic/particles`, `/quantum`, `/nuclei`), 2026-11-28

1. **Menus:** Atomic gains Subatomic ▾ (Particles, Quantum lab, Nuclei); to keep the 1440 px bar fitting, Molecules and Reactions move into Chemistry ▾ and Materials and Phases into Matter ▾.
2. **Views:** Particles (PDG 2025 values, mass ladder, DOE sentences); Quantum lab (bound states for box, oscillator, double and finite wells solved live; tunnelling transmission); Nuclei (binding energy per nucleon with the fit and published coefficients, chart of nuclides, U-238 series, pp chain).
3. **Read on page images:** Schrödinger 1928 pp. 27, 31; Mott 1930 pp. 59, 61; Condon & Morse 1929 pp. 225–226; Gurney & Condon 1928; Wing 1964 p. 11 Table 1.
4. **Findings:** Condon & Morse eq. (68.5) sign misprint; Mott's 1-cm example (3·2 vs 5.5 × 10⁻⁷ V); Green's 1954 coefficients still fit modern masses to 3.4 MeV rms.
5. **Sources (+9, 251 entries):** pdg-2025, doe-explains, schrodinger-1928, mott-1930, condon-morse-1929, gurney-condon-1928, wing-anl-6814, usgs-ofr-2004-1050, nasa-msfc-solar-interior. The Bardeen–Press–Teukolsky Kerr ISCO formula could not be read in an open copy (ADS bot challenge; IOP off-limits): its code was removed rather than shipped unverified.
6. **Tests:** science 944/944 (quantum, nuclear, plus the plasma and GR/RAR cores for 14.4–14.6); browser tests 109–111. End-of-Phase-13 full suite: 102/102.

## Gates 14.4–14.6: plasma, tests of relativity, dark matter or modified gravity (`#/cosmic/plasma`, `/grtests`, `/models`), 2026-11-28

1. **Menus:** Cosmic gains Stars ▾ Plasma & solar wind, Gravity ▾ Tests of relativity, Universe ▾ Dark matter or modified gravity?; Galaxies and Nebulae fold into Galaxies ▾ (the Cosmic bar overflowed 1440 px by 58 px; phase 6 tests updated).
2. **Read on page images:** NRL Formulary pp. 28–29, 40, 42; Einstein 1916 p. 822; Friedmann 1922 p. 381. RAR paper's selection read in its text (PDFKit).
3. **Findings:** the bundled SPARC tables reproduce the RAR paper's sample (153 galaxies; 2,696 vs 2,693 points) and its g† within 3 % (1.16 vs 1.20 × 10⁻¹⁰); Einstein's 43″ reproduced with today's elements (42.98″); his 1.7″ is 1.751″ unrounded.
4. **Sources (+9, 260 entries):** nrl-formulary-2009, divine-1973, noaa-swpc-solar-wind, einstein-1916, gpb-stanford-2011, cen-song-2025, mcgaugh-2016-rar, famaey-mcgaugh-2012, friedmann-1922.
5. **Screenshot helper:** Phase 14 captures wait for the heading and disable finite animations (blank frames were an entry animation caught mid-way, not an app fault).
6. **Tests:** browser tests 112–114.

## Gate 14.7: unified pathways, 2026-11-28 — Phase 14 complete

1. **Five pathways** through the new records (see SCIENTIFIC_MODELS §65); every step an existing, sourced relationship. The sunlight → photosynthesis reaction edge cites a reaction record, not the Source index, so the first pathway goes through the photon instead.
2. **Fix (pre-existing since Gate 8.6):** the pathway stop card is a `.panel` (absolutely positioned) and covered the “All steps with their sources” line; it now flows in the page.
3. **Tests:** pathways and relations science tests; browser test 115.

**Phase 14 summary:** Subatomic ▾ (particles, quantum lab, nuclei) in Atomic; plasma, tests of relativity and a dark-matter/modified-gravity comparison in Cosmic; five pathways. 18 new sources. Findings: Condon & Morse's (68.5) sign misprint; Mott's 1-cm example; Einstein's 43″ and 1.7″ reproduced (42.98″, 1.751″); the 2016 radial-acceleration sample and g† reproduced from the bundled SPARC tables (2,696 vs 2,693 points; 1.16 vs 1.20 × 10⁻¹⁰). Left out: the Kerr ISCO formula (paper not openly readable), the full CNO cycle and per-step solar-neutrino energies (no open source), a “three generations” statement (no public-domain source).

**End-of-Phase-14 full browser suite (2026-11-28):** 107/109 on the first run; the two failures were stale tests, not app faults: test 59 (“Relativity” now also matches “Tests of relativity” — made exact) and test 73 (the “lensing” link search now finds 3 relationships, including Gate 14.5's). Both pass after the update: **109/109**.

## Gate 15.1: Engineering mode, bits and logic (`#/engineering`), 2026-11-28

1. **Fifth mode:** ENGINEERING in the mode switch (coral accent), mobile mode menu, relationship-explorer colour; the landing page becomes a 3 + 2 grid with an Engineering portal (a live 5-bit adder in SVG). On phones the landing now scrolls and its source caption sits below the portals (it used to overlap the last one).
2. **View:** Bits (byte converter, binary prefixes), Logic gates (live inputs, truth tables, NAND universality), Adding (4-bit ripple-carry adder showing every carry).
3. **Read on page images:** Boole 1854 p. 31; Shannon 1938 p. 714; Shannon 1948 p. 380. Research for all of Phase 15 saved (`research/SOURCE_NOTES_PHASE15.md`). Licence notes: Intel's terms forbid bots (Moore 1965 not used); LBNL 2024 report blocked (eScholarship 403) — its 2025 update (CC BY 4.0) is available; Unicode Core Spec not redistributable (facts only).
4. **Sources (+4, 264 entries):** boole-1854, shannon-1938, shannon-1948, nist-binary-prefixes.
5. **Tests:** science `logic.test.ts` (9); browser test 116; landing tests 01 and 18 updated for five portals.

## Gate 15.2: semiconductors and the junction (`#/engineering/semiconductors`), 2026-11-28

1. **View:** Engineering → Semiconductors: a live p-n junction (bias, saturation current, temperature) from Shockley's eq. (4.13); silicon's element data, band gap and 1107 nm edge; links to element 14 and the infrared in Spectral.
2. **Sources (+2, 266 entries):** shockley-1949 (page images pp. 435, 460), tudelft-ocw-solar. Searched for a US-government silicon band-gap source: the DOE page survives only in the UNT web archive, whose robots.txt disallows ClaudeBot — not used.
3. **Tests:** science `semiconductor.test.ts` (5, including hc/1.12 eV = 1107 nm); browser test 117.

## Gate 15.3: integrated circuits (`#/engineering/chips`), 2026-11-28

1. **View:** Engineering → Chips: Kilby's and Noyce's 1959 patents with their original drawing sheets; the planar process stepped through in Noyce's words with a schematic cross-section.
2. **Read:** both patents on the USPTO page images (rendered with PDFKit); the research agent's Google Patents OCR text was replaced by image readings.
3. **Sources (+2, 268 entries):** kilby-us3138743, noyce-us2981877.
4. **Tests:** browser test 118.

## Gate 15.4: the stored-program computer (`#/engineering/architecture`), 2026-11-28

1. **View:** Engineering → Hardware ▾ → Stored-program computer: pick a program, step or run it; memory words marked order/number; the part acting on each cycle lights up; von Neumann's five parts quoted. The Engineering bar now groups Semiconductors, Chips and the computer under Hardware ▾ (the 1440 px bar overflowed by 5 px).
2. **Read on page images:** EDVAC report pp. 3, 6, 7, 85.
3. **Sources (+1, 269 entries):** vonneumann-edvac-1945.
4. **Tests:** science `cpu.test.ts` (6); browser test 119.

## Gate 15.5: information and encoding (`#/engineering/information`), 2026-11-28

1. **View:** Engineering → Information: type text, see code points, UTF-8 bytes (colour by length), entropy vs UTF-8 bits per character, Unicode version totals. (Planned as “memory and storage”; no open source with measured memory or storage figures was found, so the gate covers how information is measured and encoded instead.)
2. **Sources (+1, 270 entries):** unicode-standard; shannon-1948 extended (Theorem 2, page image).
3. **Tests:** science `information.test.ts` (6); browser test 120.

## Gate 15.6: networks (`#/engineering/network`), 2026-11-28

1. **View:** Engineering → Information ▾ → Networks: a packet (header octets coloured by field, hop-by-hop TTL and checksum), TCP's handshake (RFC 9293 Figure 6), Shannon capacity calculator. The Engineering bar now reads Information ▾ (Bits & logic, Information & encoding, Networks) · Hardware ▾ (it overflowed 1440 px by 6 px).
2. **Sources (+2, 272 entries):** rfc-791, rfc-9293; shannon-1948 extended (Theorem 17). “Protocol 6 is TCP” was removed — neither RFC states it.
3. **Tests:** science `network.test.ts` (6); browser test 121.

## Gate 15.7: data centres (`#/engineering/datacentres`), 2026-11-28 — Phase 15 complete

1. **View:** Engineering → Hardware ▾ → Data centres: LBNL's 2024 estimate and forecasts to 2030 with the uncertainty range, PUE definition and averages, a one-facility calculator.
2. **Sources (+1, 273 entries):** lbnl-2025-datacentre (the 2024 report itself was behind eScholarship's bot block; the 2025 Update supersedes it).
3. **Tests:** science `datacentre.test.ts` (4); browser test 122.

**Phase 15 summary:** a fifth mode, ENGINEERING, with its landing portal and seven views: bits and logic, semiconductors, integrated circuits, the stored-program computer, information and encoding, networks, data centres. 17 new sources, read on page images, patent images, RFC text or born-digital PDFs. Findings: von Neumann's own preference that output go from M, not C (our machine differs, said so); LBNL's PUE and infrastructure-share statements agree; Shannon's (1938) hindrance convention stated as he wrote it. Left out: Moore 1965 (terms forbid bots), MOSFET/CMOS (no open primary source yet), memory-hierarchy figures, device 3D models (no open technical documentation).

## End-of-Phase-15 browser suite and the top-bar fix, 2026-11-28

105/116 on the first run: the ENGINEERING mode button made the top bar up to 115 px too wide in every other mode, pushing Scale and Notebook off-screen (11 tests). Fix: below 1700 px the wordmark gives way to the logo and the mode buttons tighten (`.topbar.many-chips`). All 11 pass after the fix. Lesson: a change to the shared top bar needs the full suite, not just its own phase's tests.

## Phase 16: machine learning and AI (`#/engineering/ai`), 2026-11-28

1. **View:** Engineering → AI ▾ with six tabs: History, Training (a network trained live), Attention (and scaling), Models (disclosed vs not disclosed), Agents (educational coding-agent walk-through), Energy (labelled figures and a calculator).
2. **Read:** page images for Cauchy 1847, Turing 1950, Rosenblatt 1961, Widrow & Hoff 1960; rendered pages for Vaswani eq. (1) and DDPM eq. (2); text layers for the other arXiv papers. Licences: arXiv non-exclusive papers quoted briefly; CC BY / CC BY-SA papers; MCP spec Apache-2.0; d2l CC BY-SA 4.0. Not used: OpenAI and Meta web pages (terms / notice), IEA (bot wall), Nielsen's book (withdrawn by its author, Nov 2026).
3. **Sources (+21, 294 entries).**
4. **Tests:** science `neural.test.ts` (6); browser test 123.

## End-of-Phase-16 browser suite: 116/117, 2026-11-28

Test 93 (universe map) failed: the fly-to zoom eased by 8 % per frame, so at the low frame rates SwiftShader reaches on that heavy scene a preset took far longer than the test allowed. Fixed by time-based easing (τ ≈ 0.2 s, same feel at 60 fps) — a real fix for slow devices too. Passes.

## Phase 17: machines and electricity (`#/engineering/machines`), 2026-11-28

1. **View:** Engineering → Hardware ▾ → Machines & electricity, six tabs: Circuits, Mechanisms, Engines, Grid, Batteries & EVs, Control.
2. **Read on page images:** Ohm 1827; Kirchhoff (1882 reprint of 1845); Faraday 1832, 1852; Carnot 1824; Rankine 1859, 1869; Archimedes (Heath 1897); Maxwell 1868. U.S. government pages: EIA, DOE, EPA, AFDC, NASA Glenn.
3. **Findings:** Rankine's absolute zero (−461·2 °F); DOE and EPA disagree on gasoline-vehicle efficiency (about 30 % vs 16–25 %).
4. **Sources (+20, 314 entries).**
5. **Tests:** science `machines.test.ts` (11); browser test 124.

## Phase 18: spacecraft and space systems (`#/engineering/space`), 2026-11-28

1. **View:** Engineering → Hardware ▾ → Spacecraft & space systems, seven tabs: Spacecraft, Rockets, Orbits, Power, Radio, Pointing, Data.
2. **Research:** two source agents (notes `research/SOURCE_NOTES_PHASE18A.md`, `…18B.md`); robots.txt logged for every host.
3. **Findings shown:** NASA Glenn MR 10 vs 9.19; Yuen 3.05 vs 3.20 × 10⁻¹⁶ W; Voyager HGA 47 vs 48.1 dBi; received power 10⁻¹⁶ vs 10⁻²² W; Voyager power vs Pu-238 decay; Hubble 483 vs 560 km and 5,500 vs >5,200 W; Landsat 9 750 vs 740 scenes; Voyager 1 instruments on (4 vs 2).
4. **Sources (+32).** **Tests:** science `spaceflight.test.ts` (10); browser test 125.

## Phase 19: integrated systems (`#/engineering/systems`), 2026-11-28

1. **View:** Engineering → Hardware ▾ → Build a system, four tabs: Spacecraft, Data centre, Electric car, All systems.
2. **New sourced values:** Yuen (1982) p. 5 read on the page image: N₀ = kT = 3.933 × 10⁻²² W/Hz at 28.5 K; L = 0.7; 2.05 × 10⁵ Hz needed for 115.2 kbit/s.
3. **Check shown:** the chain predicts 275 bit/s for Voyager 1 in 2024; NASA's normal rate is 160 bit/s.
4. **Tests:** science `systems.test.ts` (7); browser test 126.

5. **Fix:** the new `instrument:systems` id collided with the biology "Organ systems" entity and overwrote its route; renamed to `instrument:eng-systems`, and `registerEntity` now records route conflicts, with a test that there are none.

## Phase 20 (Meteorology): Gates 20.1–20.3, 2026-11-28

1. **Mode:** METEOROLOGY joins the top bar (fits at 1440 px, tested) and the landing page (six portals in a 3 × 2 grid; the portal draws the USSA 1976 temperature profile). Shared depth switch.
2. **Views:** `#/meteorology` (structure), `#/meteorology/air` (humidity, stability), `#/meteorology/radiation` (energy budget, absorption, forcing, ozone, aerosols).
3. **Research:** three agents (notes `research/SOURCE_NOTES_PHASE20A/B/C.md`). Refused hosts logged: www.noaa.gov/jetstream (403), journals.ametsoc.org (403), www.ipcc.ch copyright page (403 → IPCC not used), ozonewatch (TLS), spc (robots), pluto.jhuapl.edu, gpm.nasa.gov (504).
4. **Sources (+13).** **Tests:** science `atmosphere.test.ts` (13); browser 127–129.

## Gate 20.4: wind, clouds and water (`#/meteorology/motion`), 2026-11-28 — Phase 20 complete

Six tabs: Coriolis (turntable), convection (Rayleigh 1916), clouds (ten genera), rain, water cycle, circulation. A research misreading caught on the page image (Rayleigh's κ = 5ν/2, not 4ν/3), corrected in the notes. Sources +10; science `motion.test.ts` (8); browser 130.

## Phase 21: Gates 21.1 (storm laboratory) and 21.2 (Earth weather atlas), 2026-11-28

1. **Storm lab** `#/meteorology/storms`: seven storm types; official scales and indices; five observed cases from NHC/NWS reports.
2. **Atlas** `#/meteorology/atlas`: 19 layers on map and globe; data pipeline `scripts/ingestion/atlas-grids.ts` (from `/tmp/vv-research/p21/a/grids`).
3. **Top bar:** Meteorology sections grouped into Atmosphere ▾ and Weather ▾ menus (six chips overflowed at 1440 px — caught in the screenshots; fit now asserted in tests 131–132).
4. **End-of-Phase-20 suite:** 124/124.
5. **Sources +27.** **Tests:** `storms.test.ts` (7), `grid.test.ts` (6); browser 131–132.

## Gate 21.3: regional climates (`#/meteorology/climates`), 2026-11-28

Sixteen NOAA stations, Köppen–Geiger by Peel et al. (2007), eight causes with station pairs, a what-if reclassifier. Finding: LAX is BSk by the criteria. Sources +10; science `koppen.test.ts` (6); browser 133.

## Gate 21.4: temperature record (`#/meteorology/records`), 2026-11-28 — Phase 21 complete

NOAAGlobalTemp 1850–2025 with running mean, ranks, decade means and a reference-period switch; links to the storm lab's observed extremes. Sources +2; browser 134.

## Phase 22: weather on other worlds (`#/meteorology/planets`), 2026-11-28

Library, comparison engine and energy tab; two research agents (notes 22A/22B); 39 sources. End-of-Phase-21 suite 128/128. Science `planets.test.ts` (9); browser 135.

## Gate 23.1: ice ages and the orbit (`#/meteorology/iceages`), 2026-11-28

Three NOAA paleo files, NASA explanations; a new “Climate ▾” menu in the Meteorology top bar. Sources +9; `paleo.test.ts` (4); browser 136.

## Gate 23.2: climate through geological time (`#/meteorology/deeptime`), 2026-11-28

Twenty events, the time scale, proxies. Sources +20; browser 137.

## Gate 23.3: oceans, ice and biomes (`#/meteorology/oceans`), 2026-11-28 — Phase 23 complete

Five tabs; NOAA's 2026 switch to the Relative ONI reflected; HOT pH from every cruise. Sources +26; `ocean.test.ts` (5); browser 138.

## Gate 24.1: human activities (`#/meteorology/human`), 2026-11-28

Five tabs (carbon, sectors, electricity, heat & water, interventions); every effect tagged by kind of impact. Full browser suite before the gate: 132/132. Sources +16; `human.test.ts` (13); browser 139.

## Gate 24.2: future climate (`#/meteorology/future`), 2026-11-28 — Phase 24 complete

Five tabs (kinds of statement, warming levels, sea level, ocean & ice, known & unknown); a projection notice on every projection panel. NCA5 read from NOAA's mirror PDFs (site offline). Sources +13; `future.test.ts` (13); browser 140.
