/**
 * Dark-matter evidence (Phase 7, Gate 7.4): pure functions behind #/cosmic/darkmatter.
 *
 *  - Accelerations and enclosed masses from circular speeds: g = V²/R, M(<R) ≈ V²R/G (spherical
 *    approximation; a flattened disc differs by a factor of order unity).
 *  - The generalised halo profile of Łokas & Mamon (2003) eq. 6, ρ = ρ_char / [(r/r_s)^α (1 + r/r_s)^(3−α)],
 *    normalised so that the mass inside r_v (mean density Δ_c ρ_crit,0, eq. 9) is M_v (eqs. 10–12).
 *    α = 1 is the NFW profile.
 *  - Their Coma mass model: stars from the fitted luminosity profile × Υ (eqs. 1–2), isothermal β-model
 *    gas (eqs. 4–5), dark matter (eq. 12); M(r) = M_G + M_g + M_D (eq. 24).
 *  - The spherical Jeans equation with constant anisotropy β (their eqs. 15–16; Binney & Mamon 1982)
 *    projected to a line-of-sight velocity dispersion.
 *  - Offsets on the sky between two J2000 positions (small-angle, east = increasing RA).
 *
 * Nothing here decides whether dark matter exists: the functions turn published inputs into the quantities
 * the view compares (Newtonian expectations from the visible matter against what is measured).
 */
import { CONSTANTS, PARSEC_M, SOLAR_MASS_KG } from '@/core/constants/constants';

/** G in kpc (km/s)² / M☉. 1 kpc = 1000 pc = PARSEC_M km numerically. */
export const G_KPC = CONSTANTS.GMsun.value / 1e9 / PARSEC_M;
/** (km/s)²/kpc → m/s². */
export const ACCEL_SI_PER_KMS2_KPC = 1e6 / (1e3 * PARSEC_M);
const KPC_CM = PARSEC_M * 1e3 * 100;

/** Centripetal acceleration (m/s²) from a signed V² (km²/s²) at R (kpc). */
export const accelFromV2 = (V2: number, R: number) => (V2 / R) * ACCEL_SI_PER_KMS2_KPC;
/** Mass (M☉) inside R (kpc) that a circular speed √V2 implies for a spherical distribution: V²R/G. */
export const enclosedMassFromV2 = (V2: number, R: number) => (V2 * R) / G_KPC;
/** Mass discrepancy V_obs²/V_bar²; null where the baryonic V² is not positive. */
export const massDiscrepancy = (vObs: number, vBar2: number) => (vBar2 > 0 ? (vObs * vObs) / vBar2 : null);

/** ρ_crit,0 = 3H₀²/8πG in M☉/kpc³ (H₀ in km/s/Mpc). */
export const criticalDensity = (H0: number) => (3 * (H0 / 1000) ** 2) / (8 * Math.PI * G_KPC);
/** Radius (kpc) inside which mass M (M☉) has mean density Δ ρ_crit. */
export const radiusAtOverdensity = (M: number, delta: number, H0: number) => Math.cbrt((3 * M) / (4 * Math.PI * delta * criticalDensity(H0)));

/** m(x) = ∫₀ˣ u^(2−α) (1+u)^(α−3) du, the dimensionless mass of the generalised profile (Simpson in ln u). */
export function profileMass(x: number, alpha: number): number {
  if (x <= 0) return 0;
  const s0 = Math.log(x) - 18, s1 = Math.log(x), n = 600, h = (s1 - s0) / n;
  const f = (s: number) => { const u = Math.exp(s); return u ** (3 - alpha) * (1 + u) ** (alpha - 3); };
  let sum = f(s0) + f(s1);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(s0 + i * h);
  // the part below e^(s0) ≈ 1.5e−8 x contributes ∝ x^(3−α) e^(−18(3−α)): negligible for α ≤ 3/2
  return (sum * h) / 3;
}

export interface Halo { Mv: number; c: number; alpha: number; deltaC: number; H0: number }
/** Virial radius (kpc) and scale radius of a generalised halo. */
export function haloRadii(h: Halo) { const rv = radiusAtOverdensity(h.Mv, h.deltaC, h.H0); return { rv, rs: rv / h.c }; }
/** Dark mass (M☉) inside r (kpc): M_v · m(r/r_s)/m(c) (Łokas & Mamon eq. 12). */
export function haloMass(r: number, h: Halo): number {
  const { rs } = haloRadii(h);
  return (h.Mv * profileMass(r / rs, h.alpha)) / profileMass(h.c, h.alpha);
}

