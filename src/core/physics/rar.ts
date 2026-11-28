/**
 * The radial acceleration relation (Phase 14, Gate 14.6) — McGaugh, Lelli & Schombert (2016), arXiv:1609.05917
 * p. 4, eq. (4): g_obs = g_bar / (1 − exp(−√(g_bar/g†))), with g† = 1.20 ± 0.02 (random) ± 0.24 (systematic)
 * × 10⁻¹⁰ m s⁻², for their adopted mass-to-light ratios at 3.6 µm: 0.50 M☉/L☉ for disks, 0.7 for bulges (p. 2).
 *
 * From SPARC rotation-curve tables (velocities in km/s for M/L = 1): g_obs = V_obs²/R and
 * g_bar = (V_gas|V_gas| + Υ_d V_disk² + Υ_b V_bul²)/R — the baryonic circular speed squared over radius
 * (SPARC's V_gas may be negative where the gas pulls outward; it enters with its sign).
 */
import { accelFromV2 } from '@/core/physics/darkMatter';

export const G_DAGGER = 1.2e-10;
export const UPSILON_DISK = 0.5, UPSILON_BULGE = 0.7;

/** Eq. (4). */
export const rarPredict = (gBar: number, gDagger = G_DAGGER) => gBar / (1 - Math.exp(-Math.sqrt(gBar / gDagger)));
/** Eq. (5): the acceleration the baryons cannot account for. */
export const rarDarkPart = (gBar: number, gDagger = G_DAGGER) => gBar / (Math.exp(Math.sqrt(gBar / gDagger)) - 1);

/** One SPARC row [R, Vobs, eVobs, Vgas, Vdisk, Vbul] → accelerations (m/s²), or null where g_bar ≤ 0. */
export function rowAccelerations(row: number[], ud = UPSILON_DISK, ub = UPSILON_BULGE): { gObs: number; gBar: number } | null {
  const [R, Vobs, , Vgas, Vdisk, Vbul] = row;
  if (!(R > 0)) return null;
  const V2bar = Vgas * Math.abs(Vgas) + ud * Vdisk * Vdisk + ub * Vbul * Vbul;
  if (V2bar <= 0) return null;
  return { gObs: accelFromV2(Vobs * Vobs, R), gBar: accelFromV2(V2bar, R) };
}

/** Least-squares fit of g† in log space (minimise Σ (log g_obs − log F(g_bar))²) by golden-section search. */
export function fitGDagger(points: { gObs: number; gBar: number }[], lo = 1e-11, hi = 1e-9): number {
  const cost = (lg: number) => points.reduce((s, p) => s + (Math.log10(p.gObs) - Math.log10(rarPredict(p.gBar, 10 ** lg))) ** 2, 0);
  let a = Math.log10(lo), b = Math.log10(hi);
  const r = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 80; i++) {
    const x1 = b - r * (b - a), x2 = a + r * (b - a);
    if (cost(x1) < cost(x2)) b = x2; else a = x1;
  }
  return 10 ** ((a + b) / 2);
}
/** rms scatter in dex about eq. (4). */
export const rarScatterDex = (points: { gObs: number; gBar: number }[], gDagger = G_DAGGER) => Math.sqrt(points.reduce((s, p) => s + (Math.log10(p.gObs) - Math.log10(rarPredict(p.gBar, gDagger))) ** 2, 0) / points.length);
