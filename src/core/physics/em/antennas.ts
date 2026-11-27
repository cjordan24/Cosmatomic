/**
 * Voyager Physics Engine — antennas and radiation (Phase 9, Gate 9.1). SI units; phasors use e^{+jωt}.
 *
 * Source: S. W. Ellingson, Electromagnetics Vol. 2 (VT Publishing 2020, CC BY-SA 4.0), chapters 9–10.
 *
 *  Hertzian dipole (current moment IΔl at the origin along the dipole axis, lossless medium):
 *    H_φ = (IΔl / 4π) sinθ e^{−jβr}/r · (jβ + 1/r)                                   (eq. 9.61, exact)
 *    E = (1/jωε) ∇ × H                                                                   (eq. 9.65)
 *      → E_r = (2K cosθ / jωε) e^{−jβr} (jβ/r² + 1/r³)
 *        E_θ = (K sinθ / jωε r) e^{−jβr} (−β² + jβ/r + 1/r²),   K = IΔl/4π           (derived here from 9.61 and 9.65)
 *    Far field (r ≫ λ): E_θ ≈ jη (IΔl β/4π) sinθ e^{−jβr}/r                              (eq. 9.67)
 *    The near and far terms of (jβ + 1/r) are equal at r = 1/β = λ/2π                    (eq. 9.62–9.63)
 *  Thin straight filament of length L with current I(z), far field (r ≫ L, r ≫ λ):
 *    E_θ ≈ j(η/2) (e^{−jβr}/r) sinθ · (1/λ) ∫ I(z′) e^{+jβz′ cosθ} dz′                 (eq. 9.96)
 *    electrically short dipole: triangular current (§9.5), E_θ ≈ jη I₀ βL/(8π) sinθ e^{−jβr}/r (eq. 10.49)
 *    half-wave dipole: I(z) = I₀ cos(πz/L), L = λ/2 (eq. 9.97) → E_θ ≈ jη I₀/(2π) cos[(π/2)cosθ]/sinθ e^{−jβr}/r (eq. 9.102)
 *  Power density S = |E|²/2η; P_rad = ∮ S r² dΩ;  R_rad = 2P_rad/|I₀|²                (eqs. 10.29, 10.38)
 *  Directivity D(θ,φ) = S / S_ave = 4π r² S / P_rad                                      (eq. 10.48)
 *  Effective aperture A_e = D λ²/4π                                                     (eq. 10.160)
 *  Friis: P_R = P_T G_T (λ/4πR)² G_R;  free-space path loss L_p = (4πR/λ)²               (eqs. 10.166–10.167)
 *  Arrays: identical elements at x_n = n d with phase n α; far fields add (superposition), so the pattern is the
 *    element pattern times the array factor AF = Σ e^{jn(βd sinθ cosφ + α)} (derived from eq. 9.96 by superposition;
 *    mutual coupling between elements is neglected, which Ellingson §10.12 notes matters for dense arrays).
 *
 * Validity: thin, lossless wires in free space; no ground, no feed line or impedance mismatch; far-field formulas only
 * where r ≫ λ and r ≫ L (the Hertzian near field is exact).
 */
import { CONSTANTS } from '@/core/constants/constants';
import { MU0 } from './em';

const c = CONSTANTS.c.value, EPS0 = CONSTANTS.eps0.value;
/** Wave impedance of free space η₀ = μ₀c (≈ 376.7 Ω, Ellingson eq. 5.57). */
export const ETA0 = MU0 * c;

// ---------------------------------------------------------------- complex helpers
export type Cx = [number, number];
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: Cx, b: Cx): Cx => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const cexpj = (ph: number): Cx => [Math.cos(ph), Math.sin(ph)];
export const cabs = (a: Cx) => Math.hypot(a[0], a[1]);
/** Instantaneous value Re{P e^{jωt}} of a phasor. */
export const instant = (p: Cx, omegaT: number) => p[0] * Math.cos(omegaT) - p[1] * Math.sin(omegaT);

// ---------------------------------------------------------------- Hertzian dipole (exact)
export interface Hertzian { /** current moment IΔl (A·m) */ IdL: number; /** frequency (Hz) */ f: number }
export interface HertzianPhasors { Er: Cx; Etheta: Cx; Hphi: Cx }
export const wavelength = (f: number) => c / f;
export const beta = (f: number) => (2 * Math.PI * f) / c;
/** r at which the near (1/r²) and radiating (1/r) parts of H_φ are equal: 1/β = λ/2π. */
export const nearFarCrossover = (f: number) => 1 / beta(f);

