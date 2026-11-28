/**
 * Gate 11.4 — cells. Sphere geometry, and the glossary and Inside the Cell text checked against what was read.
 */
import { describe, expect, it } from 'vitest';
import { diameterForVolume, sphereArea, sphereVolume, surfaceToVolume, volumeRatio } from '@/core/biology/cellGeometry';
import { PARTS } from '@/modes/biologic/cells/CellsView';
import data from '@datasets/biology/cells.json';

const D = data as unknown as { nigms: { term: string; text: string }[]; nhgri: { term: string; text: string }[]; comparison: { rows: string[][] }; fractions: { id: string; share: { value: number; kind: string }; quote: string }[] };

describe('sphere geometry', () => {
  it('A = πd², V = πd³/6 and A/V = 6/d, consistent with each other', () => {
    for (const d of [0.5, 1, 3.16, 30, 150]) {
      expect(sphereArea(d) / sphereVolume(d)).toBeCloseTo(surfaceToVolume(d), 12);
      expect(diameterForVolume(sphereVolume(d))).toBeCloseTo(d, 10);
    }
    expect(sphereVolume(1)).toBeCloseTo(Math.PI / 6, 15); // 0.5236 µm³ = fL
  });
  it('doubling the diameter halves A/V and multiplies volume by 8; a 30 µm cell holds 27 000 times a 1 µm one', () => {
    expect(surfaceToVolume(20) / surfaceToVolume(10)).toBeCloseTo(0.5, 15);
    expect(volumeRatio(20, 10)).toBeCloseTo(8, 12);
    expect(volumeRatio(30, 1)).toBeCloseTo(27000, 8);
  });
});

describe('cell text', () => {
  it('NIGMS definitions are verbatim, with pronunciations, plurals and blog pointers removed', () => {
    const t = (k: string) => D.nigms.find((d) => d.term === k)!.text;
    expect(t('Prokaryotic cell')).toBe('A cell that lacks a nucleus, such as a bacterium.');
    expect(t('Eukaryotic cell')).toBe('A cell with a membrane-bound nucleus and other organelles not found in prokaryotic cells. Eukaryotic cells make up animals, plants, fungi, and some single-celled organisms.');
    expect(t('Membrane')).toBe('A semi-fluid layer of lipids and proteins. Membranes enclose cells and organelles and control passage of materials into and out of them.');
    expect(t('Nucleus')).toBe('The membrane-bound structure within a eukaryotic cell that contains most of the cell\'s genetic material.');
    for (const d of D.nigms) { expect(d.text).not.toMatch(/\s[A-Z]$|For more|\(plural|text_to_speech/); }
  });
  it('NHGRI: an adult human body has between 10 and 100 trillion cells', () => {
    expect(D.nhgri.find((d) => d.term === 'Cell')!.text).toContain('An adult human body is estimated to contain between 10 and 100 trillion cells.');
  });
  it('Inside the Cell: four table rows and four volume statements with their qualifiers', () => {
    expect(D.comparison.rows).toHaveLength(4);
    expect(D.comparison.rows[3][1]).toBe('Most are 1–10 micrometers across');
    expect(D.fractions.map((f) => `${f.id} ${f.share.kind} ${f.share.value}`)).toEqual(['cytosol about 0.5', 'er more than 0.1', 'nucleus up to 0.1', 'mito-heart around 0.25']);
    for (const f of D.fractions) expect(f.quote).toContain(`${Math.round(f.share.value * 100)} percent`);
  });
  it('every part of the drawing resolves to definitions that exist', () => {
    for (const p of PARTS) {
      if (p.nigms) expect(D.nigms.some((d) => d.term === p.nigms), p.id).toBe(true);
      if (p.nhgri) expect(D.nhgri.some((d) => d.term === p.nhgri), p.id).toBe(true);
    }
  });
});
