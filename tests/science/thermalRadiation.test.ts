/**
 * Phase 10, Gate 10.5 — thermal radiation: Planck (1914) eqs. 48, 75–76, 109–110, 276; NASA Earth Observatory energy
 * budget; NSSDCA fact-sheet albedos, irradiances and black-body temperatures (datasets/astronomical/planet-radiation.json).
 */
import { describe, expect, it } from 'vitest';
import {
  SIGMA_SB, WIEN_B, WIEN_B_1914, blackFlux, equilibriumTemperature, greyFlux, integratedFlux, meanInsolation, netExchange, peakWavelength, planckLambda,
} from '@/core/physics/thermal/radiation';
import rad from '@datasets/astronomical/planet-radiation.json';

const bodies = (rad as unknown as { bodies: { id: string; bondAlbedo: number; solarIrradianceWm2: number; blackBodyTemperatureK: number }[] }).bodies;

describe('black-body laws (Planck 1914)', () => {
  it('Stefan–Boltzmann: π∫B_λ dλ = σT⁴ to 10⁻⁶ at 300 K and 5772 K; σ = 5.670374 × 10⁻⁸', () => {
    expect(SIGMA_SB).toBeCloseTo(5.670374e-8, 13);
    for (const T of [300, 5772]) expect(integratedFlux(T) / blackFlux(T)).toBeCloseTo(1, 6);
  });
  it('Wien: the Planck curve peaks at b/T; b = 2.8978 mm·K, 1.4 % below Lummer and Pringsheim’s 2.94 mm·K', () => {
    const T = 5772, lm = peakWavelength(T);
    expect(planckLambda(lm, T)).toBeGreaterThan(planckLambda(lm * 1.001, T));
    expect(planckLambda(lm, T)).toBeGreaterThan(planckLambda(lm * 0.999, T));
    expect(WIEN_B * 1e3).toBeCloseTo(2.8978, 4);
    expect((WIEN_B_1914 - WIEN_B) / WIEN_B).toBeCloseTo(0.0146, 3);
  });
  it('the peak moves to shorter wavelengths as T rises (Planck §89) and the peak height grows as T⁵ (eq. 111)', () => {
    expect(peakWavelength(6000)).toBeLessThan(peakWavelength(3000));
    expect(planckLambda(peakWavelength(6000), 6000) / planckLambda(peakWavelength(3000), 3000)).toBeCloseTo(32, 6);
  });
});

describe('Kirchhoff: grey bodies and exchange', () => {
  it('a grey body emits ε σT⁴; at equal temperatures the net exchange vanishes', () => {
    expect(greyFlux(0.5, 400)).toBeCloseTo(0.5 * blackFlux(400), 10);
    expect(netExchange(0.8, 300, 300)).toBe(0);
    expect(netExchange(1, 310, 290)).toBeCloseTo(blackFlux(310) - blackFlux(290), 10);
  });
});

describe('radiative balance (NASA energy budget; NSSDCA fact sheets)', () => {
  it('Earth: S/4 ≈ 340 W/m², 29 % reflected leaves ≈ 240 W/m² absorbed (NASA)', () => {
    const e = bodies.find((b) => b.id === 'earth')!;
    expect(meanInsolation(e.solarIrradianceWm2)).toBeCloseTo(340.25, 2);
    expect(meanInsolation(e.solarIrradianceWm2) * (1 - 0.29)).toBeCloseTo(241.6, 1);
  });
  it('T = [S(1 − A)/4σ]^¼ reproduces the NSSDCA black-body temperatures within 0.1 K, except Earth (+1.1 K) and Pluto (−5.3 K), whose printed temperatures imply albedos of 0.306 and 0.486', () => {
    const implied = (b: { solarIrradianceWm2: number; blackBodyTemperatureK: number }) => 1 - (4 * SIGMA_SB * b.blackBodyTemperatureK ** 4) / b.solarIrradianceWm2;
    for (const b of bodies) {
      const T = equilibriumTemperature(b.solarIrradianceWm2, b.bondAlbedo);
      if (b.id === 'earth') { expect(T - b.blackBodyTemperatureK).toBeCloseTo(1.1, 1); expect(implied(b)).toBeCloseTo(0.306, 3); }
      else if (b.id === 'pluto') { expect(T - b.blackBodyTemperatureK).toBeCloseTo(-5.3, 1); expect(implied(b)).toBeCloseTo(0.486, 3); }
      else expect(Math.abs(T - b.blackBodyTemperatureK), b.id).toBeLessThan(0.1);
    }
  });

});
