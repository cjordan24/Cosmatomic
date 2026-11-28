/**
 * Gate 11.3 — PDB structures. Sequences, residues, secondary structure and hetero groups are checked against each
 * file's own records; the citations against the Source index (DOIs checked on Crossref when added).
 */
import { describe, expect, it } from 'vitest';
import { heteroGroups, loadStructure, residues, sequences, ssFractions } from '@/core/biology/pdb';
import { principalExtents } from '@/core/biology/structure';
import { coords } from '@/core/biology/pdb';
import { PDB_CITATION } from '@/modes/biologic/proteins/ProteinsView';
import { SOURCES } from '@/shared/sources/sources';

describe('PDB structures', () => {
  it('1BNA: both strands are CGCGAATTCGCG; 22 phosphorus residues (the 5′ ends have none)', async () => {
    const s = await loadStructure('1BNA');
    expect(sequences(s)).toEqual({ A: 'CGCGAATTCGCG', B: 'CGCGAATTCGCG' });
    expect(residues(s)).toHaveLength(22);
  });
  it('4HHB: two α chains of 141 and two β chains of 146 residues, four haem groups', async () => {
    const s = await loadStructure('4HHB');
    const q = sequences(s);
    expect([q.A.length, q.B.length, q.C.length, q.D.length]).toEqual([141, 146, 141, 146]);
    expect(q.A.startsWith('VLSPADKTNV')).toBe(true);
    expect(heteroGroups(s).find((h) => h.code === 'HEM')).toMatchObject({ copies: 4, name: 'PROTOPORPHYRIN IX CONTAINING FE' });
    expect(s.molecules.map((m) => m.chains.join(''))).toEqual(['AC', 'BD']);
  });
  it('4INS insulin: chains of 21 and 30 residues, zinc ions present', async () => {
    const s = await loadStructure('4INS');
    const q = sequences(s);
    expect([q.A.length, q.B.length]).toEqual([21, 30]);
    expect(heteroGroups(s).some((h) => h.code === 'ZN')).toBe(true);
  });
  it('secondary structure from the files: myoglobin mostly helix, GFP mostly strand, lysozyme mixed', async () => {
    const mb = ssFractions(residues(await loadStructure('1MBN')));
    const gfp = ssFractions(residues(await loadStructure('1EMA')));
    const lyz = ssFractions(residues(await loadStructure('1LYZ')));
    expect(mb.H).toBeGreaterThan(0.7); expect(mb.E).toBe(0);
    expect(gfp.E).toBeGreaterThan(0.4); expect(gfp.E).toBeGreaterThan(gfp.H);
    expect(lyz.H).toBeGreaterThan(0.2); expect(lyz.E).toBeGreaterThan(0.05);
  });
  it('1EMA: the chromophore CRO and selenomethionine MSE are hetero groups; MSE counts as a residue of the chain', async () => {
    const s = await loadStructure('1EMA');
    const codes = heteroGroups(s).map((h) => h.code);
    expect(codes).toContain('CRO'); expect(codes).toContain('MSE');
    expect(residues(s).some((r) => r.res === 'MSE')).toBe(true);
  });
  it('1A6M binds an oxygen molecule (OXY) to its haem', async () => {
    const codes = heteroGroups(await loadStructure('1A6M')).map((h) => h.code);
    expect(codes).toEqual(expect.arrayContaining(['HEM', 'OXY']));
  });
  it('myoglobin is smaller than haemoglobin along every principal axis', async () => {
    const mb = principalExtents(coords(await loadStructure('1A6M'))).extents;
    const hb = principalExtents(coords(await loadStructure('4HHB'))).extents;
    for (let k = 0; k < 3; k++) expect(mb[k]).toBeLessThan(hb[k]);
  });
  it('every entry cites a Source-index entry for its primary citation', () => {
    for (const [id, src] of Object.entries(PDB_CITATION)) expect(SOURCES.some((s) => s.id === src), id).toBe(true);
  });
});
