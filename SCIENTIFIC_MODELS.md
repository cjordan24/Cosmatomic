# Scientific models, approximations and validation

Every model below states its assumptions, validity range and the test that checks it (`npm test` — **73 tests, all passing**). Measured errors are from `tests/science` against the stated references.

## 1. Units, constants, time
* **Constants:** CODATA 2018 (exact SI-defining constants marked exact); IAU 2012 B2 (au), IAU 2015 B2/B3 (pc, nominal R☉, GM☉, L☉, GM⊕). Solar mass derived as GM☉/G (uncertainty dominated by G, 2.2×10⁻⁵).
* **Units:** each unit carries a 7-component SI dimension vector; conversions between unlike dimensions throw `DimensionError`. Affine °C handled. *Tests:* au, pc↔ly, eV, Å, u→MeV (931.494 10), M☉, temperature, dimension errors.
* **Time:** internal time is Julian Date **TDB** (JPL ephemeris time). UTC display uses the IERS leap-second table (1972–2017, TAI−UTC = 37 s since 2017) plus 32.184 s; before 1972 a fixed 42.184 s is used (true ΔT varied ≈ −3 … +40 s over 1800–1972 — display only). *Test:* J2000.0 = 2000-01-01 11:58:55.816 UTC (±1 s).

## 2. Atomic structure
* **Ground-state configurations** are taken verbatim from PubChem/NIST (so experimental exceptions such as Cr 3d⁵4s¹, Cu 3d¹⁰4s¹, Pd 4d¹⁰ are preserved); predicted configurations (Z ≥ 104 etc.) are flagged. *Tests:* Σ electrons = Z for all 118; capacities; highest n = period (Pd exception documented).
* **Ions:** cations lose electrons from the highest-n, then highest-l subshell (Fe²⁺ → [Ar]3d⁶); anions fill in Madelung order. Standard textbook approximation; some real ions deviate. Offered charges = PubChem oxidation states (+ full ionisation for H, He).
* **Valence electrons:** s/p block = outer-shell s+p; d block = ns + (n−1)d (convention); f block = undefined (shown blank).
* **Slater's rules** (Slater 1930) give Z_eff per subshell. *Test:* C 2p 3.25, Na 3s 2.20, Zn 3d 8.85, Zn 4s 4.35.
* **Neutron count** = A − Z for the *selected isotope*. Default isotope = most abundant natural isotope, else longest-lived ground-state nuclide — never the rounded atomic weight (*test:* Te → ¹³⁰Te although 127.60 rounds to 128; Tc → ⁹⁷Tc; Pu → ²⁴⁴Pu).

## 3. Quantum orbitals
* **One-electron systems (H, He⁺, Li²⁺ …): exact** non-relativistic ψ_nlm = R_nl(r)·Y_lm with real spherical harmonics (s, p, d, f; l ≤ 3), generalised-Laguerre radial functions. *Tests:* ∫R²r²dr = 1 (n ≤ 5, tol 10⁻⁴); ∫|Y|²dΩ = 1 (all l ≤ 3); sampled ⟨r⟩ = 1.5 a₀ (1s) and 5 a₀ (2p) within 2 %.
* **Sampling:** r from the exact radial CDF (inverse transform), angles by rejection on |Y|² — independent draws from |ψ|², seeded (mulberry32) for reproducibility. Points are probability samples, **not trajectories**; the UI says so.
* **Multi-electron clouds: approximation.** Hydrogenic orbitals with Slater Z_eff (principal n, not Slater n*). Qualitatively right shell structure and relative sizes; **not** Hartree–Fock and not quantitative densities. Labelled "approx." in the UI.
* **Energy levels:** one-electron: E_n = −R_M·Z²/n² with reduced-mass Rydberg R_M = R∞/(1+mₑ/M). Multi-electron: E ≈ −13.6 eV·Z_eff²/n² (Slater) — labelled APPROXIMATE.
* **Computed spectra** (one-electron systems): Rydberg formula, vacuum wavelengths; fine structure/Lamb shift neglected. *Tests:* H ground state −13.5984 eV; Lyman-α 121.567 nm (±0.005); Hα 656.46 nm (±0.02). Measured multi-electron spectra come from NIST (§4e); elements without bundled data show no lines.
* **Educational shell model:** occupancy exact; radii and motion non-physical; labelled.
* **Nucleus:** R = r₀A^⅓, r₀ = 1.2 fm (empirical charge-radius fit); nucleon placement is a deterministic schematic packing; binding energy from AMDC atomic masses: B = [Z·m(¹H) + N·mₙ − m]c².

## 4. Molecules
* Geometries are **PubChem3D computed conformers (MMFF94s)** → provenance *Derived*, badge "computed conformer". H₂ and NO use experimental r_e (Huber & Herzberg) → *Observed*.
* *Tests:* Hill formula (with net-charge suffix) from 3D atoms = PubChem formula (all 140); Σ atomic weights = PubChem MW within its reported precision; bond sanity; water O–H 0.958 Å (±0.03), ∠HOH 104.5° (±2.5°); CO₂ linear (±1°), C=O 1.160 Å (±0.05 — MMFF gives 1.197 Å, a real force-field deviation); CH₄ 109.47° (±1°); NH₃ 106.7° (±3°); benzene six C–C 1.397 Å (±0.03) despite Kekulé orders.

### 4b. Structure files and comparison (Phase 2.1)
* **Formats:** XYZ, MDL MOL/SDF V2000 (bond orders 1–3, formal charges via atom block + `M  CHG`), PDB (HETATM + CONECT; repeated CONECT partners encode bond order). Aromatic (type 4) bonds, V3000 and query features are rejected with explicit errors. *Tests:* every library molecule round-trips MOL and PDB with exact connectivity/orders/charges (coords ≤ 1e-4 Å / 1e-3 Å).
* **Connectivity inference** (XYZ, PDB without CONECT): bonded if d < r₁ + r₂ + 0.4 Å using Cordero 2008 covalent radii; single bonds only (orders not perceived) and the record says so. *Test:* reproduces PubChem connectivity exactly for all 140 library molecules.
* **C₆₀:** atoms placed on icosahedron edges at fraction t from each vertex: pentagon edges = t·e, 6:6 bonds = (1−2t)·e; solving for the experimental 1.458 / 1.401 Å fixes the cage exactly (radius 3.55 Å). *Test:* all 90 bonds to 1e-9 Å.
* **Comparison statistics:** bond lengths grouped by element pair and order (mean ± population sd); mass-weighted radius of gyration.
* **Imported structures** carry *Hypothetical* provenance (user-supplied, unverified) until validated in the laboratory (Phase 2.2).

