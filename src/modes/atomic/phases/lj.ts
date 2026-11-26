/**
 * Qualitative Lennard-Jones fluid (Gate 4.4) — reduced units (σ = ε = m = k_B = 1).
 *
 *   V(r) = 4ε[(σ/r)¹² − (σ/r)⁶], truncated and shifted at r_c = 2.5σ.
 *   Velocity Verlet; cubic periodic box with minimum-image convention; fcc start; seeded
 *   Maxwell–Boltzmann velocities; optional Berendsen weak-coupling thermostat.
 *   Observables: reduced temperature (equipartition, 3N−3 dof), potential energy per particle, virial pressure, g(r), mean-squared displacement.
 *
 * Physical units (argon, Rahman 1964): ε/k_B = 120 K, σ = 3.4 Å, m = 39.948 u, τ = σ√(m/ε) ≈ 2.16 ps.
 * This is a QUALITATIVE demonstration of solid/liquid/gas behaviour: N is small, the cut-off potential
 * shifts phase boundaries, and runs are short. It does not predict real phase diagrams, sound speeds,
 * refractive indices or thermal emission.
 */
import { mulberry32 } from '@/core/simulation/random';

export const RC = 2.5;
const RC2 = RC * RC;
const VSHIFT = 4 * (RC ** -12 - RC ** -6);

export interface LJState {
  N: number; L: number; t: number;
  x: Float64Array; v: Float64Array; f: Float64Array;
  /** unwrapped positions for MSD */
  u: Float64Array; u0: Float64Array;
  pot: number; virial: number;
}

export const ljPotential = (r: number) => 4 * (r ** -12 - r ** -6);

function forces(s: LJState) {
  const { N, L, x, f } = s;
  f.fill(0);
  let pot = 0, vir = 0;
  for (let i = 0; i < N; i++) {
    const xi = x[3 * i], yi = x[3 * i + 1], zi = x[3 * i + 2];
    for (let j = i + 1; j < N; j++) {
      let dx = xi - x[3 * j], dy = yi - x[3 * j + 1], dz = zi - x[3 * j + 2];
      dx -= L * Math.round(dx / L); dy -= L * Math.round(dy / L); dz -= L * Math.round(dz / L);
      const r2 = dx * dx + dy * dy + dz * dz;
      if (r2 >= RC2) continue;
      const ir2 = 1 / r2, ir6 = ir2 * ir2 * ir2;
      const fr = 24 * ir6 * (2 * ir6 - 1) * ir2; // F/r
      f[3 * i] += fr * dx; f[3 * i + 1] += fr * dy; f[3 * i + 2] += fr * dz;
      f[3 * j] -= fr * dx; f[3 * j + 1] -= fr * dy; f[3 * j + 2] -= fr * dz;
      pot += 4 * ir6 * (ir6 - 1) - VSHIFT;
      vir += fr * r2;
    }
  }
  s.pot = pot; s.virial = vir;
}

/** n×n×n fcc cells (N = 4n³) at reduced density rho, velocities at temperature T (seeded). */
export function createLJ(n: number, rho: number, T: number, seed = 1): LJState {
  const N = 4 * n ** 3, L = (N / rho) ** (1 / 3), a = L / n;
  const x = new Float64Array(3 * N);
  const basis = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
  let k = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let l = 0; l < n; l++) for (const b of basis) {
    x[3 * k] = (i + b[0] + 0.25) * a; x[3 * k + 1] = (j + b[1] + 0.25) * a; x[3 * k + 2] = (l + b[2] + 0.25) * a; k++;
  }
  const rnd = mulberry32(seed);
  const gauss = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const v = new Float64Array(3 * N).map(() => gauss());
  const s: LJState = { N, L, t: 0, x, v, f: new Float64Array(3 * N), u: Float64Array.from(x), u0: Float64Array.from(x), pot: 0, virial: 0 };
  removeDrift(s); rescale(s, T); forces(s);
  return s;
}

