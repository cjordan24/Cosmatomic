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
    solvers: ['Geometry measurement (bond lengths, angles) on PubChem3D conformers', 'Interactive builder with in-house valence rules', 'RDKit-JS sanitisation, canonical SMILES and InChIKey (independent validator)', 'Structure I/O: XYZ, MOL/SDF V2000, PDB'],
    validity: ['Conformers are MMFF94s-computed, not experimental', 'Builder geometry is a starting guess until optimised (Gate 2.3)', 'MD: Phase 3'] },
  { id: 'chemical', name: 'Chemical', responsibility: 'Reactions, conservation, equilibrium', status: 'planned', version: '—', phase: 4, solvers: [], validity: ['Not implemented; unknown reactions will return an unsupported state'] },
  { id: 'classical', name: 'Classical', responsibility: 'Motion, collisions, momentum', status: 'planned', version: '—', phase: 3, solvers: [], validity: [] },
  { id: 'electromagnetic', name: 'Electromagnetic', responsibility: 'Fields and charged particles', status: 'planned', version: '—', phase: 3, solvers: [], validity: [] },
  { id: 'thermodynamic', name: 'Thermodynamic', responsibility: 'Temperature, heat transfer, phase behaviour', status: 'planned', version: '—', phase: 4, solvers: [], validity: [] },
  { id: 'gravitational', name: 'Gravitational', responsibility: 'Planetary motion, orbital mechanics, N-body', status: 'partial', version: '1.0.0', phase: 1,
    solvers: ['JPL Keplerian elements + secular rates (planets, 1800–2050)', 'Truncated ELP-2000/82 lunar theory (Meeus ch. 47 principal terms)', 'Two-body propagation of Horizons osculating elements (other moons, dwarf planets)', 'Leapfrog KDK N-body integrator with conservation diagnostics'],
    validity: ['Newtonian; invalid near compact objects or at relativistic speeds', 'Planet ephemeris valid 1800–2050 (JPL-stated errors up to ~600″ for Saturn)', 'Moon/dwarf-planet two-body orbits degrade away from the 2025-01-01 epoch'] },
  { id: 'relativistic', name: 'Relativistic', responsibility: 'Relativistic effects, black holes', status: 'planned', version: '—', phase: 6, solvers: [], validity: ['Newtonian solver is NOT used near horizons'] },
  { id: 'cosmological', name: 'Cosmological', responsibility: 'Expansion, redshift, large-scale structure', status: 'partial', version: '0.1.0', phase: 7,
    solvers: ['Flat/curved ΛCDM distance integrals (Simpson)'], validity: ['Radiation density neglected (<0.1% error for z < 10)', 'No visualisation yet'] },
];