export function hertzianPhasors(d: Hertzian, r: number, theta: number): HertzianPhasors {
  if (!(r > 0)) throw new RangeError('distance must be positive (the field diverges at the dipole)');
  const b = beta(d.f), w = 2 * Math.PI * d.f, K = d.IdL / (4 * Math.PI);
  const ph = cexpj(-b * r);
  const jweps: Cx = [0, w * EPS0];
  const s = Math.sin(theta), co = Math.cos(theta);
  const Hphi = cmul([K * s / r, 0], cmul(ph, [1 / r, b]));                                      // (jβ + 1/r)
  const Er = cdiv(cmul([2 * K * co, 0], cmul(ph, [1 / r ** 3, b / r ** 2])), jweps);            // (jβ/r² + 1/r³)
  const Etheta = cdiv(cmul([K * s / r, 0], cmul(ph, [-b * b + 1 / (r * r), b / r])), jweps);   // (−β² + jβ/r + 1/r²)
  return { Er, Etheta, Hphi };
}
/** Far-field approximation of E_θ (eq. 9.67). */
export function hertzianFarEtheta(d: Hertzian, r: number, theta: number): Cx {
  const b = beta(d.f);
  return cmul([0, (ETA0 * d.IdL * b * Math.sin(theta)) / (4 * Math.PI * r)], cexpj(-b * r));
}

/**
 * Instantaneous fields on the plane containing the dipole. The dipole lies along the frame +y axis; (x, y) in metres.
 * Returns the in-plane electric field (Ex, Ey) and the out-of-plane magnetic field Hz (positive out of the screen).
 */
export function hertzianInstant(d: Hertzian, x: number, y: number, t: number): { Ex: number; Ey: number; Hz: number } {
  const r = Math.hypot(x, y);
  const theta = Math.atan2(Math.abs(x), y);          // angle from the dipole axis, 0…π
  const side = x >= 0 ? 1 : -1;
  const p = hertzianPhasors(d, r, theta);
  const wt = 2 * Math.PI * d.f * t;
  const er = instant(p.Er, wt), et = instant(p.Etheta, wt), hp = instant(p.Hphi, wt);
  // r̂ = (side·sinθ, cosθ), θ̂ = (side·cosθ, −sinθ) in the frame; φ̂ = r̂ × θ̂ points into the screen for x > 0
  const s = Math.sin(theta), co = Math.cos(theta);
  return { Ex: er * side * s + et * side * co, Ey: er * co - et * s, Hz: -side * hp };
}

// ---------------------------------------------------------------- thin filaments (far field)
export type DipoleKind = 'esd' | 'hwd';
export interface Dipole { kind: DipoleKind; /** physical length as a fraction of λ (ESD: ≤ 0.1; HWD: 0.5) */ lengthL: number }
export const HWD: Dipole = { kind: 'hwd', lengthL: 0.5 };
/** Normalised current I(z)/I₀ at position u = z/L ∈ [−½, ½]. */
export function currentShape(d: Dipole, u: number): number {
  if (Math.abs(u) > 0.5) return 0;
  return d.kind === 'esd' ? 1 - 2 * Math.abs(u) : Math.cos(Math.PI * u);
}
/**
 * The bracket of eq. 9.96, (1/λ) ∫ I(z′) e^{jβz′cosθ} dz′, per unit I₀, by composite Simpson's rule (n even).
 * Lengths in units of λ, so the result is dimensionless.
 */
export function filamentIntegral(d: Dipole, theta: number, n = 256): Cx {
  const L = d.lengthL, co = Math.cos(theta), h = L / n;
  let re = 0, im = 0;
  for (let i = 0; i <= n; i++) {
    const zl = -L / 2 + i * h;                       // z′/λ
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    const I = currentShape(d, zl / L);
    re += w * I * Math.cos(2 * Math.PI * zl * co);
    im += w * I * Math.sin(2 * Math.PI * zl * co);
  }
  return [(re * h) / 3, (im * h) / 3];
}
/** r·|E_θ| per unit I₀ (V/A) in the far field (eq. 9.96 for the numerical form). */
export function farFieldMagnitude(d: Dipole, theta: number): number {
  return (ETA0 / 2) * Math.abs(Math.sin(theta)) * cabs(filamentIntegral(d, theta));
}
/** Closed forms quoted by Ellingson, per unit I₀: ESD eq. 10.49 and HWD eq. 9.102 (r·|E_θ|). */
export function farFieldClosedForm(d: Dipole, theta: number): number {
  const s = Math.sin(theta);
  if (d.kind === 'esd') return (ETA0 * 2 * Math.PI * d.lengthL * Math.abs(s)) / (8 * Math.PI);
  if (Math.abs(s) < 1e-12) return 0;
  return (ETA0 / (2 * Math.PI)) * Math.abs(Math.cos((Math.PI / 2) * Math.cos(theta)) / s);
}

/** Radiation intensity U = r²S = r²|E|²/2η (W/sr per A² of I₀²) as a function of direction. */
export type Pattern = (theta: number, phi: number) => number;
export const dipolePattern = (d: Dipole): Pattern => { const cache = new Map<number, number>(); return (theta) => {
  const k = Math.round(theta * 1e6);
  let v = cache.get(k);
  if (v === undefined) { v = farFieldMagnitude(d, theta) ** 2 / (2 * ETA0); cache.set(k, v); }
  return v;
}; };

