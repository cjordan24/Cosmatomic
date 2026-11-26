/**
 * Periodic-table colour schemes. Each scheme reads a property from the shared
 * element dataset; missing values are reported as null (rendered hatched, "no data").
 */
import curated from '@datasets/curated/curated-reference.json';
import { type ElementRecord, FAMILY_COLORS, tablePosition } from '../atoms/elements';
import { parseConfiguration, valenceElectrons } from '../atoms/configuration';
import { ramp } from '@/rendering/colors';

export interface Scheme {
  id: string;
  label: string;
  unit: string;
  kind: 'categorical' | 'continuous';
  log?: boolean;
  get: (e: ElementRecord) => number | string | null;
  categories?: Record<string, string>;
  source: string;
  note?: string;
}

const solarLogEps = curated.solarPhotosphericAbundances.logEpsilon as Record<string, number>;
const STATE_COLORS: Record<string, string> = { Solid: '#8fb4ff', Liquid: '#5cf2c8', Gas: '#ffb36b', 'Predicted solid': '#4a5d8a', 'Predicted gas': '#8a6a4a', 'Predicted liquid': '#3d7a6c' };

export const SCHEMES: Scheme[] = [
  { id: 'family', label: 'Element family', unit: '', kind: 'categorical', get: (e) => e.groupBlock, categories: FAMILY_COLORS, source: 'PubChem GroupBlock' },
  { id: 'electronegativity', label: 'Electronegativity', unit: 'Pauling', kind: 'continuous', get: (e) => e.electronegativityPauling, source: 'PubChem (Pauling scale)' },
  { id: 'radius', label: 'Atomic radius', unit: 'pm (van der Waals)', kind: 'continuous', get: (e) => e.vanDerWaalsRadiusPm, source: 'PubChem AtomicRadius (van der Waals)' },
  { id: 'ionization', label: 'Ionization energy', unit: 'eV (first)', kind: 'continuous', get: (e) => e.ionizationEnergyEV, source: 'PubChem / NIST' },
  { id: 'affinity', label: 'Electron affinity', unit: 'eV', kind: 'continuous', get: (e) => e.electronAffinityEV, source: 'PubChem', note: 'Blank entries include elements whose anion is unbound (negative EA) as well as unmeasured ones.' },
  {
    id: 'state', label: 'Physical state (STP)', unit: '', kind: 'categorical', categories: STATE_COLORS, source: 'PubChem StandardState',
    get: (e) => { const s = e.standardState ?? ''; if (!s) return null; const m = s.match(/Expected to be a (\w+)/i); return m ? `Predicted ${m[1].toLowerCase()}` : s; },
  },
  { id: 'density', label: 'Density', unit: 'g/cm³ (log scale)', kind: 'continuous', log: true, get: (e) => e.densityGcm3, source: 'PubChem' },
  { id: 'melting', label: 'Melting point', unit: 'K', kind: 'continuous', get: (e) => e.meltingPointK, source: 'PubChem' },
  { id: 'boiling', label: 'Boiling point', unit: 'K', kind: 'continuous', get: (e) => e.boilingPointK, source: 'PubChem' },
  {
    id: 'radioactivity', label: 'Radioactivity', unit: '', kind: 'categorical', source: 'IAEA AMDC NUBASE (via PubChem)',
    categories: { 'Has stable isotope(s)': '#5cf2a6', 'No stable isotope (radioactive)': '#ff7a90' },
    get: (e) => (e.hasStableIsotope ? 'Has stable isotope(s)' : 'No stable isotope (radioactive)'),
    note: 'Bismuth-209 is classed radioactive (α decay, t½ ≈ 2 × 10¹⁹ y).',
  },
  {
    id: 'valence', label: 'Valence electrons', unit: 'electrons', kind: 'continuous', source: 'Derived from ground-state configuration',
    get: (e) => valenceElectrons(parseConfiguration(e.electronConfiguration), tablePosition(e.Z).block),
    note: 'd-block: ns + (n−1)d convention. f-block left blank — no single accepted definition.',
  },
  {
    id: 'cosmic', label: 'Cosmic abundance', unit: 'log ε (H = 12), solar photosphere', kind: 'continuous',
    get: (e) => solarLogEps[e.symbol] ?? null, source: 'Asplund et al. 2009 (manually transcribed subset)',
    note: 'Only 28 elements transcribed so far; others are not zero, just not yet ingested.',
  },
  { id: 'earth', label: 'Earth crustal abundance', unit: 'mg/kg (log scale)', kind: 'continuous', log: true, get: (e) => e.crustalAbundanceMgKg, source: 'CRC Handbook via PubChem' },
];

export interface ColorResult { color: string | null; label: string }

export function schemeRange(s: Scheme, elements: ElementRecord[]): [number, number] {
  const vals = elements.map(s.get).filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && (!s.log || v > 0)).map((v) => (s.log ? Math.log10(v) : v));
  return [Math.min(...vals), Math.max(...vals)];
}

export function colorFor(s: Scheme, e: ElementRecord, range: [number, number]): ColorResult {
  const v = s.get(e);
  if (v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v))) return { color: null, label: 'no data' };
  if (s.kind === 'categorical') return { color: s.categories?.[String(v)] ?? '#888', label: String(v) };
  const n = v as number;
  if (s.log && n <= 0) return { color: null, label: 'no data' };
  const t = ((s.log ? Math.log10(n) : n) - range[0]) / (range[1] - range[0] || 1);
  return { color: ramp(t), label: `${Number(n.toPrecision(4))} ${s.unit.replace(/\s*\(.*\)/, '')}` };
}
