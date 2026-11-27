/**
 * Phase 10, Gate 10.1 — geometric optics: Drude, The Theory of Optics (1902) eqs. 1, 3, 6, 12–13, 22, 25;
 * Southall, Geometrical Optics (1910) eqs. 25, 27. Exact ray traces are checked against these formulas.
 */
import { describe, expect, it } from 'vitest';
import {
  axisCrossing, criticalAngle, lensmakerFocal, minimumDeviation, mirrorFocal, mirrorImage, prismDeviation, refractAngle, refractVec,
  reflectVec, thinLensImage, traceLens, traceMirror, tracePrism, tracedFocus, tracedImage, type Lens,
} from '@/core/physics/optics/geometric';
import { getMaterial, refractiveIndex } from '@/modes/atomic/materials/materials';

const deg = Math.PI / 180;
const nOf = (id: string, um: number) => refractiveIndex(getMaterial(id)!.refractiveIndex!, um)!;

describe('refraction and reflection (Drude eqs. 1, 3, 6)', () => {
  it('Snell: n_a sin φ_a = n_b sin φ_b, and the path is reversible', () => {
    const phiB = refractAngle(1, 1.5, 40 * deg)!;
    expect(Math.sin(40 * deg)).toBeCloseTo(1.5 * Math.sin(phiB), 14);
    expect(refractAngle(1.5, 1, phiB)!).toBeCloseTo(40 * deg, 12);
  });
  it('total reflection beyond the critical angle; water → air at 589 nm: φ_c ≈ 48.6°', () => {
    const nw = nOf('water', 0.589);
    const pc = criticalAngle(nw, 1)!;
    expect(pc / deg).toBeCloseTo(48.6, 1);
    expect(refractAngle(nw, 1, pc + 0.01)).toBeNull();
    expect(refractAngle(nw, 1, pc - 0.01)).not.toBeNull();
    expect(criticalAngle(1, nw)).toBeNull();
  });
  it('vector refraction agrees with the scalar law; vector reflection keeps the angle', () => {
    const u: [number, number] = [Math.cos(-30 * deg), Math.sin(-30 * deg)];
    const t = refractVec(u, [0, 1], 1 / 1.5)!;             // surface along x, normal +y, ray going down
    expect(Math.asin(Math.abs(t[0]))).toBeCloseTo(refractAngle(1, 1.5, 60 * deg)!, 12);
    const r = reflectVec(u, [0, 1]);
    expect(r[0]).toBeCloseTo(u[0], 14); expect(r[1]).toBeCloseTo(-u[1], 14);
  });
  it('dispersion: fused silica has a larger index in the blue than in the red', () => {
    expect(nOf('fused-silica', 0.4)).toBeGreaterThan(nOf('fused-silica', 0.7));
  });
});

describe('lenses and mirrors (Drude eqs. 12–13, 22, 25)', () => {
  it('thin-lens formulas: biconvex r₁ = 50, r₂ = −50, n = 1.5 → f = 50; e = 150 → e′ = 75; e = 25 → virtual image e′ = −50', () => {
    expect(lensmakerFocal(1.5, 50, -50)).toBeCloseTo(50, 12);
    expect(thinLensImage(50, 150)).toBeCloseTo(75, 12);
    expect(thinLensImage(50, 25)).toBeCloseTo(-50, 12);
    expect(lensmakerFocal(1.5, 50, 50)).toBeNull();
  });
  it('a traced thin lens converges on the lens-maker focus as the thickness and ray height go to zero', () => {
    const L: Lens = { r1: 50, r2: -50, thickness: 0.01, diameter: 20, n: 1.5 };
    const { efl, backFocus } = tracedFocus(L, 0.001);
    expect(efl!).toBeCloseTo(50, 1);
    expect(backFocus!).toBeCloseTo(50, 1);
    expect(tracedImage(L, 150)!).toBeCloseTo(75, 0);
  });
  it('spherical aberration: marginal rays of a thick biconvex lens cross the axis closer than paraxial rays', () => {
    const L: Lens = { r1: 50, r2: -50, thickness: 5, diameter: 30, n: 1.5 };
    const par = tracedFocus(L, 0.01).backFocus!, marg = tracedFocus(L, 14).backFocus!;
    expect(marg).toBeLessThan(par);
  });
  it('chromatic aberration: a fused-silica lens focuses blue light shorter than red', () => {
    const mk = (um: number): Lens => ({ r1: 50, r2: -50, thickness: 3, diameter: 20, n: nOf('fused-silica', um) });
    expect(tracedFocus(mk(0.45), 0.01).efl!).toBeLessThan(tracedFocus(mk(0.65), 0.01).efl!);
  });
  it('a ray through the lens centre at the axis is undeviated; a blocked ray returns null', () => {
    const L: Lens = { r1: 50, r2: -50, thickness: 4, diameter: 20, n: 1.5 };
    const { out } = traceLens({ p: [-100, 0], u: [1, 0] }, L);
    expect(out!.u[1]).toBeCloseTo(0, 14);
    expect(traceLens({ p: [-100, 15], u: [1, 0] }, L).out).toBeNull();
  });
  it('concave mirror r = −100: f = 50; paraxial rays cross at x = −50, marginal rays closer to the mirror; e = 150 → real image 75 in front', () => {
    expect(mirrorFocal(-100)).toBe(50);
    expect(mirrorImage(-100, 150)).toBeCloseTo(-75, 12);
    const par = traceMirror(-100, 0.01, 40)!, marg = traceMirror(-100, 40, 40)!;
    expect(par.crossing!).toBeCloseTo(-50, 5);
    expect(marg.crossing!).toBeGreaterThan(-50);
    expect(axisCrossing({ p: [0, 1], u: [1, 0] })).toBeNull();
  });
});

describe('prisms (Southall eqs. 25, 27)', () => {
  it('the traced deviation equals Southall’s formula at several incidences', () => {
    for (const a of [40, 50, 60, 70]) expect(tracePrism(1.5, 60 * deg, a * deg).deviation!).toBeCloseTo(prismDeviation(1.5, 60 * deg, a * deg)!, 10);
  });
  it('minimum deviation: 60° prism, n = 1.5 → 37.18°, the smallest deviation over all incidences, at symmetric passage', () => {
    const e0 = minimumDeviation(1.5, 60 * deg)!;
    expect(e0 / deg).toBeCloseTo(37.18, 2);
    let best = Infinity;
    for (let a = 30; a <= 89; a += 0.01) { const d = prismDeviation(1.5, 60 * deg, a * deg); if (d !== null) best = Math.min(best, d); }
    expect(best).toBeCloseTo(e0, 6);
    expect(prismDeviation(1.5, 60 * deg, (e0 + 60 * deg) / 2)!).toBeCloseTo(e0, 12);
  });
  it('fused silica 60° prism at 589 nm: ε₀ ≈ 33.6°; blue deviates more than red', () => {
    expect(minimumDeviation(nOf('fused-silica', 0.589), 60 * deg)! / deg).toBeCloseTo(33.6, 1);
    expect(minimumDeviation(nOf('fused-silica', 0.4), 60 * deg)!).toBeGreaterThan(minimumDeviation(nOf('fused-silica', 0.7), 60 * deg)!);
  });
  it('total reflection inside the prism at grazing exit returns null', () => {
    expect(prismDeviation(2.4, 60 * deg, 10 * deg)).toBeNull();
    expect(minimumDeviation(2.4, 80 * deg)).toBeNull();
  });
});
