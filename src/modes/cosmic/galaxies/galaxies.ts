/**
 * Galaxies and rotation curves (Phase 6, Gate 6.4).
 *
 *  - Baryonic (Newtonian) rotation curve from the SPARC mass models (Lelli, McGaugh & Schombert 2016,
 *    eq. 2): V_bar² = |V_gas|V_gas + Υ_disk|V_disk|V_disk + Υ_bul|V_bul|V_bul, with V_disk, V_bul tabulated
 *    for Υ = 1 M☉/L☉ at 3.6 µm. Defaults Υ_disk = 0.5, Υ_bul = 0.7 (the values of their Fig. 5).
 *  - NFW dark-matter halo (Navarro, Frenk & White 1996, 1997): ρ ∝ 1/[(r/r_s)(1 + r/r_s)²], with circular
 *    velocity V²(r) = V₂₀₀² · [ln(1 + cx) − cx/(1 + cx)] / (x[ln(1 + c) − c/(1 + c)]), x = r/r₂₀₀ (NFW 1997
 *    eq. 3). r₂₀₀ encloses a mean density of 200 ρ_crit, ρ_crit = 3H²/8πG, so V₂₀₀ = 10 H r₂₀₀ and
 *    M₂₀₀ = V₂₀₀³/(10 G H). H₀ = 73 km/s/Mpc, the value SPARC adopts for Hubble-flow distances.
 *  - Halo fit: V_obs² ≈ V_bar² + V_NFW² by least squares in (log V₂₀₀, log c) on a grid with refinement.
 *    This is a model fit, not a measurement of dark matter; Υ is held fixed.
 */
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import mw from '@datasets/astronomical/milky-way.json';

export interface SparcGalaxy {
  name: string; T: number; D: number; eD: number; fD: number; inc: number; eInc: number; L36: number; eL36: number;
  Reff: number; SBeff: number; Rdisk: number; SBdisk: number; MHI: number; RHI: number; Vflat: number | null; eVflat: number | null; Q: number; refs: string[];
}
/** [R kpc, Vobs, eV, Vgas, Vdisk(Υ=1), Vbul(Υ=1)] in km/s */
export type CurvePoint = [number, number, number, number, number, number];
export interface Sparc { galaxies: SparcGalaxy[]; curves: Record<string, CurvePoint[]>; references: Record<string, string>; notes: Record<string, string> }

let sparcPromise: Promise<Sparc> | null = null;
export function loadSparc(): Promise<Sparc> {
  sparcPromise ??= import('@datasets/astronomical/sparc-galaxies.json').then((m) => (m.default ?? m) as unknown as Sparc);
  return sparcPromise;
}

export const HUBBLE_TYPE = ['S0', 'Sa', 'Sab', 'Sb', 'Sbc', 'Sc', 'Scd', 'Sd', 'Sdm', 'Sm', 'Im', 'BCD'];
export const DISTANCE_METHOD: Record<number, string> = { 1: 'Hubble flow (H₀ = 73 km/s/Mpc)', 2: 'tip of the red giant branch', 3: 'Cepheids', 4: 'Ursa Major cluster', 5: 'supernova light curve' };
export const UPSILON_DEFAULT = { disk: 0.5, bul: 0.7 };
export const H0_KMS_MPC = 73;
const H_KMS_KPC = H0_KMS_MPC / 1000;
/** G in kpc (km/s)² / M☉ = GM☉ [km³/s²] / (1 kpc in km). 1 kpc = 1000 pc = PARSEC_M km numerically (IAU parsec). */
export const G_KPC = CONSTANTS.GMsun.value / 1e9 / PARSEC_M;

const ssq = (v: number) => Math.abs(v) * v;
/** Signed square root: keeps the sign of a negative V² (inner gas depressions, Lelli et al.). */
const ssqrt = (x: number) => Math.sign(x) * Math.sqrt(Math.abs(x));

/** Baryonic velocity squared (km²/s²) at one point; may be negative where the gas term is. */
export const vBar2 = (p: CurvePoint, upsDisk: number, upsBul: number) => ssq(p[3]) + upsDisk * ssq(p[4]) + upsBul * ssq(p[5]);
export const vBar = (p: CurvePoint, upsDisk: number, upsBul: number) => ssqrt(vBar2(p, upsDisk, upsBul));

