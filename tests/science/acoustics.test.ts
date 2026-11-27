/**
 * Phase 9, Gate 9.5 — acoustics: OpenStax University Physics Vol. 1 ch. 17 and College Physics 2e §17.7.
 */
import { describe, expect, it } from 'vitest';
import {
  I0, TABLE_17_5, acousticMedia, coneAngle, dopplerShift, impedance, intensityAt, intensityFromLevel, levelDb, machNumber, pressureAmplitude, reflectedFraction, sumLevels,
} from '@/core/physics/waves/acoustics';
import { doppler } from '@/core/physics/waves/waves';
import { getSource } from '@/shared/sources/sources';

describe('intensity and level (UP1 eqs. 17.8–17.12)', () => {
  it('β(I₀) = 0 dB; 1 W/m² is 120 dB (Table 17.2)', () => {
    expect(levelDb(I0)).toBe(0);
    expect(levelDb(1)).toBeCloseTo(120, 12);
    expect(intensityFromLevel(90)).toBeCloseTo(1e-3, 15);
  });
  it('intensity ratios and level differences of Table 17.3: ×2 → 3.0 dB, ×5 → 7.0 dB, ×10 → 10 dB', () => {
    expect(levelDb(2 * I0)).toBeCloseTo(3.0, 1); expect(levelDb(5 * I0)).toBeCloseTo(7.0, 1); expect(levelDb(1000 * I0)).toBeCloseTo(30, 12);
  });
  it('inverse square: doubling the distance quarters the intensity (17.9), −6.02 dB', () => {
    expect(intensityAt(1, 2) / intensityAt(1, 1)).toBeCloseTo(0.25, 15);
    expect(levelDb(intensityAt(1, 2)) - levelDb(intensityAt(1, 1))).toBeCloseTo(-6.0206, 4);
  });
  it('two equal incoherent sources add 3 dB; I = Δp²/(2ρv) round-trips', () => {
    expect(sumLevels([70, 70])).toBeCloseTo(73.0103, 4);
    const I = 1e-4, p = pressureAmplitude(I, 1.2, 343);
    expect((p * p) / (2 * 1.2 * 343)).toBeCloseTo(I, 15);
  });
});

describe('impedance and reflection (College Physics 2e §17.7)', () => {
  it('Example 17.7: Z(fat) = 925 × 1450 ≈ 1.34 × 10⁶; fat → muscle reflects a = 0.014', () => {
    expect(impedance(925, 1450)).toBeCloseTo(1.34e6, -4);
    const fat = TABLE_17_5.find((r) => r.id === 't175-fat')!.Z as number, muscle = TABLE_17_5.find((r) => r.id === 't175-muscle')!.Z as number;
    expect(reflectedFraction(fat, muscle)).toBeCloseTo(0.014, 3);
  });
  it('equal impedances transmit everything; air → water reflects 99.9 %', () => {
    expect(reflectedFraction(5, 5)).toBe(0);
    expect(reflectedFraction(429, 1.5e6)).toBeGreaterThan(0.998);
  });
  it('NIST water at 293 K agrees with the rounded Table 17.5 value within 2 %; every medium cites a source', () => {
    const media = acousticMedia(293);
    const w = media.find((m) => m.id === 'water')!;
    expect(Math.abs(w.Z! / 1.5e6 - 1)).toBeLessThan(0.02);
    const air = media.find((m) => m.id === 'air-ideal')!;
    expect(air.rho!).toBeGreaterThan(1.1); expect(air.rho!).toBeLessThan(1.3);
    for (const m of media) expect(getSource(m.source), m.id).toBeTruthy();
  });
});

describe('moving sources (UP1 eqs. 17.20–17.22)', () => {
  it('Doppler shift equals the wave engine’s; undefined at and above the speed of sound', () => {
    expect(dopplerShift(440, 343, 30, 10)).toBeCloseTo(doppler(440, 343, 30, 10)!, 12);
    expect(dopplerShift(440, 343, 343, 0)).toBeNull();
  });
  it('Mach 2: cone half-angle 30°; no cone below Mach 1', () => {
    expect(coneAngle(machNumber(686, 343))! * 180 / Math.PI).toBeCloseTo(30, 10);
    expect(coneAngle(0.9)).toBeNull();
  });
});
