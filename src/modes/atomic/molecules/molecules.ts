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
  /** PubChem computed descriptors (derived), when available */
  computed?: { source: string; provenance: 'derived'; exactMassU: number | null; xlogp: number | null; tpsaA2: number | null; hBondDonors: number | null; hBondAcceptors: number | null; rotatableBonds: number | null; complexity: number | null };
  atoms: MolAtom[];
  bonds: MolBond[];
  geometry: { source: string; units: 'angstrom'; provenance: 'derived' | 'observed' | 'simulated' | 'hypothetical'; experimental: boolean };
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

/**
 * C60 from experimental bond lengths: atoms lie on icosahedron edges at fraction t from each vertex,
 * giving pentagon (5:6) edges t·e and 6:6 bonds (1−2t)·e. Solving for both measured lengths fixes e and t.
 */
function buildC60(): MoleculeRecord {
  const F = curated.fullerene;
  const e = F.bond66Angstrom + 2 * F.bond56Angstrom;
  const t = F.bond56Angstrom / e;
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) raw.push([0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a]);
  const scaleIco = e / 2; // raw icosahedron edge = 2
  const V = raw.map((p) => p.map((x) => x * scaleIco) as [number, number, number]);
  const d = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const nb = V.map((v) => V.map((w, j) => [j, d(v, w)] as [number, number]).filter(([, x]) => Math.abs(x - e) < 1e-6).map(([j]) => j));
  const atoms: MolAtom[] = []; const key = new Map<string, number>();
  V.forEach((v, i) => nb[i].forEach((j) => {
    const w = V[j];
    key.set(`${i}-${j}`, atoms.length);
    atoms.push({ Z: 6, x: v[0] + t * (w[0] - v[0]), y: v[1] + t * (w[1] - v[1]), z: v[2] + t * (w[2] - v[2]), charge: 0 });
  }));
  const bonds: MolBond[] = [];
  V.forEach((_, i) => nb[i].forEach((j) => {
    const a = key.get(`${i}-${j}`)!;
    if (i < j) bonds.push({ a, b: key.get(`${j}-${i}`)!, order: 2 }); // 6:6 bond (Kekulé double)
    nb[i].forEach((k) => { if (k > j && Math.abs(d(V[j], V[k]) - e) < 1e-6) bonds.push({ a, b: key.get(`${i}-${k}`)!, order: 1 }); }); // 5:6 pentagon edge
  }));
  return {
    id: F.id, name: F.name, iupacName: null, category: 'materials', detectedInISM: F.detectedInISM, context: F.context,
    formula: F.formula, molecularWeight: 60 * (ELEMENTS[5].atomicWeight ?? 12.011), netCharge: 0, smiles: null, inchi: null, inchiKey: null,
    pubchemCid: F.pubchemCid, atoms, bonds,
    geometry: { source: `Constructed from experimental bond lengths 1.401 Å (6:6) and 1.458 Å (5:6) — ${F.citation}`, units: 'angstrom', provenance: 'observed', experimental: true },
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${F.pubchemCid}`,
  };
}

export const MOLECULES: MoleculeRecord[] = [...diatomics, buildC60(), ...(pubchem as unknown as MoleculeRecord[])].sort((a, b) => a.name.localeCompare(b.name));
export const getMolecule = (id: string) => MOLECULES.find((m) => m.id === id);
export const moleculeByFormula = (f: string) => MOLECULES.find((m) => m.formula === f);

/**
 * Hill-system formula from atoms (C first, H second, then alphabetical; alphabetical if no C).
 * Net charge (sum of formal charges) is appended PubChem-style: "+", "-", "+2", "-3".
 */
export function hillFormula(atoms: { Z: number; charge?: number }[]): string {
  const q = atoms.reduce((t, a) => t + (a.charge ?? 0), 0);
  const suffix = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q) > 1 ? Math.abs(q) : ''}`;
  return neutralHill(atoms) + suffix;
}
function neutralHill(atoms: { Z: number }[]): string {
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

export interface BondStat { pair: string; order: number; n: number; mean: number; sd: number; min: number; max: number }

/** Bond-length statistics grouped by element pair (alphabetical) and bond order, Å. */
export function bondStats(m: MoleculeRecord): BondStat[] {
  const groups = new Map<string, { pair: string; order: number; d: number[] }>();
  for (const b of m.bonds) {
    const pair = [ELEMENTS[m.atoms[b.a].Z - 1].symbol, ELEMENTS[m.atoms[b.b].Z - 1].symbol].sort().join(['', '–', '=', '≡'][b.order] ?? '–');
    const key = `${pair}|${b.order}`;
    const g = groups.get(key) ?? { pair, order: b.order, d: [] };
    g.d.push(bondLength(m, b.a, b.b));
    groups.set(key, g);
  }
  return [...groups.values()].map(({ pair, order, d }) => {
    const mean = d.reduce((t, x) => t + x, 0) / d.length;
    const sd = Math.sqrt(d.reduce((t, x) => t + (x - mean) ** 2, 0) / d.length);
    return { pair, order, n: d.length, mean, sd, min: Math.min(...d), max: Math.max(...d) };
  }).sort((a, b) => a.pair.localeCompare(b.pair) || a.order - b.order);
}

/** Radius of gyration (Å), mass-weighted — a simple size descriptor for comparison. */
export function radiusOfGyration(m: MoleculeRecord): number {
  const w = m.atoms.map((a) => ELEMENTS[a.Z - 1].atomicWeight ?? a.Z * 2);
  const W = w.reduce((t, x) => t + x, 0);
  const c = [0, 1, 2].map((k) => m.atoms.reduce((t, a, i) => t + w[i] * [a.x, a.y, a.z][k], 0) / W);
  return Math.sqrt(m.atoms.reduce((t, a, i) => t + w[i] * ((a.x - c[0]) ** 2 + (a.y - c[1]) ** 2 + (a.z - c[2]) ** 2), 0) / W);
}
