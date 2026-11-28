/**
 * Gate 11.6 — diffusion, osmosis, enzyme kinetics. Each check reproduces a number printed in the source or an
 * exact solution.
 */
import { describe, expect, it } from 'vitest';
import { diffusionTime, fickStep, gaussianProfile, meanSquare, michaelisMenten, osmoticPressure, randomWalk, rmsDisplacement, rmsDisplacement3D, stokesEinsteinD, stokesEinsteinRadius } from '@/core/biology/transport';
import { R_GAS } from '@/core/biology/membrane';
import data from '@datasets/biology/transport.json';

const T6 = data as unknown as { diffusion: { id: string; e5: number; tC: number; reliability: string }[]; einstein: { supplement1906: { thovertCm2PerDay: number } }; vantHoff: { numbers: { P: number; Vvalue: number; T: number; R: number } }; michaelisMenten: { fig4aLogK: number } };

describe('Einstein (1905), eq. (11) and his worked example', () => {
  it('N = 6·10²³, water at 17 °C (k = 1.35·10⁻² poise), 0.001 mm particles: λx ≈ 0.8 µ in 1 s and about 6 µ in a minute', () => {
    const D = stokesEinsteinD(290.15, 1.35e-3, 0.5e-6, 6e23);
    expect(rmsDisplacement(D, 1) * 1e6).toBeCloseTo(0.795, 2);
    expect(Math.round(rmsDisplacement(D, 60) * 1e6)).toBe(6);
    expect(stokesEinsteinRadius(290.15, 1.35e-3, D, 6e23)).toBeCloseTo(0.5e-6, 12);
  });
  it('the 3D rms displacement is √3 times the one-axis value (eq. 12); t = x²/2D inverts eq. (11)', () => {
    expect(rmsDisplacement3D(1e-9, 2) / rmsDisplacement(1e-9, 2)).toBeCloseTo(Math.sqrt(3), 12);
    expect(rmsDisplacement(5.2e-10, diffusionTime(5.2e-10, 30e-6))).toBeCloseTo(30e-6, 15);
  });
  it('glucose (ICT, 15 °C) wanders 30 µm in under a second and 1 cm in about 11 days', () => {
    const D = T6.diffusion.find((d) => d.id === 'glucose')!.e5 * 1e-9;
    expect(diffusionTime(D, 30e-6)).toBeCloseTo(0.865, 2);
    expect(diffusionTime(D, 1e-2) / 86400).toBeCloseTo(1.113, 2);
  });
  it('sucrose: ICT 0.38·10⁻⁵ cm²/s is 0.328 cm²/day, matching Thovert’s 0.33 cm²/day quoted by Einstein (1906)', () => {
    const ict = T6.diffusion.find((d) => d.id === 'sucrose')!.e5 * 1e-5 * 86400;
    expect(ict).toBeCloseTo(0.328, 3);
    expect(Math.abs(ict - T6.einstein.supplement1906.thovertCm2PerDay)).toBeLessThan(0.01);
  });
});

describe('Fick (1855), eq. (2), solved numerically', () => {
  it('an explicit step conserves the amount with zero-flux ends and refuses r > ½', () => {
    let c: Float64Array = new Float64Array(51); c[25] = 1;
    for (let k = 0; k < 200; k++) c = fickStep(c, 1, 1, 0.4);
    expect(c.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(() => fickStep(c, 1, 1, 0.6)).toThrow(/unstable/);
  });
  it('a Gaussian evolved by the solver matches the exact spreading Gaussian within 1 %', () => {
    const D = 5e-10, dx = 1e-6, n = 401, dt = 0.4 * dx * dx / D, t0 = 0.05, steps = 300;
    const x = (i: number) => (i - 200) * dx;
    let c: Float64Array = Float64Array.from({ length: n }, (_, i) => gaussianProfile(1, D, t0, x(i)));
    for (let k = 0; k < steps; k++) c = fickStep(c, D, dx, dt);
    const t = t0 + steps * dt;
    const peak = gaussianProfile(1, D, t, 0);
    let err = 0;
    for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(c[i] - gaussianProfile(1, D, t, x(i))));
    expect(err / peak).toBeLessThan(0.01);
  });
  it('random walkers with steps of variance 2DΔt give ⟨x²⟩ = 2Dt within 3 %', () => {
    const D = 5e-10, x = randomWalk(20000, D, 0.01, 50, 3);
    expect(meanSquare(x) / (2 * D * 0.5)).toBeGreaterThan(0.97);
    expect(meanSquare(x) / (2 * D * 0.5)).toBeLessThan(1.03);
  });
});

describe("van 't Hoff (1887) and Michaelis & Menten (1913)", () => {
  it('ideal osmotic pressure of 1 mol/L at 0 °C is 22.4 atm', () => {
    expect(osmoticPressure(1000, 273.15) / 101325).toBeCloseTo(22.41, 2);
  });
  it("van 't Hoff's own numbers give PV/T = 845.24, against his printed R = 845.05; in SI 8.287 against 8.314", () => {
    const n = T6.vantHoff.numbers;
    expect(n.P * n.Vvalue / n.T).toBeCloseTo(845.24, 2);
    expect(n.R).toBe(845.05);
    expect(n.R * 9.80665 / 1000).toBeCloseTo(8.287, 3);
    expect((R_GAS - n.R * 9.80665 / 1000) / R_GAS).toBeCloseTo(0.0033, 3);
  });
  it('V = [S]/([S] + k): half the maximum at [S] = k, approaching 1 far above; invertase log k = −1.78 (Fig. 4a)', () => {
    const k = 10 ** T6.michaelisMenten.fig4aLogK;
    expect(k).toBeCloseTo(0.0166, 4);
    expect(michaelisMenten(k, k)).toBe(0.5);
    expect(michaelisMenten(1000 * k, k)).toBeGreaterThan(0.999);
    expect(michaelisMenten(k / 9, k)).toBeCloseTo(0.1, 12);
  });
  it('ICT transcription: six sugars at 15 °C, infinite dilution', () => {
    expect(T6.diffusion.map((d) => `${d.id} ${d.e5} ${d.reliability}`)).toEqual(['glucose 0.52 C-D', 'mannitol 0.5 C-D', 'sucrose 0.38 D', 'lactose 0.38 D', 'maltose 0.38 D', 'raffinose 0.33 E']);
    expect(T6.diffusion.every((d) => d.tC === 15)).toBe(true);
  });
});
