/**
 * Biomolecules (Gate 11.2): groups of bundled molecule records, the amino-acid symbols (IUPAC-IUB 1983) and the
 * genetic codes and glossary excerpts of datasets/biology/biomolecules.json. Descriptions come from the
 * encyclopedia (ChEBI data as worded by PubChem, CC BY 4.0).
 */
import data from '@datasets/biology/biomolecules.json';
import { MOLECULES, type MoleculeRecord } from '@/modes/atomic/molecules/molecules';
import type { NcbiCode } from '@/core/biology/geneticCode';

export interface AminoAcid { one: string; three: string; name: string; molecule: string }
export interface GlossaryEntry { term: string; url: string; text: string[] }
const D = data as unknown as { geneticCodes: { compiledBy: string; lastUpdate: string; url: string; codes: NcbiCode[]; notes: { code: number; text: string }[] }; aminoAcids: AminoAcid[]; glossary: GlossaryEntry[] };

export const AMINO_ACIDS = D.aminoAcids;
export const GENETIC_CODES = D.geneticCodes;
export const STANDARD_CODE = D.geneticCodes.codes.find((c) => c.id === 1)!;
export const VERT_MITO_CODE = D.geneticCodes.codes.find((c) => c.id === 2)!;
export const glossary = (term: string) => D.glossary.find((g) => g.term === term)!;

export type BioGroup = 'amino' | 'nucleic' | 'carbs' | 'lipids';
export const GROUPS: { id: BioGroup; label: string; ids: string[] }[] = [
  { id: 'amino', label: 'Amino acids', ids: AMINO_ACIDS.map((a) => a.molecule) },
  { id: 'nucleic', label: 'Nucleic-acid parts', ids: ['pubchem-190', 'pubchem-135398634', 'pubchem-597', 'pubchem-1135', 'pubchem-1174', 'pubchem-10975657', 'pubchem-9828112', 'pubchem-6083', 'pubchem-5957'] },
  { id: 'carbs', label: 'Sugars', ids: ['pubchem-5793', 'pubchem-2723872', 'pubchem-6036', 'pubchem-5988', 'pubchem-6134', 'pubchem-439186'] },
  { id: 'lipids', label: 'Lipids', ids: ['pubchem-985', 'pubchem-445639', 'pubchem-5280450', 'pubchem-5997'] },
];
/** One-letter base symbols as NHGRI uses them (“adenine (A), cytosine (C), guanine (G) and thymine (T)”; uracil (U) in RNA). */
export const BASE_LETTER: Record<string, string> = { 'pubchem-190': 'A', 'pubchem-135398634': 'G', 'pubchem-597': 'C', 'pubchem-1135': 'T', 'pubchem-1174': 'U' };

export const molecule = (id: string): MoleculeRecord => MOLECULES.find((m) => m.id === id)!;
export const aminoAcidFor = (moleculeId: string) => AMINO_ACIDS.find((a) => a.molecule === moleculeId) ?? null;
export const aminoAcidByLetter = (one: string) => AMINO_ACIDS.find((a) => a.one === one) ?? null;
