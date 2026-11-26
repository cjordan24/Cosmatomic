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
