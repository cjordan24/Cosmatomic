/**
 * Voyager Physics Engine — module registry.
 *
 * Each module declares its status honestly, its solver(s), validity limits and
 * the model version, so the UI can show what is and is not implemented.
 */
export type ModuleStatus = 'implemented' | 'partial' | 'planned';

export interface PhysicsModule {
  id: string;
  name: string;
  responsibility: string;
  status: ModuleStatus;
  version: string;
  solvers: string[];
  validity: string[];
  phase: number;
}

export const PHYSICS_MODULES: PhysicsModule[] = [
  { id: 'quantum', name: 'Quantum', responsibility: 'Atomic orbitals, probability distributions, energy states', status: 'partial', version: '0.1.0', phase: 1,
    solvers: ['Analytic hydrogen-like wavefunctions ψnlm (n ≤ 7, real orbitals)', 'Slater-rule effective nuclear charge for multi-electron approximation', 'Rydberg formula with reduced-mass correction'],
    validity: ['Exact (non-relativistic) for one-electron systems: H, He⁺, Li²⁺ …', 'Multi-electron clouds are a qualitative hydrogenic/Slater approximation — not Hartree–Fock', 'No fine structure, spin–orbit, Lamb shift, or relativistic corrections'] },
  { id: 'nuclear', name: 'Nuclear', responsibility: 'Nuclear composition, isotopes, decay', status: 'partial', version: '0.1.0', phase: 1,
    solvers: ['Nuclide composition (Z, N, A) from NUBASE/AMDC data', 'Half-life lookup'],
    validity: ['Nucleus rendering is a schematic sphere packing — nucleon positions are not physical', 'Decay chains and activity simulation: planned'] },
  { id: 'molecular', name: 'Molecular', responsibility: 'Chemical bonds, geometry, molecular dynamics', status: 'partial', version: '0.1.0', phase: 1,
    solvers: ['Geometry measurement (bond lengths, angles) on PubChem3D conformers', 'Interactive builder with in-house valence rules', 'RDKit-JS sanitisation, canonical SMILES and InChIKey (independent validator)', 'Structure I/O: XYZ, MOL/SDF V2000, PDB', 'VGFF-1 generic valence force field + L-BFGS geometry optimisation (Web Worker)', 'Classical MD: velocity Verlet, Maxwell–Boltzmann start, NVE / Berendsen'],
    validity: ['Conformers are MMFF94s-computed, not experimental', 'VGFF-1: main-group organic chemistry; relative strain energies only; nearest local minimum (no conformer search)', 'MD: single molecules in vacuum, qualitative force constants'] },
  { id: 'chemical', name: 'Chemical', responsibility: 'Reactions, conservation, equilibrium', status: 'partial', version: '0.1.0', phase: 4,
    solvers: ['Curated reaction library (52 cited equations)', 'Atom + charge conservation check', 'Exact rational null-space stoichiometry solver (BigInt)'],
    validity: ['Balancing proves conservation only — not that a reaction occurs', 'No product prediction: reactant-only input returns an explicit unsupported state', 'Net equations (photosynthesis, respiration) are not mechanisms'] },
  { id: 'waves', name: 'Waves', responsibility: 'Mechanical waves: propagation, superposition, resonance, dispersion', status: 'partial', version: '1.0.0', phase: 4,
    solvers: ['Analytic sinusoids, superposition, beats, standing-wave normal modes (3 boundary types)', 'Gaussian packets with linear or deep-water dispersion', 'Acoustic Doppler shift', 'Explicit finite-difference 1D wave equation with Courant check'],
    validity: ['Linear (small-amplitude) waves; no shocks', 'Medium speeds from sourced models only (string √(T/μ), ideal-gas air, NIST fluids at 1 atm); vacuum carries no sound', 'Attenuation coefficient is user-chosen (illustrative)', 'No 2D/3D numerical acoustics yet (two-source pattern is analytic)'] },
  { id: 'classical', name: 'Classical', responsibility: 'Motion, collisions, momentum', status: 'planned', version: '—', phase: 3, solvers: [], validity: [] },
  { id: 'electromagnetic', name: 'Electromagnetic', responsibility: 'Radiation in vacuum (fields and charged particles to follow)', status: 'partial', version: '0.1.0', phase: 4,
    solvers: ['Vacuum photon relations λ = c/f, E = hf (exact SI constants)', 'Analytic vacuum plane wave: B = k̂×E/c; linear, circular and elliptical polarisation (CIE handedness)', 'Planck spectrum, Wien displacement (λ and ν forms), Stefan–Boltzmann', 'Band mapping under named conventions (ITU-R V.431, CIE S 017, ISO 21348, detector IR scheme)', 'FIELDS layers: point-charge Coulomb potential and field (CODATA ε₀), plane-wave Eₓ map'],
    validity: ['Vacuum, classical fields; no sources, scattering or absorption', 'In materials only n(λ) inside each formula’s cited range; no extrapolation', 'Blackbody is an idealisation; real spectra (e.g. the Sun) deviate', 'Display colours of wavelengths are illustrative'] },
  { id: 'thermodynamic', name: 'Thermodynamic', responsibility: 'Temperature, heat transfer, phase behaviour', status: 'partial', version: '0.1.0', phase: 4,
    solvers: ['Standard reaction enthalpy/entropy from CODATA + NIST WebBook formation data (Hess)', 'ΔrG°(T) = ΔrH° − TΔrS° and K = exp(−ΔrG°/RT)', 'Shared EnergyQuantity / EnergyTransfer / Measurement interfaces with a conservation ledger', 'FIELDS layer: analytic heat diffusion from an instantaneous point source (α = k/ρcₚ from NIST fluid data)'],
    validity: ['ΔrCp° = 0: approximate away from 298.15 K', 'Standard states only (no activities, no non-ideal mixing)', 'VGFF-1 force-field energies are never used as thermochemistry'] },
  { id: 'gravitational', name: 'Gravitational', responsibility: 'Planetary motion, orbital mechanics, N-body', status: 'partial', version: '1.0.0', phase: 1,
    solvers: ['JPL Keplerian elements + secular rates (planets, 1800–2050)', 'Truncated ELP-2000/82 lunar theory (Meeus ch. 47 principal terms)', 'Two-body propagation of Horizons osculating elements (other moons, dwarf planets)', 'Leapfrog KDK and Yoshida 4th-order symplectic N-body integrators with conservation diagnostics', 'Interactive sandbox: inelastic mergers, Lagrange points (CR3BP), escape velocities, ephemeris comparison', 'FIELDS layer: softened Newtonian potential (shared by the sandbox and the Fields explorer)'],
    validity: ['Newtonian; invalid near compact objects or at relativistic speeds', 'Planet ephemeris valid 1800–2050 (JPL-stated errors up to ~600″ for Saturn)', 'Moon/dwarf-planet two-body orbits degrade away from the 2025-01-01 epoch'] },
  { id: 'stellar', name: 'Stellar', responsibility: 'Nearby stars: astrometry, photometry and spectral-type calibrations', status: 'partial', version: '0.1.0', phase: 5,
    solvers: ['Parallax distance d = 1/ϖ with 1σ interval', 'Absolute magnitude M = m + 5 log₁₀(ϖ/100 mas)', 'Tangential velocity v_t = κμ/ϖ (κ = 1 au per Julian year)', 'ICRS → galactic rotation (Hipparcos matrix)', 'Spectral type → mean dwarf T_eff, L, R, M (Pecaut & Mamajek sequence, linear in subtype)'],
    validity: ['1/ϖ is a good estimate only for small σϖ/ϖ: ≤ 0.011 for every Gaia parallax in the 10 pc sample, but up to 0.25 for some ground/Spitzer brown-dwarf parallaxes (flagged in the panel above 0.1)', 'No interstellar extinction (negligible within 20 pc)', 'Calibrations are class V means: subgiants, giants, white dwarfs and subdwarfs are not covered', 'Positions are at the catalogue epoch; stellar motion over time is not yet propagated'] },
  { id: 'relativistic', name: 'Relativistic', responsibility: 'Relativistic effects, black holes', status: 'planned', version: '—', phase: 6, solvers: [], validity: ['Newtonian solver is NOT used near horizons'] },
  { id: 'cosmological', name: 'Cosmological', responsibility: 'Expansion, redshift, large-scale structure', status: 'partial', version: '0.1.0', phase: 7,
    solvers: ['Flat/curved ΛCDM distance integrals (Simpson)'], validity: ['Radiation density neglected (<0.1% error for z < 10)', 'No visualisation yet'] },
];
