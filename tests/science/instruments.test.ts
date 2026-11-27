/**
 * Phase 8, Gate 8.4 — shared instruments. Dimension-checked unit families, readable-unit choice, the ruler
 * (distance, relative speed, light time), the time-series recorder, its statistics and CSV export.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import { DimensionError, UNITS, convert, type UnitDef } from '@/core/units/units';
import { dimEquals } from '@/core/units/dimensions';
import { COULOMB_LAYER, GRAVITY_LAYER, HEAT_LAYER, PLANE_WAVE_LAYER } from '@/core/fields/fields';
import { CONVERTER_GROUPS, TimeSeries, compatibleUnits, dimensionKey, readableUnit, ruler, separation, seriesCSV, seriesStats, unitKeyOf } from '@/shared/instruments/instruments';

const C = CONSTANTS.c.value, AU = CONSTANTS.au.value;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('unit families', () => {
  it('offers only units of the same dimension, smallest first', () => {
    const len = compatibleUnits('m');
    for (const k of ['fm', 'nm', 'cm', 'km', 'au', 'pc', 'Mpc'] as const) expect(len).toContain(k);
    expect(len).not.toContain('kg');
    for (let i = 1; i < len.length; i++) expect((UNITS[len[i]] as UnitDef).toSI).toBeGreaterThanOrEqual((UNITS[len[i - 1]] as UnitDef).toSI);
    expect(compatibleUnits('K')).toEqual(['K', '°C']);
    expect(compatibleUnits('rad')).toEqual(['arcsec', 'deg', 'rad']);
    expect(compatibleUnits('V/m')).toEqual(['V/m', 'kV/m', 'MV/m']);
    expect(compatibleUnits('J/kg')).toEqual(['J/kg', 'MJ/kg', 'km²/s²']);
  });
  it('converts the new instrument units exactly and refuses mismatched dimensions', () => {
    expect(convert(1, 'km²/s²', 'J/kg')).toBe(1e6);
    expect(convert(2.5, 'kV/m', 'V/m')).toBe(2500);
    expect(convert(440, 'Hz', 'kHz')).toBeCloseTo(0.44, 15);
    expect(convert(1, 'au', 'km')).toBeCloseTo(149_597_870.7, 6);
    expect(convert(25, '°C', 'K')).toBeCloseTo(298.15, 12);
    expect(convert(1500, 'ms', 's')).toBeCloseTo(1.5, 15);
    expect(convert(1, 'g_n', 'm/s²')).toBe(9.80665);
    expect(() => convert(1, 'V', 'V/m')).toThrow(DimensionError);
    expect(() => convert(1, 'J/kg', 'J')).toThrow(DimensionError);
    expect(() => convert(1, 'Hz', 's')).toThrow(DimensionError);
  });
  it('maps printed unit strings to registered units, and leaves unregistered ones alone', () => {
    expect(unitKeyOf('V/m')).toBe('V/m');
    expect(unitKeyOf('°')).toBe('deg');
    expect(unitKeyOf('R⊕')).toBe('R_earth');
    expect(unitKeyOf('W/(m·K)')).toBeNull();
    expect(unitKeyOf(null)).toBeNull();
  });
  it('resolves the unit of every FIELDS layer, so probe readouts are convertible', () => {
    for (const L of [GRAVITY_LAYER, COULOMB_LAYER, PLANE_WAVE_LAYER, HEAT_LAYER]) expect(unitKeyOf(L.units), L.id).not.toBeNull();
  });
  it('shares one unit preference per dimension; angles are kept apart from other dimensionless units', () => {
    expect(dimensionKey('km')).toBe(dimensionKey('au'));
    expect(dimensionKey('km')).not.toBe(dimensionKey('kg'));
    expect(dimensionKey('deg')).toBe('angle');
  });
  it('chooses a readable unit: the largest whose value is at least 1', () => {
    expect(readableUnit(1.5e11, 'm')).toBe('au');
    expect(readableUnit(0.002, 'm')).toBe('mm');
    expect(readableUnit(-0.05, 'm')).toBe('cm');
    expect(readableUnit(1000, 's')).toBe('min');
    expect(readableUnit(300, 'K')).toBe('K');
    expect(readableUnit(-5e3, 'V')).toBe('kV');
    expect(readableUnit(0, 'm')).toBe('m');
    expect(readableUnit(3e22, 'm')).toBe('kpc');
  });
  it('builds converter groups whose units all share one dimension', () => {
    for (const g of CONVERTER_GROUPS) {
      expect(g.units.length, g.id).toBeGreaterThanOrEqual(2);
      const d0 = (UNITS[g.units[0]] as UnitDef).dimension;
      for (const k of g.units) expect(dimEquals((UNITS[k] as UnitDef).dimension, d0)).toBe(true);
    }
  });
});

describe('ruler', () => {
  it('gives distance, relative speed and one-way light time', () => {
    const r = ruler({ x: [AU / 1000, 0, 0], v: [0, 29.78, 0] }, { x: [0, 0, 0], v: [0, 0, 0] }, 'km', 'km/s');
    expect(rel(r.distance, AU / 1000)).toBeLessThan(1e-15);
    expect(r.relSpeed).toBeCloseTo(29.78, 12);
    expect(r.lightTimeS).toBeCloseTo(499.004784, 5);          // 1 au / c
    expect(ruler({ x: [1, 0, 0] }, { x: [0, 0, 0] }, 'au').lightTimeS).toBeCloseTo(AU / C, 9);
    expect(ruler({ x: [0, 0, 0] }, { x: [3, 4, 0] }, 'm').relSpeed).toBeNull();
    expect(separation([1, 2, 3], [4, 6, 3])).toBe(5);
  });
});

describe('time series', () => {
  it('keeps the latest `cap` finite samples in order', () => {
    const ts = new TimeSeries(5);
    for (let i = 0; i < 8; i++) ts.push(i, i * i);
    ts.push(9, NaN);
    expect(ts.length).toBe(5);
    expect(ts.points().map((p) => p[0])).toEqual([3, 4, 5, 6, 7]);
    ts.clear();
    expect(ts.points()).toEqual([]);
    expect(() => new TimeSeries(1)).toThrow(RangeError);
  });
  it('computes min, max, mean, rms and span (sine: rms = A/√2)', () => {
    const pts = Array.from({ length: 1000 }, (_, i) => [i / 1000, 2 * Math.sin((2 * Math.PI * i) / 1000)] as const);
    const st = seriesStats(pts)!;
    expect(st.n).toBe(1000);
    expect(st.rms).toBeCloseTo(2 / Math.SQRT2, 6);
    expect(st.mean).toBeCloseTo(0, 10);
    expect(st.max).toBeCloseTo(2, 4);
    expect(st.tSpan).toBeCloseTo(0.999, 12);
    expect(seriesStats([])).toBeNull();
  });
  it('exports CSV with metadata comments and full-precision values', () => {
    const csv = seriesCSV({ title: 'Probe y(t)', x: { name: 'time', unit: 's' }, y: { name: 'displacement, y', unit: 'm' }, provenance: 'derived', method: 'analytic', sources: ['codata-2018'] }, [[0, 0.1], [0.5, -1.234567890123e-7]]);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('# Probe y(t)');
    expect(lines).toContain('# provenance: derived');
    expect(lines).toContain('# sources: codata-2018');
    expect(lines).toContain('time (s),"displacement, y (m)"');
    expect(Number(lines[lines.length - 1].split(',')[1])).toBe(-1.234567890123e-7);
  });
});
