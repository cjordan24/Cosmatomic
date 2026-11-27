/**
 * Distance ladder (Phase 7, Gate 7.2): typed access to datasets/astronomical/distance-ladder.json for
 * #/cosmic/ladder. Physics lives in src/core/physics/distanceLadder.ts.
 */
import data from '@datasets/astronomical/distance-ladder.json';
import { quadrature } from '@/core/physics/distanceLadder';
import { PLANCK, planckParam } from './universe';

export interface Measured { value: number; sigma: number }
export interface Anchor {
  id: string; name: string; method: string;
  distance: { value: number; stat: number; sys: number; unit: 'kpc' | 'Mpc' } | null;
  interval: string | null; source: string;
  adoptedMu: { value: number; sigma: number; source: string; note: string } | null;
  meanParallaxUas?: number; note?: string;
}
export interface TrgbCalibration { object: string; M: number; stat: number; sys: number; reference: string; note: string; adopted: boolean }
export interface Calibrator { n: number; host: string; sn: string; mB: number; eMB: number; muCeph: number; eMuCeph: number; MB: number; eMBabs: number; muHost: number; eMuHost: number; R: number }
export interface H0Measurement { id: string; label: string; method: string; value: number; parts: { label: string; sigma: number }[]; interval: string; unit: string; source: string; note?: string; erratum?: string }
export interface Statement { source: string; where: string; text: string }

export interface LadderData {
  version: string;
  anchors: Anchor[];
  leavitt: { source: string; equation: string; band: string; MW1: Measured; bW: Measured; ZW: Measured; interval: string; periodRangeDays: [number, number]; periodNote: string; lmcOH: Measured & { note: string }; intrinsicScatter: number; scatterNote: string; nCepheidsN4258: number; nCepheidsLMC: number };
  trgb: { source: string; band: string; interval: string; calibrations: TrgbCalibration[]; transformNote: string };
  sne: { source: string; equation: string; MB: Measured & { interval: string; note: string }; aB: { value: number; sigma: null; note: string }; hubbleFlow: { zMin: number; zMax: number; n: number; q0: number; note: string }; calibratorDispersion: number; hubbleFlowDispersion: number; columns: string; calibrators: Calibrator[] };
  h0: H0Measurement[];
  statements: Statement[];
  planckReference: { dataset: string; sh0esComparedWith: Measured & { note: string } };
}
export const LADDER = data as unknown as LadderData;

export const anchor = (id: string): Anchor => {
  const a = LADDER.anchors.find((x) => x.id === id);
  if (!a) throw new Error(`anchor ${id} missing`);
  return a;
};
/** Anchor distance in pc and its total σ (stat and sys in quadrature). */
export function anchorPc(a: Anchor): { pc: number; sigmaPc: number } | null {
  if (!a.distance) return null;
  const f = a.distance.unit === 'kpc' ? 1e3 : 1e6;
  return { pc: a.distance.value * f, sigmaPc: quadrature([a.distance.stat, a.distance.sys]) * f };
}
export const adoptedTrgb = () => LADDER.trgb.calibrations.find((c) => c.adopted)!;
/** Total σ of an H₀ measurement (components in quadrature, as the papers combine them). */
export const h0Sigma = (m: H0Measurement) => quadrature(m.parts.map((p) => p.sigma));

/** Planck 2018 entries for the comparison, read from the bundled Planck dataset (not duplicated). */
export const PLANCK_H0: H0Measurement[] = [
  { id: 'planck-2018-bao', label: 'Planck 2018 + BAO (ΛCDM)', method: 'CMB temperature, polarization and lensing with BAO, inferred in base ΛCDM', value: planckParam('H0').value, parts: [{ label: 'total', sigma: planckParam('H0').sigma! }], interval: '68 %', unit: 'km/s/Mpc', source: 'planck-2018-vi', note: 'Table 2, TT,TE,EE+lowE+lensing+BAO' },
  { id: 'planck-2018', label: 'Planck 2018 (ΛCDM, no BAO)', method: 'CMB temperature, polarization and lensing, inferred in base ΛCDM', value: PLANCK.baselineH0.value, parts: [{ label: 'total', sigma: PLANCK.baselineH0.sigma }], interval: '68 %', unit: 'km/s/Mpc', source: 'planck-2018-vi', note: PLANCK.baselineH0.likelihood },
];
export const ALL_H0: H0Measurement[] = [...PLANCK_H0, ...LADDER.h0];
