/**
 * Transport and enzyme kinetics (Phase 11, Gate 11.6).
 *
 * Diffusion
 *  - Fick (1855), eq. (2): the concentration obeys ∂c/∂t = D ∂²c/∂x² (Fick prints the coefficient with a minus sign;
 *    the International Critical Tables define it without, p. 63). Solved here by explicit finite differences (FTCS),
 *    stable for r = DΔt/Δx² ≤ ½; checked against the spreading Gaussian c = (M/√(4πDt)) exp(−x²/4Dt).
 *  - Einstein (1905; tr. 1926), eq. (11): the root-mean-square displacement along one axis λx = √(2Dt); total (3D)
 *    λx√3 (eq. 12). Hence the time to wander a distance x along one axis is t = x²/(2D).
 *  - Einstein, p. 17: D = (RT/N) · 1/(6πkP) for spheres of radius P in a liquid of viscosity k.
 *  - A random walk with Gaussian steps of variance 2DΔt reproduces ⟨x²⟩ = 2Dt.
 * Osmotic pressure: van 't Hoff (1887): PV = RT holds for the osmotic pressure of dilute solutions, so π = cRT for
 *   c moles of solute particles per unit volume — valid only when the dilution is great enough to neglect the
 *   particles' interaction and volume (his own restriction).
 * Enzyme kinetics: Michaelis & Menten (1913), eqs. (2)–(4): the initial rate v = CΦ[S]/([S] + k), i.e. the
 *   normalised rate V = [S]/([S] + k), half its maximum at [S] = k (the dissociation constant).
 */
import { R_GAS } from './membrane';
import { mulberry32 } from '@/core/simulation/random';

/** rms displacement along one axis after time t (Einstein eq. 11). */
export const rmsDisplacement = (D: number, t: number) => Math.sqrt(2 * D * t);
/** rms total (3D) displacement (Einstein eq. 12). */
export const rmsDisplacement3D = (D: number, t: number) => Math.sqrt(3) * rmsDisplacement(D, t);
/** Time for the rms displacement along one axis to reach x. */
export const diffusionTime = (D: number, x: number) => (x * x) / (2 * D);
/** Einstein's D for spheres of radius r in a liquid of viscosity η (SI): D = RT/(6π η r N_A) = k_B T/(6π η r). */
export const stokesEinsteinD = (T: number, eta: number, r: number, N = 6.02214076e23) => (R_GAS * T) / (N * 6 * Math.PI * eta * r);
/** Inverse: radius from D. */
export const stokesEinsteinRadius = (T: number, eta: number, D: number, N = 6.02214076e23) => (R_GAS * T) / (N * 6 * Math.PI * eta * D);

/** Spreading Gaussian from an initial point amount M (per unit area) at x = 0. */
export const gaussianProfile = (M: number, D: number, t: number, x: number) => (M / Math.sqrt(4 * Math.PI * D * t)) * Math.exp(-(x * x) / (4 * D * t));

/** One explicit FTCS step of ∂c/∂t = D ∂²c/∂x² with zero-flux ends; returns a new array. Throws if unstable. */
export function fickStep(c: ArrayLike<number>, D: number, dx: number, dt: number): Float64Array {
  const r = (D * dt) / (dx * dx);
  if (r > 0.5) throw new Error(`unstable: r = ${r} > 0.5`);
  const n = c.length, out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    // finite-volume form: flux only between neighbouring cells, none through the ends, so the total is conserved
    out[i] = c[i] + r * ((i > 0 ? c[i - 1] - c[i] : 0) + (i < n - 1 ? c[i + 1] - c[i] : 0));
  }
  return out;
}

/** N walkers from x = 0, Gaussian steps of variance 2DΔt (Box–Muller on a seeded generator). Returns final positions. */
export function randomWalk(nWalkers: number, D: number, dt: number, steps: number, seed = 1): Float64Array {
  const rnd = mulberry32(seed), x = new Float64Array(nWalkers), s = Math.sqrt(2 * D * dt);
  for (let k = 0; k < steps; k++) for (let i = 0; i < nWalkers; i++) {
    const u = Math.max(1e-12, rnd()), v = rnd();
    x[i] += s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  return x;
}
export const meanSquare = (x: ArrayLike<number>) => { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return s / x.length; };

/** Ideal (van 't Hoff) osmotic pressure in pascals for c mol/m³ of solute particles at T kelvin. */
export const osmoticPressure = (c: number, T: number) => c * R_GAS * T;

/** Michaelis–Menten normalised initial rate V = [S]/([S] + k) (eq. 4). */
export const michaelisMenten = (S: number, k: number) => S / (S + k);
