/**
 * Gate 11.1 — scale of life. Values are checked against the quotes they were transcribed from, sources exist,
 * disagreements are kept, and two independent cross-checks: haemoglobin's quoted width against the 4HHB crystal
 * structure, and the derived small-molecule sizes against their conformers.
 */
import { describe, expect, it } from 'vitest';
import { LIFE_SIZES, formatLen, lifeSize, reportCentre, reportSpan } from '@/modes/biologic/atlas/lifeSizes';
import { SOURCES } from '@/shared/sources/sources';
import { principalExtents, radiusOfGyration, symmetricEigen3 } from '@/core/biology/structure';
import pdbIndex from '@datasets/biology/pdb-index.json';
import hb from '@datasets/biology/pdb/4HHB.json';
import bna from '@datasets/biology/pdb/1BNA.json';

const nm = 1e-9, um = 1e-6;
const val = (id: string, k = 0) => lifeSize(id)!.reports[k].m;

describe('life sizes: transcription', () => {
  it('every report cites a Source-index entry and carries a quote and a location', () => {
    for (const it of LIFE_SIZES) for (const r of it.reports) {
      expect(SOURCES.some((s) => s.id === r.source), `${it.id} → ${r.source}`).toBe(true);
      expect(r.quote.length, it.id).toBeGreaterThan(3);
      expect(r.where.length, it.id).toBeGreaterThan(3);
    }
  });
  it('values match Inside the Cell p. 11 and p. 7, and the human egg on p. 20', () => {
    expect(val('nucleus')).toBeCloseTo(5 * um, 12);
    expect(val('ribosome')).toEqual([20 * nm, 30 * nm]);
    expect(val('microtubule')).toBeCloseTo(25 * nm, 15);
    expect(val('intermediate-filament')).toBeCloseTo(10 * nm, 15);
    expect(val('actin')).toEqual([5 * nm, 9 * nm]);
    expect(val('lysosome')).toEqual([50 * nm, 3000 * nm]);
    expect(val('mitochondrion')).toEqual([1 * um, 2 * um]);
    expect(val('prokaryote')).toEqual([1 * um, 10 * um]);
    expect(val('animal-cell')).toEqual([10 * um, 30 * um]);
    expect(val('plant-cell')).toEqual([10 * um, 100 * um]);
    expect(val('human-egg')).toBeCloseTo(150 * um, 12);
  });
  it('the number in each quote is the stored number (unit-aware spot check)', () => {
    const unit: Record<string, number> = { nanometers: nm, nm, micrometers: um, 'µm': um, mm: 1e-3 };
    for (const it of LIFE_SIZES.filter((i) => i.provenance === 'observed')) for (const r of it.reports) {
      const m = r.quote.replace(/,(\d{3})/g, '$1').match(/(\d+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*(\d+(?:\.\d+)?))?\s*(nanometers|micrometers|nm|µm|mm)/);
      if (!m || r.quote.includes("1/2")) continue; // “DNA ~2-1/2 nm diameter” is checked below
      const [a, b] = reportSpan(r);
      const f = unit[m[3]];
      expect(a, `${it.id}: ${r.quote}`).toBeCloseTo(Number(m[1]) * f, 15);
      if (m[2]) expect(b, `${it.id}: ${r.quote}`).toBeCloseTo(Number(m[2]) * f, 15);
    }
    expect(lifeSize('dna')!.reports.find((r) => r.source === 'doe-scale-of-things-2006')!.m).toBeCloseTo(2.5 * nm, 15);
  });
  it('disagreeing sources are both kept: DNA 2 nm (NIGMS) and 2.5 nm (nano.gov, DOE)', () => {
    const dna = lifeSize('dna')!;
    expect(dna.reports.map((r) => r.m)).toEqual([2 * nm, 2.5 * nm, 2.5 * nm]);
    expect(lifeSize('hair')!.reports.map((r) => reportSpan(r)[1])).toEqual([100 * um, 100 * um, 120 * um]);
  });
  it('the atlas is sorted by size and spans a water molecule to an ant', () => {
    const c = LIFE_SIZES.map((i) => reportCentre(i.reports[0]));
    expect([...c].sort((a, b) => a - b)).toEqual(c);
    expect(LIFE_SIZES[0].id).toBe('mol-pubchem-962');
    expect(LIFE_SIZES.at(-1)!.id).toBe('ant');
  });
  it('derived small molecules: water ≈ 1.5 Å H···H; glucose and ATP between 0.5 and 2.5 nm', () => {
    expect(val('mol-pubchem-962') as number).toBeGreaterThan(1.4e-10);
    expect(val('mol-pubchem-962') as number).toBeLessThan(1.7e-10);
    for (const id of ['mol-pubchem-5793', 'mol-pubchem-5957']) { expect(val(id) as number).toBeGreaterThan(0.5 * nm); expect(val(id) as number).toBeLessThan(2.5 * nm); }
  });
  it('formatLen picks readable units', () => {
    expect(formatLen(150e-6)).toBe('150 µm');
    expect(formatLen(28.4e-9)).toBe('28.4 nm');
    expect(formatLen(5e-3)).toBe('5 mm');
  });
});

