/**
 * Molecule records. Two sources, merged under shared identifiers (PubChem CID):
 *  - PubChem3D computed conformers (provenance: derived; NOT experimental)
 *  - experimental diatomic equilibrium bond lengths (Huber & Herzberg) for
 *    molecules PubChem has no 3D conformer for (H₂, NO)
 */
import pubchem from '@datasets/molecular/molecules.json';
import curated from '@datasets/curated/curated-reference.json';
import { type Vec3, angleBetween, dist, sub } from '@/core/mathematics/vec3';
import { ELEMENTS, elementBySymbol } from '../atoms/elements';

export interface MolAtom { Z: number; x: number; y: number; z: number; charge: number }
export interface MolBond { a: number; b: number; order: number }
export interface MoleculeRecord {
  id: string;
  name: string;
  iupacName: string | null;
  category: string;
  detectedInISM: boolean;
  context: string | null;
  formula: string;
  molecularWeight: number;
  netCharge: number;
  smiles: string | null;
  inchi: string | null;
  inchiKey: string | null;
  pubchemCid: number | null;
  atoms: MolAtom[];
  bonds: MolBond[];
  geometry: { source: string; units: 'angstrom'; provenance: 'derived' | 'observed'; experimental: boolean };
  sourceUrl: string;
}

const diatomics: MoleculeRecord[] = curated.diatomicGeometries.molecules.map((d) => {
  const [a, b] = d.atoms.map((s) => elementBySymbol(s)!);
  const half = d.reAngstrom / 2;
  return {
    id: d.id, name: d.name, iupacName: null, category: 'fundamental', detectedInISM: d.detectedInISM, context: d.context,
    formula: d.formula, molecularWeight: (a.atomicWeight ?? 0) + (b.atomicWeight ?? 0), netCharge: 0,
    smiles: null, inchi: null, inchiKey: null, pubchemCid: d.pubchemCid,
    atoms: [{ Z: a.Z, x: -half, y: 0, z: 0, charge: 0 }, { Z: b.Z, x: half, y: 0, z: 0, charge: 0 }],
    bonds: [{ a: 0, b: 1, order: d.bondOrder }],
    geometry: { source: `Experimental r_e = ${d.reAngstrom} Å (${curated.diatomicGeometries.citation})`, units: 'angstrom', provenance: 'observed', experimental: true },
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${d.pubchemCid}`,
  };
});

export const MOLECULES: MoleculeRecord[] = [...diatomics, ...(pubchem as unknown as MoleculeRecord[])].sort((a, b) => a.name.localeCompare(b.name));
export const getMolecule = (id: string) => MOLECULES.find((m) => m.id === id);
export const moleculeByFormula = (f: string) => MOLECULES.find((m) => m.formula === f);

/** Hill-system formula from atoms (C first, H second, then alphabetical; alphabetical if no C). */
export function hillFormula(atoms: { Z: number }[]): string {
  const counts = new Map<string, number>();
  for (const a of atoms) { const s = ELEMENTS[a.Z - 1].symbol; counts.set(s, (counts.get(s) ?? 0) + 1); }
  const keys = [...counts.keys()].sort();
  const order = counts.has('C') ? ['C', ...(counts.has('H') ? ['H'] : []), ...keys.filter((k) => k !== 'C' && k !== 'H')] : keys;
  return order.map((k) => `${k}${counts.get(k)! > 1 ? counts.get(k) : ''}`).join('');
}

/** Molecular mass from IUPAC standard atomic weights (u). */
export const molecularMass = (atoms: { Z: number }[]) => atoms.reduce((t, a) => t + (ELEMENTS[a.Z - 1].atomicWeight ?? NaN), 0);

export const atomPos = (a: MolAtom): Vec3 => [a.x, a.y, a.z];
export const bondLength = (m: MoleculeRecord, i: number, j: number) => dist(atomPos(m.atoms[i]), atomPos(m.atoms[j]));
/** Angle i–j–k at vertex j, degrees. */
export const bondAngle = (m: MoleculeRecord, i: number, j: number, k: number) =>
  (angleBetween(sub(atomPos(m.atoms[i]), atomPos(m.atoms[j])), sub(atomPos(m.atoms[k]), atomPos(m.atoms[j]))) * 180) / Math.PI;

export function centroid(m: MoleculeRecord): Vec3 {
  const n = m.atoms.length;
  return m.atoms.reduce<Vec3>((c, a) => [c[0] + a.x / n, c[1] + a.y / n, c[2] + a.z / n], [0, 0, 0]);
}

export const neighbours = (m: MoleculeRecord, i: number) => m.bonds.filter((b) => b.a === i || b.b === i).map((b) => (b.a === i ? b.b : b.a));

/** Subscript digits for display. */
export const prettyFormula = (f: string) => f.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);
