/**
 * Classical molecular dynamics (foundation, Phase 3.2) on the VGFF-1 potential.
 *
 * Units: length Å, time fs, mass u (g/mol), energy kcal/mol, temperature K.
 *   acceleration [Å/fs²] = F [kcal/mol/Å] / m [g/mol] × 4.184×10⁻⁴
 *   (1 kcal/mol/Å ÷ 1 g/mol = 4184 J / (10⁻³ kg · 10⁻¹⁰ m) = 4.184×10¹⁶ m/s² = 4.184×10⁻⁴ Å/fs²)
 *   k_B = 0.0019872043 kcal/(mol·K)
 * Integrator: velocity Verlet (symplectic). Ensembles: NVE, or Berendsen weak coupling (NVT-like;
 * does not sample the exact canonical distribution — documented).
 * FIDELITY: VGFF-1 is a geometry force field; its force constants are not fitted to vibrational
 * spectra, so frequencies and amplitudes are QUALITATIVE (labelled "Classical MD · VGFF-1 · qualitative").
 */
import { ELEMENTS } from '../atoms/elements';
import { mulberry32 } from '@/core/simulation/random';
import { buildForceField, energyGradient, type ForceField } from './forcefield';
import type { Structure } from './builder';

export const ACC = 4.184e-4;
export const KB = 0.0019872043;

export interface MDState { ff: ForceField; x: Float64Array; v: Float64Array; m: Float64Array; g: Float64Array; t: number; Epot: number; dof: number }
export type Thermostat = { kind: 'none' } | { kind: 'berendsen'; T: number; tauFs: number };

export function masses(s: Structure): Float64Array {
  return new Float64Array(s.atoms.flatMap((a) => { const m = ELEMENTS[a.Z - 1].atomicWeight ?? a.Z * 2; return [m, m, m]; }));
}

export function kineticEnergy(st: MDState): number {
  let K = 0;
  for (let i = 0; i < st.v.length; i++) K += 0.5 * st.m[i] * st.v[i] * st.v[i];
  return K / ACC; // convert u·Å²/fs² → kcal/mol
}
export const temperature = (st: MDState) => (2 * kineticEnergy(st)) / (st.dof * KB);

/** Initialise: Maxwell–Boltzmann velocities at T (seeded), zero net momentum, rescaled to exactly T. */
export function initMD(s: Structure, T: number, seed = 1): MDState {
  const ff = buildForceField(s);
  const x = new Float64Array(s.atoms.flatMap((a) => [a.x, a.y, a.z]));
  const m = masses(s);
  const n = s.atoms.length;
  const dof = Math.max(1, 3 * n - (n === 2 ? 5 : 6));
  const rand = mulberry32(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-300)) * Math.cos(2 * Math.PI * rand());
  const v = new Float64Array(3 * n);
  for (let i = 0; i < 3 * n; i++) v[i] = gauss() * Math.sqrt((KB * T * ACC) / m[i]);
  // remove centre-of-mass velocity
  const M = s.atoms.reduce((t, _, i) => t + m[3 * i], 0);
  for (let k = 0; k < 3; k++) { let p = 0; for (let i = 0; i < n; i++) p += m[3 * i] * v[3 * i + k]; for (let i = 0; i < n; i++) v[3 * i + k] -= p / M; }
  const g = new Float64Array(3 * n);
  const Epot = energyGradient(ff, x, g);
  const st: MDState = { ff, x, v, m, g, t: 0, Epot, dof };
  if (T > 0) { const f = Math.sqrt(T / Math.max(1e-12, temperature(st))); for (let i = 0; i < v.length; i++) v[i] *= f; }
  return st;
}

/** One velocity-Verlet step of dt fs (in place), with optional Berendsen velocity scaling. */
export function mdStep(st: MDState, dt: number, thermostat: Thermostat = { kind: 'none' }): void {
  const { x, v, m, g } = st;
  for (let i = 0; i < x.length; i++) { v[i] -= 0.5 * dt * (g[i] / m[i]) * ACC; x[i] += dt * v[i]; }
  st.Epot = energyGradient(st.ff, x, g);
  for (let i = 0; i < x.length; i++) v[i] -= 0.5 * dt * (g[i] / m[i]) * ACC;
  if (thermostat.kind === 'berendsen') {
    const T = temperature(st);
    if (T > 0) { const lambda = Math.sqrt(1 + (dt / thermostat.tauFs) * (thermostat.T / T - 1)); for (let i = 0; i < v.length; i++) v[i] *= lambda; }
  }
  st.t += dt;
}

export const totalEnergy = (st: MDState) => kineticEnergy(st) + st.Epot;
