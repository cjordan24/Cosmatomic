/**
 * Macromolecular structures from the Protein Data Bank (Phase 11, Gate 11.3).
 *
 * The bundled files (datasets/biology/pdb/<ID>.json, from scripts/ingestion/pdb-structures.ts) keep every non-water
 * atom of the first model in columns, plus the records needed here: COMPND molecules, KEYWDS, HETNAM, SEQRES and the
 * HELIX/SHEET ranges assigned in the file. This module turns them into residues with a secondary-structure label,
 * sequences in one-letter code (IUPAC-IUB symbols; DNA as its bases) and composition counts. Nothing is recomputed
 * from geometry: helix and strand ranges are the file's own.
 */
export interface PdbStructure {
  id: string; title: string; classification: string; deposited: string; organisms: string[]; synthetic: boolean; method: string; resolutionA: number | null;
  citation: { authors: string; title: string; ref: string; doi: string | null };
  molecules: { name: string; chains: string[] }[]; keywords: string[]; hetnam: Record<string, string>; seqres: Record<string, string[]>;
  helices: { chain: string; from: number; to: number }[]; sheets: { chain: string; from: number; to: number }[];
  atomCount: number;
  cols: { name: string[]; res: string[]; chain: string; seq: number[]; el: string[]; het: number[]; xyz: number[] };
}

/** Three-letter residue names → one-letter (the 20 IUPAC-IUB symbols; DNA deoxynucleotides as their base). */
export const RESIDUE_ONE: Record<string, string> = {
  ALA: 'A', ARG: 'R', ASN: 'N', ASP: 'D', CYS: 'C', GLN: 'Q', GLU: 'E', GLY: 'G', HIS: 'H', ILE: 'I',
  LEU: 'L', LYS: 'K', MET: 'M', PHE: 'F', PRO: 'P', SER: 'S', THR: 'T', TRP: 'W', TYR: 'Y', VAL: 'V',
  DA: 'A', DC: 'C', DG: 'G', DT: 'T',
};
export const isNucleotide = (res: string) => /^D[ACGT]$/.test(res);

export type SS = 'H' | 'E' | 'C';
export interface Residue { chain: string; seq: number; res: string; trace: number; ss: SS }

/** One residue per C-alpha (proteins) or phosphorus (DNA; the 5′ residue has none), in file order. */
export function residues(s: PdbStructure): Residue[] {
  const out: Residue[] = [];
  const { name, res, chain, seq, het } = s.cols;
  for (let i = 0; i < name.length; i++) {
    const protein = name[i] === 'CA' && (het[i] === 0 || res[i] === 'MSE') && res[i] !== 'CA';
    const dna = name[i] === 'P' && isNucleotide(res[i]);
    if (!protein && !dna) continue;
    const ch = chain[i], n = seq[i];
    const ss: SS = s.helices.some((h) => h.chain === ch && n >= h.from && n <= h.to) ? 'H' : s.sheets.some((h) => h.chain === ch && n >= h.from && n <= h.to) ? 'E' : 'C';
    out.push({ chain: ch, seq: n, res: res[i], trace: i, ss });
  }
  return out;
}

/** Deposited sequence of each chain (SEQRES) in one-letter code; anything non-standard is “X”. */
export function sequences(s: PdbStructure): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [ch, list] of Object.entries(s.seqres)) o[ch] = list.map((r) => RESIDUE_ONE[r] ?? 'X').join('');
  return o;
}

/** Fractions of modelled residues in helix, strand and other, by the file's HELIX/SHEET records. */
export function ssFractions(rs: Residue[]): Record<SS, number> {
  const n = rs.length || 1;
  return { H: rs.filter((r) => r.ss === 'H').length / n, E: rs.filter((r) => r.ss === 'E').length / n, C: rs.filter((r) => r.ss === 'C').length / n };
}

/** Hetero groups present as atoms (ligands, ions, modified residues), with their HETNAM names and copy counts. */
export function heteroGroups(s: PdbStructure): { code: string; name: string | null; copies: number }[] {
  const seen = new Map<string, Set<string>>();
  for (let i = 0; i < s.cols.name.length; i++) if (s.cols.het[i]) {
    const k = s.cols.res[i];
    (seen.get(k) ?? seen.set(k, new Set()).get(k)!).add(`${s.cols.chain[i]}${s.cols.seq[i]}`);
  }
  return [...seen.entries()].map(([code, set]) => ({ code, name: s.hetnam[code] ?? null, copies: set.size }));
}

/** Coordinates (Å) of the atoms matching a predicate, flat [x,y,z,…]. */
export function coords(s: PdbStructure, keep: (i: number) => boolean = () => true): number[] {
  const o: number[] = [];
  for (let i = 0; i < s.cols.name.length; i++) if (keep(i)) o.push(s.cols.xyz[3 * i], s.cols.xyz[3 * i + 1], s.cols.xyz[3 * i + 2]);
  return o;
}

const files = import.meta.glob('/datasets/biology/pdb/*.json', { import: 'default' });
/** Lazy-load one bundled structure. */
export async function loadStructure(id: string): Promise<PdbStructure> {
  const f = files[`/datasets/biology/pdb/${id}.json`];
  if (!f) throw new Error(`no bundled structure ${id}`);
  return (await f()) as PdbStructure;
}
