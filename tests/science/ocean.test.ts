/**
 * Phase 23.3 — ENSO episodes, ocean pH, sea ice.
 */
import { describe, expect, it } from 'vitest';
import { acidityIncrease, ensoEpisodes, flatten, ols } from '@/core/meteorology/ocean';
import oceans from '@datasets/meteorology/oceans.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const O = oceans as any;
const eps = ensoEpisodes(flatten(O.enso.oni));
const covers = (kind: string, year: number) => eps.some((e) => e.kind === kind && e.start.year <= year && e.end.year >= year);
describe('ENSO (NOAA ONI, ERSSTv6)', () => {
  it('finds the 1997–98, 2015–16 and 2023–24 El Niños and the 1988–89 and 2010–11 La Niñas', () => {
    expect(covers('El Niño', 1997)).toBe(true); expect(covers('El Niño', 2015)).toBe(true); expect(covers('El Niño', 2023)).toBe(true);
    expect(covers('La Niña', 1988)).toBe(true); expect(covers('La Niña', 2010)).toBe(true);
  });
  it('the strongest El Niño peaks above 2 °C', () => { expect(Math.max(...eps.map((e) => e.peak))).toBeGreaterThan(2); });
});
describe('acidification', () => {
  it('a pH drop of 0.11 is a 28.8 % rise in hydrogen ions (PMEL)', () => { expect(acidityIncrease(0.11) * 100).toBeCloseTo(28.8, 1); });
  it('Station ALOHA surface pH falls by about 0.02 per decade (HOT data, our fit)', () => {
    const r = O.acid.hot.rows as [number, number][]; const f = ols(r.map((x) => x[0]), r.map((x) => x[1]));
    expect(f.slope * 10).toBeLessThan(-0.015); expect(f.slope * 10).toBeGreaterThan(-0.025);
  });
});
describe('Arctic sea ice', () => {
  it('the minimum extent falls about 12 % per decade relative to 1981–2010 (NASA 12.2, NSIDC 11.8)', () => {
    const r = O.ice.rows as number[][]; const f = ols(r.map((x) => x[0]), r.map((x) => x[3]));
    const base = r.filter((x) => x[0] >= 1981 && x[0] <= 2010).map((x) => x[3]); const m = base.reduce((a, b) => a + b, 0) / base.length;
    expect((f.slope * 10) / m * 100).toBeLessThan(-11); expect((f.slope * 10) / m * 100).toBeGreaterThan(-13.5);
  });
});
