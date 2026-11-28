/**
 * Phase 23 — ice-core and orbital records.
 */
import { describe, expect, it } from 'vitest';
import { interp, onGrid, pearson } from '@/core/meteorology/paleo';
import ice from '@datasets/meteorology/iceages.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const I = ice as any;
const co2 = I.co2.rows as [number, number][], temp = I.temp.rows as [number, number][];
describe('ice cores', () => {
  it('CO₂ extremes before 1800: 173.71 ppm (~667 kyr) and 298.6 ppm (~335 kyr)', () => {
    const old = co2.filter(([a]) => a > 150).map(([, v]) => v);
    expect(Math.min(...old)).toBeCloseTo(173.71, 2); expect(Math.max(...old)).toBeCloseTo(298.6, 1);
  });
  it('Last Glacial Maximum (~20 kyr): CO₂ under 200 ppm and Antarctica about 9 °C colder', () => {
    expect(interp(co2, 20000)).toBeLessThan(200); expect(interp(temp, 21000)).toBeLessThan(-8);
  });
  it('CO₂ and Antarctic temperature rise and fall together (r > 0.8 over 800 kyr)', () => {
    const { xs, ys } = onGrid(co2, temp, 1000, 800000, 1000); expect(pearson(xs, ys)).toBeGreaterThan(0.8);
  });
});
describe('orbits (Berger & Loutre 1991)', () => {
  it('obliquity spans 22.08–24.48° over 800 kyr (NASA: “between 22.1 and 24.5 degrees”); 23.446° in 1950', () => {
    const o = I.orbit.rows.map((r: number[]) => r[2]);
    expect(Math.min(...o)).toBeCloseTo(22.079, 3); expect(Math.max(...o)).toBeCloseTo(24.48, 2); expect(o[0]).toBe(23.446);
  });
});
