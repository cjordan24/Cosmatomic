/**
 * Phase 10, Gate 10.7 — atmospheric radiation: Rayleigh 1871 (λ⁻⁴) and 1899 (eqs. 4, 14, 23; pp. 402–403);
 * NASA TM-82021 (air mass, Bouguer's law); USGS Landsat 8–9 bands; Wien (Planck 1914) for the thermal bands.
 */
import { describe, expect, it } from 'vitest';
import { LANDSAT_89, RAYLEIGH_1899, airMass, bouguer, loschmidt, molecularDepth, rayleighExtinction, rayleighRelative } from '@/core/physics/atmosphere/radiation';
import { peakWavelength } from '@/core/physics/thermal/radiation';

describe('Rayleigh scattering', () => {
  it('intensity ∝ λ⁻⁴: blue 450 nm is scattered 4.35 times as strongly as red 650 nm', () => {
    expect(rayleighRelative(450e-9) / rayleighRelative(650e-9)).toBeCloseTo((650 / 450) ** 4, 12);
    expect((650 / 450) ** 4).toBeCloseTo(4.35, 2);
  });
  it('Rayleigh’s 1899 numbers: λ = 6 × 10⁻⁵ cm, μ − 1 = ·0003 give x = 4·4 × 10⁻¹³ n cm (eq. 23) and 83 km with Maxwell’s n', () => {
    const { lambda, muMinus1, nMaxwell } = RAYLEIGH_1899;
    const x = 1 / rayleighExtinction(lambda, muMinus1, nMaxwell);
    expect(x / 1e3).toBeCloseTo(82.7, 1);
    expect(x * 100 / (nMaxwell / 1e6)).toBeCloseTo(4.4e-13, 14);
  });
  it('with today’s Loschmidt number (p/kT at 0 °C) the attenuation length at 600 nm is 117 km', () => {
    expect(loschmidt()).toBeCloseTo(2.6868e25, -21);
    expect(1 / rayleighExtinction(6e-7, 0.0003, loschmidt()) / 1e3).toBeCloseTo(117.0, 0);
  });
  it('8·3 km of air: molecular zenith transmission ·90 at 600 nm with Maxwell’s n (Bouguer observed ·8); blue light is dimmed more', () => {
    const T600 = Math.exp(-molecularDepth(6e-7, RAYLEIGH_1899.nMaxwell));
    expect(T600).toBeCloseTo(0.905, 2);
    expect(Math.exp(-molecularDepth(4.5e-7, loschmidt()))).toBeLessThan(Math.exp(-molecularDepth(6.5e-7, loschmidt())));
    // Rayleigh's check: (·8)¹⁰ ≈ ·11 over 83 km against 1/e ≈ ·37
    expect(0.8 ** 10).toBeCloseTo(0.107, 3);
  });
});

describe('air mass and Bouguer’s law (NASA TM-82021)', () => {
  it('m = sec z: 1 at the zenith, 2 at 60°; transmission multiplies along the path', () => {
    expect(airMass(0)).toBe(1);
    expect(airMass(Math.PI / 3)).toBeCloseTo(2, 12);
    expect(bouguer(0.2, 2)).toBeCloseTo(bouguer(0.2, 1) ** 2, 14);
    expect(airMass(Math.PI / 2)).toBeNull();
  });
});

describe('Landsat 8–9 (USGS)', () => {
  it('eleven bands; the thermal bands contain the 10 µm Wien peak of a 288 K surface', () => {
    expect(LANDSAT_89).toHaveLength(11);
    const peak = peakWavelength(288) * 1e6;
    expect(peak).toBeCloseTo(10.06, 2);
    expect(LANDSAT_89.filter((b) => b.sensor === 'TIRS').every((b) => b.lo >= 10 && b.hi <= 12.6)).toBe(true);
  });
});
