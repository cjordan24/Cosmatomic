/**
 * Phase 21.3 — Köppen–Geiger (Peel et al. 2007) on NOAA 1991–2020 normals.
 */
import { describe, expect, it } from 'vitest';
import { fToC, inToMm, koppen } from '@/core/meteorology/koppen';
import climates from '@datasets/meteorology/climates.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const S = (climates as any).stations as any[];
const k = (id: string) => { const s = S.find((x) => x.id === id)!; return koppen(s.tavgF.map(fToC), s.prcpIn.map(inToMm)).code; };
describe('Köppen classes of the stations', () => {
  it('Hilo Af, Utqiaġvik ET, Mt Washington ET', () => { expect(k('USW00021504')).toBe('Af'); expect(k('USW00027502')).toBe('ET'); expect(k('USW00014755')).toBe('ET'); });
  it('Phoenix and Las Vegas hot desert (BWh)', () => { expect(k('USW00023183')).toBe('BWh'); expect(k('USW00023169')).toBe('BWh'); });
  it('San Francisco and Seattle Csb; Los Angeles airport falls just inside arid (BSk: 310.6 mm < 351.3 mm threshold)', () => {
    expect(k('USW00023272')).toBe('Csb'); expect(k('USW00024233')).toBe('Csb'); expect(k('USW00023174')).toBe('BSk');
  });
  it('Atlanta Cfa; Chicago and Minneapolis Dfa', () => { expect(k('USW00013874')).toBe('Cfa'); expect(k('USW00094846')).toBe('Dfa'); expect(k('USW00014922')).toBe('Dfa'); });
  it('Yakima (lee of the Cascades) is arid; Quillayute is not', () => { expect(k('USW00024243').startsWith('B')).toBe(true); expect(k('USW00094240').startsWith('B')).toBe(false); });
  it('monthly normals sum to the printed annual totals', () => { for (const s of S) expect(s.prcpIn.reduce((a: number, b: number) => a + b, 0)).toBeCloseTo(s.annual.prcpIn, 2); });
});
