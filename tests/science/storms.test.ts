/**
 * Phase 21 — storm scales and indices.
 */
import { describe, expect, it } from 'vitest';
import { efScale, heatIndexF, isBlizzard, saffirSimpson, windChillF } from '@/core/meteorology/storms';

describe('scales', () => {
  it('Saffir-Simpson boundaries (NHC, kt)', () => {
    expect(saffirSimpson(63).label).toBe('Tropical storm'); expect(saffirSimpson(64).cat).toBe(1);
    expect(saffirSimpson(95).cat).toBe(2); expect(saffirSimpson(96).cat).toBe(3); expect(saffirSimpson(137).cat).toBe(5);
  });
  it('Katrina: 150 kt peak = Category 5; 110 kt at Buras = Category 3', () => { expect(saffirSimpson(150).cat).toBe(5); expect(saffirSimpson(110).cat).toBe(3); });
  it('EF boundaries (NWS)', () => { expect(efScale(65)).toBe('EF0'); expect(efScale(110)).toBe('EF1'); expect(efScale(200)).toBe('EF4'); expect(efScale(201)).toBe('EF5'); });
});
describe('indices', () => {
  it('wind chill: 0 °F with 15 mph ≈ −19.4 °F', () => { expect(windChillF(0, 15)).toBeCloseTo(-19.4, 1); });
  it('heat index: 90 °F at 50 % ≈ 94.6 °F (regression)', () => { const h = heatIndexF(90, 50); expect(h.method).toBe('regression'); expect(h.hi).toBeCloseTo(94.6, 1); });
  it('heat index below 80 uses the simple formula', () => { expect(heatIndexF(70, 50).method).toBe('simple'); });
  it('blizzard criteria', () => { expect(isBlizzard(35, 0.25, 3)).toBe(true); expect(isBlizzard(34, 0.1, 5)).toBe(false); });
});
