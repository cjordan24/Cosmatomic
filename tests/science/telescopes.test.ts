/**
 * Phase 10, Gate 10.6 — telescopes: Airy (1835) pp. 286–287; Rayleigh, Scientific Papers I, Arts. 62 and 67;
 * STScI HST Primer and JWST JDox parameters.
 */
import { describe, expect, it } from 'vitest';
import {
  airyAmplitude, airyAngle, airyFirstRing, airyHalfLight, airyIntensity, airyIntensityFast, airyRadiusFocal, airyZero, doubleStar, focalLength,
  plateScaleArcsecPerMm, slitPairMidpoint, toArcsec,
} from '@/core/physics/optics/telescopes';

describe('Airy’s pattern (Airy 1835)', () => {
  it('the integral is 1 at the centre and matches Airy’s series 1 − n²/(2·4) + n⁴/(2·4²·6) − … at small n', () => {
    expect(airyAmplitude(0)).toBe(1);
    const n = 0.7, series = 1 - n ** 2 / 8 + n ** 4 / (2 * 16 * 6) - n ** 6 / (2 * 16 * 36 * 8);
    expect(airyAmplitude(n)).toBeCloseTo(series, 6);
  });
  it('Airy’s numbers: half light at n = 1·616, first black ring at 3·832, first bright ring at 5·12 with about 1/57 of the centre', () => {
    expect(airyHalfLight()).toBeCloseTo(1.616, 3);
    expect(airyZero(1)).toBeCloseTo(3.832, 3);
    const ring = airyFirstRing();
    expect(ring.n).toBeCloseTo(5.136, 2);           // Airy printed 5,12
    expect(1 / ring.intensity).toBeCloseTo(57.1, 0); // “about 1/57”
  });
  it('the drawing table agrees with the integral to 10⁻⁴ of the central intensity', () => {
    for (let n = 0; n < 20; n += 0.137) expect(Math.abs(airyIntensityFast(n) - airyIntensity(n))).toBeLessThan(1e-4);
  });
  it('the second black ring is at n = 7.016; Airy printed 7,14 (a difference documented in the view)', () => {
    expect(airyZero(2)).toBeCloseTo(7.016, 3);
    expect(airyIntensity(airyZero(2))).toBeLessThan(1e-12);
  });
});

describe('resolving power (Rayleigh, Scientific Papers I)', () => {
  it('θ = 1·2197 λ/D for the first dark ring (Art. 62 §1)', () => {
    expect(airyAngle(500e-9, 1) / (500e-9)).toBeCloseTo(1.2197, 4);
  });
  it('slit images on each other’s first zero: midpoint brightness ·8106 of the peaks (Art. 62 §2)', () => {
    expect(slitPairMidpoint()).toBeCloseTo(0.8106, 4);
  });
  it('two circular-aperture images at the Rayleigh separation show a dip at the midpoint; closer pairs merge', () => {
    const lam = 550e-9, D = 1, th = airyAngle(lam, D);
    const mid = doubleStar(lam, D, th, 0), peak = doubleStar(lam, D, th, th / 2);
    expect(mid / peak).toBeLessThan(0.8);
    expect(doubleStar(lam, D, 0.5 * th, 0)).toBeGreaterThan(doubleStar(lam, D, 0.5 * th, 0.25 * th));
  });
});

describe('Hubble and JWST (STScI)', () => {
  it('Hubble: 2.4 m at f/24 → F = 57.6 m and 3.581″/mm, the Primer’s 3.58″/mm', () => {
    const F = focalLength(24, 2.4);
    expect(F).toBeCloseTo(57.6, 10);
    expect(plateScaleArcsecPerMm(F)).toBeCloseTo(3.58, 2);
  });
  it('Hubble at 500 nm: an unobstructed 2.4 m aperture gives FWHM 0.0442″ against the Primer’s measured 0.043″; first dark ring 0.052″', () => {
    const fwhm = (2 * airyHalfLight() * 500e-9) / (Math.PI * 2.4);
    expect(toArcsec(fwhm)).toBeCloseTo(0.0442, 4);
    expect(toArcsec(airyAngle(500e-9, 2.4))).toBeCloseTo(0.0524, 4);
  });
  it('JWST: f/20 and 131.4 m imply a 6.57 m aperture (“~6.5 m”); its first dark ring at 2 µm is 0.077″; on the detector 1.2197 λN', () => {
    expect(131.4 / 20).toBeCloseTo(6.57, 2);
    expect(toArcsec(airyAngle(2e-6, 6.5))).toBeCloseTo(0.0774, 3);
    expect(airyRadiusFocal(2e-6, 20) * 1e6).toBeCloseTo(48.8, 1);
  });
});
