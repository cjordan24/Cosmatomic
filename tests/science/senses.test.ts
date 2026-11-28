/**
 * Gates 13.1–13.3 — the reduced eye, Helmholtz's diffraction blur, Fletcher & Munson's intensity level and
 * Einthoven's leads, each checked against a number printed in the source.
 */
import { describe, expect, it } from 'vitest';
import { GULLSTRAND_REDUCED, einthovenAngle, einthovenLeads, helmholtzBlurMm, intensityFromLevel, intensityLevel, microWcm2ToWm2, reducedFocal, retinalImageMm } from '@/core/biology/senses';

describe('the eye (Helmholtz, tr. 1924)', () => {
  it('Gullstrand’s reduced eye (n = 4/3, r = 5.7 mm): f₁ = 17.1 mm, f₂ = 22.8 mm, 58.5 dioptres', () => {
    const f = reducedFocal(GULLSTRAND_REDUCED.n, GULLSTRAND_REDUCED.rMm);
    expect(f.f1).toBeCloseTo(17.1, 10); expect(f.f2).toBeCloseTo(22.8, 10); expect(f.powerD).toBeCloseTo(58.48, 2);
  });
  it('Listing’s eye, p. 95: f₂/f₁ = 20.0746/15.0072 equals the humour index 103/77 (one surface), yet f₂ − f₁ = 5.0674 mm is not the printed radius 5.1248 mm', () => {
    expect(20.0746 / 15.0072).toBeCloseTo(103 / 77, 5);
    expect(20.0746 - 15.0072).toBeCloseTo(5.0674, 4);
    expect(Math.abs(20.0746 - 15.0072 - 5.1248)).toBeGreaterThan(0.05);
  });
  it('a 1 m object at 100 m makes a 0.171 mm retinal image (nodal point to retina f₂ − r = 17.1 mm)', () => {
    expect(retinalImageMm(1, 100)).toBeCloseTo(0.171, 3);
  });
  it('p. 196: δ = 2.440 lr/d gives 0.0122 mm for a 2 mm pupil (l = 0.0005 mm, r = 20 mm) — a visual angle of about 2′6″', () => {
    const d = helmholtzBlurMm(0.0005, 20, 2);
    expect(d).toBeCloseTo(0.0122, 6);
    const arcmin = (d / 20) * (180 / Math.PI) * 60;
    expect(arcmin).toBeCloseTo(2.1, 1);   // 2′6″ = 2.1′
  });
});

describe('hearing (Fletcher & Munson 1933)', () => {
  it('eq. (4): the reference 10⁻¹⁶ W/cm² = 10⁻¹⁰ µW/cm² is 0 dB; 1 µW/cm² is 100 dB', () => {
    expect(intensityLevel(1e-10)).toBeCloseTo(0, 10);
    expect(intensityLevel(1)).toBe(100);
    expect(intensityFromLevel(60)).toBeCloseTo(1e-4, 15);
  });
  it('the reference in SI is 10⁻¹² W/m²', () => {
    expect(microWcm2ToWm2(1e-10)).toBeCloseTo(1e-12, 25);
  });
});

describe('the electrocardiogram (Einthoven 1912)', () => {
  it('lead II − lead I = lead III for every direction of the heart’s potential difference', () => {
    for (const a of [0, 40, 76, -30, 150]) { const L = einthovenLeads(1.2, a); expect(L.II - L.I).toBeCloseTo(L.III, 12); }
  });
  it('the angle is recovered from leads I and III (his figures: α = 76°, 40°, 0°)', () => {
    for (const a of [76, 40, 0]) { const L = einthovenLeads(1, a); expect(einthovenAngle(L.I, L.III)).toBeCloseTo(a, 9); }
  });
  it('at α = 0° (Fig. 28) lead I is largest, lead II = cos 60° and lead III = cos 120°', () => {
    const L = einthovenLeads(1, 0);
    expect(L.I).toBe(1); expect(L.II).toBeCloseTo(0.5, 12); expect(L.III).toBeCloseTo(-0.5, 12);
  });
});
