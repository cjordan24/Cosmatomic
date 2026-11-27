/**
 * Dark-matter evidence (Phase 7, Gate 7.4): typed access to datasets/astronomical/dark-matter.json and the
 * comparisons shown at #/cosmic/darkmatter. Physics lives in src/core/physics/darkMatter.ts; SPARC and the
 * Milky Way come from the Gate 6.4 galaxies module; Ω_b h² and Ω_c h² from the Planck 2018 dataset.
 */
import data from '@datasets/astronomical/dark-matter.json';
import { accelFromV2, comaModel, jeansSigmaLos, massDiscrepancy, overdensityRadius, type ComaModel } from '@/core/physics/darkMatter';
import { vBar2, type CurvePoint, type Sparc } from '@/modes/cosmic/galaxies/galaxies';
import { planckParam } from './universe';

type PM = [number, number];
export interface BulletComponent { id: string; label: string; ra: string; dec: string; MX: PM; Mstar: PM; kappa: PM }
export interface Quote { where: string; text: string }
export interface ComaFit { alpha: number; Mv: number; beta: number; c: number; chi2: number }
export interface DarkMatterData {
  version: string;
  bullet: {
    source: string; name: string; z: number; cosmology: { H0: number; Om: number; Ode: number; kpcPerArcsec: number; note: string }; apertureKpc: number;
    components: BulletComponent[]; massUnit: string; interval: string; tableNote: string;
    peaks: { id: string; label: string; from: string | null; east: number | null; north: number | null; significance: string; note: string }[];
    offsetSignificance: string; plasmaKappaShare: { cluster: string; value: number; plus: number; minus: number; unit: string }[];
    stellarMassToLight: { value: number; band: string; range: [number, number]; note: string }; plasmaMassAccuracy: string;
    merger: { separationMpc: number; tSubKeV: number; tMainKeV: number; shockKms: number; losKms: number; passageMyr: number; note: string };
    quotes: Quote[];
  };
  coma: {
    source: string; name: string; centre: string; H0: number; distanceMpc: number; distanceNote: string;
    stars: { lstar: number; rS: number; unit: string; upsilonE: number; upsilonS: number; ratioES: number; upsilon: number; note: string };
    tracer: { lstar: number; rS: number; unit: string; note: string };
    gas: { n0: number; rc: number; b: number; gamma: number; S0: number; unit: string; note: string };
    dark: { deltaC: number; deltaNote: string; fits: ComaFit[]; fitsNote: string; Mv: { value: number; sigma: number; unit: string; interval: string } };
    sample: { members: number; es0: number; perBin: number; innerBins: number; innerRadiusArcmin: number; sigmaError: number; note: string };
    published: {
      Mtot: { value: number; accuracy: string; note: string }; fractions: { galaxies: number; gas: number; dark: number; at: string };
      rvDarkMpc: number; rvDarkArcmin: number; rvTotalMpc: number; rvTotalArcmin: number;
      MtoL: { value: number; band: string; at: string; unit: string }; M36: { value: number; sigma: number; at: number; note: string };
      omega0: { value: number; sigma: number; note: string };
    };
    quotes: Quote[];
  };
  bbn: {
    source: string; dh: { value: number; sigma: number; unit: string; interval: string; note: string }; eta10: { value: number; sigma: number; note: string };
    ombh2: { value: number; measurement: number; theory: number; scale: number; interval: string; note: string };
    ombh2Empirical: { value: number; measurement: number; theory: number; scale: number; interval: string; note: string };
    quotes: Quote[];
  };
}
export const DM = data as unknown as DarkMatterData;
export const BULLET = DM.bullet, COMA = DM.coma, BBN = DM.bbn;

// ---------------------------------------------------------------- galaxies (SPARC)
export interface RarPoint { name: string; R: number; gObs: number; gBar: number; Q: number }
/** Every SPARC radius with a positive baryonic V²: observed and baryonic (Newtonian) accelerations in m/s². */
export function radialAccelerations(sparc: Sparc, upsDisk: number, upsBul: number, maxQ = 3): RarPoint[] {
  const out: RarPoint[] = [];
  for (const g of sparc.galaxies) {
    if (g.Q > maxQ) continue;
    for (const p of sparc.curves[g.name] ?? []) {
      const b2 = vBar2(p, upsDisk, upsBul);
      if (b2 <= 0 || p[1] <= 0) continue;
      out.push({ name: g.name, R: p[0], gObs: accelFromV2(p[1] * p[1], p[0]), gBar: accelFromV2(b2, p[0]), Q: g.Q });
    }
  }
  return out;
}
/** V_obs²/V_bar² at the outermost measured radius of one rotation curve (null if V_bar² ≤ 0 there). */
export const outerDiscrepancy = (curve: CurvePoint[], upsDisk: number, upsBul: number) => {
  const p = curve[curve.length - 1];
  return massDiscrepancy(p[1], vBar2(p, upsDisk, upsBul));
};
export function quantile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  const i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}

// ---------------------------------------------------------------- Coma
export const comaFit = (alpha: number) => COMA.dark.fits.find((f) => f.alpha === alpha) ?? COMA.dark.fits[0];
const comaCache = new Map<number, ComaModel>();
export function coma(alpha = 0): ComaModel {
  const f = comaFit(alpha);
  let m = comaCache.get(f.alpha);
  if (!m) {
    m = comaModel({ distanceMpc: COMA.distanceMpc, stars: COMA.stars, tracer: COMA.tracer, gas: COMA.gas, deltaC: COMA.dark.deltaC, H0: COMA.H0 }, { Mv: f.Mv * 1e15, c: f.c, alpha: f.alpha });
    comaCache.set(f.alpha, m);
  }
  return m;
}
export const comaTotalVirialRadius = (m: ComaModel) => overdensityRadius(m.total, COMA.dark.deltaC, COMA.H0);
/** σ_los(R) of the E-S0 tracer for the full model and for its stars + gas alone, with the fit's β. */
export function comaDispersion(alpha: number, Rs: number[]) {
  const m = coma(alpha), beta = comaFit(alpha).beta;
  return { total: jeansSigmaLos(Rs, m.total, m.tracer, beta), baryons: jeansSigmaLos(Rs, m.baryons, m.tracer, beta), beta };
}

// ---------------------------------------------------------------- cosmic densities
export function cosmicBudget() {
  const b = planckParam('ombh2'), c = planckParam('omch2'), m = planckParam('omh2');
  const bbn = BBN.ombh2.value / BBN.ombh2.scale;
  const bbnSigma = Math.hypot(BBN.ombh2.measurement, BBN.ombh2.theory) / BBN.ombh2.scale;
  return {
    planck: { ombh2: b, omch2: c, omh2: m },
    bbn: { value: bbn, sigma: bbnSigma },
    /** Ω_c/Ω_b from Planck (both from the same fit) */
    darkToBaryon: c.value / b.value,
    /** Ω_b/Ω_m: Planck alone, and BBN baryons over Planck's matter density */
    baryonFractionPlanck: b.value / m.value,
    baryonFractionBbn: bbn / m.value,
  };
}
