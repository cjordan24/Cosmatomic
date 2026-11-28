/**
 * Gate 14.4 — plasma parameters against the NRL Plasma Formulary 2009 practical forms (pp. 28–29, page images). 
 */
import { describe, expect, it } from 'vitest';
import { EV_K, alfvenSpeed, debyeLengthM, gyroFrequencyHz, plasmaBeta, plasmaFrequencyHz, thermalSpeed, ELECTRON_MASS } from '@/core/physics/plasma';

describe('plasma (NRL practical forms: n in cm⁻³, T in eV, B in gauss)', () => {
  it('f_pe = 8.98 × 10³ n^½ Hz', () => { expect(plasmaFrequencyHz(1e6) / 1e3).toBeCloseTo(8.98, 2); });
  it('λ_D = 7.43 × 10² T^½ n^−½ cm', () => { expect(debyeLengthM(1e6, 1) * 100).toBeCloseTo(743, 0); });
  it('f_ce = 2.80 × 10⁶ B Hz (B in gauss)', () => { expect(gyroFrequencyHz(1e-4) / 1e6).toBeCloseTo(2.8, 2); });
  it('v_A = 2.18 × 10¹¹ μ^−½ n^−½ B cm/s', () => { expect(alfvenSpeed(1e-4, 1e6) * 100 / 1e11).toBeCloseTo(2.18, 2); });
  it('v_Te = (kT/m)^½ = 4.19 × 10⁷ T^½ cm/s; 1 eV = 11 604.5 K', () => {
    expect(thermalSpeed(1, ELECTRON_MASS) * 100 / 1e7).toBeCloseTo(4.19, 2);
    expect(EV_K).toBeCloseTo(11604.5, 0);
  });
  it('β = n k T/(B²/2μ₀) = 4.03 × 10⁻¹¹ n T B⁻²', () => { expect(plasmaBeta(1e6, 1, 1e-4) / 4.03e-11).toBeCloseTo(1, 2); });
});