### 4c. Molecular builder and validation (Phase 2.2)
* **Builder geometry** is a starting guess: new atoms at covalent-radius bond lengths (×0.87 double, ×0.78 triple) along VSEPR-like free directions; hydrogens fill open valences. Labelled "unoptimised" until Gate 2.3.
* **In-house valence model:** allowed bond-order sums per main-group element (hypervalent P, S, Se, Te, halogens, Xe listed), shifted by formal charge isoelectronically (N⁺/O⁺ +1, O⁻/N⁻ −1, C±→3, B⁻→4). Transition metals: "no simple rule — not checked". *Test:* all 139 closed-shell library molecules raise zero errors; the only warning is the NO radical.
* **Independent validator:** RDKit-JS MinimalLib 2026.09.2 sanitisation; canonical SMILES and InChI/InChIKey. *Tests:* InChIKey connectivity layer equals PubChem's for all 137 records; full keys equal except where a 3D conformer necessarily fixes stereocentres PubChem leaves undefined (racemates, anomeric carbons) — asserted per mismatch; RDKit and the in-house model both reject pentavalent carbon.
* **Identity:** InChIKey → PubChem compound lookup (exact incl. stereo layer).
* **Strict vs sandbox:** strict mode refuses edits that add valence errors; the experimental sandbox allows them and labels the structure failing validation (provenance class Hypothetical).
* **Dihedral rotation:** Rodrigues rotation of one side of a non-ring single bond; bond lengths preserved to 1e-9 Å (test).

### 4d. Geometry optimisation — VGFF-1 (Phase 2.3)
A deliberately small, fully traceable **generic valence force field** (`src/modes/atomic/laboratory/forcefield.ts`); results are labelled *Simulated*.
| Term | Form | Parameters (source) |
|---|---|---|
| Bond | k(r − r₀)², k = 700 | r₀ = Cordero 2008 radii; heavy-atom single bonds use hybrid carbon radii sp³ 0.76 / sp² 0.73 / sp 0.69 Å; multiple bonds r₁ − 0.71·log₁₀ n (Pauling); aromatic n = 1.5 (→ 1.395 Å C–C); resonance n = 1.25 for sp² C–N/O(lone pair) — **calibrated** on formamide C–N 1.352 Å and formic acid C–OH 1.343 Å |
| Angle | K(cos θ − cos θ₀)², K = 120 | sp 180°, sp² 120°, sp³ 109.47°; lone-pair sp³ centres use parent-hydride experimental angles (H₂O 104.5°, NH₃ 106.7°, H₂S 92.1°, PH₃ 93.8°); none for > 4 neighbours |
| Torsion | V/2(1 − cos 2φ) double/aromatic (V 12), conjugated single (V 2.5); V/2(1 + cos 3φ) sp³–sp³ (V 0.35) | planarity / staggering |
| Non-bonded | K(d₀ − r)² for r < d₀, ≥ 3 bonds apart (1-4 × 0.5) | d₀ = 0.8 × Σ PubChem vdW radii; repulsion only |
Perception: hybridisation from bond orders; aromatic 6-rings (3 alternating doubles) and 5-rings (2 doubles + N/O/S); amide/aniline N planarised. Optimiser: L-BFGS (m = 8), Armijo backtracking, 0.3 Å step cap, convergence at RMS gradient ≤ 10⁻³; runs in a Web Worker with live progress.
*Validation (tests/science/forcefield.test.ts):* analytic gradient vs central differences (relative error < 10⁻⁵, 7 molecules); rigid-motion invariance; monotone convergence. From crude builder guesses it reproduces **experimental** geometries: water 0.958 Å / 104.5°, ammonia 106.7°, methane 109.47° / 1.087 Å, ethane 1.535 Å, ethylene 1.339 Å (planar), acetylene 1.203 Å (linear), benzene six equal bonds 1.397 Å (spread < 0.005 Å). Against PubChem MMFF94s conformers: **91 % of 133 organic molecules keep bond-length RMS change < 0.04 Å (median 0.021 Å)**. Known failures of additive radii: H₂, O₂, HF, H₂O₂, P/S oxoacids, SO₂, fused aromatics (anthracene), C₆₀, heterocumulenes. Energies are relative strain within one structure, not thermochemistry.

### 4e. Measured atomic spectra (Phase 2.4)
* **Data:** NIST Atomic Spectra Database, 33 spectra (neutral atoms + He II, C II, N II, Mg II, Ca II, Fe II, O III, and D I), 200–1000 nm, **vacuum** wavelengths; strongest 150 lines per spectrum by NIST relative intensity then A_ki, plus every forbidden M1/E2 line from levels below 50 000 cm⁻¹ (nebular/auroral diagnostics such as [O III] 495.9/500.7, [N II] 654.8/658.3, [O I] 557.7/630.0 nm air). Ritz wavelengths are used (and flagged) when no observed value exists.
* **Model checks against measurement:** Rydberg/Bohr model vs NIST A-weighted fine-structure centroids — Hα, Hβ, Hγ within 0.01 nm; He II 468.6 nm within 0.02 nm; the **H–D isotope shift** of Hα (≈ 0.179 nm, reduced mass) reproduced within 0.002 nm.
* **Display:** emission/absorption views; bar height = log relative intensity (else A_ki) — explicitly *not* comparable between spectra (NIST intensities depend on the light source).
* **Ion stages:** any ionisation stage with a bundled spectrum is selectable (spectroscopy is physics, not chemistry), in addition to chemical oxidation states.
* **Isotope comparison chart:** half-life vs neutron number for every ground-state nuclide (NUBASE), coloured by primary decay mode, with the age of the Universe (4.35 × 10¹⁷ s) marked.

## 5. Solar-system dynamics
| Body set | Model | Validated accuracy (1900–2049, vs JPL Horizons DE440/441) |
|---|---|---|
| 8 planets (EMB) | JPL "Approximate Positions of the Planets" Table 1 — Keplerian elements + linear rates, mean ecliptic J2000, valid 1800–2050 | Mercury 11″ · Venus 15″ · EMB 10″ · Mars 59″ · Jupiter 309″ · Saturn 545″ · Uranus 79″ · Neptune 45″ (max angular); distance ≤ 0.13 % |
| Moon | Truncated ELP-2000/82: 32 longitude/distance + 20 latitude principal terms (Meeus ch. 47), precession removed to J2000 | **48″** max, distance 0.003 % |
| Earth | EMB − μ·r_Moon, μ = GM☾/(GM⊕+GM☾) from DE440 | follows from the above |
| 21 other major moons, Pluto, Ceres, Eris, Haumea, Makemake | Two-body propagation of Horizons osculating elements at 2025-01-01 TDB | exact at epoch; **degrades with distance from epoch** (secular precession and perturbations ignored); flagged in the panel when > 2 yr away. *Test:* Io distance at epoch within 1 % |
| Voyager 1 & 2 | Horizons position+velocity samples, cubic Hermite interpolation (5 min / 20 min / 2 h / 10 d / 30 d sampling) | Leave-one-out ≤ 40 km at 5-min closest-approach spacing ⇒ ≲ 2.5 km in-app; heliopause distances 121.6 au / ≈119 au reproduced |
| Planets & major moons during Voyager encounters | Horizons vectors (±10 d planets, ±3 d moons), blended into the model over 1 day at window edges | Closest approaches vs NASA: Jupiter/Saturn ≤ 0.9 %, Uranus −4.4 %, Neptune +15 % (inherited from the Horizons patched-conic arc) |