function removeDrift(s: LJState) {
  for (let d = 0; d < 3; d++) { let m = 0; for (let i = 0; i < s.N; i++) m += s.v[3 * i + d]; m /= s.N; for (let i = 0; i < s.N; i++) s.v[3 * i + d] -= m; }
}
export const kinetic = (s: LJState) => { let k = 0; for (let i = 0; i < 3 * s.N; i++) k += s.v[i] * s.v[i]; return k / 2; };
export const temperature = (s: LJState) => (2 * kinetic(s)) / (3 * s.N - 3);
function rescale(s: LJState, T: number) { const f = Math.sqrt(T / temperature(s)); for (let i = 0; i < 3 * s.N; i++) s.v[i] *= f; }
export const pressure = (s: LJState) => (s.N * temperature(s) + s.virial / 3) / s.L ** 3;
export const momentum = (s: LJState) => [0, 1, 2].map((d) => { let p = 0; for (let i = 0; i < s.N; i++) p += s.v[3 * i + d]; return p; });

/** One velocity-Verlet step; Berendsen coupling (time constant tauT) if targetT is given. */
export function step(s: LJState, dt: number, targetT?: number, tauT = 0.5) {
  const { N, L, x, v, f, u } = s;
  for (let i = 0; i < 3 * N; i++) {
    v[i] += 0.5 * dt * f[i];
    const dx = dt * v[i];
    u[i] += dx;
    x[i] = ((x[i] + dx) % L + L) % L;
  }
  forces(s);
  for (let i = 0; i < 3 * N; i++) v[i] += 0.5 * dt * f[i];
  if (targetT !== undefined) { const T = temperature(s); const lam = Math.sqrt(1 + (dt / tauT) * (targetT / T - 1)); for (let i = 0; i < 3 * N; i++) v[i] *= lam; }
  s.t += dt;
}

/**
 * Advance by a span of SIMULATED time in fixed steps (dt), carrying the remainder — the trajectory
 * depends only on the total simulated time, never on how often the caller (render loop) calls this.
 */
export function advance(s: LJState & { carry?: number }, span: number, dt: number, targetT?: number) {
  let t = (s.carry ?? 0) + span;
  let n = 0;
  while (t >= dt - 1e-12 && n < 20000) { step(s, dt, targetT); t -= dt; n++; }
  s.carry = t;
  return n;
}

export const totalEnergy = (s: LJState) => kinetic(s) + s.pot;

export function msd(s: LJState) { let m = 0; for (let i = 0; i < 3 * s.N; i++) m += (s.u[i] - s.u0[i]) ** 2; return m / s.N; }

/** Radial distribution function g(r) up to L/2 with `bins` bins. */
export function rdf(s: LJState, bins = 60): [number, number][] {
  const rmax = s.L / 2, dr = rmax / bins, h = new Float64Array(bins);
  const { N, L, x } = s;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    let dx = x[3 * i] - x[3 * j], dy = x[3 * i + 1] - x[3 * j + 1], dz = x[3 * i + 2] - x[3 * j + 2];
    dx -= L * Math.round(dx / L); dy -= L * Math.round(dy / L); dz -= L * Math.round(dz / L);
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (r < rmax) h[Math.floor(r / dr)] += 2;
  }
  const rho = N / L ** 3;
  return Array.from(h, (c, k) => { const r0 = k * dr, r1 = r0 + dr; return [(r0 + r1) / 2, c / (N * rho * (4 / 3) * Math.PI * (r1 ** 3 - r0 ** 3))] as [number, number]; });
}

/** Argon conversion (Rahman 1964 parameters). */
export const ARGON = { epsK: 120, sigmaA: 3.4, massU: 39.948 };
export const tauPs = () => { const kB = 1.380649e-23, u = 1.66053906660e-27; return ARGON.sigmaA * 1e-10 * Math.sqrt((ARGON.massU * u) / (ARGON.epsK * kB)) * 1e12; };
export const densityGcc = (rhoStar: number) => (rhoStar * ARGON.massU * 1.66053906660e-24) / (ARGON.sigmaA * 1e-8) ** 3;
