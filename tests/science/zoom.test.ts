/**
 * Gate 12.7 — the body-to-molecule zoom: stops get smaller, every size comes from its quoted source, the range is
 * nine powers of ten, and each stop cites a Source-index entry.
 */
import { describe, expect, it } from 'vitest';
import { STOPS, Z_MAX, Z_MIN } from '@/modes/biologic/zoom/ZoomView';
import { SOURCES } from '@/shared/sources/sources';

describe('body-to-molecule zoom', () => {
  it('stops shrink monotonically, from 1.71 m to the water molecule', () => {
    const big = STOPS.map((s) => s.size);
    for (let i = 1; i < big.length; i++) expect(big[i], STOPS[i].id).toBeLessThan(big[i - 1]);
    expect(big[0]).toBeCloseTo(1.707, 2);
    expect(big.at(-1)!).toBeGreaterThan(1.4e-10); expect(big.at(-1)!).toBeLessThan(1.7e-10);
  });
  it('side branches sit outside the nucleus but inside the cell', () => {
    for (const id of ['mitochondrion', 'ribosome']) { const p = STOPS.find((x) => x.id === id)!.pos, r = Math.hypot(p[0], p[1]); expect(r, id).toBeGreaterThan(2.5e-6 + 1e-6); expect(r, id).toBeLessThan(15e-6 - 1e-6); }
  });
  it('quoted sizes: kidney 12 cm long, cell 30 µm, nucleus 5 µm, DNA 2 nm wide', () => {
    const s = (id: string) => STOPS.find((x) => x.id === id)!;
    expect(s('kidney').h).toBe(0.12); expect(s('cell').w).toBe(30e-6); expect(s('nucleus').w).toBe(5e-6); expect(s('dna').w).toBe(2e-9); expect(s('dna').size).toBe(2e-9);
  });
  it('the zoom spans about ten powers of ten and every stop cites a source', () => {
    expect(Z_MAX - Z_MIN).toBeGreaterThan(9.5);
    for (const s of STOPS) expect(SOURCES.some((x) => x.id === s.source), s.id).toBe(true);
  });
});
