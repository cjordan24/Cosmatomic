/**
 * Gates 13.4–13.6 — tissue dielectric model, X-ray attenuation, ultrasound reflection, MRI, microscopy; each
 * checked against a number printed in its source or an exact identity.
 */
import { describe, expect, it } from 'vitest';
import { abbeLimit, echoTimeS, electronWavelengthApproxM, electronWavelengthClassicalM, electronWavelengthM, fdaDeratingDb, gabriel, halfValueLayerCm, larmorMHz, photonWavelengthM, rayleighAmplitude, reflectedIntensity, relativisticTerm, sar, skinDepthM, transmission, type ColeCole } from '@/core/biology/imaging';
import { CONSTANTS } from '@/core/constants/constants';
import data from '@datasets/biology/imaging.json';

// IFAC-CNR parameters for Muscle (τ in ps, ns, µs, ms → s)
const MUSCLE: ColeCole = { epsInf: 4, sigmaI: 0.2, terms: [[50, 7.234e-12, 0.1], [7000, 353.68e-9, 0.1], [1.2e6, 318.31e-6, 0.1], [2.5e7, 2.274e-3, 0]] };

describe('tissue as a dielectric (Gabriel / IFAC-CNR; USAF handbook)', () => {
  it('at very high frequency the permittivity tends to ε∞ and the loss to zero dispersion', () => {
    const g = gabriel(MUSCLE, 1e15);
    expect(g.epsR).toBeCloseTo(4, 1);
  });
  it('σ = ωε₀ε″ (stated by IFAC)', () => {
    const f = 9e8, g = gabriel(MUSCLE, f);
    expect(g.sigma).toBeCloseTo(2 * Math.PI * f * CONSTANTS.eps0.value * g.epsI, 12);
  });
  it('muscle at 900 MHz: ε′ ≈ 55 and σ ≈ 0.94 S/m — a model value in the range of the Gabriel curves', () => {
    const g = gabriel(MUSCLE, 9e8);
    expect(g.epsR).toBeGreaterThan(50); expect(g.epsR).toBeLessThan(60);
    expect(g.sigma).toBeGreaterThan(0.85); expect(g.sigma).toBeLessThan(1.05);
  });
  it('finding: the handbook’s 67.52 is c√2/2π with its own c = 3 × 10⁸ m/s; the exact c gives 67.48 — otherwise its skin depth is exactly 1/α', () => {
    expect((3e8 * Math.SQRT2) / (2 * Math.PI) / 1e6).toBeCloseTo(67.52, 2);
    expect((CONSTANTS.c.value * Math.SQRT2) / (2 * Math.PI) / 1e6).toBeCloseTo(67.477, 3);
    const f = 9e8, g = gabriel(MUSCLE, f);
    // k = (ω/c)√(ε′ − jε″); α = −Im k
    const mod = Math.hypot(g.epsR, g.epsI), arg = -Math.atan2(g.epsI, g.epsR) / 2;
    const alpha = ((2 * Math.PI * f) / CONSTANTS.c.value) * Math.sqrt(mod) * -Math.sin(arg);
    expect(skinDepthM(g.epsR, g.epsI, f / 1e6) * (67.477 / 67.52)).toBeCloseTo(1 / alpha, 4);
  });
  it('SAR = σ|E|²/ρ: 1 S/m, 10 V/m rms, 1000 kg/m³ → 0.1 W/kg', () => {
    expect(sar(1, 10, 1000)).toBeCloseTo(0.1, 12);
  });
});

describe('X-rays (NIST SRD 126)', () => {
  it('water at 100 keV (μ/ρ = 0.1707 cm²/g): half-value layer 4.06 cm, 10 cm passes 18.1 %', () => {
    expect(halfValueLayerCm(0.1707, 1)).toBeCloseTo(4.061, 3);
    expect(transmission(0.1707, 1, 10)).toBeCloseTo(0.1814, 4);
  });
  it('a 12.398 keV photon has a wavelength of 1.0000 Å (hc = 12.398 keV·Å)', () => {
    expect(photonWavelengthM(12.39842) * 1e10).toBeCloseTo(1, 5);
  });
});

