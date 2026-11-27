/**
 * Phase 9, Gate 9.1 — antennas. Checks the dipole fields, patterns, directivity, radiation resistance, effective
 * aperture, arrays and the Friis equation against Ellingson, Electromagnetics Vol. 2 (2020).
 */
import { describe, expect, it } from 'vitest';
import {
  ETA0, HWD, TEXTBOOK, arrayFactor2, arrayMainLobes, arrayPattern, beta, cabs, dbmToW, dipolePattern, effectiveAperture, farFieldClosedForm,
  farFieldMagnitude, freeSpacePathLoss, friis, fromDb, hertzianFarEtheta, hertzianInstant, hertzianPhasors, nearFarCrossover, patternStats, wToDbm,
  wavelength, type Dipole,
} from '@/core/physics/em/antennas';
import { DIPOLE_LAYER, sampleGrid } from '@/core/fields/fields';
import { getSource } from '@/shared/sources/sources';
import { CONSTANTS } from '@/core/constants/constants';

const EPS0 = CONSTANTS.eps0.value;

describe('Hertzian dipole (exact near + far field)', () => {
  const d = { IdL: 0.01, f: 100e6 };
  it('η₀ = μ₀c ≈ 376.7 Ω (Ellingson eq. 5.57)', () => { expect(ETA0).toBeCloseTo(376.73, 2); });
  it('reduces to the far-field formula (eq. 9.67) for r ≫ λ', () => {
    const lam = wavelength(d.f);
    for (const th of [0.3, Math.PI / 2, 2.2]) {
      const r = 2000 * lam;
      const ex = hertzianPhasors(d, r, th).Etheta, far = hertzianFarEtheta(d, r, th);
      expect(cabs(ex) / cabs(far)).toBeCloseTo(1, 5);
      expect(Math.abs(ex[0] - far[0]) + Math.abs(ex[1] - far[1])).toBeLessThan(1e-3 * cabs(far));
      expect(cabs(hertzianPhasors(d, r, th).Er) / cabs(ex)).toBeLessThan(1e-3);  // radial field is a near-zone term
    }
  });
  it('far zone: E ⊥ H with |E_θ|/|H_φ| → η₀ (locally a plane wave)', () => {
    const r = 500 * wavelength(d.f), p = hertzianPhasors(d, r, 1.1);
    expect(cabs(p.Etheta) / cabs(p.Hphi)).toBeCloseTo(ETA0, 0);
  });
  it('E satisfies Ampère’s law E = (1/jωε)∇×H by finite differences of H_φ', () => {
    const w = 2 * Math.PI * d.f, r = 0.4, th = 0.9, h = 1e-6;
    const Hp = (rr: number, tt: number) => hertzianPhasors(d, rr, tt).Hphi;
    // (∇×H)_θ = −(1/r) ∂(r H_φ)/∂r ;  (∇×H)_r = (1/(r sinθ)) ∂(sinθ H_φ)/∂θ
    const dr = [0, 1].map((k) => ((r + h) * Hp(r + h, th)[k] - (r - h) * Hp(r - h, th)[k]) / (2 * h));
    const dt = [0, 1].map((k) => (Math.sin(th + h) * Hp(r, th + h)[k] - Math.sin(th - h) * Hp(r, th - h)[k]) / (2 * h));
    const curlT = [-dr[0] / r, -dr[1] / r], curlR = [dt[0] / (r * Math.sin(th)), dt[1] / (r * Math.sin(th))];
    // divide by jωε: (a + jb)/(jωε) = (b − ja)/(ωε)
    const p = hertzianPhasors(d, r, th);
    expect(p.Etheta[0]).toBeCloseTo(curlT[1] / (w * EPS0), 3);
    expect(p.Etheta[1]).toBeCloseTo(-curlT[0] / (w * EPS0), 3);
    expect(p.Er[0]).toBeCloseTo(curlR[1] / (w * EPS0), 3);
    expect(p.Er[1]).toBeCloseTo(-curlR[0] / (w * EPS0), 3);
  });
  it('near and radiating parts of H are equal at r = λ/2π (eq. 9.62)', () => {
    expect(nearFarCrossover(d.f)).toBeCloseTo(wavelength(d.f) / (2 * Math.PI), 12);
    expect(beta(d.f) * nearFarCrossover(d.f)).toBeCloseTo(1, 12);
  });
  it('field is zero along the axis and mirror-symmetric in the plane', () => {
    const a = hertzianInstant(d, 0.3, 0.5, 1e-9), b = hertzianInstant(d, -0.3, 0.5, 1e-9);
    expect(b.Ex).toBeCloseTo(-a.Ex, 12); expect(b.Ey).toBeCloseTo(a.Ey, 12); expect(b.Hz).toBeCloseTo(-a.Hz, 12);
    expect(hertzianInstant(d, 0, 2, 0).Hz).toBeCloseTo(0, 12);
  });
  it('the FIELDS layer samples the same function with sources', () => {
    const g = sampleGrid(DIPOLE_LAYER, { ...d, t: 0 }, { xmin: -3, xmax: 3, ymin: -3, ymax: 3 }, 40);
    expect(g.values.length).toBe(1600);
    expect(Number.isFinite(g.max)).toBe(true);
    for (const s of DIPOLE_LAYER.sources) expect(getSource(s), s).toBeTruthy();
  });
});

