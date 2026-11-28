/**
 * Genetic codes (Phase 11, Gate 11.2).
 *
 * Tables are read from NCBI's “The Genetic Codes” (Elzanowski & Ostell, updated Sep. 23, 2024) in the form NCBI
 * prints them: five 64-character lines. Codon i is Base1[i] Base2[i] Base3[i] (DNA letters T, C, A, G); AAs[i] is the
 * one-letter amino acid or “*” for a stop (termination) codon; Starts[i] is “M” where translation may start.
 * NHGRI: “A codon is a DNA or RNA sequence of three nucleotides (a trinucleotide) that forms a unit of genomic
 * information encoding a particular amino acid or signaling the termination of protein synthesis.”
 *
 * translate() reads a sequence in one of three forward frames codon by codon. It does not search for genes,
 * splice introns or model the ribosome; a sequence that is not a coding sequence still “translates”, and the view
 * says so.
 */
export interface NcbiCode { id: number; name: string; AAs: string; Starts: string; Base1: string; Base2: string; Base3: string }
export interface CodonInfo { codon: string; aa: string; stop: boolean; start: boolean }

export function codonTable(c: NcbiCode): Map<string, CodonInfo> {
  const m = new Map<string, CodonInfo>();
  for (let i = 0; i < 64; i++) {
    const codon = c.Base1[i] + c.Base2[i] + c.Base3[i];
    m.set(codon, { codon, aa: c.AAs[i], stop: c.AAs[i] === '*', start: c.Starts[i] === 'M' });
  }
  return m;
}

/** DNA ↔ RNA letters (T ↔ U); anything else is kept for validation to report. */
export const toRna = (s: string) => s.toUpperCase().replace(/T/g, 'U');
export const toDna = (s: string) => s.toUpperCase().replace(/U/g, 'T');
const COMP: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
/** Reverse complement of a DNA sequence: the other strand read 5′→3′ (A pairs with T, C with G). */
export const reverseComplement = (dna: string) => [...toDna(dna)].reverse().map((b) => COMP[b] ?? 'N').join('');

/** Strip whitespace and digits (FASTA-style line numbers); returns the cleaned sequence and any invalid letters. */
export function cleanSequence(raw: string): { seq: string; invalid: string[] } {
  const seq = toDna(raw.replace(/[\s\d]/g, ''));
  const invalid = [...new Set([...seq].filter((c) => !'ACGT'.includes(c)))];
  return { seq, invalid };
}

export interface Translation { frame: number; codons: CodonInfo[]; protein: string; trailing: string }
export function translate(rawSeq: string, c: NcbiCode, frame = 0): Translation {
  const table = codonTable(c);
  const { seq } = cleanSequence(rawSeq);
  const codons: CodonInfo[] = [];
  let i = frame;
  for (; i + 3 <= seq.length; i += 3) {
    const k = seq.slice(i, i + 3);
    codons.push(table.get(k) ?? { codon: k, aa: 'X', stop: false, start: false });
  }
  return { frame, codons, protein: codons.map((x) => x.aa).join(''), trailing: seq.slice(i) };
}

/** Number of codons for each amino acid (and “*”), i.e. the degeneracy of the code. */
export function degeneracy(c: NcbiCode): Record<string, number> {
  const n: Record<string, number> = {};
  for (const a of c.AAs) n[a] = (n[a] ?? 0) + 1;
  return n;
}

/** Codons whose meaning differs between two codes. */
export function differences(a: NcbiCode, b: NcbiCode): { codon: string; a: string; b: string }[] {
  const ta = codonTable(a), tb = codonTable(b);
  return [...ta.keys()].filter((k) => ta.get(k)!.aa !== tb.get(k)!.aa).map((k) => ({ codon: k, a: ta.get(k)!.aa, b: tb.get(k)!.aa }));
}
