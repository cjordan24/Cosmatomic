/**
 * Phase 20 — the U.S. Standard Atmosphere 1976 and humidity relations.
 */
import { describe, expect, it } from 'vitest';
import { cloudBase, dewPoint, dryLapse, geopotential, layerBases, relHumidity, satVapour, scaleHeight, standardAtmosphere } from '@/core/meteorology/atmosphere';

describe('U.S. Standard Atmosphere 1976', () => {
  it('sea level: 288.15 K, 101325 Pa, 1.2250 kg/m³', () => {
    const s = standardAtmosphere(0);
    expect(s.T).toBe(288.15); expect(s.P).toBe(101325); expect(s.rho).toBeCloseTo(1.2250, 4);
  });
  it('layer-base pressures match the standard’s table (Pa)', () => {
    const P = layerBases().map((b) => b.P);
    [101325, 22632.06, 5474.889, 868.0187, 110.9063, 66.93887, 3.956420].forEach((v, i) => expect(P[i] / v).toBeCloseTo(1, 5));
  });
  it('the tropopause at 11 km geopotential is 216.65 K', () => { expect(layerBases()[1].T).toBeCloseTo(216.65, 9); });
  it('geometric 11.019 km is geopotential 11 km', () => { expect(geopotential(11019.1)).toBeCloseTo(11000, 0); });
  it('pressure halves roughly every 5.5 km near the ground', () => { expect(standardAtmosphere(5500).P / 101325).toBeCloseTo(0.5, 1); });
  it('scale height at 288 K is about 8.4 km; dry lapse rate about 9.8 K/km', () => {
    expect(scaleHeight(288.15) / 1000).toBeCloseTo(8.43, 2);
    expect(dryLapse() * 1000).toBeCloseTo(9.77, 2);
  });
});
describe('humidity', () => {
  it('saturation vapour pressure: 6.11 hPa at 0 °C; about 7 % more per kelvin near 15 °C', () => {
    expect(satVapour(0)).toBeCloseTo(6.11, 9);
    expect(satVapour(16) / satVapour(15)).toBeCloseTo(1.066, 2);
  });
  it('dew point inverts relative humidity', () => {
    const td = dewPoint(25, 0.6); expect(relHumidity(25, td)).toBeCloseTo(0.6, 9);
  });
  it('cloud base: 10 °C (18 °F) spread → 4,091 ft ≈ 1,247 m', () => { expect(cloudBase(25, 15)).toBeCloseTo(1246.9, 1); });
});

import { co2ForcingAR6, co2ForcingSimple, duToMm, effectiveTemp } from '@/core/meteorology/atmosphere';
describe('radiation', () => {
  it('reproduces NOAA AGGI: 425.62 ppm (2025) → 2.372 W/m² with the AR6 formula', () => { expect(co2ForcingAR6(425.62)).toBeCloseTo(2.372, 2); });
  it('simple formula: doubling gives 3.71 W/m² (“just under 4”)', () => { expect(co2ForcingSimple(560, 280)).toBeCloseTo(3.708, 3); });
  it('effective temperature with S = 1361, α = 0.294 is 255 K (fact sheet prints 254.0)', () => { expect(effectiveTemp(1361, 0.294)).toBeCloseTo(255.0, 0); });
  it('300 DU is 3 mm', () => { expect(duToMm(300)).toBeCloseTo(3, 12); });
});
