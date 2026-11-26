/** Scientific validation — constants, unit conversion and dimensional analysis. */
import { describe, expect, it } from 'vitest';
import { convert, DimensionError, bestLengthUnit } from '@/core/units/units';
import { CONSTANTS, LIGHT_YEAR_M, PARSEC_M, SOLAR_MASS_KG } from '@/core/constants/constants';
import { advance, jdFromDate, dateFromJd } from '@/core/simulation/clock';
import { takeSnapshot, replay } from '@/core/simulation/snapshot';
import { leapfrogStep, NBODY_SOLVER } from '@/core/physics/gravity';

describe('Unit conversion (exact SI / IAU definitions)', () => {
  it('1 au = 149 597 870 700 m exactly (IAU 2012)', () => expect(convert(1, 'au', 'm')).toBe(149_597_870_700));
  it('1 pc = 206 264.806 au and 3.261 564 ly (tol 1e-9 rel)', () => {
    expect(convert(1, 'pc', 'au') / 206264.80624709636 - 1).toBeLessThan(1e-12);
    expect(Math.abs(convert(1, 'pc', 'ly') / 3.2615637771674333 - 1)).toBeLessThan(1e-9);
  });
  it('1 ly = 9.460 730 472 580 8 × 10¹⁵ m exactly', () => expect(LIGHT_YEAR_M).toBe(9_460_730_472_580_800));
  it('1 eV = 1.602 176 634 × 10⁻¹⁹ J exactly', () => expect(convert(1, 'eV', 'J')).toBe(1.602176634e-19));
  it('1 Å = 100 pm = 0.1 nm = 10⁵ fm', () => {
    expect(convert(1, 'Å', 'pm')).toBeCloseTo(100, 10);
    expect(convert(1, 'Å', 'nm')).toBeCloseTo(0.1, 12);
    expect(convert(1, 'Å', 'fm')).toBeCloseTo(1e5, 6);
  });
  it('1 u = 931.494 10 MeV/c² via E = mc² (tol 1e-8 rel)', () => {
    const MeV = (CONSTANTS.u.value * CONSTANTS.c.value ** 2) / convert(1, 'MeV', 'J');
    expect(Math.abs(MeV / 931.49410242 - 1)).toBeLessThan(1e-8);
  });
  it('solar mass from nominal GM☉ and CODATA G = 1.9884 × 10³⁰ kg (tol 1e-4 rel)', () => expect(Math.abs(SOLAR_MASS_KG / 1.98841e30 - 1)).toBeLessThan(1e-4));
  it('affine temperature: 0 °C = 273.15 K, 100 °C = 373.15 K', () => {
    expect(convert(0, '°C', 'K')).toBeCloseTo(273.15, 10);
    expect(convert(373.15, 'K', '°C')).toBeCloseTo(100, 10);
  });
  it('dimensional mismatch throws (au → eV, kg → s)', () => {
    expect(() => convert(1, 'au', 'eV')).toThrow(DimensionError);
    expect(() => convert(1, 'kg', 's')).toThrow(DimensionError);
  });
  it('readable unit ladder: Bohr radius → pm, 1 au → au, 4.2 ly → ly', () => {
    expect(bestLengthUnit(5.29e-11).unit).toBe('pm');
    expect(bestLengthUnit(CONSTANTS.au.value).unit).toBe('au');
    expect(bestLengthUnit(4.2 * LIGHT_YEAR_M).unit).toBe('ly');
    expect(PARSEC_M).toBeGreaterThan(LIGHT_YEAR_M);
  });
});

describe('Simulation infrastructure', () => {
  it('JD ↔ Date round-trips; J2000.0 = 2000-01-01 11:58:55.816 UTC (TDB 12:00), tol 1 s', () => {
    const d = new Date('2000-01-01T11:58:55.816Z');
    expect(Math.abs(jdFromDate(d) - 2451545.0) * 86400).toBeLessThan(1);
    expect(Math.abs(dateFromJd(2460676.5).getTime() - new Date('2024-12-31T23:58:50.816Z').getTime())).toBeLessThan(1000);
  });
  it('clock advance is deterministic and clamps to the ephemeris validity range', () => {
    const range = { minJd: 0, maxJd: 10, label: 't' };
    expect(advance({ jd: 5, rate: 86400, playing: true }, 2, range).jd).toBe(7);
    const c = advance({ jd: 9, rate: 86400, playing: true }, 5, range);
    expect(c.jd).toBe(10); expect(c.clamped).toBe(true); expect(c.playing).toBe(false);
  });
  it('snapshot replay reproduces an N-body run bit-for-bit', () => {
    const state = { t: 0, bodies: [{ id: 'a', mass: 1e30, r: [0, 0, 0] as [number, number, number], v: [0, 0, 0] as [number, number, number] }, { id: 'b', mass: 1e24, r: [1.5e11, 0, 0] as [number, number, number], v: [0, 3e4, 0] as [number, number, number] }] };
    const snap = takeSnapshot(NBODY_SOLVER, state, 0, 3600, 1);
    const r1 = replay(snap, (s, dt) => leapfrogStep(s, dt), 50);
    const r2 = replay(snap, (s, dt) => leapfrogStep(s, dt), 50);
    expect(r1[49]).toEqual(r2[49]);
    expect(state.bodies[1].r[0]).toBe(1.5e11); // snapshot isolated from live state
  });
});
