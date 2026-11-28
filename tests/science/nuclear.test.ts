/**
 * Gate 14.3 — binding energies from the bundled NUBASE2020 masses and a liquid-drop fit to them.
 */
import { describe, expect, it } from 'vitest';
import { MN_U, U_MEV, bindingEnergyMeV, fitSemf, qValueMeV, rmsResidual, semf } from '@/core/physics/nuclear';
import nuclides from '@datasets/atomic/nuclides.json';

type N = { A: number; isomer: string | null; mass: number | null; stable: boolean; halfLifeS: number | null };
const D = nuclides as unknown as Record<string, { nuclides: N[] }>;
const mH = D['1'].nuclides.find((n) => n.A === 1)!.mass!;
const mass = (Z: number, A: number) => D[String(Z)].nuclides.find((n) => n.A === A && !n.isomer)!.mass!;
const points = Object.entries(D).flatMap(([z, v]) => v.nuclides.filter((n) => !n.isomer && n.mass && n.A >= 16 && (n.stable || (n.halfLifeS ?? 0) >= 1)).map((n) => ({ Z: Number(z), A: n.A, B: bindingEnergyMeV(Number(z), n.A, n.mass!, mH) })));

describe('constants', () => {
  it('1 u = 931.494 MeV; mₙ = 1.008665 u (CODATA)', () => {
    expect(U_MEV).toBeCloseTo(931.494, 3);
    expect(MN_U).toBeCloseTo(1.0086649, 6);
  });
});

describe('binding energies from NUBASE2020 masses', () => {
  it('⁴He: 28.296 MeV (7.07 MeV per nucleon); ²H: 2.2246 MeV', () => {
    expect(bindingEnergyMeV(2, 4, mass(2, 4), mH)).toBeCloseTo(28.296, 2);
    expect(bindingEnergyMeV(1, 2, mass(1, 2), mH)).toBeCloseTo(2.2246, 3);
  });
  it('the binding energy per nucleon peaks near iron and nickel (⁶²Ni highest, ⁵⁸Fe and ⁵⁶Fe next)', () => {
    const perA = points.map((p) => ({ ...p, b: p.B / p.A })).sort((a, b) => b.b - a.b);
    expect(`${perA[0].Z}-${perA[0].A}`).toBe('28-62');
    expect(perA.slice(0, 3).map((p) => `${p.Z}-${p.A}`)).toEqual(['28-62', '26-58', '26-56']);
    expect(perA[0].b).toBeCloseTo(8.7945, 3);
  });
});

describe('liquid-drop fit', () => {
  const c = fitSemf(points);
  it('fits 2292 nuclides (A ≥ 16, stable or half-life ≥ 1 s) with an rms error of 2.86 MeV', () => {
    expect(points.length).toBe(2292);
    expect(rmsResidual(points, c)).toBeCloseTo(2.857, 2);
  });
  it('fitted coefficients (MeV): a_v 16.00, a_s 18.73, a_c 0.734, a_a 24.03, a_p 13.25', () => {
    expect(c.av).toBeCloseTo(16.003, 2); expect(c.as).toBeCloseTo(18.734, 2); expect(c.ac).toBeCloseTo(0.7337, 3);
    expect(c.aa).toBeCloseTo(24.027, 2); expect(c.ap).toBeCloseTo(13.25, 1);
  });
  it('²³⁸U from the fit lies within 0.5 % of the measured binding energy', () => {
    const B = bindingEnergyMeV(92, 238, mass(92, 238), mH);
    expect(Math.abs(semf(92, 238, c) / B - 1)).toBeLessThan(0.005);
  });
});

describe('published coefficients (Wing 1964, Table 1) on the same nuclides', () => {
  it('with Z² Coulomb terms, Green (1954–55) fits the 2292 nuclides to 3.38 MeV rms, Wapstra (1958) to 4.87, Bethe & Bacher (1936) to 36.0 (our fit: 2.86)', () => {
    const green = rmsResidual(points, { av: 15.753, aa: 23.69, as: 17.804, ac: 0.71, ap: 12, coulombZ2: true });
    const wap = rmsResidual(points, { av: 15.835, aa: 23.2, as: 18.33, ac: 0.714, ap: 11.2, coulombZ2: true });
    const bb = rmsResidual(points, { av: 13.86, aa: 19.5, as: 13.2, ac: 0.58, ap: 0, coulombZ2: true });
    expect(green).toBeCloseTo(3.376, 2); expect(wap).toBeCloseTo(4.867, 2); expect(bb).toBeCloseTo(36.05, 1);
  });
});

describe('the pp chain from NUBASE2020 atomic masses', () => {
  it('p + p → d: 1.442 MeV (with annihilation); p + d → ³He: 5.493 MeV; ³He + ³He → ⁴He + 2p: 12.860 MeV; total 26.73 MeV (PDG: “∼ 26 MeV”)', () => {
    const H = mH, D = mass(1, 2), He3 = mass(2, 3), He4 = mass(2, 4);
    const q1 = qValueMeV([H, H], [D]), q2 = qValueMeV([H, D], [He3]), q3 = qValueMeV([He3, He3], [He4, H, H]);
    expect(q1).toBeCloseTo(1.442, 3); expect(q2).toBeCloseTo(5.493, 3); expect(q3).toBeCloseTo(12.860, 3);
    expect(2 * (q1 + q2) + q3).toBeCloseTo(qValueMeV([H, H, H, H], [He4]), 9);
    expect(qValueMeV([H, H, H, H], [He4])).toBeCloseTo(26.73, 2);
  });
});
