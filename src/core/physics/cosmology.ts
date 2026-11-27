/**
 * Cosmological module (Phase 7). FLRW background for ΛCDM with matter, radiation, a cosmological
 * constant and curvature.
 *
 * Sources (Source index):
 *  - hogg-1999: E(z) (14), D_C (15), D_M with curvature (16), D_A (18), D_A12 for lensing (19, valid for
 *    Ω_k ≥ 0 only), D_L (21), distance modulus (25), lookback time (30) and age.
 *  - carroll-1997 ch. 8: ρ ∝ a^−3(1+w) (8.23), matter a^−3 (8.24), radiation a^−4 (8.28), vacuum w = −1
 *    (8.31), acceleration equation (8.33) and the deceleration parameter q = −aä/ȧ² (8.38). Hogg's E(z)
 *    omits radiation; the Ω_r(1+z)⁴ term follows from (8.28).
 *  - planck-2018-vi: parameters (Table 2). Ω_r is not tabulated; it is set from the tabulated matter–
 *    radiation equality redshift, Ω_r = Ω_m / (1 + z_eq), and Ω_Λ = 1 − Ω_m − Ω_r (flat base model).
 *
 * Numerics: integrals in x = ln(1 + z) (or u = √a for ages) by composite Simpson's rule, which keeps the
 * integrands smooth from z = 0 to z ≈ 10⁴.
 * Validity: w = −1 exactly; radiation is massless at all z; Planck's massive neutrino (0.06 eV) is
 * counted as matter at all z; no recombination or reionization physics in the background.
 */
import { CONSTANTS } from '../constants/constants';

export interface Cosmology { name: string; H0: number; Om: number; Ode: number; /** radiation (photons + relativistic neutrinos); 0 if omitted */ Or?: number }

/** Planck 2018 VI, Table 2, TT,TE,EE+lowE+lensing+BAO. Ω_r from z_eq = 3387; Ω_Λ = 1 − Ω_m − Ω_r (tabulated 0.6889 ± 0.0056). */
const P18_OM = 0.3111, P18_ZEQ = 3387, P18_OR = P18_OM / (1 + P18_ZEQ);
export const PLANCK18: Cosmology = { name: 'Planck 2018', H0: 67.66, Om: P18_OM, Or: P18_OR, Ode: 1 - P18_OM - P18_OR };

const C_KMS = CONSTANTS.c.value / 1000;
/** 1/H₀ in Gyr for H₀ in km/s/Mpc: Mpc/km ÷ (s per Gyr). */
export const HUBBLE_TIME_GYR_X_H0 = 3.0856775814913673e19 / (365.25 * 86400 * 1e9);
const orad = (c: Cosmology) => c.Or ?? 0;
export const Ok = (c: Cosmology) => 1 - c.Om - c.Ode - orad(c);
export const E = (z: number, c: Cosmology) => Math.sqrt(orad(c) * (1 + z) ** 4 + c.Om * (1 + z) ** 3 + Ok(c) * (1 + z) ** 2 + c.Ode);
export const hubbleDistanceMpc = (c: Cosmology) => C_KMS / c.H0;
export const hubbleTimeGyr = (c: Cosmology) => HUBBLE_TIME_GYR_X_H0 / c.H0;
/** H(z) = H₀ E(z) in km/s/Mpc. */
export const hubbleParameter = (z: number, c: Cosmology) => c.H0 * E(z, c);

function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** ∫₀^z dz′/E(z′), evaluated in x = ln(1+z). */
const chiIntegral = (z1: number, z2: number, c: Cosmology) =>
  simpson((x) => { const zz = Math.expm1(x); return (1 + zz) / E(zz, c); }, Math.log1p(z1), Math.log1p(z2));

/** Line-of-sight comoving distance (Mpc), Hogg (15). */
export const comovingDistanceMpc = (z: number, c: Cosmology) => (z <= 0 ? 0 : hubbleDistanceMpc(c) * chiIntegral(0, z, c));

/** Transverse comoving distance D_M (Mpc) from a line-of-sight comoving distance, Hogg (16). */
export function dmFromDc(dc: number, c: Cosmology): number {
  const dh = hubbleDistanceMpc(c), ok = Ok(c);
  if (Math.abs(ok) < 1e-10) return dc;
  const s = Math.sqrt(Math.abs(ok));
  return ok > 0 ? (dh / s) * Math.sinh((s * dc) / dh) : (dh / s) * Math.sin((s * dc) / dh);
}
export const transverseComovingMpc = (z: number, c: Cosmology) => dmFromDc(comovingDistanceMpc(z, c), c);

export const luminosityDistanceMpc = (z: number, c: Cosmology) => (1 + z) * transverseComovingMpc(z, c);
export const angularDiameterDistanceMpc = (z: number, c: Cosmology) => transverseComovingMpc(z, c) / (1 + z);
/** Distance modulus μ = 5 log₁₀(D_L / 10 pc), Hogg (25). */
export const distanceModulus = (z: number, c: Cosmology) => 5 * Math.log10(luminosityDistanceMpc(z, c) * 1e5);
/** Proper transverse size per arcsecond at redshift z (kpc/″). */
export const kpcPerArcsec = (z: number, c: Cosmology) => angularDiameterDistanceMpc(z, c) * 1e3 * (Math.PI / 180 / 3600);

