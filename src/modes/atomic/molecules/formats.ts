/**
 * Molecular structure file formats: XYZ, MDL MOL / SDF (V2000), PDB.
 *
 * Export is lossless for atoms, coordinates, bond orders (1–3) and formal charges (MOL).
 * Import never invents chemistry: when a format carries no bonds (XYZ, PDB without CONECT),
 * connectivity is INFERRED from covalent radii (Cordero 2008) as single bonds and the record
 * says so. Imported structures are user-supplied and carry 'hypothetical' provenance until validated.
 */
import curated from '@datasets/curated/curated-reference.json';
import { ELEMENTS, elementBySymbol } from '../atoms/elements';
import { hillFormula, molecularMass, type MolAtom, type MolBond, type MoleculeRecord } from './molecules';

const RADII = curated.covalentRadii.radii as Record<string, number>;
const sym = (Z: number) => ELEMENTS[Z - 1].symbol;

export class FormatError extends Error { constructor(msg: string) { super(msg); this.name = 'FormatError'; } }

// ------------------------------------------------------------------ export
export function toXYZ(m: MoleculeRecord): string {
  const lines = m.atoms.map((a) => `${sym(a.Z).padEnd(3)}${a.x.toFixed(6).padStart(14)}${a.y.toFixed(6).padStart(14)}${a.z.toFixed(6).padStart(14)}`);
  return `${m.atoms.length}\n${m.name} (${m.formula}) — ${m.geometry.source.replace(/\n/g, ' ')}\n${lines.join('\n')}\n`;
}

/** MDL MOL V2000 (CTfile). Charges written in both the atom block and an "M  CHG" line. */
export function toMolV2000(m: MoleculeRecord): string {
  if (m.atoms.length > 999 || m.bonds.length > 999) throw new FormatError('V2000 supports at most 999 atoms/bonds');
  const chgCode = (q: number) => ({ 3: 1, 2: 2, 1: 3, [-1]: 5, [-2]: 6, [-3]: 7 } as Record<number, number>)[q] ?? 0;
  const head = `${m.name}\n  VoyagerVentures 3D\n${m.geometry.source.slice(0, 80)}\n`;
  const counts = `${String(m.atoms.length).padStart(3)}${String(m.bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000\n`;
  const atoms = m.atoms.map((a) => `${a.x.toFixed(4).padStart(10)}${a.y.toFixed(4).padStart(10)}${a.z.toFixed(4).padStart(10)} ${sym(a.Z).padEnd(3)} 0${String(chgCode(a.charge)).padStart(3)}  0  0  0  0  0  0  0  0  0  0`).join('\n');
  const bonds = m.bonds.map((b) => `${String(b.a + 1).padStart(3)}${String(b.b + 1).padStart(3)}${String(b.order).padStart(3)}  0`).join('\n');
  const charged = m.atoms.map((a, i) => [i + 1, a.charge] as const).filter(([, q]) => q !== 0);
  const chg: string[] = [];
  for (let i = 0; i < charged.length; i += 8) {
    const chunk = charged.slice(i, i + 8);
    chg.push(`M  CHG${String(chunk.length).padStart(3)}${chunk.map(([k, q]) => `${String(k).padStart(4)}${String(q).padStart(4)}`).join('')}`);
  }
  return `${head}${counts}${atoms}\n${bonds ? bonds + '\n' : ''}${chg.length ? chg.join('\n') + '\n' : ''}M  END\n`;
}

export const toSDF = (m: MoleculeRecord) =>
  `${toMolV2000(m)}>  <PUBCHEM_CID>\n${m.pubchemCid ?? ''}\n\n>  <FORMULA>\n${m.formula}\n\n>  <PROVENANCE>\n${m.geometry.source}\n\n$$$$\n`;

/** PDB (HETATM + CONECT). Bond order is encoded by repeating CONECT partners (common convention). */
export function toPDB(m: MoleculeRecord): string {
  if (m.atoms.length > 99999) throw new FormatError('PDB supports at most 99 999 atoms');
  const counts = new Map<string, number>();
  const lines = [`HEADER    ${m.name.toUpperCase().slice(0, 40)}`, `REMARK   1 ${m.geometry.source.slice(0, 68)}`];
  m.atoms.forEach((a, i) => {
    const s = sym(a.Z);
    counts.set(s, (counts.get(s) ?? 0) + 1);
    const name = `${s}${counts.get(s)}`.slice(0, 4);
    const q = a.charge === 0 ? '  ' : `${Math.abs(a.charge)}${a.charge > 0 ? '+' : '-'}`;
    lines.push(`HETATM${String(i + 1).padStart(5)} ${name.padEnd(4)} MOL A   1    ${a.x.toFixed(3).padStart(8)}${a.y.toFixed(3).padStart(8)}${a.z.toFixed(3).padStart(8)}  1.00  0.00          ${s.toUpperCase().padStart(2)}${q}`);
  });
  const partners = m.atoms.map(() => [] as number[]);
  for (const b of m.bonds) for (let k = 0; k < b.order; k++) { partners[b.a].push(b.b + 1); partners[b.b].push(b.a + 1); }
  partners.forEach((p, i) => { for (let k = 0; k < p.length; k += 4) lines.push(`CONECT${String(i + 1).padStart(5)}${p.slice(k, k + 4).map((x) => String(x).padStart(5)).join('')}`); });
  lines.push('END');
  return lines.join('\n') + '\n';
}