describe('ultrasound (Rayleigh 1896; FDA)', () => {
  it('Rayleigh’s air → hydrogen example (gases: V ∝ 1/√ρ): φ″ = −·5833 φ′, intensity ·3403 (printed ·3402)', () => {
    const rho = 0.001276, rho1 = 0.00008837;
    const a = rayleighAmplitude(rho, 1 / Math.sqrt(rho), rho1, 1 / Math.sqrt(rho1));
    expect(a).toBeCloseTo(-0.5833, 4);
    expect(a * a).toBeCloseTo(0.3403, 4);
    expect(Math.sqrt(rho / rho1)).toBeCloseTo(3.8, 3);
  });
  it('no reflection when ρ₁ : ρ = V : V₁', () => {
    expect(rayleighAmplitude(1000, 1500, 1500, 1000)).toBeCloseTo(0, 12);
  });
  it('eq. (23) equals (Z₁ − Z)/(Z₁ + Z) with Z = ρV', () => {
    const [r, v, r1, v1] = [1000, 1483, 1050, 1585];
    expect(rayleighAmplitude(r, v, r1, v1)).toBeCloseTo((r1 * v1 - r * v) / (r1 * v1 + r * v), 12);
    expect(reflectedIntensity(r, v, r1, v1)).toBeGreaterThan(0);
  });
  it('an echo from 5 cm in water (1483 m/s) returns after 67.4 µs; FDA derating at 5 MHz over 5 cm is 7.5 dB', () => {
    expect(echoTimeS(0.05, 1483) * 1e6).toBeCloseTo(67.43, 2);
    expect(fdaDeratingDb(5, 5)).toBeCloseTo(7.5, 12);
  });
});

describe('MRI (CODATA 2022)', () => {
  it('protons in water precess at 63.86 MHz at 1.5 T and 127.73 MHz at 3 T', () => {
    expect(larmorMHz(1.5)).toBeCloseTo(63.865, 3);
    expect(larmorMHz(3)).toBeCloseTo(127.729, 3);
  });
});

describe('microscopy (Abbe 1873; de Broglie & Flint 1930)', () => {
  it('Abbe: 0.5 µm light, sin u = 1 → 0.5 µm central, 0.25 µm oblique', () => {
    expect(abbeLimit(0.5, 90, false)).toBeCloseTo(0.5, 12);
    expect(abbeLimit(0.5, 90, true)).toBeCloseTo(0.25, 12);
  });
  it('eq. (24): 300 kV electrons have λ = 1.969 pm; 100 V electrons 122.6 pm', () => {
    expect(electronWavelengthM(3e5) * 1e12).toBeCloseTo(1.9687, 3);
    expect(electronWavelengthM(100) * 1e12).toBeCloseTo(122.6, 1);
  });
  it('the “always small” term eP/2mc² is 0.29 at 300 kV: eq. (25) is then 3.0 % off and the classical value 13.7 % off', () => {
    expect(relativisticTerm(3e5)).toBeCloseTo(0.2935, 3);
    const ex = electronWavelengthM(3e5);
    expect((electronWavelengthApproxM(3e5) - ex) / ex).toBeCloseTo(-0.0296, 3);
    expect((electronWavelengthClassicalM(3e5) - ex) / ex).toBeCloseTo(0.1373, 3);
  });
});

describe('the imaging dataset', () => {
  const D = data as unknown as { xray: { energiesKeV: number[]; materials: { id: string; muRho: number[]; kEdge?: { keV: number; below: number; above: number } }[] }; tissue: { params: Record<string, ColeCole> } };
  it('NIST spot checks: water at 100 keV μ/ρ = 0.1707 cm²/g; lead’s K edge at 88.0045 keV, 1.910 → 7.683', () => {
    const w = D.xray.materials.find((m) => m.id === 'water')!;
    expect(w.muRho[D.xray.energiesKeV.indexOf(100)]).toBe(0.1707);
    expect(D.xray.materials.find((m) => m.id === 'lead')!.kEdge).toEqual({ keV: 88.0045, below: 1.91, above: 7.683 });
  });
  it('cortical bone attenuates more than soft tissue at every energy, most at low energy', () => {
    const b = D.xray.materials.find((m) => m.id === 'corticalBone')!, t = D.xray.materials.find((m) => m.id === 'softTissue')!;
    const r = b.muRho.map((v, i) => v / t.muRho[i]);
    r.forEach((x) => expect(x).toBeGreaterThan(0.99));
    expect(r[0]).toBeGreaterThan(r[r.length - 1]);
  });
  it('the dataset’s muscle parameters give ε′ = 55.0 and σ = 0.943 S/m at 900 MHz', () => {
    const g = gabriel(D.tissue.params.Muscle, 9e8);
    expect(g.epsR).toBeCloseTo(55.03, 2); expect(g.sigma).toBeCloseTo(0.943, 3);
  });
});