* **Orientation:** IAU WGCCRE pole (α₀, δ₀) and prime meridian W(t) (Archinal et al. 2018; Mars uses the 2009 secular model because the 2015 model needs large periodic terms). The spin axis is sign(Ẇ)·pole, which correctly gives retrograde obliquities. *Test:* obliquities of Earth, Venus 177.4°, Mars, Jupiter, Saturn, Uranus 97.8°, Neptune within 0.6° of NASA values.
* **Saturn ring illumination:** B′ = asin(pole · ŝ_Sun). *Test:* |B′| < 0.5° at the 2009-08-11 and 2025-05-06 equinoxes, 26.7° at the 2017 solstice.
* **Hill sphere** (gravity overlay): r_H = a·(m/3M)^⅓ (circular approximation).
* Timeline playback is **ephemeris playback**, not an N-body integration (stated in the UI).

## 6a. Gravitational sandbox (Phase 3.1) — Explore / Experiment / Compare
* **Physics:** Newtonian point masses, G = CODATA 2018 (km³ kg⁻¹ s⁻²). Integrators: leapfrog KDK (2nd order) and **Yoshida (1990) 4th-order** symplectic composition (w₁ = 1/(2 − 2^⅓), w₀ = −2^⅓/(2 − 2^⅓)); fixed step, suggested as 0.2 % of the shortest pairwise orbital period.
* **Initial conditions:** "real" presets take positions from the validated Explore ephemerides and velocities by central differences of the same models, then move to the barycentric frame; without the Moon, Earth is represented by the **Earth–Moon barycentre** with the combined mass (Earth's own state contains its monthly ±4 670 km / ±12.5 m/s wobble). Textbook presets (binary star, Trojans, Chenciner–Montgomery figure-eight) are Hypothetical.
* **Collisions:** perfectly inelastic mergers (mass and momentum conserved, radius from volume conservation); dissipated kinetic energy is reported.
* **Instruments:** conservation (ΔE/E, ΔL/L, |p|) with drift plot; speeds, distances, surface and orbital escape velocities; CR3BP Lagrange points (collinear by Newton iteration, L4/L5 at ±60°); event log. Edits re-centre on the barycentre and reset baselines; any edit relabels the system Hypothetical.
* **Compare:** simulated heliocentric positions vs the Explore (JPL-element) model with per-body divergence.
* *Validation (tests/science/sandbox.test.ts):* convergence order (halving dt: leapfrog ×3.2–4.8, Yoshida ×11–22 reduction of the max energy error); 100-yr solar system |ΔE/E| < 10⁻⁸, |ΔL/L| < 10⁻¹²; 1-yr agreement with the ephemeris < 0.002 au (Earth, Mars, Jupiter); Sun–Earth L1/L2 at 0.00997 R / 0.01004 R; Trojans stay within 0.05 au of L4/L5 for 20 Jovian years; figure-eight periodic to 10⁻³ au; Earth escape velocity 11.19 km/s; merger conservation.
* **Display:** trails sampled in *simulated* time (~60 per shortest orbit) so shapes don't depend on frame rate; the speed control honours wall-clock time and shows the achieved rate (capped at 4 000 steps/frame).

## 6b. Molecular dynamics (Phase 3.2)
* **Model:** classical velocity-Verlet MD on the VGFF-1 potential (§4d); units Å, fs, u, kcal/mol; a[Å/fs²] = 4.184 × 10⁻⁴ · F/m; k_B = 0.0019872043 kcal mol⁻¹ K⁻¹. Maxwell–Boltzmann initial velocities (seeded), centre-of-mass motion removed, rescaled to exactly the target T; T from equipartition over 3N − 6 (linear: 3N − 5) degrees of freedom. Ensembles: NVE, or Berendsen weak coupling (τ = 100 fs; not an exact canonical sampler). Runs start from the VGFF-1 minimum.
* *Validation (tests/science/md.test.ts):* a two-atom oscillator's simulated period equals the analytic 2π√(μ/2k) within 0.5 % (validates integrator + unit conversion); NVE energy fluctuation scales as dt² (halving dt → 3–5× smaller) with no secular drift (< 5 × 10⁻⁴ of K over 4 ps); momentum conserved to 10⁻⁹; Berendsen ⟨T⟩ within 5 % of 500 K; bit-identical trajectories for equal seeds.
* **Fidelity label:** "Classical MD · VGFF-1 · qualitative" — VGFF-1 force constants are not fitted to vibrational spectra.

## 6c. Instruments and notebook (Phases 3.3–3.4)
* **Orbital analyser:** osculating classical elements from the instantaneous state vector (μ = G(M + m)); elliptic and hyperbolic cases. *Tests:* elements → state → elements round trip (a, e to 10⁻⁷; angles to 10⁻⁴°) for e = 0.0167–0.85; Earth's ephemeris state gives a = 1.000 au, e = 0.0167, P = 365.26 d.
* **Measurement:** inter-body distance, relative speed, light time (c exact). **Vector overlay:** velocity and gravitational acceleration directions exact, lengths log-compressed (labelled). **Potential map:** Φ = −Σ G mᵢ / √(|r − rᵢ|² + ε²) on the reference plane (ε = 1 % of system extent to avoid singular pixels), log colour scale with contours every 0.25 dex — computed from the live state every 0.4 s.
* **Notebook:** IndexedDB records with initial conditions, solver identity/version, integrator and step, saved state, event log, diagnostics, energy-drift graph, notes, screenshot and data sources; JSON/CSV export. Every edit becomes a new initial-conditions checkpoint, so "Restart from initial conditions" reproduces the run bit-for-bit (deterministic integrators; tested).

## 6. N-body foundation (for Phase 3)
Kick-drift-kick leapfrog (symplectic, time-reversible), optional Plummer softening, energy/momentum/angular-momentum diagnostics, deterministic snapshots & replay. *Tests:* Sun–Earth–Jupiter, 100 yr at dt = 0.5 d: |ΔE/E| < 10⁻⁶, |ΔL/L| < 10⁻¹², momentum conserved to 10⁻¹²; snapshot replay bit-identical. Validity: Newtonian, non-relativistic, no collisions.

## 7. Cosmology foundation (for Phase 7)
FLRW with matter, Λ and curvature (radiation neglected, < 0.1 % for z < 10); Simpson integration. Planck 2018 parameters provided. *Tests:* Einstein–de Sitter analytic comoving distance and lookback time (10⁻⁶), Hubble-law limit (10⁻³).

## 8. Visual conventions (never used in physics)
CPK colours (PubChem), illustrative giant-planet banding (procedural, not imagery), size exaggeration with on-screen disclosure (radii ×k, Sun capped ×20, moon distances expanded per system only as needed to clear the enlarged planet (factor max(1, 1.6·k·R/a_min))), sunward default camera, photon wave-packet animation (illustrative).

## 9. Chemistry and materials (Phase 4)

### 9a. Reactions and conservation (Gate 4.1)
* **Library:** 52 hand-curated equations (`datasets/chemistry/reactions.json`): combustion, industrial synthesis, acid–base, precipitation, redox, the atmospheric Chapman and Cl/NOₓ cycles, interstellar ion–molecule chemistry, and net biological equations. Each entry cites its source and states whether it is an *elementary step*, an *equilibrium* or a *net equation* (multi-step pathway). Photosynthesis, respiration and fermentation carry caveats that they are not single reactions.
* **Species syntax:** `formula[^charge][(phase)]`, where `hν` is a photon and `M` an unspecified third body (both carry no atoms and no charge). Element symbols are validated against all 118 elements.
* **Conservation:** per-element atom totals and net charge, compared exactly.
* **Stoichiometry solver:** the composition matrix A (elements + charge × species, products negated) is reduced with exact BigInt rational arithmetic, and the null space classifies the input. Nullity 0 means *unbalanceable*. Nullity 1 gives the unique smallest positive integers, or *infeasible* if a sign is wrong. Nullity > 1 means *ambiguous*: several reactions are mixed and conservation alone cannot fix them.
* **No product prediction.** Reactant-only input returns an explicit *unsupported* state, plus a lookup (not a prediction) of curated reactions that contain those reactants. A balanced equation that is not in the library is labelled *balanced · not verified*: conservation is necessary for a real reaction, but it doesn't show the reaction occurs.
* *Validation (tests/science/reactions.test.ts):* every curated reaction conserves atoms and charge, and the solver reproduces each curated set of coefficients. Textbook checks: octane 2/25/16/18; KMnO₄ + HCl 2/16/2/2/8/5; Ca₃(PO₄)₂ + SiO₂ + C 2/6/10/6/1/10; ionic MnO₄⁻/Fe²⁺ 1/5/8/1/5/4; Cr₂O₇²⁻ half-reaction 1/14/6/2/7. Ambiguous and unbalanceable sets are detected, and so is reactant-only input.

### 9b. Thermochemistry (Gate 4.2)
* **Data** (`datasets/chemistry/thermochemistry.json`, 167 species): **CODATA Key Values for Thermodynamics** (Cox, Wagman & Medvedev 1989) first: ΔfH°, S° and H°(298) − H°(0), each with the evaluators' uncertainty. The **NIST Chemistry WebBook** is used only for species CODATA lacks. Its selection rule is fixed and recorded: the first *Review* row that has an uncertainty, then the first *Review* row, then the first row. The literature reference is stored with each value. Where the WebBook gives only a measured ΔcH° for a CHO compound (glucose), ΔfH° is **derived** as n_C·ΔfH°(CO₂,g) + (n_H/2)·ΔfH°(H₂O,l) − ΔcH° from CODATA product values, with uncertainty propagated and the value flagged. Standard state: 298.15 K, 1 bar; ions at unit molality with H⁺(aq) ≡ 0.
* **Model:** ΔrH° = Σν ΔfH°(products) − Σν ΔfH°(reactants) (Hess), and the same for S°. ΔrG°(T) = ΔrH° − TΔrS° with **ΔrCp° = 0** (flagged when |T − 298.15| > 100 K). K = exp(−ΔrG°/RT), with R = N_A·k_B exact. Uncertainties combine in quadrature as if independent, which is indicative only because CODATA values are correlated. Any missing species makes the result **unknown**. For photochemical steps ΔrH° covers chemical species only (the minimum photon energy, not a property of light).
* **Energy diagram:** elements, reactants and products sit on one enthalpy axis (Derived). The dashed reaction path is **Illustrative** and has no barrier value, because no measured activation energies are bundled.
* **Shared interfaces** (`src/core/physics/energy/energy.ts`): `EnergyQuantity` (value, unit, uncertainty, provenance, basis), `EnergyTransfer` (mechanism, from → to, model, validity), `Measurement` (for instruments) and an `energyLedger` conservation check. Radiation, acoustic, conduction and biological energy flows will use these same types.
* **VGFF-1 force-field energies are never used as thermochemistry.**
* *Validation (tests/science/thermo.test.ts):* CODATA values are reproduced exactly (H₂O(l) −285.83, CO₂(g) −393.51). Glucose ΔfH° derived from combustion is −1271.04, matching NIST's −1271.1. CH₄ combustion gives −890.6 kJ/mol. 2H₂ + O₂ gives −571.66, and the liquid−gas difference of 88.008 kJ equals 2ΔvapH°. The Hess cycle C → CO → CO₂ closes to 10⁻⁹. Neutralisation gives −55.815. Haber–Bosch gives ΔrH° −91.88 and ΔrS° −198.1, with ΔrG° = 0 near 464 K. The water ΔrG° crossover lands within 2 % of 373.12 K. Missing data → null. The energy ledger detects non-conservation.

### 9c. Crystals and materials (Gate 4.3)
* **Unit cells** (`datasets/materials/crystals.json`, 10 structures): lattice constants and stated X-ray densities **transcribed** from NBS Circular 539 (Swanson et al. 1953–55). They were read from the OCR text layer of the scanned NIST PDFs via macOS PDFKit and are flagged in the UI. Silicon uses the CODATA 2018 lattice parameter (5.431 020 511 Å, fetched from NIST). Atomic positions are the standard Wyckoff positions of each structure type (*International Tables* Vol. A); rutile O x = 0.30479 comes from Abrahams & Bernstein (1971).
* **Computed:** lattice vectors (cubic, tetragonal, hexagonal); volume; X-ray density ρ = Σm / (N_A V); formula units; coordination (periodic images over a 5×5×5 block, first shell within 3 %); hard-sphere packing fraction (single-element structures only); d(hkl) from the reciprocal metric; 2θ for Cu Kα₁ = 1.5405929 Å; and structure factor F = Σ Z_j e^{2πi h·r_j}. The structure factor is **exact for systematic absences** but is **not an intensity model** (no form factors, Debye–Waller or Lorentz-polarisation terms). (hkl) plane polygons are drawn by intersecting the plane with the cell edges.
* **Material properties** (`datasets/materials/materials.json`, 21 materials). Every value carries its conditions and source, and every evaluator returns *null* outside its validity range:
  * refractive index n(λ) from refractiveindex.info (CC0) dispersion formulas (types 1–5 and tabulated), each traced to its primary paper: Malitson 1965/1963, Ghosh 1999, Peter 1923, Li 1976, DeVore 1951, Daimon & Masumura 2007, Malitson & Dodge 1972;
  * Cp(T), S°(T) and H − H(298) from NIST-JANAF text tables;
  * density, cp, speed of sound, viscosity and thermal conductivity of water, N₂, O₂, Ar, CO₂ and He at 101.325 kPa, from the NIST WebBook reference equations of state (IAPWS-95 for water);
  * the defined 100 % IACS copper resistivity (IEC 60028);
  * the water static permittivity polynomial of Malmberg & Maryott (1956), checked against the paper's text.
  * Permeability, emissivity, optical absorption and the thermal conductivity of solids are in the schema but show as *unknown* until a cited source is added.
* *Validation (tests/science/materials.test.ts):*
  * every NBS cell reproduces its stated X-ray density to < 0.15 %, which checks the transcription, basis and composition;
  * Si from CODATA gives 2.329 g/cm³;
  * packing fractions are exact (fcc π/3√2, bcc π√3/8, diamond π√3/16), and real Mg falls below ideal hcp;
  * coordination is right: NaCl 6, CsCl 8, diamond 4 at 1.544 Å, fcc 12, bcc 8;
  * the rutile TiO₆ distances match 1.946/1.983 Å to 0.006 Å;
  * Cu d-spacings match the NBS table, and the hexagonal metric checks out;
  * absences are correct (fcc 100/110, bcc 111, diamond 200/222), and Cu 111 sits at 2θ = 43.30°;
  * n_D is 1.4585 for fused silica, 2.417 for diamond and 1.5443 for NaCl. Water is 1.33335 (Daimon) against the commonly quoted 1.3330, a real inter-source difference of 3×10⁻⁴;
  * JANAF Cp for Cu is 24.442, and metals fall within 5 % of 3R;
  * argon and helium sound speeds are within 0.5 % of the ideal-gas value √(γRT/M), which cross-checks the ingestion;
  * water permittivity is 78.30 at 25 °C.

### 9d. Phase behaviour and intermolecular forces (Gate 4.4)
* **Water:** vapour pressure from IAPWS SR1-86(1992) Eq. 1 (T_c = 647.096 K, p_c = 22.064 MPa; coefficients read from the release, page 3). Melting curves of ice Ih, III, V, VI and VII (Eqs. 1–5) and sublimation (Eq. 6) come from IAPWS R14-08(2011), whose coefficients are read from the release text. The melting curve is **multi-valued in T**: between 251.165 and 273.16 K the ice Ih branch (low p) coexists with the ice III/V branches (high p), and liquid is the band between them. Coexisting liquid/vapour properties come from IAPWS-95 via the NIST WebBook, interpolated with ln p.
* **CO₂:** the liquid–vapour coexistence table (Span–Wagner 1996) supplies the curve, the triple point (216.592 K, 0.51796 MPa) and the critical point (304.128 K, 7.3773 MPa). The TRC-evaluated measured triple point (216.58 K, 5.185 bar) is shown for comparison. Sublimation uses NIST's Antoine fit to Giauque & Egan (1937) **only within 154.26–195.89 K**, and the gap to the triple point is drawn as a gap. **No melting curve is bundled**: liquid states are flagged *uncertain*.
* **Classification** uses only the bundled boundaries. Points within 0.2 % of p_sat are reported as coexistence. Undetermined regions are reported, not guessed: ice polymorphs below 251 K, CO₂ above the melting curve, and outside sublimation validity.
* **Lennard-Jones fluid:** reduced units, r_c = 2.5σ truncated and shifted, velocity Verlet with dt = 0.004 τ, minimum image, fcc start, seeded Maxwell–Boltzmann start, Berendsen thermostat. Observables are T, virial pressure, MSD and g(r). Argon units come from Rahman (1964): ε/k_B = 120 K, σ = 3.4 Å, τ = 2.15 ps. `advance()` steps a fixed dt over a span of simulated time and carries the remainder, so the trajectory doesn't depend on frame rate. **Qualitative:** N = 256, cut-off potential, Berendsen. It does not predict real phase boundaries or other properties.
* *Validation (tests/science/phases.test.ts):* p_sat(373.124 K) = 101.325 kPa (< 2×10⁻⁴). The auxiliary equation agrees with the IAPWS-95 table to < 0.05 % from 273 to 647 K. The three water curves meet at 611.657 Pa. The melting branches join at the IAPWS ice triple points (208.566 / 350.1 / 632.4 / 2216 MPa), and both branches exist at 260 K. Clausius–Clapeyron agrees with the tabulated ΔvapH to within 3 %. The classifications are correct, including pressure-melted liquid at 260 K and 150 MPa. CO₂: triple and critical points check out, dry ice sublimes at 1 atm at 194.69 K (< 1 %), there is no extrapolation outside the Antoine range, and p_sat(298 K) = 6.43 MPa. LJ: the minimum is −ε at 2^{1/6}σ; NVE conserves momentum to 10⁻⁹ with no energy drift; the thermostat holds T; trajectories are identical under different call chunking; the liquid g(r) peaks at 1.0–1.2σ and diffuses; the solid stays bound (MSD < 0.1σ²). 0.69ε/k_B lies within 5 % of argon's ITS-90 triple point, as an order-of-magnitude check.

## 10. Waves (Phase 4, Gate 4.5): shared engine `src/core/physics/waves`
* **Kinematics:** v = fλ, T = 1/f, ω = 2πf, k = 2π/λ. Frequency and the medium's speed are the independent pair, and **λ is always derived**. Asking for a wavelength solves for f; it is never set independently.
* **Media** (`media.ts`): string v = √(T/μ) (user tension and density; Hypothetical configuration, Derived speed). Dry air uses the ideal gas c = √(γRT/M) with γ = 1.4 and **M = 28.966 g/mol derived from the bundled NSSDC composition × IUPAC atomic weights**. Water, N₂, He, CO₂ and Ar use the NIST reference-EOS sound speed at 1 atm (null outside the tabulated T range). **Vacuum has no sound speed, so mechanical waves do not propagate.** Fluids carry longitudinal waves only.
* **Analytic models:** travelling sinusoid y = A sin(kx ∓ ωt + φ); superposition; resultant amplitude √(A₁² + A₂² + 2A₁A₂cosΔφ); beats |f₁ − f₂|. Normal modes: fixed–fixed and open–open fₙ = nv/2L, open–closed fₙ = (2n − 1)v/4L, with pipes plotted as pressure. Gaussian packets by Fourier superposition with ω = vk or deep-water ω² = gk (g = 9.80665 m/s², exact), giving v_g = v_p/2. Acoustic Doppler f′ = f(v + v_o)/(v − v_s), invalid (null) for supersonic sources. Attenuation A₀e^{−αx} with a user-chosen, illustrative α. Two coherent sources: instantaneous field or time-averaged intensity 2 + 2cos(kΔr), with spreading loss ignored.
* **Numerical:** explicit leapfrog for ∂²y/∂t² = v²∂²y/∂x², with fixed or free boundaries and a zero-velocity half-step start. It **refuses Courant C = vΔt/Δx > 1** (CourantError); the lab uses C = 0.8. `advanceFD` steps a fixed Δt over a span of simulated time, so results are independent of render rate.
* **Time controls:** the lab's simulated time advances by wall time × a *time scale* (slow motion), shown separately from the medium's physical propagation speed. Step and reset are available, and the configuration is held in the URL.
* *Validation (tests/science/waves.test.ts, 27 tests):*
  * exact kinematic identities; one-period and one-wavelength periodicity; crests travel at ±v_p; φ = π/2 is a quarter-wavelength shift;
  * pointwise superposition; Δφ = 0 doubles and Δφ = π cancels everywhere; the two-source pattern has maxima at Δr = mλ and nulls at (m + ½)λ;
  * beats: |f₁ − f₂| with an envelope node at 1/(2f_beat);
  * mode frequencies, including open–closed odd harmonics; nodes at fixed ends with n − 1 interior nodes; pipe pressure nodes and antinodes;
  * v_g = v_p (non-dispersive), v_g = v_p/2 (deep water), and the packet peak moves at v_g;
  * Doppler signs, and the supersonic case returns null; attenuation half-distance;
  * FD: Courant rejection; pulse splitting at ±v; inverted (fixed) and upright (free) reflections; energy within 2 % over 1000 steps; bit-identical results under different time slicing;
  * string 100 m/s; air M = 28.96 g/mol and c(20 °C) = 343.2 m/s; water/air ≈ 4.3; vacuum gives null; no extrapolation.
* **Experiment persistence:** the Experiment store is now a discriminated union (`gravitational` | `wave`). Legacy records without `kind` migrate unchanged (tested), and wave experiments store the full parameter set, model, solver version, Courant number, medium, speed and observations.

## 11. Electromagnetic radiation (Phase 4, Gate 4.6): `src/core/physics/em`, `src/modes/spectral/atlas`
* **Vacuum relations:** λ = c/f, E = hf = hc/λ, σ̃ = 1/λ and ω = 2πf, with exact c, h and e (2019 SI). Only one quantity is stored, the **vacuum wavelength** (URL `lambda`); everything else is derived. In a medium, f is invariant, λ = λ₀/n and v = c/n. n(λ) comes only from a cited dispersion formula, inside its range (null outside).
* **Plane wave:** k̂ = +z, E = (E₀ₓcos φ, E₀ᵧcos(φ + δ), 0), φ = kz − ωt, B = k̂ × E/c. Polarisation is linear for δ = 0 or π, circular for E₀ₓ = E₀ᵧ with δ = ±π/2, and elliptical otherwise. **Handedness follows CIE S 017 17-21-018/019:** right-handed means clockwise as seen by the receiver, so with this sign convention δ = −π/2 is right-handed. ⟨S⟩ = ½cε₀(E₀ₓ² + E₀ᵧ²) and μ₀ = 1/(ε₀c²).
* **Blackbody:** B_λ = 2hc²λ⁻⁵/(e^{hc/λkT} − 1) and B_ν = 2hν³c⁻²/(e^{hν/kT} − 1). Wien: λ_max = b/T and ν_max = x₃kT/h, with x₅ and x₃ solved by Newton's method; σ = 2π⁵k⁴/(15h³c²). The two peaks fall at different wavelengths, and both are shown. Curves at sourced temperatures (IAU 5772 K, Fixsen 2.72548 K) are **Derived**; curves at user temperatures are **Hypothetical**. A blackbody is an idealisation.
* **Band conventions** (`datasets/spectral/em-bands.json`) are kept separate and each is shown under its own name; none is presented as *the* definition. Edge rules come from the documents:
  * ITU-R V.431: lower limit exclusive, upper inclusive, **in frequency**;
  * ISO 21348: lower limit inclusive, upper exclusive, **in wavelength**. Its sub-categories overlap by design (UVC/MUV, VUV/EUV/FUV);
  * CIE and the detector IR scheme do not state a rule, so a value exactly on an edge matches both neighbours and is flagged;
  * ISO 20473 is not available (see KNOWN_LIMITATIONS).
* **Visible colours** are an sRGB approximation (**Illustrative**). Per the CIE, visible radiation has no precise limits (lower 360–400 nm, upper 760–830 nm).
* *Validation (tests/science/spectral.test.ts, 26 tests):*
  * photon relations: λ = c/f; 1 eV ↔ 1239.841984 nm and 8.065543937 × 10⁵ m⁻¹ (CODATA listed values); round trips between f, λ and E;
  * plane wave: E ⊥ B ⊥ k and c|B| = |E| at sampled points for every polarisation; Poynting vector along +k; ⟨S⟩ by quadrature = ½cε₀E₀²; μ₀ = 1.25663706212 × 10⁻⁶; the field pattern moves at c;
  * polarisation: handedness checked against the actual rotation sense; |E| constant for circular, modulated at twice the frequency for elliptical;
  * bands: ITU band algebra (17 contiguous bands, 0.3·10^N … 3·10^N Hz, symbols TLF…THF) and edge inclusivity; ISO 21348 overlaps and edges; CIE edge flagging; detector IR contiguity;
  * blackbody: b = 2.897771955 × 10⁻³ m K, b′ = 5.878925757 × 10¹⁰ Hz/K and σ = 5.670374419 × 10⁻⁸ W m⁻² K⁻⁴ (CODATA); the peaks are maxima; π∫B_λ dλ = σT⁴; Sun peak 502.04 nm and CMB peak 160.23 GHz;
  * materials: frequency invariance and λ/n in fused silica; normal dispersion in four materials; null outside the validity range.

## 12. FIELDS foundation (Phase 4, Gate 4.7): `src/core/fields`
One `FieldLayer` interface (quantity, units, frame, resolution, sources, display transform, fidelity, validity, provenance, `sample`, optional `vector`); see FIELDS_ARCHITECTURE.md.
* **Gravity:** Φ = −Σ G mᵢ/√(|r − rᵢ|² + ε²) on the z = 0 plane (J/kg), ε = 1 % of the view. The Cosmic sandbox's potential map now evaluates this layer (contours unchanged: the old km-unit formula agrees to 1e-12).
* **Coulomb:** V = Σ qᵢ/(4πε₀|r − rᵢ|), E = Σ qᵢ(r − rᵢ)/(4πε₀|r − rᵢ|³), CODATA ε₀ (OpenStax University Physics 2 §5.3). Shown with a symmetric-log colour scale and log-compressed direction arrows (directions exact).
* **Plane wave:** Eₓ(x, t) from `em.ts` `planeE` with the frame x axis as the propagation direction.
* **Heat diffusion:** instantaneous point source Q in an infinite still medium (Carslaw & Jaeger 1959): T = T₀ + Q/(ρcₚ(4παt)^{3/2}) e^{−r²/4αt}, α = k/(ρcₚ) with k, ρ, cₚ interpolated from the NIST WebBook 1 atm isobar at T₀. **Simulated**, idealised: no convection, constant properties.
* *Validation (tests/science/fields.test.ts, 20 tests):* interface completeness; k = 8.9875517 × 10⁹; E = −∇V; Gauss's law; Φ = −GM/r and |g| = GM/r²; sandbox equivalence; plane-wave periods; heat energy conservation to 1e-6 and the PDE residual ∂T/∂t = α∇²T; water α ∈ [1.43, 1.48] × 10⁻⁷ m²/s; relationship integrity (NIST spectrum list matches the dataset, Sun at 5772 K from IAU 2015 B3, every edge sourced, optical edges cite the primary dispersion paper).

## 13. Nearby stars (Phase 5, Gate 5.1): `src/modes/cosmic/star-systems/stars.ts`
* **Catalogues (Observed):** the 10 pc sample (Reylé et al. 2021, update of 25 Aug 2023): 562 objects in 354 systems, each parallax, proper motion, radial velocity and spectral type with its own bibcode. CNS5 within 20 pc (Golovin et al. 2023, ϖ ≥ 50 mas): 2 986 objects with *resulting* G and G−RP (deblended Gaia EDR3, uncorrected EDR3, or converted from Hipparcos; flag kept).
* **Distance:** d = 1/ϖ with the asymmetric 1σ interval [1/(ϖ+σ), 1/(ϖ−σ)]. σϖ/ϖ ≤ 0.011 for every Gaia parallax in the 10 pc sample. Some ground and Spitzer brown-dwarf parallaxes reach 0.25; the panel warns above 0.1, because 1/ϖ is then biased.
* **Absolute magnitude:** M = m + 5 log₁₀(ϖ/100 mas). No extinction correction (negligible within 20 pc). The catalogue's *estimated* G (G_CODE 10/20) is never used, because its authors say it is not for scientific use.
* **Velocity:** v_t = κμ/ϖ with κ = 1 au / 1 Julian year = 4.740470464 km/s (exact from IAU definitions). The space speed √(v_t² + v_r²) is shown only when v_r is catalogued.
* **Frames:** ICRS Cartesian (x → α = 0, z → NCP). Galactic: r_gal = N_Hip · r_icrs, with the Hipparcos matrix (ESA 1997 §1.5.3, quoted by Liu, Zhu & Zhang 2011).
* **Spectral-type calibration (Derived):** the Mamajek dwarf sequence (version 2022.04.16; Pecaut & Mamajek 2013) maps type → T_eff, log L, R, M, M_G and colours. Values are interpolated linearly in a continuous subtype coordinate (O0 = 0 … Y0 = 90) between the two neighbouring rows. It refuses white dwarfs, subdwarfs, bounds (">Y0") and types without a subtype. The catalogue gives no luminosity class, so every value is labelled *typical class V dwarf, not a measurement*.
* **Cross-match 10 pc ↔ CNS5:** by Gaia source id, then by Hipparcos number. A Hipparcos match is refused when CNS5 lists an unresolved pair ("AB") for a single component, so α Cen A does not inherit the combined α Cen AB magnitude.
* **Display (Illustrative):** point colour is a hand-chosen ramp in calibrated T_eff, and point size follows absolute G. Neither is a physical rendering.
* *Validation (tests/science/stars.test.ts, 24 tests):* κ and pc/ly; distance, interval and M at 1 and 10 pc; v_t of 1″/yr at 1 pc. N_Hip is a proper rotation to 1e-9, and the NGP and Galactic centre map to b = 90° and (0°, 0°) within 2 × 10⁻³°. Catalogue checks: every object inside 10 pc, or within 1σ for the candidates (seq ≥ 1001); Proxima is nearest at 1.30197 pc, M_G 13.41 and v_t 23.8 km/s; no estimated G is stored as measured; per-value references are present; Gaia σϖ/ϖ ≤ 0.011. CNS5 checks: ϖ ≥ 50; cross-match > 300 objects with ≥ 95 % parallax agreement; Sirius matched through Hipparcos; α Cen A refused. Calibration checks: exact rows, interpolation midpoint, refusals, G2V ≈ IAU Sun, and calibrated vs observed M_G within 1.5 mag for > 85 % of single dwarfs.

## 14. HR diagrams and stellar classes (Phase 5, Gate 5.2): `src/modes/cosmic/star-systems/hr.ts`
* **Colour–magnitude diagram (Observed + Derived):** M_G against G−RP from CNS5 *resulting* photometry, for every star within 20 pc that has both values. Hipparcos-converted points (flag 2) are drawn hollow.
* **Luminosity–temperature diagram (Derived):** T_eff is the class V mean for the star's spectral type. L is scaled from that type's mean: log L = log L_cal − 0.4 (M_obs − M_cal). This assumes the star shares the mean bolometric correction of its type, and the solar M_bol zero point cancels. M_obs uses measured Gaia G (G_CODE 2/3) when present, otherwise Johnson V with the calibration's M_V. Converted or estimated G is never used. White dwarfs, uncalibratable types and objects without G or V are listed as not placed, with the reason.
* **Sun:** IAU 2015 B3 nominal T_eff = 5772 K and L = L☉. The T_eff implied by the nominal L☉, R☉ and CODATA σ is 5772.0 K (tested < 1 K).
* **Constant-radius lines:** L/L☉ = (R/R☉)²(T/T☉)⁴. The radius of each star is shown as R = √(L/L☉)(T☉/T)² R☉ (Derived).
* **Converted-G check:** for Hipparcos-converted G the panel compares it with catalogue V + (G−V) of the type's dwarf mean, and warns above 0.2 mag. Sirius A is off by +0.39 mag. The value is shown unchanged, with the warning.
* **Classes:** T_eff, mass and radius spans of class V per MK letter, from the same sequence. The class descriptions are from OpenStax *Astronomy 2e* §17.3.
* *Validation (10 more tests in tests/science/stars.test.ts, 34 in all):*
  * T☉ from Stefan–Boltzmann; the radius lines (R² and T⁴ scaling, round trip); the luminosity scaling (on-row identity, 2.5 mag = ×0.1);
  * Proxima log L = −2.81 and R 0.13–0.17 R☉; Sirius A placed with V at log L ≈ 1.39;
  * refusals for white dwarfs, planets and untyped objects; ≥ 300 stars placed, with the main sequence monotonic in the mean;
  * white dwarfs > 5 mag below the main sequence on the CMD; the Sirius converted-G discrepancy (+0.3…+0.5 mag); MK class ordering.

## 15. Exoplanets within 10 pc (Phase 5, Gate 5.3): `src/modes/cosmic/star-systems/exoplanets.ts`
* **Census and elements:** the 85 planets come from the 10 pc sample. 82 are matched to exoplanet.eu, 79 by planet name and 3 by host identifier plus planet letter. The other 3 have no exoplanet.eu entry under a matching letter (GJ 9066 b, GJ 832 c, BD+61 195 b) and are shown with catalogue data only. Elements are stored as published, [value, −σ, +σ].
* **Units:** M_J and R_J are converted to Earth units with the IAU 2015 B3 nominal (GM)_J/(GM)_E = 317.83 and R_eJ/R_eE = 11.209. Where no true mass is published, m sin i is shown and labelled *minimum mass*.
* **Checks (Derived):**
  * Kepler's third law: a = (GM★P²/4π²)^{1/3} with M★ from the same compilation (planet mass neglected). The panel shows the difference and warns above 15 %.
  * Periastron times outside 1950–2100 are rejected as not plausible Julian dates (4 in the compilation, e.g. Proxima b 245813.5).
  * Eccentricities must lie in [0, 1) and inclinations in [0°, 180°].
* **Orbit drawing:** each orbit is drawn face-on in its own plane, star at the focus, r(ν) = a(1−e²)/(1+e cos ν) rotated by ω. The band spans a ± 1σ. Missing e or ω gives a dashed placeholder shape or orientation. The orientation on the sky is not shown. Solar System comparison orbits use the JPL approximate elements.
* *Validation (8 more tests in tests/science/stars.test.ts):* IAU nominal ratios; Kepler (Earth at 1 au to 1e-4, a ∝ P^{2/3}); the census matches the catalogue; published a agrees with Kepler within 15 % for > 90 % of planets; Proxima b P, a and minimum mass; JD plausibility; e/i ranges; ellipse geometry (closure, periastron, apastron, ω rotation).

## 16. Stellar spectra and thermal radiation (Phase 5, Gate 5.4)
* **Planck model per star (Derived):** B_λ at the class V mean T_eff of the star's spectral type (rounded to 1 K), with λ_max = b/T and σT⁴ from the existing `em.ts` (CODATA). It models the continuum only. The panel states that real spectra carry absorption lines and, in M dwarfs, molecular TiO bands (OpenStax §17.3). White dwarfs, planets and uncalibratable types get no model.
* **Class → lines:** following OpenStax §17.3, ionised helium peaks at O, neutral helium at B, hydrogen at about A, ionised metals between F and G, neutral metals at K, and molecules beyond M. The registry links O → He II, B → He I, A → H I, F/G → Ca II and Fe II, and K → Ca I and Fe I. Calcium and iron stand in for "metals"; both ionisation stages are in the bundled NIST set. M has no line edge, because molecular bands are not bundled.
* **Registry:** star entities are registered when the 10 pc catalogue loads. Edges: star → class (*part-of*, from the catalogue spectral type) and star → Planck model (*has-spectrum*, from the calibration). Reverse links appear in the Spectral atlas (blackbody tab opened with `star=`, limited to 6 with the originating star first) and on the Lines tab (classes that absorb in that spectrum).
* *Validation (4 more tests):* class edges only target bundled NIST spectra and follow O/B/A as stated, with no M edge; Proxima → 2930 K model and back, with peak 989 nm; refusals for white dwarfs and planets; registry integrity after registering more than 450 stars.

## 17. Relativity foundations (Phase 6, Gate 6.1): `src/core/physics/relativity.ts`, `#/cosmic/relativity`
* **Geometry:** exterior Schwarzschild solution (non-rotating, uncharged mass, vacuum outside the body). r_s = 2GM/c², unstable photon orbit 3GM/c² (Carroll 1997, eq. 7.51), innermost stable circular orbit 6GM/c² (7.55), critical impact parameter 3√3 GM/c² (derived from the maximum of the photon effective potential, 7.48 with ε = 0). GM comes from IAU 2015 B3 nominal values, so r_s☉ = 2.953 km.
* **Clocks and redshift:** static observers dτ/dt = √(1 − r_s/r) (7.58); exact frequency ratio between static observers √((1 − r_s/r₁)/(1 − r_s/r₂)) (7.61) and its weak-field limit 1 + Φ₁ − Φ₂ (7.62). Circular geodesics: Ẽ = (1 − 2m/r)/√(1 − 3m/r), L̃ = √(mr)/√(1 − 3m/r) (m = GM/c²), dτ/dt = √(1 − 3m/r). **Refusals:** r ≤ r_s returns null (no static observers); circular orbits require r > 3m; values inside a body's surface are not shown.
* **Light paths (Simulated):** null geodesics in the equatorial plane from u″ = −u + 3mu² (u = 1/r; Carroll 7.44 and 7.46 with ε = 0), RK4 in φ with Δφ = 10⁻³, starting at r₀ = max(10⁴ r_s, 10⁴ b). Deflection = extra swept angle relative to a straight line; the part beyond r₀ is neglected (< 10⁻⁴ r_s/b).
* **Weak field:** perihelion advance 6πGM/(c²a(1 − e²)) per orbit (lowest order of 7.56) with JPL a, e and mean motion for Mercury; deflection 4GM/(c²b) (Narayan & Bartelmann 1996, eq. 7). Special relativity: γ = 1/√(1 − v²/c²), Δt = γΔτ (OpenStax University Physics 3 §5.3).
* **Field regime indicator:** r_s/r ≤ 10⁻⁴ weak, ≤ 0.1 moderate, > 0.1 strong (Newtonian gravity flagged as invalid). The Newtonian N-body solver is not used by this module.
* *Validation (tests/science/relativity.test.ts, 21 tests):* r_s☉ = 2.953 km and GM☉/c² = 1.4766 km (Carroll: 1.48 × 10⁵ cm); radius ratios 1.5, 3 and 3√3/2 exactly; static clock, redshift and refusals at and inside r_s; exact vs weak-field shift at the solar surface (< 10⁻¹¹), cz☉ = 636 m/s; reciprocity and composition of frequency ratios; circular orbits are stationary points of V with V = Ẽ²/2, ISCO binding energy 1 − √(8/9) and V″ = 0 there; the photon potential peaks at 3m for every L; Mercury 42.98″ per century (Carroll: 42.9″, 43″ residual); solar-limb deflection 1.751″ (N&B: 1.″7); photon paths approach 2r_s/b from above (excess < 2/b relative), agree with an independent quadrature of the orbit equation to 0.2 % for b = 3…200 r_s, capture below 2.598 r_s and wind around the photon sphere just above it; periapsis matches the turning-point cubic; γ(0.6c) = 1.25 and refusal at v ≥ c.