// ------------------------------------------------------------------ import
function zOf(symbol: string): number {
  const clean = symbol.trim().replace(/[^A-Za-z]/g, '');
  const e = elementBySymbol(clean) ?? elementBySymbol(clean.charAt(0) + clean.slice(1).toLowerCase());
  if (!e) throw new FormatError(`Unknown element symbol "${symbol}"`);
  return e.Z;
}

/** Infer single bonds from covalent radii (d < r1 + r2 + 0.4 Å). Returns bonds and elements lacking radii. */
export function inferBonds(atoms: MolAtom[]): { bonds: MolBond[]; missingRadii: string[] } {
  const r = atoms.map((a) => RADII[sym(a.Z)]);
  const missing = [...new Set(atoms.filter((_, i) => r[i] === undefined).map((a) => sym(a.Z)))];
  const bonds: MolBond[] = [];
  for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
    if (r[i] === undefined || r[j] === undefined) continue;
    const d = Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y, atoms[i].z - atoms[j].z);
    if (d > 0.4 && d < r[i] + r[j] + 0.4) bonds.push({ a: i, b: j, order: 1 });
  }
  return { bonds, missingRadii: missing };
}

function record(name: string, atoms: MolAtom[], bonds: MolBond[], note: string, format: string): MoleculeRecord {
  if (!atoms.length) throw new FormatError('No atoms found');
  return {
    id: `import-${Date.now().toString(36)}`, name, iupacName: null, category: 'imported', detectedInISM: false, context: null,
    formula: hillFormula(atoms), molecularWeight: molecularMass(atoms), netCharge: atoms.reduce((t, a) => t + a.charge, 0),
    smiles: null, inchi: null, inchiKey: null, pubchemCid: null, atoms, bonds,
    geometry: { source: `User-imported ${format} file. ${note}`, units: 'angstrom', provenance: 'hypothetical', experimental: false },
    sourceUrl: '',
  };
}

export function parseXYZ(text: string, name = 'Imported XYZ'): MoleculeRecord {
  const lines = text.replace(/\r/g, '').split('\n');
  const n = Number(lines[0]?.trim());
  if (!Number.isInteger(n) || n <= 0) throw new FormatError('XYZ: first line must be the atom count');
  const atoms: MolAtom[] = [];
  for (let i = 0; i < n; i++) {
    const p = (lines[i + 2] ?? '').trim().split(/\s+/);
    if (p.length < 4) throw new FormatError(`XYZ: atom line ${i + 1} is incomplete`);
    const [x, y, z] = p.slice(1, 4).map(Number);
    if (![x, y, z].every(Number.isFinite)) throw new FormatError(`XYZ: bad coordinates on atom ${i + 1}`);
    atoms.push({ Z: /^\d+$/.test(p[0]) ? Number(p[0]) : zOf(p[0]), x, y, z, charge: 0 });
  }
  const { bonds, missingRadii } = inferBonds(atoms);
  const title = lines[1]?.trim() || name;
  return record(title.slice(0, 80), atoms, bonds, `XYZ carries no bonds: ${bonds.length} single bonds inferred from covalent radii (bond orders not perceived)${missingRadii.length ? `; no radii for ${missingRadii.join(', ')}` : ''}.`, 'XYZ');
}

