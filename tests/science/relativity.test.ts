/**
 * Phase 6, Gate 6.1 — relativity foundations. Closed forms from Carroll (1997) ch. 7, Narayan &
 * Bartelmann (1996) eq. 7 and Einstein (1905) §4. Tolerances are explicit.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import planets from '@datasets/astronomical/planet-elements.json';
import {
  circularOrbit, compactness, criticalImpactParameter, effectivePotential, fieldRegime, frequencyRatio, frequencyRatioWeak,
  gravitationalRadius, iscoRadius, lorentzFactor, perihelionAdvancePerOrbit, photonPath, photonSphereRadius, redshiftToInfinity,
  schwarzschildRadius, staticTimeRate, weakDeflection,
} from '@/core/physics/relativity';
import { PHYSICS_MODULES } from '@/core/physics/modules';

const GMsun = CONSTANTS.GMsun.value;
const c = CONSTANTS.c.value;
const ARCSEC = Math.PI / 180 / 3600;

describe('Schwarzschild characteristic radii', () => {
  it('r_s of the Sun ≈ 2.95 km (Narayan & Bartelmann quote 2.95 km)', () => {
    expect(schwarzschildRadius(GMsun) / 1000).toBeCloseTo(2.953, 3);
    expect(gravitationalRadius(GMsun) / 1000).toBeCloseTo(1.4766, 4); // Carroll: GM☉/c² = 1.48 × 10⁵ cm
  });
  it('photon sphere = 1.5 r_s, ISCO = 3 r_s, b_c = (3√3/2) r_s', () => {
    const rs = schwarzschildRadius(GMsun);
    expect(photonSphereRadius(GMsun) / rs).toBeCloseTo(1.5, 14);
    expect(iscoRadius(GMsun) / rs).toBeCloseTo(3, 14);
    expect(criticalImpactParameter(GMsun) / rs).toBeCloseTo((3 * Math.sqrt(3)) / 2, 14);
  });
  it('the Sun is far from compact: R☉ ≈ 4.71 × 10⁵ GM☉/c² (Carroll 7.31: of order 10⁶)', () => {
    expect(CONSTANTS.Rsun.value / gravitationalRadius(GMsun) / 1e5).toBeCloseTo(4.711, 2);
  });
});

describe('clocks and redshift', () => {
  it('static clock rate √(1 − r_s/r) and 1 + z = 1/√(1 − r_s/r)', () => {
    const rs = schwarzschildRadius(GMsun);
    expect(staticTimeRate(GMsun, 4 * rs)).toBeCloseTo(Math.sqrt(0.75), 14);
    expect(redshiftToInfinity(GMsun, 4 * rs)).toBeCloseTo(1 / Math.sqrt(0.75) - 1, 14);
    expect(redshiftToInfinity(GMsun, 2 * rs)).toBeCloseTo(Math.SQRT2 - 1, 14);
  });
  it('refuses r ≤ r_s (no extrapolation inside the horizon)', () => {
    const rs = schwarzschildRadius(GMsun);
    expect(staticTimeRate(GMsun, rs)).toBeNull();
    expect(redshiftToInfinity(GMsun, 0.5 * rs)).toBeNull();
    expect(frequencyRatio(GMsun, 0.9 * rs, 10 * rs)).toBeNull();
    expect(fieldRegime(GMsun, 0.9 * rs)).toBe('inside-horizon');
  });
  it('exact shift reduces to the weak-field 1 + Φ₁ − Φ₂ far from the mass (Carroll 7.62)', () => {
    const R = CONSTANTS.Rsun.value;
    const exact = frequencyRatio(GMsun, R, 1e15)!;
    const weak = frequencyRatioWeak(GMsun, R, 1e15);
    expect(Math.abs(exact - weak)).toBeLessThan(1e-11); // difference is second order, (GM/Rc²)² ≈ 4.5e-12
    // solar surface → infinity: cz ≈ 636 m/s
    expect(redshiftToInfinity(GMsun, R)! * c).toBeCloseTo(636.3, 0);
  });
  it('frequency ratio is reciprocal and composes', () => {
    const rs = schwarzschildRadius(GMsun);
    const a = frequencyRatio(GMsun, 3 * rs, 7 * rs)!, b = frequencyRatio(GMsun, 7 * rs, 3 * rs)!;
    expect(a * b).toBeCloseTo(1, 14);
    expect(frequencyRatio(GMsun, 3 * rs, 7 * rs)! * frequencyRatio(GMsun, 7 * rs, 50 * rs)!).toBeCloseTo(frequencyRatio(GMsun, 3 * rs, 50 * rs)!, 14);
  });
});

describe('circular orbits and effective potential', () => {
  const m = gravitationalRadius(GMsun);
  it('circular orbits exist only beyond 3GM/c², stable from 6GM/c²', () => {
    expect(circularOrbit(GMsun, 3 * m)).toBeNull();
    expect(circularOrbit(GMsun, 4 * m)!.stable).toBe(false);
    expect(circularOrbit(GMsun, 6 * m)!.stable).toBe(true);
  });
  it('Ẽ, L̃ make r a stationary point of V with V = Ẽ²/2 (Carroll 7.47–7.48)', () => {
    for (const k of [4, 6, 10, 100]) {
      const r = k * m, o = circularOrbit(GMsun, r)!;
      const h = r * 1e-6;
      const dV = (effectivePotential(GMsun, r + h, o.L, true) - effectivePotential(GMsun, r - h, o.L, true)) / (2 * h);
      expect(Math.abs(dV) * r).toBeLessThan(1e-9);
      expect(effectivePotential(GMsun, r, o.L, true)).toBeCloseTo(o.E * o.E / 2, 12);
      // dτ/dt from the conserved energy equals √(1 − 3m/r)
      expect((1 - 2 * m / r) / o.E).toBeCloseTo(o.dTauDt, 12);
    }
  });
  it('at the ISCO Ẽ = √(8/9): binding energy 1 − √(8/9) ≈ 5.72 %', () => {
    expect(1 - circularOrbit(GMsun, 6 * m)!.E).toBeCloseTo(1 - Math.sqrt(8 / 9), 12);
  });
  it('the ISCO is where the stationary points of V merge (V″ = 0)', () => {
    const r = 6 * m, L = circularOrbit(GMsun, r)!.L, h = r * 1e-4;
    const d2 = (effectivePotential(GMsun, r + h, L, true) - 2 * effectivePotential(GMsun, r, L, true) + effectivePotential(GMsun, r - h, L, true)) / (h * h);
    expect(Math.abs(d2) * r * r).toBeLessThan(1e-6);
  });
  it('the photon potential peaks at 3GM/c² for every L', () => {
    for (const L of [1e3, 5e4, 1e7]) {
      const r = 3 * m, h = r * 1e-6;
      const d = (effectivePotential(GMsun, r + h, L, false) - effectivePotential(GMsun, r - h, L, false)) / (2 * h);
      expect(Math.abs(d / effectivePotential(GMsun, r, L, false)) * r).toBeLessThan(1e-8);
    }
  });
});

describe('weak-field tests', () => {
  it('Mercury: perihelion advance ≈ 43″ per century (Carroll: 42.9″) from JPL elements', () => {
    const mer = (planets as { elements: { id: string; a: number; e: number; LDot: number }[] }).elements.find((p) => p.id === 'mercury')!;
    const perOrbit = perihelionAdvancePerOrbit(GMsun, mer.a * CONSTANTS.au.value, mer.e);
    const orbitsPerCentury = mer.LDot / 360;
    expect(perOrbit * orbitsPerCentury / ARCSEC).toBeCloseTo(42.98, 1);
  });
  it('light grazing the Sun is deflected by ≈ 1.75″ (Narayan & Bartelmann: 1.″7)', () => {
    expect(weakDeflection(GMsun, CONSTANTS.Rsun.value) / ARCSEC).toBeCloseTo(1.751, 2);
  });
  it('field regimes', () => {
    expect(fieldRegime(GMsun, CONSTANTS.Rsun.value)).toBe('weak');
    expect(fieldRegime(GMsun, 5 * schwarzschildRadius(GMsun))).toBe('strong');
  });
});

describe('photon paths (numerical null geodesics)', () => {
  // independent check: α + π = 2∫₀^{u₀} du / √(1/b² − u² + r_s u³) by quadrature (u = u₀(1 − t²) removes the end singularity)
  const quadDeflection = (b: number) => {
    let r = b; for (let i = 0; i < 80; i++) r -= (r ** 3 - b * b * r + b * b) / (3 * r * r - b * b);
    const u0 = 1 / r, n = 4000, F = (u: number) => 1 / (b * b) - u * u + u * u * u;
    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const t = i / n, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
      const u = u0 * (1 - t * t);
      const g = t === 0 ? 2 * u0 / Math.sqrt(u0 * (2 * u0 - 3 * u0 * u0)) : (2 * u0 * t) / Math.sqrt(F(u)); // limit at t → 0
      sum += w * g;
    }
    return 2 * sum / (3 * n) - Math.PI;
  };
  it('large b approaches the weak-field deflection 2r_s/b (next-order excess < 2/b relative)', () => {
    for (const b of [200, 1000]) {
      const p = photonPath(b);
      expect(p.outcome).toBe('escaped');
      const ratio = p.deflection! / (2 / b);
      expect(ratio).toBeGreaterThan(1);
      expect(ratio - 1).toBeLessThan(2 / b);
    }
  });
  it('ODE deflection agrees with the quadrature of the orbit equation', () => {
    for (const b of [3, 5, 20, 200]) {
      const ode = photonPath(b, { dphi: 2e-4 }).deflection!;
      expect(Math.abs(ode - quadDeflection(b)) / quadDeflection(b)).toBeLessThan(2e-3);
    }
  });
  it('captured below b_c = 2.598 r_s, escapes just above', () => {
    const bc = (3 * Math.sqrt(3)) / 2;
    expect(photonPath(bc * 0.99).outcome).toBe('captured');
    const p = photonPath(bc * 1.01);
    expect(p.outcome).toBe('escaped');
    expect(p.rMin).toBeGreaterThan(1.5); // never inside the photon sphere when it escapes
    expect(p.rMin).toBeLessThan(1.8);
    expect(p.deflection!).toBeGreaterThan(Math.PI); // loops around the hole
  });
  it('periapsis of an escaping ray satisfies b² = r³/(r − r_s) (turning point of 7.46)', () => {
    const b = 5, p = photonPath(b, { dphi: 2e-4 });
    // exact turning point root of r³ − b²r + b² r_s = 0 (largest root)
    let r = b;
    for (let i = 0; i < 60; i++) r -= (r ** 3 - b * b * r + b * b) / (3 * r * r - b * b);
    expect(p.rMin).toBeCloseTo(r, 3);
  });
});

describe('special relativity', () => {
  it('γ and its limits', () => {
    expect(lorentzFactor(0)).toBe(1);
    expect(lorentzFactor(0.6 * c)).toBeCloseTo(1.25, 14);
    expect(lorentzFactor(c)).toBeNull();
    expect(lorentzFactor(2 * c)).toBeNull();
  });
});

describe('module registry', () => {
  it('relativistic module is declared with validity limits', () => {
    const m = PHYSICS_MODULES.find((x) => x.id === 'relativistic')!;
    expect(m.status).toBe('partial');
    expect(m.validity.join(' ')).toMatch(/non-rotating/i);
    expect(compactness(GMsun, CONSTANTS.Rsun.value)).toBeLessThan(1e-5);
  });
});
