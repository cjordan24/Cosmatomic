/**
 * Gate 11.7 — photosynthesis and microorganisms.
 */
import { describe, expect, it } from 'vitest';
import { photonEnergyEV, photonEnergyKJmol } from '@/modes/biologic/plants/PlantsView';
import { parseFormulaCounts } from '@/modes/atomic/reactions/formula';
import { REACTIONS } from '@/modes/atomic/reactions/library';
import plants from '@datasets/biology/plants.json';
import cells from '@datasets/biology/cells.json';

const P = plants as unknown as { chlorophyll: { id: string; peaks: { nm: number; epsilon: number; stated: boolean; quote: string }[]; quantumYield: { value: number } }[]; photosynthesis: { equation: string } };
const C = cells as unknown as { nhgri: { term: string; text: string }[]; nigms: { term: string; text: string }[] };

describe('photosynthesis', () => {
  it('NASA’s CO2 + H2O = CH2O + O2 is balanced, and six times it is the curated net reaction', () => {
    const count = (side: string[], k = 1) => { const m = new Map<string, number>(); for (const f of side) for (const [el, n] of parseFormulaCounts(f)) m.set(el, (m.get(el) ?? 0) + n * k); return m; };
    expect(count(['CO2', 'H2O'])).toEqual(count(['CH2O', 'O2']));
    const r = REACTIONS.find((x) => x.id === 'photosynthesis-net')!;
    const side = (xs: { c: number; s: string }[]) => { const m = new Map<string, number>(); for (const x of xs) for (const [el, n] of parseFormulaCounts(x.s.replace(/\(.*\)$/, ''))) m.set(el, (m.get(el) ?? 0) + n * x.c); return m; };
    expect(side(r.reactants)).toEqual(count(['CO2', 'H2O'], 6));
    expect(side(r.products)).toEqual(count(['CH2O', 'O2'], 6));
    expect(P.photosynthesis.equation).toBe('CO2 + H2O + energy = CH2O + O2');
  });
  it('chlorophyll maxima as stated (427.8 nm, 111 700; 453.0 nm, 159 100) and read from the data (660.06, 643.0 nm)', () => {
    const a = P.chlorophyll.find((c) => c.id === 'chl-a')!, b = P.chlorophyll.find((c) => c.id === 'chl-b')!;
    expect(a.peaks.map((p) => [p.nm, p.epsilon, p.stated])).toEqual([[427.8, 111700, true], [660.06, 85265, false]]);
    expect(b.peaks.map((p) => [p.nm, p.epsilon, p.stated])).toEqual([[453, 159100, true], [643, 57050, false]]);
    expect(a.peaks[0].quote).toContain('111,700cm-1/M at 427.8nm (Strain, 1963)');
    expect([a.quantumYield.value, b.quantumYield.value]).toEqual([0.32, 0.117]);
    for (const c of P.chlorophyll) for (const p of c.peaks) { expect(p.nm).toBeGreaterThan(400); expect(p.nm).toBeLessThan(700); }
  });
  it('photon energy hc/λ: 2.898 eV at 427.8 nm, 1.878 eV at 660.06 nm; 279.6 kJ/mol at 427.8 nm', () => {
    expect(photonEnergyEV(427.8e-9)).toBeCloseTo(2.898, 3);
    expect(photonEnergyEV(660.06e-9)).toBeCloseTo(1.878, 3);
    expect(photonEnergyKJmol(427.8e-9)).toBeCloseTo(279.6, 1);
  });
});

describe('microorganism text', () => {
  it('NHGRI definitions only — the narration transcripts are not quoted', () => {
    const bac = C.nhgri.find((d) => d.term === 'Bacteria')!.text;
    expect(bac.startsWith('Bacteria are small single-celled organisms.')).toBe(true);
    expect(bac).not.toContain('10 times more bacterial cells');
    expect(C.nhgri.find((d) => d.term === 'Virus')!.text).toContain('A virus cannot replicate alone');
  });
  it('NIGMS: a virus “is neither a cell nor a living organism because it can\'t reproduce on its own”', () => {
    expect(C.nigms.find((d) => d.term === 'Virus')!.text).toContain("A virus is neither a cell nor a living organism because it can't reproduce on its own.");
    expect(C.nigms.find((d) => d.term === 'Photosynthesis')!.text).toContain("use the sun's energy to make carbohydrates from carbon dioxide and water");
  });
});
