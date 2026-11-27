/**
 * Cosmic microwave background (Phase 7, Gate 7.3): typed access to datasets/astronomical/cmb.json for
 * #/cosmic/cmb. Physics lives in src/core/physics/cmb.ts.
 */
import data from '@datasets/astronomical/cmb.json';
import { firasPoints } from '@/core/physics/cmb';

export interface TzMeasurement { id: string; object: string; z: number; T: number; lo: number; hi: number; interval: string; method: string; source: string; note: string }
export interface Quote { text: string; where: string; source?: string }
export interface Distortion { key: string; label: string; limit: number; measured: string; interval: string; epoch: string }
export interface CmbData {
  version: string;
  t0: { value: number; sigma: number; interval: string; source: string; note: string };
  firas: {
    source: string; dataSource: string; columns: string[]; referenceT: number; referenceTNote: string; rows: number[][];
    fit1996: { T: number; sigma: number; interval: string; note: string }; chi2: { value: number; dof: number; note: string };
    rmsPpm: { value: number; note: string }; distortions: Distortion[]; quote: Quote;
  };
  tz: { relation: { text: string; source: string }; beta: { value: number; sigma: number; interval: string; source: string; note: string }; measurements: TzMeasurement[]; quotes: Quote[] };
  power: {
    source: string; dataSource: string; units: string;
    lowEll: { columns: string[]; rows: number[][]; method: string };
    binned: { columns: string[]; rows: number[][]; method: string };
    theory: { rows: number[][]; model: string; thinned: string };
    errorNote: string; credit: string; checks: string[];
  };
}
export const CMB = data as unknown as CmbData;
export const FIRAS = firasPoints(CMB.firas.rows);

/** Theory D_ℓ at any ℓ by linear interpolation of the (thinned) best-fit spectrum. */
export function theoryDl(l: number): number {
  const r = CMB.power.theory.rows;
  if (l <= r[0][0]) return r[0][1];
  for (let i = 1; i < r.length; i++) if (r[i][0] >= l) { const [l0, d0] = r[i - 1], [l1, d1] = r[i]; return d0 + ((d1 - d0) * (l - l0)) / (l1 - l0); }
  return r[r.length - 1][1];
}

/** The measured band power nearest to ℓ: a low-ℓ multipole (ℓ < 30) or the Δℓ = 30 bin that contains it. */
export function bandAt(l: number): { kind: 'low' | 'binned'; l: number; D: number; lo: number; hi: number; bestFit: number; range: [number, number] } {
  if (l < 29.5) {
    const r = CMB.power.lowEll.rows.reduce((a, b) => (Math.abs(b[0] - l) < Math.abs(a[0] - l) ? b : a));
    return { kind: 'low', l: r[0], D: r[1], lo: r[2], hi: r[3], bestFit: theoryDl(r[0]), range: [r[0], r[0]] };
  }
  const rows = CMB.power.binned.rows, i = Math.min(rows.length - 1, Math.max(0, Math.floor((l - 30) / 30)));
  const r = rows[i], lo = 30 + 30 * i;
  return { kind: 'binned', l: r[0], D: r[1], lo: r[2], hi: r[2], bestFit: r[3], range: [lo, i === rows.length - 1 ? 2508 : lo + 29] };
}
