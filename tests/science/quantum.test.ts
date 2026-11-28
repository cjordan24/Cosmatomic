/**
 * Gate 14.2 — the finite-difference Schrödinger solver against exact solutions.
 */
import { describe, expect, it } from 'vitest';
import { HB2M, barrierTransmission, boxEnergyEV, grid, oscillatorEnergyEV, oscillatorPotentialEV, solve1D, transmission } from '@/core/physics/quantum';

describe('constants', () => {
  it('ħ²/2mₑ = 0.0380998 eV·nm²', () => { expect(HB2M).toBeCloseTo(0.0380998, 6); });
  it('an electron in a 1 nm box: E₁ = h²/8mL² = 0.376 eV', () => { expect(boxEnergyEV(1, 1)).toBeCloseTo(0.37603, 4); });
});

describe('finite-difference solver', () => {
  it('infinite square well, L = 1 nm, 1000 points: the first four levels within 0.01 %', () => {
    const g = grid(0, 1, 1000);
    const { E } = solve1D(g.x.map(() => 0), g.dx, 4);
    E.forEach((Ei, i) => expect(Math.abs(Ei / boxEnergyEV(i + 1, 1) - 1)).toBeLessThan(1e-4));
  });
  it('harmonic oscillator, ħω = 0.5 eV: levels 0.25, 0.75, 1.25, 1.75 eV within 0.05 %', () => {
    const g = grid(-6, 6, 1200);
    const { E } = solve1D(g.x.map((x) => oscillatorPotentialEV(x, 0.5)), g.dx, 4);
    E.forEach((Ei, n) => expect(Math.abs(Ei / oscillatorEnergyEV(n, 0.5) - 1)).toBeLessThan(5e-4));
  });
  it('eigenvectors are normalised and the ground state has no node', () => {
    const g = grid(0, 1, 400);
    const { psi } = solve1D(g.x.map(() => 0), g.dx, 2);
    expect(psi[0].reduce((s, z) => s + z * z, 0) * g.dx).toBeCloseTo(1, 9);
    expect(psi[0].every((z) => z > 0)).toBe(true);
    const signChanges = psi[1].slice(1).filter((z, i) => Math.sign(z) !== Math.sign(psi[1][i])).length;
    expect(signChanges).toBe(1);
  });
});

describe('tunnelling', () => {
  it('transfer matrices reproduce the closed-form rectangular barrier (below and above the top)', () => {
    for (const E of [0.2, 0.5, 0.9, 1.5, 3]) expect(transmission(E, [[0.5, 1]])).toBeCloseTo(barrierTransmission(E, 1, 0.5), 10);
  });
  it('with no barrier everything passes; a thicker barrier passes less', () => {
    expect(transmission(0.5, [[0.5, 0]])).toBeCloseTo(1, 12);
    expect(transmission(0.5, [[1, 1]])).toBeLessThan(transmission(0.5, [[0.5, 1]]));
  });
  it('resonant transmission above the barrier when ka = nπ', () => {
    const V0 = 1, a = 1, k2 = (Math.PI / a) ** 2, E = V0 + k2 * HB2M;   // one half-wavelength fits
    expect(barrierTransmission(E, V0, a)).toBeCloseTo(1, 12);
  });
});

describe('the printed sources', () => {
  it('Mott (1930) p. 61: a 1 cm box and a 20 V electron give a level spacing of 5.5 × 10⁻⁷ V from his own ν_n = hn²/8ml², not the printed 3·2 × 10⁻⁷', () => {
    const E1 = boxEnergyEV(1, 1e7);   // L = 1 cm = 10⁷ nm
    const n = Math.sqrt(20 / E1), spacing = (2 * n + 1) * E1;
    expect(spacing).toBeCloseTo(5.49e-7, 8);
  });
  it('Condon & Morse (1929) eq. (68.4) equals the exact transmission; (68.5) needs a minus sign (k₀ = 1, κ = 0.7, a = 1.3: 1/T = 2.2273; printed form 2.3600)', () => {
    const k0 = 1, k = 0.7, a = 1.3;
    const exact = 1 + ((k0 * k0 + k * k) ** 2 / (4 * k0 * k0 * k * k)) * Math.sinh(k * a) ** 2;
    const printed = 0.5 + (1 / 8) * ((k0 / k - k / k0) ** 2 + (1 + k0 ** 2 / k ** 2) * (1 + k ** 2 / k0 ** 2) * Math.cosh(2 * k * a));
    const fixed = 0.5 + (1 / 8) * (-((k0 / k - k / k0) ** 2) + (1 + k0 ** 2 / k ** 2) * (1 + k ** 2 / k0 ** 2) * Math.cosh(2 * k * a));
    expect(exact).toBeCloseTo(2.2273, 4); expect(printed).toBeCloseTo(2.36, 3); expect(fixed).toBeCloseTo(exact, 12);
    const kk = 0.9, w = 0.8, c = 1 / 16, x = kk / k0, y = k0 / kk;
    const cc684 = c * ((1 + x) ** 2 * (1 + y) ** 2 + (1 - x) ** 2 * (1 - y) ** 2 + 2 * (1 + x) * (1 - x) * (1 + y) * (1 - y) * Math.cos(2 * kk * w));
    expect(cc684).toBeCloseTo(1 + ((k0 * k0 - kk * kk) ** 2 * Math.sin(kk * w) ** 2) / (4 * k0 * k0 * kk * kk), 12);
  });
});