/** r₂₀₀ (kpc) for a given V₂₀₀ (km/s): V₂₀₀ = 10 H r₂₀₀. */
export const r200 = (V200: number) => V200 / (10 * H_KMS_KPC);
/** M₂₀₀ (M☉) = V₂₀₀² r₂₀₀ / G = V₂₀₀³ / (10 G H). */
export const m200 = (V200: number) => (V200 * V200 * r200(V200)) / G_KPC;

/** NFW circular velocity (km/s) at radius r (kpc) — NFW 1997 eq. 3. */
export function vNFW(r: number, V200: number, c: number): number {
  const x = r / r200(V200);
  if (x <= 0) return 0;
  const f = (y: number) => Math.log(1 + y) - y / (1 + y);
  return V200 * Math.sqrt(f(c * x) / (x * f(c)));
}

export interface HaloFit { V200: number; c: number; chi2: number; dof: number; r200: number; m200: number; rs: number; atEdge: boolean }

export function chi2Baryons(curve: CurvePoint[], upsDisk: number, upsBul: number) {
  let chi2 = 0;
  for (const p of curve) chi2 += ((p[1] - vBar(p, upsDisk, upsBul)) / p[2]) ** 2;
  return { chi2, dof: curve.length };
}

/**
 * Least-squares NFW fit with Υ fixed: minimise Σ((V_obs − √(V_bar² + V_NFW²))/e_V)² over
 * V₂₀₀ ∈ [10, 500] km/s and c ∈ [1, 50] (log grid 80 × 80, then two 5× refinements).
 * `atEdge` reports a best fit on the boundary of the allowed range (the fit is then not a minimum).
 */
export function fitNFW(curve: CurvePoint[], upsDisk: number, upsBul: number): HaloFit | null {
  if (curve.length < 3) return null;
  const vb2 = curve.map((p) => vBar2(p, upsDisk, upsBul));
  const chi = (lv: number, lc: number) => {
    const V = 10 ** lv, c = 10 ** lc;
    let s = 0;
    for (let i = 0; i < curve.length; i++) {
      const p = curve[i];
      const vh = vNFW(p[0], V, c);
      const m = ssqrt(vb2[i] + vh * vh);
      s += ((p[1] - m) / p[2]) ** 2;
    }
    return s;
  };
  const LV = [1, Math.log10(500)], LC = [0, Math.log10(50)];
  let best = { lv: 2, lc: 1, s: Infinity };
  let [v0, v1, c0, c1] = [LV[0], LV[1], LC[0], LC[1]];
  for (let pass = 0; pass < 3; pass++) {
    const n = 80;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const lv = v0 + ((v1 - v0) * i) / n, lc = c0 + ((c1 - c0) * j) / n;
      const s = chi(lv, lc);
      if (s < best.s) best = { lv, lc, s };
    }
    const dv = (v1 - v0) / 8, dc = (c1 - c0) / 8;
    [v0, v1, c0, c1] = [Math.max(LV[0], best.lv - dv), Math.min(LV[1], best.lv + dv), Math.max(LC[0], best.lc - dc), Math.min(LC[1], best.lc + dc)];
  }
  const V200 = 10 ** best.lv, c = 10 ** best.lc;
  const eps = 1e-3;
  const atEdge = best.lv < LV[0] + eps || best.lv > LV[1] - eps || best.lc < LC[0] + eps || best.lc > LC[1] - eps;
  return { V200, c, chi2: best.s, dof: Math.max(1, curve.length - 2), r200: r200(V200), m200: m200(V200), rs: r200(V200) / c, atEdge };
}

/** Total model velocity (km/s) at a curve point: √(V_bar² + V_NFW²). */
export const vModel = (p: CurvePoint, upsDisk: number, upsBul: number, fit: HaloFit) => ssqrt(vBar2(p, upsDisk, upsBul) + vNFW(p[0], fit.V200, fit.c) ** 2);

/** Keplerian speed √(GM/R) (km/s) of a point mass M (M☉) at R (kpc). */
export const keplerV = (M: number, R: number) => Math.sqrt((G_KPC * M) / R);

// ---------------------------------------------------------------- Milky Way (curated)
export interface MwParameter { key: string; label: string; value: [number, number, number] | null; range: [number, number] | null; unit: string; note: string; source: string }
export const MW = mw as unknown as {
  parameters: MwParameter[];
  rotationCurve: { source: string; columns: string[]; assumptions: string; vcSun: [number, number, number]; vcSunSystematic: string; slope: [number, number, number]; slopeSystematic: number; rows: [number, number, number, number][] };
};
export const mwParam = (k: string) => MW.parameters.find((p) => p.key === k)!;
