/**
 * Gate 11.2 — genetic codes and biomolecules. The NCBI tables are checked against NCBI's own listed differences and
 * initiation codons, against NHGRI's statement that “There are 64 different codons: 61 specify amino acids and 3
 * are used as stop signals”, and the IUPAC symbols against the bundled molecule records.
 */
import { describe, expect, it } from 'vitest';
import { cleanSequence, codonTable, degeneracy, differences, reverseComplement, toRna, translate } from '@/core/biology/geneticCode';
import { AMINO_ACIDS, GENETIC_CODES, GROUPS, STANDARD_CODE, VERT_MITO_CODE, glossary, molecule } from '@/modes/biologic/molecules/biomolecules';
import { entryForEntity, loadEncyclopedia } from '@/shared/encyclopedia/encyclopedia';

describe('NCBI genetic codes', () => {
  it('provenance: compiled by Elzanowski and Ostell, last update Sep. 23, 2024', () => {
    expect(GENETIC_CODES.compiledBy).toMatch(/^Andrzej \(Anjay\) Elzanowski and Jim Ostell/);
    expect(GENETIC_CODES.lastUpdate).toBe('Sep. 23, 2024');
  });
  it('standard code: 64 codons, 61 for amino acids and 3 stops (NHGRI, Codon), and the stops are UAA, UAG, UGA', () => {
    const t = codonTable(STANDARD_CODE);
    expect(t.size).toBe(64);
    const stops = [...t.values()].filter((c) => c.stop).map((c) => toRna(c.codon)).sort();
    expect(stops).toEqual(['UAA', 'UAG', 'UGA']);
    expect(glossary('Codon').text.join(' ')).toContain('There are 64 different codons: 61 specify amino acids and 3 are used as stop signals.');
  });
  it('standard code: initiation from AUG, and also UUG and CUG (NCBI note)', () => {
    const starts = [...codonTable(STANDARD_CODE).values()].filter((c) => c.start).map((c) => toRna(c.codon)).sort();
    expect(starts).toEqual(['AUG', 'CUG', 'UUG']);
  });
  it('degeneracy: Leu, Ser and Arg have six codons; Met and Trp one; all 20 amino acids appear', () => {
    const d = degeneracy(STANDARD_CODE);
    expect([d.L, d.S, d.R, d.M, d.W, d['*']]).toEqual([6, 6, 6, 1, 1, 3]);
    expect(Object.keys(d).filter((k) => k !== '*').sort().join('')).toBe(AMINO_ACIDS.map((a) => a.one).sort().join(''));
    expect(Object.values(d).reduce((a, b) => a + b, 0)).toBe(64);
  });
  it('vertebrate mitochondrial code differs exactly where NCBI lists: AGA, AGG Ter; AUA Met; UGA Trp', () => {
    const d = differences(VERT_MITO_CODE, STANDARD_CODE).map((x) => `${toRna(x.codon)} ${x.a}/${x.b}`).sort();
    expect(d).toEqual(['AGA */R', 'AGG */R', 'AUA M/I', 'UGA W/*']);
  });
});

describe('translation', () => {
  it('reads codon by codon in three frames, with leftovers', () => {
    expect(translate('AUGGCCUAA', STANDARD_CODE).protein).toBe('MA*');
    expect(translate('ATGGCCTAA', STANDARD_CODE).protein).toBe('MA*');
    const f1 = translate('GATGGCC', STANDARD_CODE, 1);
    expect(f1.protein).toBe('MA'); expect(f1.trailing).toBe('');
    expect(translate('ATGGC', STANDARD_CODE).trailing).toBe('GC');
  });
  it('UGA is a stop in the standard code and tryptophan in vertebrate mitochondria', () => {
    expect(translate('UGA', STANDARD_CODE).protein).toBe('*');
    expect(translate('UGA', VERT_MITO_CODE).protein).toBe('W');
  });
  it('the 1BNA dodecamer CGCGAATTCGCG is self-complementary (both strands are the same sequence)', () => {
    expect(reverseComplement('CGCGAATTCGCG')).toBe('CGCGAATTCGCG');
    expect(translate('CGCGAATTCGCG', STANDARD_CODE).protein).toBe('REFA');
  });
  it('cleans whitespace and digits and reports letters that are not bases', () => {
    expect(cleanSequence('1 atg gcc\n7 uaa')).toEqual({ seq: 'ATGGCCTAA', invalid: [] });
    expect(cleanSequence('ATGXB').invalid).toEqual(['X', 'B']);
    expect(translate('ATGNNN', STANDARD_CODE).protein).toBe('MX');
  });
});

describe('biomolecule records', () => {
  it('IUPAC symbols: 20 unique one-letter codes, each joined to the bundled L-form of that amino acid', () => {
    expect(new Set(AMINO_ACIDS.map((a) => a.one)).size).toBe(20);
    for (const a of AMINO_ACIDS) expect(molecule(a.molecule).name.toLowerCase(), a.name).toContain(a.name);
  });
  it('every grouped molecule exists and has a ChEBI encyclopedia entry', async () => {
    await loadEncyclopedia();
    for (const g of GROUPS) for (const id of g.ids) {
      expect(molecule(id), id).toBeTruthy();
      expect(entryForEntity(`molecule:${id}`), id).toBeTruthy();
    }
  });
  it('NHGRI quotes are verbatim (pronunciation guide omitted)', () => {
    expect(glossary('Base Pair').text[0]).toContain('adenine pairs with thymine, and cytosine pairs with guanine');
    expect(glossary('Base Pair').text[0]).toContain('guanine (G) […] or thymine (T)');
    expect(glossary('Uracil').text[0]).toContain('In a DNA molecule, the nucleotide thymine (T) is used in place of uracil.');
  });
});
