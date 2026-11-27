/**
 * Derived chemistry values quoted in the reaction descriptions (datasets/chemistry/reactions.json), recomputed from the
 * printed inputs of their sources: CODATA Key Values (Cox, Wagman & Medvedev 1989), Goldberg, Kishore & Lennen (2002),
 * Bandura & Lvov (2006) and Bratsch (1989). These replaced OpenStax Chemistry 2e on 2026-11-27.
 */
import { describe, expect, it } from 'vitest';
import data from '@datasets/chemistry/reactions.json';

const R = 8.314462618, T = 298.15;
const reaction = (id: string) => (data as { reactions: { id: string; description: string }[] }).reactions.find((r) => r.id === id)!;
/** ΔrG° (kJ/mol) from ΔrH° (kJ/mol) and ΔrS° (J/(K·mol)). */
const dG = (dH: number, dS: number) => dH - (T * dS) / 1000;

describe('derived chemistry values', () => {
  it('ΔfG°(H₂O, l) = −237.1 kJ/mol from the CODATA ΔfH° and entropies', () => {
    const dS = 69.95 - 130.680 - 205.152 / 2;
    expect(dG(-285.830, dS)).toBeCloseTo(-237.14, 2);
    expect(reaction('water-electrolysis').description).toContain('237.1 kJ');
  });
  it('neutralisation enthalpy −55.8 kJ/mol from CODATA H₂O(l) and OH⁻(aq) (H⁺(aq) = 0 by convention)', () => {
    expect(-285.830 - -230.015).toBeCloseTo(-55.815, 3);
    expect(reaction('neutralisation-net-ionic').description).toContain('−55.8 kJ/mol');
  });
  it('K_sp of AgCl ≈ 1.8 × 10⁻¹⁰ from CODATA ΔfH° and S°', () => {
    const g = dG(105.79 - 167.080 - -127.01, 73.45 + 56.60 - 96.25);
    const ksp = Math.exp((-g * 1000) / (R * T));
    expect(ksp).toBeGreaterThan(1.75e-10);
    expect(ksp).toBeLessThan(1.85e-10);
    expect(reaction('agcl-precipitation').description).toContain('1.8 × 10⁻¹⁰');
  });
  it('K_a of acetic acid from pK = 4.756; K_b of ammonia from pK(NH₄⁺) = 9.245 and pK_w = 13.99', () => {
    expect(10 ** -4.756).toBeCloseTo(1.754e-5, 7);
    expect(10 ** -(13.99 - 9.245)).toBeCloseTo(1.799e-5, 7);
    expect(reaction('acetic-acid-dissociation').description).toContain('1.75 × 10⁻⁵');
    expect(reaction('ammonia-base').description).toContain('1.8 × 10⁻⁵');
  });
  it('Daniell cell E° = 0.339 − (−0.762) = 1.101 V (Bratsch Table 1)', () => {
    expect(0.339 - -0.762).toBeCloseTo(1.101, 6);
    expect(reaction('zn-cu-displacement').description).toContain('1.101 V');
  });
});
