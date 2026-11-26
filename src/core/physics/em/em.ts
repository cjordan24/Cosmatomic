/**
 * Voyager Physics Engine — electromagnetic radiation in vacuum (Gate 4.6). SI units.
 *
 *  Vacuum relations      λ = c/f,  E = hf = hc/λ,  σ̃ = 1/λ (wavenumber)        c, h, e exact (2019 SI, CODATA)
 *  In a medium           f is unchanged; λ_medium = λ₀/n,  v_phase = c/n          (n from a sourced dispersion formula)
 *  Plane wave (vacuum)   k̂ = +z;  E = (E₀ₓ cos φ, E₀ᵧ cos(φ + δ), 0),  φ = kz − ωt
 *                        B = k̂ × E / c  →  E ⊥ B ⊥ k,  |B| = |E|/c
 *  Polarisation          δ = 0 or π: linear;  E₀ₓ = E₀ᵧ and δ = ±π/2: circular;  otherwise elliptical.
 *                        Handedness follows CIE S 017 (17-21-018/019): RIGHT-handed when the field rotates
 *                        CLOCKWISE as seen by an observer receiving the radiation (looking towards the source).
 *  Intensity             ⟨S⟩ = c ε₀ ⟨|E|²⟩ = ½ c ε₀ (E₀ₓ² + E₀ᵧ²)
 *  Blackbody (Planck)    B_λ(λ,T) = 2hc²/λ⁵ · 1/(e^{hc/λkT} − 1)   [W sr⁻¹ m⁻³]
 *                        B_ν(ν,T) = 2hν³/c² · 1/(e^{hν/kT} − 1)    [W sr⁻¹ m⁻² Hz⁻¹]
 *  Wien displacement     λ_max = b/T, b = hc/(x₅k), x₅ solves x = 5(1 − e^{−x});
 *                        ν_max = x₃kT/h, x₃ solves x = 3(1 − e^{−x}).  (Peaks per λ and per ν differ.)
 *
 * Validity: classical vacuum fields; no dispersion or absorption unless a medium is given; an ideal
 * blackbody is an idealisation (real sources such as the Sun deviate from it).
 */
import { CONSTANTS } from '@/core/constants/constants';

const c = CONSTANTS.c.value, h = CONSTANTS.h.value, e = CONSTANTS.e.value, kB = CONSTANTS.kB.value, eps0 = CONSTANTS.eps0.value;
export const MU0 = 1 / (eps0 * c * c);

export type QuantityKind = 'frequency' | 'wavelength' | 'energy';
export interface Photon { f: number; lambda: number; energyJ: number; energyEV: number; wavenumberPerCm: number; omega: number; k: number }

/** Every photon quantity from one input: frequency (Hz), vacuum wavelength (m) or energy (eV). */
export function photon(kind: QuantityKind, value: number): Photon {
  if (!(value > 0) || !Number.isFinite(value)) throw new RangeError('quantity must be positive and finite');
  const f = kind === 'frequency' ? value : kind === 'wavelength' ? c / value : (value * e) / h;
  const lambda = c / f;
  return { f, lambda, energyJ: h * f, energyEV: (h * f) / e, wavenumberPerCm: 1 / (lambda * 100), omega: 2 * Math.PI * f, k: (2 * Math.PI) / lambda };
}
export const vacuumWavelength = (f: number) => c / f;
export const photonEnergyEV = (f: number) => (h * f) / e;

/** Propagation in a non-absorbing medium of refractive index n: frequency is invariant. */
export function inMedium(f: number, n: number) {
  if (!(n > 0)) throw new RangeError('refractive index must be positive');
  return { f, lambda: c / f / n, vPhase: c / n };
}

// ---------------------------------------------------------------- plane wave & polarisation
export interface Polarisation { Ex0: number; Ey0: number; delta: number }
export type Vec3 = [number, number, number];

