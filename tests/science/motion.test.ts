/**
 * Phase 20.4 — Coriolis, Rayleigh convection, drops.
 */
import { describe, expect, it } from 'vitest';
import { coriolisParam, dropletsPerDrop, fallTime, inertialRadius, OMEGA, RAYLEIGH_FREE, rayleighThreshold, turntablePath } from '@/core/meteorology/motion';

describe('Coriolis', () => {
  it('ω = 2π/86,164 s = 7.2921 × 10⁻⁵ s⁻¹; 15° 2′ 26″ per hour', () => {
    expect(OMEGA).toBeCloseTo(7.2921e-5, 9);
    // Humphreys prints 15° 2′ 26″ per hour; 2π/86,164 s gives 15° 2′ 28″ (finding)
    expect((OMEGA * 3600 * 180) / Math.PI).toBeCloseTo(15 + 2 / 60 + 28 / 3600, 3);
  });
  it('f = 2ω sin φ is 1.03 × 10⁻⁴ s⁻¹ at 45°, zero at the equator, negative in the south', () => {
    expect(coriolisParam(45)).toBeCloseTo(1.0312e-4, 7);
    expect(coriolisParam(0)).toBe(0); expect(coriolisParam(-30)).toBeLessThan(0);
  });
  it('inertial radius of a 10 m/s wind at 45° is about 97 km', () => { expect(inertialRadius(10, 45) / 1000).toBeCloseTo(97, 0); });
  it('on a turntable turning anticlockwise, a straight launch curves to the right', () => {
    const p = turntablePath(1, 0.5, 2, 10); const [x, y] = p[10]; expect(x).toBeGreaterThan(0); expect(y).toBeLessThan(0);
  });
});
describe('Rayleigh 1916', () => {
  it('27π⁴/4 = 657.5', () => { expect(RAYLEIGH_FREE).toBeCloseTo(657.51, 2); });
  it('air, ζ = 1 cm: threshold ≈ 0.033 (“one-thirtieth part”)', () => { expect(rayleighThreshold(1)).toBeCloseTo(0.0329, 4); });
});
describe('drops', () => {
  it('a 2 mm drop holds a million 0.02 mm droplets', () => { expect(dropletsPerDrop(2, 0.02)).toBeCloseTo(1e6, 3); });
  it('1.3 cm/s from 500 m takes more than 10 hours', () => { expect(fallTime(500, 0.013) / 3600).toBeGreaterThan(10); });
});
