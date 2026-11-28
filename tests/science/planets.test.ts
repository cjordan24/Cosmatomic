/**
 * Phase 22 — planetary atmospheres: the fact sheets' scale heights follow from their own numbers.
 */
import { describe, expect, it } from 'vitest';
import { emittedOverAbsorbed, greenhouseK, scaleHeightKm } from '@/core/meteorology/planets';
import planets from '@datasets/meteorology/planets.json';
import phys from '@datasets/astronomical/planet-physical.json';
import rad from '@datasets/astronomical/planet-radiation.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const W = (planets as any).worlds as any[], P = phys as any, B = (rad as any).bodies as any[];
const w = (id: string) => W.find((x) => x.id === id)!;
describe('scale heights', () => {
  for (const id of ['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
    it(`${id}: R*T/(M g) agrees with the printed scale height within 6 %`, () => {
      const x = w(id), H = scaleHeightKm(x.tK, x.mmw, P[id].gravityMs2);
      expect(Math.abs(H / x.H - 1)).toBeLessThan(0.06);
    });
  }
});
describe('energy', () => {
  it('greenhouse warming: Venus ≈ 510 K, Earth 34 K', () => {
    const tb = (id: string) => B.find((b) => b.id === id)!.blackBodyTemperatureK;
    expect(greenhouseK(737, tb('venus'))).toBeCloseTo(510.4, 0); expect(greenhouseK(288, tb('earth'))).toBe(34);
  });
  it('Neptune emitted ÷ absorbed from Wang et al. (162 %) ≈ 2.62, within Voyager’s 2.61 ± 0.28', () => { expect(emittedOverAbsorbed(1.62)).toBeCloseTo(2.62, 2); });
});