export const POLARISATIONS: Record<'linear-x' | 'linear-45' | 'circular-right' | 'circular-left' | 'elliptical', Polarisation> = {
  'linear-x': { Ex0: 1, Ey0: 0, delta: 0 },
  'linear-45': { Ex0: Math.SQRT1_2, Ey0: Math.SQRT1_2, delta: 0 },
  'circular-right': { Ex0: Math.SQRT1_2, Ey0: Math.SQRT1_2, delta: -Math.PI / 2 },
  'circular-left': { Ex0: Math.SQRT1_2, Ey0: Math.SQRT1_2, delta: Math.PI / 2 },
  'elliptical': { Ex0: 0.894, Ey0: 0.447, delta: -Math.PI / 3 },
};

/** Electric field (V/m) at position z (m) and time t (s) for a +z plane wave of frequency f; amplitudes scaled by E0. */
export function planeE(p: Polarisation, E0: number, f: number, z: number, t: number): Vec3 {
  const k = (2 * Math.PI * f) / c, w = 2 * Math.PI * f, phi = k * z - w * t;
  return [E0 * p.Ex0 * Math.cos(phi), E0 * p.Ey0 * Math.cos(phi + p.delta), 0];
}
/** Magnetic flux density (T): B = k̂ × E / c with k̂ = ẑ. */
export function planeB(E: Vec3): Vec3 { return [-E[1] / c, E[0] / c, 0]; }
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
/** Instantaneous Poynting vector S = E × B / μ₀ (W/m²). */
export const poynting = (E: Vec3, B: Vec3): Vec3 => cross(E, B).map((x) => x / MU0) as Vec3;
/** Time-averaged intensity ⟨S⟩ (W/m²). */
export const intensity = (p: Polarisation, E0: number) => 0.5 * c * eps0 * E0 * E0 * (p.Ex0 ** 2 + p.Ey0 ** 2);

export type PolKind = 'linear' | 'circular' | 'elliptical';
export function classify(p: Polarisation, tol = 1e-9): { kind: PolKind; handedness: 'right' | 'left' | null } {
  const s = Math.sin(p.delta);
  if (Math.abs(s) < tol || p.Ex0 < tol || p.Ey0 < tol) return { kind: 'linear', handedness: null };
  // Seen from +z looking back at the source (the receiver's view), δ > 0 rotates x → y = anticlockwise = LEFT (CIE).
  const handedness = s > 0 ? 'left' : 'right';
  const circular = Math.abs(p.Ex0 - p.Ey0) < 1e-6 && Math.abs(Math.abs(s) - 1) < 1e-9;
  return { kind: circular ? 'circular' : 'elliptical', handedness };
}

// ---------------------------------------------------------------- blackbody
/** Solve x = n(1 − e^{−x}) for the non-trivial root (Newton). */
export function wienRoot(n: number): number {
  let x = n;
  for (let i = 0; i < 50; i++) { const g = x - n * (1 - Math.exp(-x)), dg = 1 - n * Math.exp(-x); const dx = g / dg; x -= dx; if (Math.abs(dx) < 1e-15) break; }
  return x;
}
export const WIEN_B = (h * c) / (wienRoot(5) * kB);           // m K
export const WIEN_B_FREQ = (wienRoot(3) * kB) / h;            // Hz/K
export const peakWavelength = (T: number) => WIEN_B / T;
export const peakFrequency = (T: number) => WIEN_B_FREQ * T;
export function planckLambda(lambda: number, T: number): number {
  const x = (h * c) / (lambda * kB * T);
  return x > 700 ? 0 : (2 * h * c * c) / lambda ** 5 / Math.expm1(x);
}
export function planckNu(nu: number, T: number): number {
  const x = (h * nu) / (kB * T);
  return x > 700 ? 0 : (2 * h * nu ** 3) / (c * c) / Math.expm1(x);
}
/** Stefan–Boltzmann constant derived from h, c, k: σ = 2π⁵k⁴/(15h³c²). */
export const SIGMA_SB = (2 * Math.PI ** 5 * kB ** 4) / (15 * h ** 3 * c * c);
