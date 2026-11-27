/**
 * Phase 10, Gate 10.4 — spectroscopy: NIST Atomic Spectroscopy Compendium eqs. 1, 2, 10, 30, 40; Bohr (1913) eq. 4;
 * NIST Diatomic Spectral Database eqs. 2–8 with Huber & Herzberg constants (datasets/molecular/diatomic.json).
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import {
  bohrFrequency, dopplerFwhm, gaussian, hydrogenicWavelength, lorentzian, reducedMass, rotationLine, rotationalConstant, rotationalTerm,
  rydbergM, vibrationalTerm, wavenumberToHz, type DiatomicConstants,
} from '@/core/physics/optics/spectroscopy';
import dia from '@datasets/molecular/diatomic.json';
import nuc from '@datasets/atomic/nuclides.json';

const u = CONSTANTS.u.value, me = CONSTANTS.me.value;
const atomMass = (Z: number, A: number) => (nuc as unknown as Record<string, { natural: { A: number; mass: number }[] }>)[String(Z)].natural.find((x) => x.A === A)!.mass;
const nucleus = (Z: number, A: number) => atomMass(Z, A) * u - Z * me;   // electron binding energy neglected
const mol = (id: string) => (dia as unknown as { molecules: { id: string; constants: DiatomicConstants & Record<string, number> }[] }).molecules.find((m) => m.id === id)!;

describe('hydrogen-like spectra (Compendium eqs. 2, 30; Bohr 1913)', () => {
  it('R_M of hydrogen is R∞/(1 + m_e/m_p); Hα (3 → 2) at 656.47 nm vacuum, Hβ at 486.27 nm', () => {
    expect(rydbergM(CONSTANTS.mp.value)).toBeCloseTo(CONSTANTS.Rinf.value / (1 + me / CONSTANTS.mp.value), 6);
    expect(hydrogenicWavelength(1, CONSTANTS.mp.value, 2, 3) * 1e9).toBeCloseTo(656.47, 2);
    expect(hydrogenicWavelength(1, CONSTANTS.mp.value, 2, 4) * 1e9).toBeCloseTo(486.27, 2);
  });
  it('isotope shift: deuterium Hα lies 0.179 nm to the blue of hydrogen Hα', () => {
    const h = hydrogenicWavelength(1, nucleus(1, 1), 2, 3), d = hydrogenicWavelength(1, nucleus(1, 2), 2, 3);
    expect((h - d) * 1e9).toBeCloseTo(0.179, 3);
  });
  it('He II 4 → 3 at 468.6 nm (Z = 2)', () => {
    expect(hydrogenicWavelength(2, nucleus(2, 4), 3, 4) * 1e9).toBeCloseTo(468.7, 1);
  });
  it('Bohr’s factor 2π²me⁴/h³ is R∞c = 3.290 × 10¹⁵ Hz, his “observed value … 3·290 . 10¹⁵”', () => {
    expect(bohrFrequency(1, Infinity) / 1e15).toBeCloseTo(3.290, 3);
  });
});

describe('line shapes (Compendium §20, eq. 40)', () => {
  it('Doppler FWHM of Hα at 10 000 K is 0.47 Å; it scales as √(T/M)', () => {
    expect(dopplerFwhm(6563, 1e4, 1.008)).toBeCloseTo(0.468, 2);
    expect(dopplerFwhm(6563, 4e4, 1.008) / dopplerFwhm(6563, 1e4, 1.008)).toBeCloseTo(2, 12);
  });
  it('profiles: both have half maximum at the stated widths; the Lorentzian has broader wings', () => {
    expect(gaussian(1.5, 1, 1)).toBeCloseTo(0.5, 12);
    expect(lorentzian(1.5, 1, 0.5)).toBeCloseTo(0.5, 12);
    expect(lorentzian(4, 1, 0.5)).toBeGreaterThan(gaussian(4, 1, 1));
  });
});

describe('diatomic molecules (NIST Diatomic Spectral Database; Huber & Herzberg)', () => {
  it('the WebBook constants are those of Huber & Herzberg: HCl ω_e = 2990.95 cm⁻¹, CO B_e = 1.9313 cm⁻¹', () => {
    expect(mol('hcl').constants.we).toBeCloseTo(2990.946, 2);
    expect(mol('co').constants.Be).toBeCloseTo(1.93128, 4);
    expect((dia as unknown as { molecules: unknown[] }).molecules).toHaveLength(6);
  });
  it('vibrational levels: zero-point energy ω_e/2 − ω_e x_e/4; HCl fundamental G(1) − G(0) = ω_e − 2ω_e x_e = 2885.3 cm⁻¹', () => {
    const c = mol('hcl').constants;
    expect(vibrationalTerm(c, 0)).toBeCloseTo(c.we / 2 - c.wexe / 4, 10);
    expect(vibrationalTerm(c, 1) - vibrationalTerm(c, 0)).toBeCloseTo(2885.31, 2);
  });
  it('rotation lines are differences of rotational terms (ΔJ = +1) and are nearly evenly spaced by 2B', () => {
    const c = mol('co').constants;
    for (const J of [1, 5, 20]) expect(rotationLine(c, 0, J)).toBeCloseTo(rotationalTerm(c, 0, J) - rotationalTerm(c, 0, J - 1), 10);
    expect(rotationLine(c, 0, 2) - rotationLine(c, 0, 1)).toBeCloseTo(2 * rotationalConstant(c, 0), 3);
  });
  it('CO J = 1 ← 0 near 115.27 GHz (the radio-astronomy line), from B_0 alone', () => {
    expect(wavenumberToHz(rotationLine(mol('co').constants, 0, 1)) / 1e9).toBeCloseTo(115.27, 1);
  });
  it('reduced mass of H³⁵Cl ≈ 0.980 u', () => {
    expect(reducedMass(atomMass(1, 1), atomMass(17, 35))).toBeCloseTo(0.9796, 3);
  });
});