/** A monotonic function sampled on a log grid and interpolated in log–log (fast repeated evaluation). */
export function logTable(f: (r: number) => number, rMin: number, rMax: number, n = 400): (r: number) => number {
  const lr = Array.from({ length: n }, (_, i) => Math.log(rMin) + (i / (n - 1)) * (Math.log(rMax) - Math.log(rMin)));
  const lf = lr.map((l) => Math.log(Math.max(f(Math.exp(l)), 1e-300)));
  const step = lr[1] - lr[0];
  return (r: number) => {
    if (r <= 0) return 0;
    const t = (Math.log(r) - lr[0]) / step;
    if (t <= 0) return Math.exp(lf[0] + (lf[1] - lf[0]) * t);
    if (t >= n - 1) return Math.exp(lf[n - 1] + (lf[n - 1] - lf[n - 2]) * (t - n + 1));
    const i = Math.floor(t), w = t - i;
    return Math.exp(lf[i] * (1 - w) + lf[i + 1] * w);
  };
}

// ---------------------------------------------------------------- the Coma model (Łokas & Mamon 2003)
export interface ComaInputs {
  distanceMpc: number;
  stars: { lstar: number; rS: number; upsilon: number }; // L☉/arcmin³, arcmin, M☉/L☉
  tracer: { lstar: number; rS: number };
  gas: { n0: number; rc: number; b: number; gamma: number }; // cm⁻³, arcmin
  deltaC: number; H0: number;
}
export interface ComaModel {
  kpcPerArcmin: number;
  halo: Halo; rv: number; rs: number;
  stars: (r: number) => number; gas: (r: number) => number; dark: (r: number) => number;
  baryons: (r: number) => number; total: (r: number) => number;
  /** blue luminosity (L☉) inside r */
  light: (r: number) => number;
  /** tracer (E-S0) luminosity density, arbitrary normalisation */
  tracer: (r: number) => number;
}

export function comaModel(p: ComaInputs, fit: { Mv: number; c: number; alpha: number }): ComaModel {
  const kpcPerArcmin = (p.distanceMpc * 1e3 * Math.PI) / (180 * 60);
  const rSs = p.stars.rS * kpcPerArcmin, lS = p.stars.lstar / kpcPerArcmin ** 3; // L☉/kpc³
  const light = (r: number) => 4 * Math.PI * lS * rSs ** 3 * (Math.log((r + rSs) / rSs) - r / (r + rSs));
  const stars = (r: number) => p.stars.upsilon * light(r);
  const rc = p.gas.rc * kpcPerArcmin;
  const rho0 = (p.gas.n0 * (CONSTANTS.me.value + p.gas.gamma * CONSTANTS.mp.value) / SOLAR_MASS_KG) * KPC_CM ** 3; // M☉/kpc³
  const gasExact = (r: number) => { // Simpson in x on [0, r]
    const n = 400, h = r / n; const f = (x: number) => x * x * (1 + (x / rc) ** 2) ** (-1.5 * p.gas.b);
    let s = f(0) + f(r); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(i * h);
    return 4 * Math.PI * rho0 * (s * h) / 3;
  };
  const halo: Halo = { ...fit, deltaC: p.deltaC, H0: p.H0 };
  const { rv, rs } = haloRadii(halo);
  const gas = logTable(gasExact, 0.1, 1e5, 300);
  const dark = logTable((r) => haloMass(r, halo), 0.1, 1e5, 300);
  const rTr = p.tracer.rS * kpcPerArcmin;
  const tracer = (r: number) => 1 / ((r / rTr) * (1 + r / rTr) ** 2);
  const baryons = (r: number) => stars(r) + gas(r);
  return { kpcPerArcmin, halo, rv, rs, stars, gas, dark, baryons, total: (r) => baryons(r) + dark(r), light, tracer };
}

