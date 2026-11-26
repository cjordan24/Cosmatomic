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
* **Spectra:** computed only for one-electron systems (Rydberg formula, vacuum wavelengths; fine structure/Lamb shift neglected). *Tests:* H ground state −13.5984 eV; Lyman-α 121.567 nm (±0.005); Hα 656.46 nm (±0.02). Multi-electron spectra are **not drawn** (NIST ASD link instead).
* **Educational shell model:** occupancy exact; radii and motion non-physical; labelled.
* **Nucleus:** R = r₀A^⅓, r₀ = 1.2 fm (empirical charge-radius fit); nucleon placement is a deterministic schematic packing; binding energy from AMDC atomic masses: B = [Z·m(¹H) + N·mₙ − m]c².

## 4. Molecules
* Geometries are **PubChem3D computed conformers (MMFF94s)** → provenance *Derived*, badge "computed conformer". H₂ and NO use experimental r_e (Huber & Herzberg) → *Observed*.
* *Tests:* Hill formula from 3D atoms = PubChem formula (all 49); Σ atomic weights = PubChem MW (±0.02 u); bond sanity; water O–H 0.958 Å (±0.03), ∠HOH 104.5° (±2.5°); CO₂ linear (±1°), C=O 1.160 Å (±0.05 — MMFF gives 1.197 Å, a real force-field deviation); CH₄ 109.47° (±1°); NH₃ 106.7° (±3°); benzene six C–C 1.397 Å (±0.03) despite Kekulé orders.

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

## 6. N-body foundation (for Phase 3)
Kick-drift-kick leapfrog (symplectic, time-reversible), optional Plummer softening, energy/momentum/angular-momentum diagnostics, deterministic snapshots & replay. *Tests:* Sun–Earth–Jupiter, 100 yr at dt = 0.5 d: |ΔE/E| < 10⁻⁶, |ΔL/L| < 10⁻¹², momentum conserved to 10⁻¹²; snapshot replay bit-identical. Validity: Newtonian, non-relativistic, no collisions.

## 7. Cosmology foundation (for Phase 7)
FLRW with matter, Λ and curvature (radiation neglected, < 0.1 % for z < 10); Simpson integration. Planck 2018 parameters provided. *Tests:* Einstein–de Sitter analytic comoving distance and lookback time (10⁻⁶), Hubble-law limit (10⁻³).

## 8. Visual conventions (never used in physics)
CPK colours (PubChem), illustrative giant-planet banding (procedural, not imagery), size exaggeration with on-screen disclosure (radii ×k, Sun capped ×20, moon distances expanded per system only as needed to clear the enlarged planet (factor max(1, 1.6·k·R/a_min))), sunward default camera, photon wave-packet animation (illustrative).