describe('structure geometry', () => {
  it('Jacobi eigen-decomposition reproduces a known symmetric matrix', () => {
    const { values, vectors } = symmetricEigen3([[2, 1, 0], [1, 2, 0], [0, 0, 5]]);
    expect(values[0]).toBeCloseTo(5, 12); expect(values[1]).toBeCloseTo(3, 12); expect(values[2]).toBeCloseTo(1, 12);
    expect(Math.abs(vectors[1][0])).toBeCloseTo(Math.SQRT1_2, 10);
  });
  it('principal extents of a rotated box are its edge lengths', () => {
    const pts: number[] = [];
    const c = Math.cos(0.7), s = Math.sin(0.7);
    for (const X of [-3, 3]) for (const Y of [-2, 2]) for (const Z of [-1, 1]) pts.push(c * X - s * Y, s * X + c * Y, Z);
    const e = principalExtents(pts).extents;
    expect(e[0]).toBeCloseTo(6, 9); expect(e[1]).toBeCloseTo(4, 9); expect(e[2]).toBeCloseTo(2, 9);
  });
  it('haemoglobin 4HHB: the two shorter principal extents agree with NIGMS “roughly 5.5 nanometers wide” within 5 %', () => {
    const xyz = (hb as unknown as { cols: { xyz: number[] } }).cols.xyz;
    const [L, W, T] = principalExtents(xyz).extents.map((a) => a * 1e-10);
    expect(L).toBeGreaterThan(6 * nm); // the longest axis is longer
    for (const w of [W, T]) expect(Math.abs(w - 5.5 * nm) / (5.5 * nm)).toBeLessThan(0.05);
    expect(radiusOfGyration(xyz)).toBeGreaterThan(22); expect(radiusOfGyration(xyz)).toBeLessThan(25);
  });
  it('B-DNA 1BNA: the phosphate backbone is ~2 nm across (between NIGMS 2 nm and nano.gov 2.5 nm)', () => {
    const d = bna as unknown as { cols: { xyz: number[]; el: string[] } };
    const P = d.cols.el.flatMap((e, i) => (e === 'P' ? d.cols.xyz.slice(3 * i, 3 * i + 3) : []));
    expect(P.length / 3).toBe(22); // 12 + 12 nucleotides, 5′ ends without phosphate
    const [, w, t] = principalExtents(P).extents.map((a) => a * 1e-10);
    for (const x of [w, t]) { expect(x).toBeGreaterThan(1.6 * nm); expect(x).toBeLessThan(2.6 * nm); }
  });
  it('PDB index: seven entries with resolutions and citations from their own files', () => {
    const e = (pdbIndex as unknown as { entries: { id: string; resolutionA: number; citation: { doi: string | null } }[] }).entries;
    expect(e.map((x) => x.id)).toEqual(['1BNA', '1MBN', '1A6M', '4HHB', '4INS', '1EMA', '1LYZ']);
    expect(e.find((x) => x.id === '4HHB')!.resolutionA).toBe(1.74);
    expect(e.find((x) => x.id === '1BNA')!.citation.doi).toBe('10.1073/PNAS.78.4.2179');
  });
});