/** Radius (kpc) where the mean enclosed density of M(r) falls to Δ ρ_crit (bisection on [lo, hi]). */
export function overdensityRadius(M: (r: number) => number, delta: number, H0: number, lo = 10, hi = 2e4): number {
  const target = delta * criticalDensity(H0);
  const g = (r: number) => M(r) / ((4 / 3) * Math.PI * r ** 3) - target;
  for (let i = 0; i < 100; i++) { const m = Math.sqrt(lo * hi); if (g(m) > 0) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}

// ---------------------------------------------------------------- spherical Jeans equation
/**
 * Line-of-sight velocity dispersion σ_los(R) (km/s) of a tracer with 3-D density ν(r) in a mass
 * distribution M(r) (M☉, r in kpc), constant anisotropy β:
 *   ν σ_r²(r) = r^(−2β) ∫_r^∞ r'^(2β) ν G M / r'² dr'                    (Łokas & Mamon eq. 15)
 *   σ_los²(R) = 2/I(R) ∫_R^∞ (1 − β R²/r²) ν σ_r² r / √(r² − R²) dr      (eq. 16)
 *   I(R) = 2 ∫_R^∞ ν r / √(r² − R²) dr.
 * The projection integrals use r = R cosh t, which removes the singularity at r = R.
 * Integrals are truncated at rMax (default 10⁵ kpc).
 */
export function jeansSigmaLos(Rs: number[], M: (r: number) => number, nu: (r: number) => number, beta: number, rMax = 1e5): number[] {
  const rMin = Math.max(1e-3, Math.min(...Rs) / 20), n = 800;
  const lr = Array.from({ length: n }, (_, i) => Math.log(rMin) + (i / (n - 1)) * (Math.log(rMax) - Math.log(rMin)));
  const integrand = (r: number) => r ** (2 * beta) * nu(r) * (G_KPC * M(r)) / (r * r) * r; // × r for d ln r
  const P = new Array<number>(n).fill(0);
  let acc = 0;
  for (let i = n - 2; i >= 0; i--) {
    const h = lr[i + 1] - lr[i];
    acc += 0.5 * h * (integrand(Math.exp(lr[i])) + integrand(Math.exp(lr[i + 1])));
    P[i] = Math.exp(lr[i]) ** (-2 * beta) * acc;
  }
  const step = lr[1] - lr[0];
  const Pat = (r: number) => {
    const t = (Math.log(r) - lr[0]) / step;
    if (t <= 0) return P[0];
    if (t >= n - 1) return 0;
    const i = Math.floor(t), w = t - i;
    if (P[i + 1] <= 0) return P[i] * (1 - w);
    return Math.exp(Math.log(P[i]) * (1 - w) + Math.log(P[i + 1]) * w);
  };
  return Rs.map((R) => {
    const tMax = Math.acosh(rMax / R), m = 2000, h = tMax / m;
    let num = 0, den = 0;
    for (let k = 0; k <= m; k++) {
      const t = k * h, ch = Math.cosh(t), r = R * ch, wgt = k === 0 || k === m ? 1 : k % 2 ? 4 : 2;
      num += wgt * (1 - beta / (ch * ch)) * Pat(r) * r;
      den += wgt * nu(r) * r;
    }
    return Math.sqrt(Math.max(0, num / den));
  });
}

// ---------------------------------------------------------------- positions on the sky
/** "hh:mm:ss.s" → degrees; "±dd:mm:ss.s" (ASCII or U+2212 minus) → degrees. */
export const parseRa = (s: string) => { const [h, m, x] = s.split(':').map(Number); return 15 * (h + m / 60 + x / 3600); };
export const parseDec = (s: string) => { const neg = /^[-−]/.test(s.trim()); const [d, m, x] = s.replace(/^[-−+]/, '').split(':').map(Number); return (neg ? -1 : 1) * (d + m / 60 + x / 3600); };
/** Small-angle offset (arcsec) of position b from a: east (increasing RA) and north. */
export function skyOffsetArcsec(a: { ra: string; dec: string }, b: { ra: string; dec: string }) {
  const dec0 = (parseDec(a.dec) * Math.PI) / 180;
  return { east: (parseRa(b.ra) - parseRa(a.ra)) * Math.cos(dec0) * 3600, north: (parseDec(b.dec) - parseDec(a.dec)) * 3600 };
}
