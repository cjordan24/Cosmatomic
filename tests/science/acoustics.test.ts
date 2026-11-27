/**
 * Phase 9, Gate 9.5 — acoustics: Rayleigh, Theory of Sound (§§245, 270, 276, 298); NASA Glenn (Doppler, Mach angle);
 * NIOSH 98-126 (I₀ = 1 pW/m²); Homick, NASA RP-1045 (inverse square law). These replaced OpenStax on 2026-11-27.
 */
import { describe, expect, it } from 'vitest';
import {
  I0, acousticMedia, coneAngle, dopplerShift, impedance, intensityAt, intensityFromLevel, levelDb, machNumber, pressureAmplitude, reflectedFraction, sumLevels,
} from '@/core/physics/waves/acoustics';
import { doppler } from '@/core/physics/waves/waves';
import { getSource } from '@/shared/sources/sources';

describe('intensity and level (NIOSH 98-126; Rayleigh §§245, 276)', () => {
  it('β(I₀) = 0 dB with I₀ = 1 pW/m²; 1 W/m² is 120 dB', () => {
    expect(levelDb(I0)).toBe(0);
    expect(levelDb(1)).toBeCloseTo(120, 12);
    expect(intensityFromLevel(90)).toBeCloseTo(1e-3, 15);
  });
  it('intensity ratios and level differences: ×2 → 3.0 dB, ×5 → 7.0 dB, ×1000 → 30 dB', () => {
    expect(levelDb(2 * I0)).toBeCloseTo(3.0, 1); expect(levelDb(5 * I0)).toBeCloseTo(7.0, 1); expect(levelDb(1000 * I0)).toBeCloseTo(30, 12);
  });
  it('inverse square: doubling the distance quarters the intensity, −6.02 dB', () => {
    expect(intensityAt(1, 2) / intensityAt(1, 1)).toBeCloseTo(0.25, 15);
    expect(levelDb(intensityAt(1, 2)) - levelDb(intensityAt(1, 1))).toBeCloseTo(-6.0206, 4);
  });
  it('two equal incoherent sources add 3 dB; I = Δp²/(2ρv) round-trips', () => {
    expect(sumLevels([70, 70])).toBeCloseTo(73.0103, 4);
    const I = 1e-4, p = pressureAmplitude(I, 1.2, 343);
    expect((p * p) / (2 * 1.2 * 343)).toBeCloseTo(I, 15);
  });
});

describe('impedance and reflection (Rayleigh §270)', () => {
  it('Rayleigh eq. 23 amplitude ratio (ρ₁/ρ − V/V₁)/(ρ₁/ρ + V/V₁) equals (Z₂ − Z₁)/(Z₂ + Z₁); its square is the reflected fraction', () => {
    const rho = 1.2, V = 343, rho1 = 998, V1 = 1482;
    const amp = (rho1 / rho - V / V1) / (rho1 / rho + V / V1);
    expect(amp).toBeCloseTo((impedance(rho1, V1) - impedance(rho, V)) / (impedance(rho1, V1) + impedance(rho, V)), 12);
    expect(reflectedFraction(impedance(rho, V), impedance(rho1, V1))).toBeCloseTo(amp * amp, 12);
  });
  it('no reflection when ρ₁ : ρ = V : V₁ (equal impedances); air → water reflects more than 99.8 % (“sensibly perfect”)', () => {
    expect(reflectedFraction(5, 5)).toBe(0);
    const media = acousticMedia(293);
    expect(reflectedFraction(media.find((m) => m.id === 'air-ideal')!.Z!, media.find((m) => m.id === 'water')!.Z!)).toBeGreaterThan(0.998);
  });
  it('NIST water at 293 K: Z ≈ 1.48 × 10⁶ kg/(m²·s); ideal-gas air density 1.1–1.3 kg/m³; every medium cites a source', () => {
    const media = acousticMedia(293);
    const w = media.find((m) => m.id === 'water')!;
    expect(w.Z!).toBeGreaterThan(1.45e6); expect(w.Z!).toBeLessThan(1.5e6);
    const air = media.find((m) => m.id === 'air-ideal')!;
    expect(air.rho!).toBeGreaterThan(1.1); expect(air.rho!).toBeLessThan(1.3);
    for (const m of media) expect(getSource(m.source), m.id).toBeTruthy();
  });
});

describe('moving sources (NASA Glenn; Rayleigh §298)', () => {
  it('Doppler shift equals the wave engine’s and NASA Glenn’s f a/(a − u) for a still observer; undefined at and above the speed of sound', () => {
    expect(dopplerShift(440, 343, 30, 0)).toBeCloseTo((440 * 343) / (343 - 30), 12);
    expect(dopplerShift(440, 343, 30, 10)).toBeCloseTo(doppler(440, 343, 30, 10)!, 12);
    expect(dopplerShift(440, 343, 343, 0)).toBeNull();
  });
  it('Mach 2: cone half-angle 30°; no cone below Mach 1', () => {
    expect(coneAngle(machNumber(686, 343))! * 180 / Math.PI).toBeCloseTo(30, 10);
    expect(coneAngle(0.9)).toBeNull();
  });
});
