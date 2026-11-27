/**
 * Phase 10, Gate 10.2 — wave optics: Drude, The Theory of Optics (1902) Pt II Sec. I, eqs. 11–17, 78, 85–88.
 */
import { describe, expect, it } from 'vitest';
import {
  filmMinima, filmMinimaDispersive, filmReflectance, fringeSpacing, gratingIntensity, linesToResolve, orderAngle, pathDifference, resolves, resolvingPower,
  slitFirstZero, slitIntensity, twoSourceIntensity,
} from '@/core/physics/optics/wave';

describe('two sources (Drude eqs. 11–13)', () => {
  it('equal amplitudes: 4A² in phase, 0 half a wave out of phase', () => {
    expect(twoSourceIntensity(1, 1, 0, 500e-9)).toBeCloseTo(4, 12);
    expect(twoSourceIntensity(1, 1, 250e-9, 500e-9)).toBeCloseTo(0, 12);
    expect(twoSourceIntensity(1, 0.5, 250e-9, 500e-9)).toBeCloseTo(0.25, 12);
  });
  it('the exact pattern has dark fringes spaced aλ/d (1 m, 0.5 mm, 589 nm → 1.178 mm)', () => {
    const a = 1, d = 0.5e-3, lam = 589e-9, s = fringeSpacing(a, lam, d);
    expect(s * 1e3).toBeCloseTo(1.178, 3);
    // first dark fringe where the path difference is λ/2: p ≈ s/2
    let lo = 0, hi = s;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (Math.abs(pathDifference(mid, d, a)) < lam / 2) lo = mid; else hi = mid; }
    expect(lo / (s / 2)).toBeCloseTo(1, 5);
  });
});

describe('slit and grating (Drude eqs. 78, 85–88)', () => {
  it('slit: 1 straight ahead, zero at sin φ = λ/a, secondary maximum ≈ 4.7 %', () => {
    const a = 10e-6, lam = 500e-9;
    expect(slitIntensity(a, lam, 0)).toBe(1);
    expect(slitIntensity(a, lam, slitFirstZero(a, lam)!)).toBeLessThan(1e-20);
    let best = 0;
    for (let s = 1.05 * (lam / a); s < 1.95 * (lam / a); s += 1e-6) best = Math.max(best, slitIntensity(a, lam, Math.asin(s)));
    expect(best).toBeCloseTo(0.0472, 3);
    expect(slitFirstZero(400e-9, 500e-9)).toBeNull();
  });
  it('grating: principal maxima at sin φ = hλ/d reach the slit envelope; m − 2 secondary maxima between orders (the envelope pulls the order-1 peak just below sin φ = hλ/d)', () => {
    const m = 6, d = 2e-6, a = 0.5e-6, lam = 500e-9;
    const phi1 = orderAngle(1, lam, d)!;
    expect(Math.sin(phi1)).toBeCloseTo(0.25, 14);
    expect(gratingIntensity(m, d, a, lam, phi1)).toBeCloseTo(slitIntensity(a, lam, phi1), 9);
    // count local maxima strictly between orders 0 and 1
    let n = 0, prev = gratingIntensity(m, d, a, lam, 1e-9), cur = gratingIntensity(m, d, a, lam, 2e-9);
    for (let s = 3e-9; s < Math.sin(phi1) - 0.02; s += 1e-5) { const next = gratingIntensity(m, d, a, lam, Math.asin(s)); if (cur > prev && cur > next) n++; prev = cur; cur = next; }
    expect(n).toBe(m - 2);
    expect(orderAngle(5, lam, d)).toBeNull();
  });
  it('sodium D lines (NIST 589.158 and 589.756 nm): resolving power hm; first order needs 987 lines', () => {
    const l1 = 589.1583264e-9, l2 = 589.7558147e-9, dl = l2 - l1;
    expect(resolvingPower(2, 500)).toBe(1000);
    expect(linesToResolve(l1, dl, 1)).toBe(987);
    expect(resolves(l1, dl, 1, 987)).toBe(true);
    expect(resolves(l1, dl, 1, 980)).toBe(false);
    expect(resolves(l1, dl, 2, 500)).toBe(true);
  });
});

describe('thin films (Drude eqs. 14–17)', () => {
  it('reflection minima at 2tn cos χ = kλ; a vanishingly thin film is dark (phase reversal)', () => {
    const t = 500e-9, n = 1.33;
    for (const { k, lambda } of filmMinima(t, n, 0, 380e-9, 750e-9)) {
      expect(2 * t * n).toBeCloseTo(k * lambda, 18);
      expect(filmReflectance(t, n, lambda, 0)).toBeLessThan(1e-20);
    }
    expect(filmMinima(t, n, 0, 380e-9, 750e-9).map((x) => x.k)).toEqual([2, 3]);
    expect(filmReflectance(1e-12, n, 550e-9, 0)).toBeLessThan(1e-6);
  });
  it('tilting the film shifts the minima to shorter wavelengths', () => {
    const at0 = filmMinima(500e-9, 1.33, 0, 380e-9, 750e-9)[0].lambda, at40 = filmMinima(500e-9, 1.33, (40 * Math.PI) / 180, 300e-9, 750e-9)[0].lambda;
    expect(at40).toBeLessThan(at0);
  });
  it('with dispersion, the minima are the dark points of the n(λ) curve and match the constant-n roots when n is constant', () => {
    const t = 500e-9;
    expect(filmMinimaDispersive(t, () => 1.33, 0, 380e-9, 750e-9).map((x) => x.lambda)).toEqual(filmMinima(t, 1.33, 0, 380e-9, 750e-9).map((x) => x.lambda).sort((a, b) => a - b).map((l) => expect.closeTo(l, 15)));
    const nOf = (l: number) => 1.32 + 3000e-18 / (l * l);   // a dispersive test index
    for (const { lambda } of filmMinimaDispersive(t, nOf, 0, 380e-9, 750e-9)) expect(filmReflectance(t, nOf(lambda), lambda, 0)).toBeLessThan(1e-12);
  });
});
