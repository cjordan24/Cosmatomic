/**
 * Expansion and distances (Phase 7, Gate 7.1): Planck 2018 parameters and model presets for
 * #/cosmic/universe. Physics lives in src/core/physics/cosmology.ts.
 */
import planck from '@datasets/astronomical/planck-2018-params.json';
import { PLANCK18, type Cosmology } from '@/core/physics/cosmology';
import type { ProvenanceClass } from '@/core/provenance/provenance';

export interface PlanckParam { key: string; label: string; value: number; sigma: number | null; interval: string | null; unit: string; kind: 'base' | 'derived' | 'assumed'; note: string }
export const PLANCK = planck as { version: string; source: string; likelihood: string; table: string; model: string; baselineH0: { value: number; sigma: number; likelihood: string }; parameters: PlanckParam[] };
export const planckParam = (key: string): PlanckParam => {
  const p = PLANCK.parameters.find((x) => x.key === key);
  if (!p) throw new Error(`Planck parameter ${key} missing`);
  return p;
};

export interface ModelPreset { id: string; label: string; cosmology: Cosmology; provenance: ProvenanceClass; note: string }
/** Planck 2018 is the measured best fit; the others are textbook limiting cases for comparison (Hogg 1999 Figs 1–6 use the same three). */
export const PRESETS: ModelPreset[] = [
  { id: 'planck18', label: 'Planck 2018 ΛCDM', cosmology: PLANCK18, provenance: 'derived', note: 'Best-fit flat ΛCDM from Planck 2018 (TT,TE,EE+lowE+lensing+BAO); radiation from z_eq' },
  { id: 'eds', label: 'Einstein–de Sitter (matter only)', cosmology: { name: 'Einstein–de Sitter', H0: PLANCK18.H0, Om: 1, Ode: 0 }, provenance: 'hypothetical', note: 'Flat, matter only: a historical reference model ruled out by observations' },
  { id: 'open', label: 'Low density, no Λ', cosmology: { name: 'Open (Ω_m = 0.05)', H0: PLANCK18.H0, Om: 0.05, Ode: 0 }, provenance: 'hypothetical', note: 'Open universe with little matter and no dark energy (Hogg’s second case)' },
  { id: 'custom', label: 'Custom', cosmology: PLANCK18, provenance: 'hypothetical', note: 'Your parameters; flat unless Ω_m + Ω_Λ ≠ 1' },
];

/** Redshift markers drawn on the history plots, all from Planck Table 2 except where noted. */
export const EPOCHS = [
  { key: 'zre', label: 'reionization mid-point' },
  { key: 'zstar', label: 'last scattering (CMB)' },
  { key: 'zeq', label: 'matter–radiation equality' },
] as const;

/** Log-spaced grid of n points from a to b. */
export const logGrid = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a * (b / a) ** (i / (n - 1)));

/** Format a number in a compact × 10ⁿ form for panels. */
export const fmtE = (x: number, d = 2) => {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e < 5) return Number(x.toPrecision(d + 2)).toLocaleString('en-GB');
  return `${(x / 10 ** e).toFixed(d)} × 10${String(e).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)])).join('')}`;
};