/**
 * Angular-diameter distance between z1 < z2 (Mpc), Hogg (19). Not valid for Ω_k < 0 (Hogg notes this),
 * so null is returned for closed models.
 */
export function angularDiameterDistanceBetweenMpc(z1: number, z2: number, c: Cosmology): number | null {
  const ok = Ok(c);
  if (!(z2 > z1 && z1 >= 0) || ok < -1e-10) return null;
  const dh = hubbleDistanceMpc(c), dm1 = transverseComovingMpc(z1, c), dm2 = transverseComovingMpc(z2, c);
  return (dm2 * Math.sqrt(1 + (ok * dm1 * dm1) / (dh * dh)) - dm1 * Math.sqrt(1 + (ok * dm2 * dm2) / (dh * dh))) / (1 + z2);
}

/** Lens geometry for a lens at z_l and source at z_s: D_d, D_s, D_ds (Mpc). */
export function lensDistancesMpc(zl: number, zs: number, c: Cosmology): { Dd: number; Ds: number; Dds: number } | null {
  const Dds = angularDiameterDistanceBetweenMpc(zl, zs, c);
  if (Dds === null || zl <= 0) return null;
  return { Dd: angularDiameterDistanceMpc(zl, c), Ds: angularDiameterDistanceMpc(zs, c), Dds };
}

/** Lookback time in Gyr (= light-travel distance in Gly), Hogg (30). */
export const lookbackTimeGyr = (z: number, c: Cosmology) =>
  z <= 0 ? 0 : hubbleTimeGyr(c) * simpson((x) => 1 / E(Math.expm1(x), c), 0, Math.log1p(z));

/** Age of the universe at redshift z (Gyr): t = (1/H₀) ∫₀^a da′/(a′E), with a = u² to keep the integrand smooth at a → 0. */
export function ageGyr(z: number, c: Cosmology): number {
  const a = 1 / (1 + z);
  return hubbleTimeGyr(c) * simpson((u) => { if (u === 0) return 0; const aa = u * u; return 2 / (u * E(1 / aa - 1, c)); }, 0, Math.sqrt(a), 4000);
}

/** Comoving distance to the particle horizon (Mpc), the radius of the observable universe today. Finite only with matter or radiation. */
export const particleHorizonMpc = (c: Cosmology) => comovingDistanceMpc(1e8, c);

/** Density parameters at redshift z: Ω_i(z) = Ω_i (1+z)^n / E². */
export function densityParameters(z: number, c: Cosmology) {
  const e2 = E(z, c) ** 2;
  return { m: (c.Om * (1 + z) ** 3) / e2, r: (orad(c) * (1 + z) ** 4) / e2, de: c.Ode / e2, k: (Ok(c) * (1 + z) ** 2) / e2 };
}

/** Deceleration parameter q(z) = Σ Ω_i(z)(1 + 3w_i)/2 with w = 0, 1/3, −1 (from Carroll 8.33, 8.38). */
export function decelerationParameter(z: number, c: Cosmology): number {
  const d = densityParameters(z, c);
  return d.m / 2 + d.r - d.de;
}

/** Bisection root of a monotone function on [lo, hi]; null if no sign change. */
function bisect(f: (z: number) => number, lo: number, hi: number): number | null {
  let flo = f(lo);
  if (flo * f(hi) > 0) return null;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; }
  }
  return (lo + hi) / 2;
}
/** Redshift at which the expansion switched from decelerating to accelerating (q = 0). */
export const accelerationOnsetZ = (c: Cosmology) => bisect((z) => decelerationParameter(z, c), 0, 20);
/** Redshift at which matter and dark-energy densities were equal. */
export const matterDarkEnergyEqualityZ = (c: Cosmology) => (c.Ode > 0 ? Math.cbrt(c.Ode / c.Om) - 1 : null);
/** Redshift whose luminosity distance is d_L (Mpc), by bisection in ln(1 + z) up to z = 100; null if out of range. */
export function redshiftAtLuminosityDistance(dLMpc: number, c: Cosmology): number | null {
  if (!(dLMpc >= 0)) return null;
  if (dLMpc === 0) return 0;
  const lz = bisect((lz) => luminosityDistanceMpc(Math.expm1(lz), c) - dLMpc, 0, Math.log1p(100));
  return lz === null ? null : Math.expm1(lz);
}
/** Redshift at which the universe had age t (Gyr); null outside (0, age now]. */
export function redshiftAtAge(tGyr: number, c: Cosmology): number | null {
  if (!(tGyr > 0) || tGyr > ageGyr(0, c)) return null;
  const lz = bisect((lz) => ageGyr(Math.expm1(lz), c) - tGyr, 0, Math.log1p(1e6));
  return lz === null ? null : Math.expm1(lz);
}