describe('thin dipoles (far field)', () => {
  const esd: Dipole = { kind: 'esd', lengthL: 0.02 };
  it('numerical filament integral (eq. 9.96) reproduces the closed forms (eqs. 10.49, 9.102)', () => {
    for (const th of [0.2, 0.7, Math.PI / 2, 2.5]) {
      expect(farFieldMagnitude(HWD, th) / farFieldClosedForm(HWD, th)).toBeCloseTo(1, 6);
      expect(farFieldMagnitude(esd, th) / farFieldClosedForm(esd, th)).toBeCloseTo(1, 3);
    }
  });
  it('ESD: D_max = 1.5 (1.76 dBi), D(θ) = 1.5 sin²θ, R_rad ≈ 20π²(L/λ)², A_e ≈ 0.119λ²', () => {
    const s = patternStats(dipolePattern(esd));
    expect(s.Dmax).toBeCloseTo(TEXTBOOK.esd.Dmax, 3);
    expect(s.DmaxDbi).toBeCloseTo(1.76, 2);
    expect(s.thetaMax).toBeCloseTo(Math.PI / 2, 6);
    expect(s.Rrad / (TEXTBOOK.esd.RradPerL2 * esd.lengthL ** 2)).toBeCloseTo(1, 2);
    expect(s.AeMaxLambda2).toBeCloseTo(TEXTBOOK.esd.AeMaxLambda2, 3);
    expect(s.hpbwDeg).toBeCloseTo(90, 0);
  });
  it('HWD: R_rad ≅ 73 Ω, A_e ≈ 0.131λ², D ≈ 1.64 (2.15 dBi), beamwidth ≈ 78°', () => {
    const s = patternStats(dipolePattern(HWD));
    expect(s.Rrad).toBeGreaterThan(72.5); expect(s.Rrad).toBeLessThan(73.5);   // 30 Cin(2π) = 73.08 Ω
    expect(s.AeMaxLambda2).toBeCloseTo(TEXTBOOK.hwd.AeMaxLambda2, 3);
    expect(s.Dmax).toBeCloseTo(1.641, 3);
    expect(s.DmaxDbi).toBeCloseTo(2.15, 2);
    expect(s.hpbwDeg!).toBeGreaterThan(77.5); expect(s.hpbwDeg!).toBeLessThan(78.5);
  });
  it('isotropic aperture λ²/4π ≈ 0.080λ² is the lower bound (eq. 10.159)', () => {
    expect(effectiveAperture(1, 1)).toBeCloseTo(TEXTBOOK.isotropicAeLambda2, 3);
  });
});

describe('uniform linear arrays', () => {
  it('broadside array of N isotropic elements: |AF|² = N² on broadside, D ≈ 2Nd/λ for long arrays', () => {
    const a = { element: 'isotropic' as const, N: 8, d: 0.5, alpha: 0 };
    expect(arrayFactor2(a, Math.PI / 2, Math.PI / 2)).toBeCloseTo(64, 9);
    const s = patternStats(arrayPattern(a), 180, 360);
    expect(s.Dmax).toBeGreaterThan(7.5); expect(s.Dmax).toBeLessThan(8.5);
  });
  it('steering: the main lobe sits where ψ = βd cosφ + α = 0', () => {
    const a = { element: HWD, N: 6, d: 0.5, alpha: -Math.PI / 2 };   // cosφ₀ = 0.5 → φ₀ = 60°
    const lobes = arrayMainLobes(a);
    expect(lobes.map((p) => (p * 180) / Math.PI)).toEqual([expect.closeTo(60, 6), expect.closeTo(300, 6)]);
    expect(arrayFactor2(a, Math.PI / 2, Math.PI / 3)).toBeCloseTo(36, 6);
  });
  it('grating lobes appear when d ≥ λ for a broadside array', () => {
    expect(arrayMainLobes({ element: 'isotropic', N: 4, d: 0.5, alpha: 0 })).toHaveLength(2);   // ±90° only
    expect(arrayMainLobes({ element: 'isotropic', N: 4, d: 1.2, alpha: 0 }).length).toBeGreaterThan(2);
  });
});

describe('Friis transmission (eq. 10.166)', () => {
  it('Ellingson Example 10.11: 6 GHz, 30 km, 27 dBi dishes, −120 dBm needs ≈ −36.5 dBm', () => {
    const lam = 3e8 / 6e9;   // the example uses c ≈ 3 × 10⁸ m/s
    const G = fromDb(27), PRmin = dbmToW(-120);
    const PT = PRmin / (G * G / freeSpacePathLoss(30e3, lam));
    expect(PT).toBeCloseTo(2.26e-7, 8);
    expect(wToDbm(PT)).toBeCloseTo(-36.5, 1);
    expect(friis(PT, G, G, 30e3, lam)).toBeCloseTo(PRmin, 20);
  });
  it('path loss grows as R²; spreading between two ranges is independent of frequency (eq. 10.169)', () => {
    expect(freeSpacePathLoss(2000, 0.1) / freeSpacePathLoss(1000, 0.1)).toBeCloseTo(4, 12);
    expect(freeSpacePathLoss(2000, 0.01) / freeSpacePathLoss(1000, 0.01)).toBeCloseTo(4, 12);
  });
});
