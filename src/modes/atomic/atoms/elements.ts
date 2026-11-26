/**
 * Element data access. A single validated dataset (datasets/atomic/elements.json,
 * ingested from PubChem/IUPAC/AMDC) drives every atomic view — there are no
 * per-element implementations.
 */
import raw from '@datasets/atomic/elements.json';
import manifest from '@datasets/manifests/elements.manifest.json';

export interface ElementRecord {
  Z: number;
  symbol: string;
  name: string;
  atomicWeight: number | null;
  hasNaturalAbundance: boolean;
  hasStableIsotope: boolean;
  cpkHex: string | null;
  electronConfiguration: string;
  configurationPredicted: boolean;
  electronegativityPauling: number | null;
  vanDerWaalsRadiusPm: number | null;
  ionizationEnergyEV: number | null;
  electronAffinityEV: number | null;
  oxidationStates: number[];
  standardState: string | null;
  meltingPointK: number | null;
  boilingPointK: number | null;
  densityGcm3: number | null;
  groupBlock: string;
  yearDiscovered: string | null;
  group: number | null;
  period: number | null;
  crustalAbundanceMgKg: number | null;
  groundLevel: string | null;
  description: string | null;
  nistSpectraUrl: string | null;
}

export const ELEMENTS: ElementRecord[] = raw as ElementRecord[];
export const ELEMENTS_MANIFEST = manifest;
const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol.toLowerCase(), e]));

export const getElement = (Z: number): ElementRecord | undefined => ELEMENTS[Z - 1];
export const elementBySymbol = (s: string) => bySymbol.get(s.toLowerCase());

// --------------------------------------------------------------- periodic layout
const NOBLE = [0, 2, 10, 18, 36, 54, 86, 118];

export function periodOf(Z: number): number {
  return NOBLE.findIndex((n) => Z <= n);
}

export interface TablePosition {
  /** display row 1–7 for main table, 9–10 for f-block rows */
  row: number;
  /** display column 1–18 (f-block rows use 3–17) */
  col: number;
  /** IUPAC group 1–18, or null for f-block (lanthanoid/actinoid series) */
  group: number | null;
  period: number;
  block: 's' | 'p' | 'd' | 'f';
}

/** Deterministic standard 18-column layout with La–Lu and Ac–Lr in separate f-block rows. */
export function tablePosition(Z: number): TablePosition {
  const period = periodOf(Z);
  const pos = Z - NOBLE[period - 1];
  if (period === 1) return { row: 1, col: Z === 1 ? 1 : 18, group: Z === 1 ? 1 : 18, period, block: 's' };
  if (period <= 3) {
    const group = pos <= 2 ? pos : pos + 10;
    return { row: period, col: group, group, period, block: pos <= 2 ? 's' : 'p' };
  }
  if (period <= 5) {
    return { row: period, col: pos, group: pos, period, block: pos <= 2 ? 's' : pos <= 12 ? 'd' : 'p' };
  }
  // periods 6, 7: 32 positions
  if (pos <= 2) return { row: period, col: pos, group: pos, period, block: 's' };
  if (pos <= 17) return { row: period + 3, col: pos, group: null, period, block: 'f' };
  const group = pos - 14;
  return { row: period, col: group, group, period, block: group <= 12 ? 'd' : 'p' };
}

/** Display label for atomic weight: standard atomic weight, or [A] of the longest-lived isotope. */
export function atomicWeightLabel(e: ElementRecord, longestLivedA?: number | null): string {
  if (e.hasNaturalAbundance && e.atomicWeight !== null) return e.atomicWeight.toString();
  if (longestLivedA) return `[${longestLivedA}]`;
  return e.atomicWeight !== null ? `[${Math.round(e.atomicWeight)}]` : '—';
}

export const FAMILY_COLORS: Record<string, string> = {
  'Alkali metal': '#ff6b8b',
  'Alkaline earth metal': '#ffa36b',
  'Transition metal': '#f5c76b',
  'Post-transition metal': '#8fd18f',
  Metalloid: '#5cd6c0',
  Nonmetal: '#7df9ff',
  Halogen: '#58b4ff',
  'Noble gas': '#b18cff',
  Lanthanide: '#ff8fd8',
  Actinide: '#e07bff',
};