export function parseMol(text: string): MoleculeRecord {
  const lines = text.replace(/\r/g, '').split('\n');
  const countsLine = lines[3] ?? '';
  if (/V3000/.test(countsLine)) throw new FormatError('MOL V3000 is not supported yet (V2000 only)');
  const na = Number(countsLine.slice(0, 3)), nb = Number(countsLine.slice(3, 6));
  if (!Number.isInteger(na) || na <= 0) throw new FormatError('MOL: invalid counts line');
  const chgFromCode: Record<number, number> = { 1: 3, 2: 2, 3: 1, 5: -1, 6: -2, 7: -3 };
  const atoms: MolAtom[] = [];
  for (let i = 0; i < na; i++) {
    const l = lines[4 + i] ?? '';
    const x = Number(l.slice(0, 10)), y = Number(l.slice(10, 20)), z = Number(l.slice(20, 30));
    if (![x, y, z].every(Number.isFinite)) throw new FormatError(`MOL: bad atom line ${i + 1}`);
    atoms.push({ Z: zOf(l.slice(31, 34)), x, y, z, charge: chgFromCode[Number(l.slice(36, 39))] ?? 0 });
  }
  const bonds: MolBond[] = [];
  for (let i = 0; i < nb; i++) {
    const l = lines[4 + na + i] ?? '';
    const a = Number(l.slice(0, 3)) - 1, b = Number(l.slice(3, 6)) - 1, t = Number(l.slice(6, 9));
    if (!(a >= 0 && b >= 0 && a < na && b < na)) throw new FormatError(`MOL: bad bond line ${i + 1}`);
    if (t < 1 || t > 3) throw new FormatError(`MOL: bond type ${t} (aromatic/query bonds) is not supported — use a Kekulé structure`);
    bonds.push({ a, b, order: t });
  }
  // "M  CHG" lines override atom-block charges (CTfile spec)
  const chgLines = lines.slice(4 + na + nb).filter((l) => l.startsWith('M  CHG'));
  if (chgLines.length) atoms.forEach((a) => (a.charge = 0));
  for (const l of chgLines) {
    const k = Number(l.slice(6, 9));
    for (let j = 0; j < k; j++) atoms[Number(l.slice(9 + 8 * j, 13 + 8 * j)) - 1].charge = Number(l.slice(13 + 8 * j, 17 + 8 * j));
  }
  const title = lines[0]?.trim() || 'Imported MOL';
  return record(title, atoms, bonds, 'Connectivity, bond orders and charges as given in the file.', 'MOL/SDF');
}

/** First record of an SDF file. */
export const parseSDF = (text: string) => parseMol(text.split('$$$$')[0]);

export function parsePDB(text: string, name = 'Imported PDB'): MoleculeRecord {
  const atoms: MolAtom[] = [];
  const serialToIndex = new Map<number, number>();
  const conect = new Map<string, number>();
  let title = '';
  for (const l of text.replace(/\r/g, '').split('\n')) {
    if (l.startsWith('HEADER') || l.startsWith('COMPND')) title ||= l.slice(10).trim();
    if (l.startsWith('ATOM') || l.startsWith('HETATM')) {
      const serial = Number(l.slice(6, 11));
      const elem = l.slice(76, 78).trim() || l.slice(12, 16).trim().replace(/[^A-Za-z]/g, '').slice(0, 1);
      const qs = l.slice(78, 80).trim();
      const charge = qs ? Number(qs[0]) * (qs[1] === '-' ? -1 : 1) : 0;
      const x = Number(l.slice(30, 38)), y = Number(l.slice(38, 46)), z = Number(l.slice(46, 54));
      if (![x, y, z].every(Number.isFinite)) throw new FormatError(`PDB: bad coordinates for atom ${serial}`);
      serialToIndex.set(serial, atoms.length);
      atoms.push({ Z: zOf(elem), x, y, z, charge: Number.isFinite(charge) ? charge : 0 });
    }
    if (l.startsWith('CONECT')) {
      const a = Number(l.slice(6, 11));
      for (let k = 11; k + 5 <= Math.max(l.length, 31); k += 5) {
        const b = Number(l.slice(k, k + 5));
        if (!b || a >= b) continue;
        const key = `${a}-${b}`;
        conect.set(key, (conect.get(key) ?? 0) + 1);
      }
    }
  }
  let bonds: MolBond[];
  let note: string;
  if (conect.size) {
    bonds = [...conect.entries()].map(([k, n]) => { const [a, b] = k.split('-').map(Number); return { a: serialToIndex.get(a)!, b: serialToIndex.get(b)!, order: Math.min(3, n) }; })
      .filter((b) => b.a !== undefined && b.b !== undefined);
    note = 'Connectivity from CONECT records (repeated partners read as bond order).';
  } else {
    const inf = inferBonds(atoms);
    bonds = inf.bonds;
    note = `No CONECT records: ${bonds.length} single bonds inferred from covalent radii${inf.missingRadii.length ? `; no radii for ${inf.missingRadii.join(', ')}` : ''}.`;
  }
  return record(title || name, atoms, bonds, note, 'PDB');
}

export function parseByExtension(fileName: string, text: string): MoleculeRecord {
  const ext = fileName.toLowerCase().split('.').pop();
  const base = fileName.replace(/\.[^.]+$/, '');
  const m = ext === 'xyz' ? parseXYZ(text, base) : ext === 'mol' ? parseMol(text) : ext === 'sdf' || ext === 'sd' ? parseSDF(text) : ext === 'pdb' || ext === 'ent' ? parsePDB(text, base) : null;
  if (!m) throw new FormatError(`Unsupported file type ".${ext}" — use .xyz, .mol, .sdf or .pdb`);
  if (m.name.startsWith('Imported') || !m.name) m.name = base;
  return m;
}
