/**
 * Phase 10, Gate 10.3 — polarisation: Drude (1902) eqs. 24–25, p. 246 (cos² α), eqs. 35 and 74; birefringence data
 * (refractiveindex.info: Ghosh 1999, Malitson & Dodge 1972, DeVore 1951).
 */
import { describe, expect, it } from 'vitest';
import { brewsterAngle, extraordinaryIndex, fresnel, plateThickness, twoReflections } from '@/core/physics/optics/polarisation';
import { refractiveIndex, type RefractiveModel } from '@/modes/atomic/materials/materials';
import bire from '@datasets/materials/birefringence.json';

const deg = Math.PI / 180;
const crystals = (bire as unknown as { crystals: { id: string; opticSign: string; ordinary: RefractiveModel; extraordinary: RefractiveModel }[] }).crystals;
const idx = (id: string, um: number) => { const c = crystals.find((x) => x.id === id)!; return { no: refractiveIndex(c.ordinary, um)!, ne: refractiveIndex(c.extraordinary, um)! }; };

describe('Fresnel reflection (Drude eqs. 24–25)', () => {
  it('normal incidence on n = 1.5 reflects 4 %, both polarisations alike', () => {
    const f = fresnel(1, 1.5, 0)!;
    expect(f.Rs).toBeCloseTo(0.04, 12); expect(f.Rp).toBeCloseTo(0.04, 12);
  });
  it('the formulas are continuous at small angles and conserve energy with the refracted amplitudes', () => {
    const a = fresnel(1, 1.5, 1e-6)!, b = fresnel(1, 1.5, 0)!;
    expect(a.Rs).toBeCloseTo(b.Rs, 9);
    // energy: R + (n2 cos χ / n1 cos φ) |D|² = 1 with D_s = 2 sin χ cos φ / sin(φ + χ)
    const phi = 50 * deg, f = fresnel(1, 1.5, phi)!, chi = f.chi;
    const Ds = (2 * Math.sin(chi) * Math.cos(phi)) / Math.sin(phi + chi);
    expect(f.Rs + ((1.5 * Math.cos(chi)) / Math.cos(phi)) * Ds * Ds).toBeCloseTo(1, 12);
  });
  it('R_p vanishes at the polarizing angle tan φ = n (56.31° for n = 1.5); φ + χ = 90° there', () => {
    const pb = brewsterAngle(1, 1.5);
    expect(pb / deg).toBeCloseTo(56.31, 2);
    const f = fresnel(1, 1.5, pb)!;
    expect(f.Rp).toBeLessThan(1e-25);
    expect((pb + f.chi) / deg).toBeCloseTo(90, 10);
    expect(fresnel(1, 1.5, pb + 0.01)!.Rp).toBeGreaterThan(0);
  });
  it('grazing incidence reflects everything; inside the denser medium total reflection gives null', () => {
    expect(fresnel(1, 1.5, 89.999 * deg)!.Rs).toBeGreaterThan(0.999);
    expect(fresnel(1.5, 1, 45 * deg)).toBeNull();
  });
});

describe('polarisation by reflection (Drude p. 246)', () => {
  it('two reflections at the polarizing angle: intensity ∝ cos² α', () => {
    for (const a of [0, 20, 45, 60, 90]) expect(twoReflections(1.52, a * deg)).toBeCloseTo(Math.cos(a * deg) ** 2, 12);
  });
});

describe('uniaxial crystals (Drude eqs. 35, 74)', () => {
  it('“Quartz is positively, calc-spar negatively, uniaxial”: n_e > n_o for quartz, n_e < n_o for calcite; the dataset signs agree', () => {
    const q = idx('alpha-quartz', 0.589), c = idx('calcite', 0.589);
    expect(q.ne).toBeGreaterThan(q.no); expect(c.ne).toBeLessThan(c.no);
    for (const x of crystals) { const { no, ne } = idx(x.id, 0.6); expect(x.opticSign).toBe(ne > no ? 'positive' : 'negative'); }
  });
  it('calcite at 589 nm: n_o ≈ 1.658, n_e ≈ 1.486, birefringence ≈ −0.172', () => {
    const { no, ne } = idx('calcite', 0.589);
    expect(no).toBeCloseTo(1.658, 2); expect(ne).toBeCloseTo(1.486, 2); expect(ne - no).toBeCloseTo(-0.172, 2);
  });
  it('the extraordinary index runs from n_o along the axis to n_e across it', () => {
    expect(extraordinaryIndex(1.6, 1.5, 0)).toBeCloseTo(1.6, 14);
    expect(extraordinaryIndex(1.6, 1.5, Math.PI / 2)).toBeCloseTo(1.5, 14);
    const mid = extraordinaryIndex(1.6, 1.5, Math.PI / 4);
    expect(mid).toBeLessThan(1.6); expect(mid).toBeGreaterThan(1.5);
  });
  it('a quartz quarter-wave plate at 589 nm is about 16 µm thick (path difference λ/4)', () => {
    const { no, ne } = idx('alpha-quartz', 0.589), t = plateThickness(589e-9, no, ne, Math.PI / 2);
    expect(t * Math.abs(ne - no)).toBeCloseTo(589e-9 / 4, 15);
    expect(t * 1e6).toBeCloseTo(16.3, 0);
  });
});
