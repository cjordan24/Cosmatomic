/**
 * Scale of life (Gate 11.1): measured sizes from small molecules to small animals on one logarithmic axis.
 *
 * Reported sizes come from datasets/biology/life-sizes.json (NIGMS Inside the Cell and Biomedical Beat, nano.gov,
 * the DOE “Scale of Things” chart, the PDB-101 virus flyer), each with its verbatim quote. Three small molecules are
 * added as derived sizes: the largest nucleus-to-nucleus distance in their bundled PubChem3D conformers
 * (computed geometries, not experimental), so they are labelled “derived” and are not comparable to a van der
 * Waals size. Haemoglobin is also measured on the 4HHB crystal structure in the protein viewer (Gate 11.3).
 */
import data from '@datasets/biology/life-sizes.json';
import { molecularExtent } from '@/modes/scale/references';
import type { ProvenanceClass } from '@/core/provenance/provenance';

export type LifeCategory = 'molecule' | 'macromolecule' | 'assembly' | 'virus' | 'organelle' | 'cell' | 'organism' | 'reference';
export interface LifeReport { m: number | [number, number]; approximate: boolean; quote: string; where: string; source: string }
export interface LifeSize {
  id: string; label: string; category: LifeCategory; quantity: string; reports: LifeReport[];
  links?: { label: string; to: string }[];
  provenance: ProvenanceClass;
}

export const CATEGORY_LABEL: Record<LifeCategory, string> = {
  molecule: 'Small molecules', macromolecule: 'Macromolecules', assembly: 'Molecular assemblies & filaments', virus: 'Viruses',
  organelle: 'Organelles', cell: 'Cells', organism: 'Small animals', reference: 'Everyday reference',
};
export const CATEGORY_COLOR: Record<LifeCategory, string> = {
  molecule: '#7df9ff', macromolecule: '#5cf2a6', assembly: '#b6f7d6', virus: '#ff7a90', organelle: '#f5c76b', cell: '#c9b4ff', organism: '#ffb347', reference: '#9aa6c8',
};

/** Representative length of a report: the value, or the geometric mean of a range (the midpoint on a log axis). */
export const reportCentre = (r: LifeReport) => (Array.isArray(r.m) ? Math.sqrt(r.m[0] * r.m[1]) : r.m);
export const reportSpan = (r: LifeReport): [number, number] => (Array.isArray(r.m) ? r.m : [r.m, r.m]);

function derivedMolecule(id: string, label: string): LifeSize {
  const m = molecularExtent(id)!;
  return {
    id: `mol-${id}`, label, category: 'molecule', quantity: 'largest nucleus-to-nucleus distance in the PubChem3D conformer', provenance: 'derived',
    reports: [{ m, approximate: false, quote: 'Computed from the bundled 3D conformer (PubChem3D, a computed geometry): the largest distance between two nuclei.', where: `molecule viewer, ${id}`, source: 'pubchem' }],
    links: [{ label: 'Open in the molecule viewer', to: `/atomic/molecules/${id}` }],
  };
}

const LINKS: Record<string, { label: string; to: string }[]> = {
  dna: [{ label: 'DNA’s building blocks', to: '/biologic/molecules?tab=nucleic' }],
  haemoglobin: [{ label: 'Amino acids, its building blocks', to: '/biologic/molecules' }],
};

export const LIFE_SIZES: LifeSize[] = [
  derivedMolecule('pubchem-962', 'Water molecule'),
  derivedMolecule('pubchem-5793', 'Glucose'),
  derivedMolecule('pubchem-5957', 'ATP'),
  ...(data as unknown as { items: Omit<LifeSize, 'provenance'>[] }).items.map((i) => ({ ...i, provenance: 'observed' as ProvenanceClass, links: [...(i.links ?? []), ...(LINKS[i.id] ?? [])] })),
].sort((a, b) => reportCentre(a.reports[0]) - reportCentre(b.reports[0]));

export const lifeSize = (id: string) => LIFE_SIZES.find((x) => x.id === id) ?? null;

/** Format a length in the most readable SI unit. */
export function formatLen(m: number, sig = 3): string {
  const units: [number, string][] = [[1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm']];
  for (const [f, u] of units) if (m >= f * 0.9999) return `${Number((m / f).toPrecision(sig))} ${u}`;
  return `${m.toExponential(2)} m`;
}
export const formatReport = (r: LifeReport) =>
  `${r.approximate ? '≈ ' : ''}${Array.isArray(r.m) ? `${formatLen(r.m[0])} – ${formatLen(r.m[1])}` : formatLen(r.m)}`;