/** ∮ U dΩ by the midpoint rule on an nθ × nφ grid (axisymmetric patterns can use nφ = 1). */
export function totalPower(U: Pattern, nTheta = 360, nPhi = 1): number {
  let s = 0;
  const dt = Math.PI / nTheta, dp = (2 * Math.PI) / nPhi;
  for (let i = 0; i < nTheta; i++) {
    const th = (i + 0.5) * dt, st = Math.sin(th);
    for (let j = 0; j < nPhi; j++) s += U(th, (j + 0.5) * dp) * st;
  }
  return s * dt * dp;
}
export interface PatternStats { Prad: number; Dmax: number; DmaxDbi: number; thetaMax: number; phiMax: number; hpbwDeg: number | null; Rrad: number; AeMaxLambda2: number }
/** Directivity, radiation resistance (per I₀ = 1 A peak) and maximum effective aperture of a pattern. */
export function patternStats(U: Pattern, nTheta = 720, nPhi = 1): PatternStats {
  const Prad = totalPower(U, nTheta, nPhi);
  let best = -1, tm = Math.PI / 2, pm = 0;
  const nP = Math.max(1, nPhi);
  for (let i = 0; i <= nTheta; i++) for (let j = 0; j < nP; j++) {
    const th = (i / nTheta) * Math.PI, ph = (j / nP) * 2 * Math.PI, u = U(th, ph);
    if (u > best) { best = u; tm = th; pm = ph; }
  }
  const Dmax = (4 * Math.PI * best) / Prad;
  // half-power beamwidth in the elevation cut through the maximum (φ = φ_max)
  let lo: number | null = null, hi: number | null = null;
  for (let i = 0; i <= 3600; i++) { const th = (i / 3600) * Math.PI; if (U(th, pm) >= best / 2) { if (lo === null) lo = th; hi = th; } }
  const hpbw = lo !== null && hi !== null && (lo > 0 || hi < Math.PI) ? ((hi - lo) * 180) / Math.PI : null;
  return { Prad, Dmax, DmaxDbi: 10 * Math.log10(Dmax), thetaMax: tm, phiMax: pm, hpbwDeg: hpbw, Rrad: 2 * Prad, AeMaxLambda2: Dmax / (4 * Math.PI) };
}
/** Textbook values (Ellingson): ESD D = 1.5 sin²θ (eq. 10.54), R_rad ≈ 20π²(L/λ)² (§10.6), A_e ≈ 0.119λ² (eq. 10.150); HWD R_rad ≅ 73 Ω, A_e ≈ 0.131λ² (Example 10.10). */
export const TEXTBOOK = {
  esd: { Dmax: 1.5, RradPerL2: 20 * Math.PI ** 2, AeMaxLambda2: 0.119 },
  hwd: { Rrad: 73, AeMaxLambda2: 0.131 },
  isotropicAeLambda2: 0.080,
} as const;

// ---------------------------------------------------------------- uniform linear arrays
export interface ArraySpec { element: Dipole | 'isotropic'; N: number; /** spacing in wavelengths */ d: number; /** progressive phase per element (rad) */ alpha: number }
/** |AF|² of N elements along the frame x axis (perpendicular to the dipole axis z). */
export function arrayFactor2(a: ArraySpec, theta: number, phi: number): number {
  const psi = 2 * Math.PI * a.d * Math.sin(theta) * Math.cos(phi) + a.alpha;
  let re = 0, im = 0;
  for (let n = 0; n < a.N; n++) { re += Math.cos(n * psi); im += Math.sin(n * psi); }
  return re * re + im * im;
}
export function arrayPattern(a: ArraySpec): Pattern {
  const el = a.element === 'isotropic' ? () => 1 : dipolePattern(a.element);
  return (th, ph) => el(th, ph) * arrayFactor2(a, th, ph);
}
/** Directions (φ in the θ = 90° plane, radians) where ψ = 2πm, i.e. full-strength maxima of the array factor. */
export function arrayMainLobes(a: ArraySpec): number[] {
  const out: number[] = [];
  for (let m = -8; m <= 8; m++) {
    const cosPhi = (2 * Math.PI * m - a.alpha) / (2 * Math.PI * a.d);
    if (Math.abs(cosPhi) <= 1) { const p = Math.acos(cosPhi); out.push(p); if (p > 1e-9 && p < Math.PI - 1e-9) out.push(2 * Math.PI - p); }
  }
  return out.sort((x, y) => x - y);
}

// ---------------------------------------------------------------- links (Friis)
export const dB = (x: number) => 10 * Math.log10(x);
export const fromDb = (x: number) => 10 ** (x / 10);
export const wToDbm = (w: number) => dB(w / 1e-3);
export const dbmToW = (dbm: number) => 1e-3 * fromDb(dbm);
export const effectiveAperture = (D: number, lambda: number) => (D * lambda * lambda) / (4 * Math.PI);
export const freeSpacePathLoss = (R: number, lambda: number) => ((4 * Math.PI * R) / lambda) ** 2;
/** Received power (W) of a conjugate-matched, co-polarised link in free space (eq. 10.166). */
export const friis = (PT: number, GT: number, GR: number, R: number, lambda: number) => (PT * GT * GR) / freeSpacePathLoss(R, lambda);
