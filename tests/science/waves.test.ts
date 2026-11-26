/**
 * Gate 4.5 — shared wave physics engine.
 */
import { describe, expect, it } from 'vitest';
import { CourantError, TAU, advanceFD, attenuated, beatFrequency, courant, createFD, deepWater, doppler, fdEnergy, frequencyForWavelength, kinematics, modeFrequency, nonDispersive, packet, resultantAmplitude, sinusoid, standingWave, superpose, velocities, twoSourceField } from '@/core/physics/waves/waves';
import { AIR_MOLAR_MASS, getMedium } from '@/core/physics/waves/media';

const st = { temperatureK: 293.15, tensionN: 100, linearDensity: 0.01 };

describe('kinematics', () => {
  it('T = 1/f, ω = 2πf, k = 2π/λ, v = fλ (exact identities)', () => {
    const k = kinematics(440, 343);
    expect(k.T * k.f).toBeCloseTo(1, 15);
    expect(k.omega).toBeCloseTo(TAU * 440, 12);
    expect(k.lambda * k.f).toBeCloseTo(343, 12);
    expect(k.k * k.lambda).toBeCloseTo(TAU, 12);
    expect(k.omega / k.k).toBeCloseTo(343, 10); // phase velocity
  });
  it('wavelength is never independent: requesting λ solves for f in the medium', () => {
    expect(frequencyForWavelength(0.5, 343)).toBeCloseTo(686, 12);
    expect(() => kinematics(0, 343)).toThrow();
  });
});

describe('sinusoid, phase and superposition', () => {
  const w = { A: 0.01, f: 5, v: 20, phi: 0, dir: 1 as const };
  it('y(x,t) = A sin(kx − ωt + φ): one period later and one wavelength along it repeats', () => {
    const { T, lambda } = kinematics(5, 20);
    for (const [x, t] of [[0.13, 0.02], [1.7, 0.33]]) {
      expect(sinusoid(w, x, t + T)).toBeCloseTo(sinusoid(w, x, t), 12);
      expect(sinusoid(w, x + lambda, t)).toBeCloseTo(sinusoid(w, x, t), 12);
    }
  });
  it('crest moves at the phase velocity in the +x direction (and −x for dir = −1)', () => {
    const { k } = kinematics(5, 20);
    const xCrest = (t: number, dir: 1 | -1) => (Math.PI / 2 + dir * TAU * 5 * t) / k;
    expect(sinusoid(w, xCrest(0.1, 1), 0.1)).toBeCloseTo(0.01, 12);
    expect((xCrest(0.1, 1) - xCrest(0, 1)) / 0.1).toBeCloseTo(20, 10);
    expect(sinusoid({ ...w, dir: -1 }, xCrest(0.1, -1), 0.1)).toBeCloseTo(0.01, 12);
  });
  it('phase φ = π/2 shifts the wave by a quarter wavelength', () => {
    const { lambda } = kinematics(5, 20);
    expect(sinusoid({ ...w, phi: Math.PI / 2 }, 0.3, 0.07)).toBeCloseTo(sinusoid(w, 0.3 + lambda / 4, 0.07), 12);
  });
  it('superposition is pointwise additive (linear medium)', () => {
    const w2 = { A: 0.004, f: 7, v: 20, phi: 1, dir: -1 as const };
    expect(superpose([w, w2], 0.4, 0.2)).toBeCloseTo(sinusoid(w, 0.4, 0.2) + sinusoid(w2, 0.4, 0.2), 15);
  });
  it('constructive (Δφ = 0) doubles, destructive (Δφ = π) cancels, everywhere', () => {
    expect(resultantAmplitude(1, 1, 0)).toBe(2);
    expect(resultantAmplitude(1, 1, Math.PI)).toBeLessThan(1e-12);
    for (const x of [0.1, 0.77, 2.3]) expect(Math.abs(superpose([w, { ...w, phi: Math.PI }], x, 0.4))).toBeLessThan(1e-12);
  });
  it('two-source field: constructive where path difference = mλ, destructive at (m + ½)λ', () => {
    const lam = 1, k = TAU / lam, s1: [number, number] = [-1, 0], s2: [number, number] = [1, 0];
    // on the perpendicular bisector the path difference is 0 → amplitude 2
    const amp = (x: number, y: number) => Math.max(...Array.from({ length: 40 }, (_, i) => Math.abs(twoSourceField(x, y, i / 40, s1, s2, k, TAU))));
    expect(amp(0, 5)).toBeCloseTo(2, 2);
    // on the axis beyond the sources, path difference = 2 m = 2λ → constructive; with λ = 0.8 → 2.5λ destructive
    expect(amp(3, 0)).toBeCloseTo(2, 2);
    const k2 = TAU / 0.8; const amp2 = Math.max(...Array.from({ length: 40 }, (_, i) => Math.abs(twoSourceField(3, 0, i / 40, s1, s2, k2, TAU))));
    expect(amp2).toBeLessThan(1e-9);
  });
  it('beats: |f₁ − f₂|, and the envelope of 440 + 444 Hz repeats every 0.25 s', () => {
    expect(beatFrequency(440, 444)).toBe(4);
    const a = { A: 1, f: 440, v: 343, phi: 0, dir: 1 as const }, b = { ...a, f: 444 };
    expect(Math.abs(superpose([a, b], 0, 0))).toBeLessThan(1e-12 + 2);
    expect(Math.abs(superpose([a, b], 0, 0.125))).toBeLessThan(1e-9); // envelope node at t = 1/(2 f_beat)
  });
});

describe('standing waves and boundary conditions', () => {
  it('fixed–fixed and open–open: fₙ = nv/2L; open–closed: odd harmonics (2n−1)v/4L', () => {
    expect(modeFrequency('fixed-fixed', 3, 0.65, 100)).toBeCloseTo((3 * 100) / 1.3, 12);
    expect(modeFrequency('open-closed', 1, 0.5, 343)).toBeCloseTo(171.5, 10);
    expect(modeFrequency('open-closed', 2, 0.5, 343) / modeFrequency('open-closed', 1, 0.5, 343)).toBeCloseTo(3, 12);
    expect(() => modeFrequency('fixed-fixed', 0, 1, 1)).toThrow();
  });
  it('nodes at both fixed ends for all t; n − 1 interior nodes; antinode amplitude 2A', () => {
    const L = 1.2, v = 50, A = 0.01;
    for (const t of [0, 0.013, 0.271]) { expect(Math.abs(standingWave('fixed-fixed', 3, L, v, A, 0, t))).toBeLessThan(1e-15); expect(Math.abs(standingWave('fixed-fixed', 3, L, v, A, L, t))).toBeLessThan(1e-14); }
    for (const x of [L / 3, (2 * L) / 3]) expect(Math.abs(standingWave('fixed-fixed', 3, L, v, A, x, 0.05))).toBeLessThan(1e-14);
    expect(standingWave('fixed-fixed', 3, L, v, A, L / 6, 0)).toBeCloseTo(2 * A, 12);
  });
  it('open–closed pipe: pressure node at the open end, antinode at the closed end', () => {
    const L = 0.5, v = 343;
    expect(Math.abs(standingWave('open-closed', 1, L, v, 1, 0, 0))).toBeLessThan(1e-15);
    expect(Math.abs(standingWave('open-closed', 1, L, v, 1, L, 0))).toBeCloseTo(2, 12);
  });
});

describe('dispersion, Doppler, attenuation', () => {
  it('non-dispersive: v_g = v_p; deep water ω² = gk: v_g = v_p/2', () => {
    const a = velocities(nonDispersive(10), 3); expect(a.group).toBeCloseTo(a.phase, 6);
    const b = velocities(deepWater(), 2); expect(b.group / b.phase).toBeCloseTo(0.5, 6);
  });
  it('wave-packet peak travels at the group velocity (deep water)', () => {
    const om = deepWater(), k0 = 2, vg = velocities(om, k0).group;
    const p = { A: 1, k0, sigmaK: 0.15, omega: om, x0: 0 };
    const peakX = (t: number) => { let best = -1e9, bx = 0; for (let x = -5 + vg * t; x < 5 + vg * t; x += 0.01) { const e = Math.abs(packet(p, x, t)); if (e > best) { best = e; bx = x; } } return bx; };
    expect(Math.abs(peakX(10) - vg * 10)).toBeLessThan(1.0); // ~λ/3 resolution of the carrier
  });
  it('Doppler: approaching source raises f; receding lowers; supersonic → invalid (null)', () => {
    expect(doppler(440, 343, 34.3, 0)!).toBeCloseTo(440 / 0.9, 9);
    expect(doppler(440, 343, -34.3, 0)!).toBeLessThan(440);
    expect(doppler(440, 343, 0, 34.3)!).toBeCloseTo(440 * 1.1, 9);
    expect(doppler(440, 343, 400, 0)).toBeNull();
  });
  it('attenuation: A₀e^(−αx) halves every ln2/α', () => {
    expect(attenuated(1, 0.5, Math.LN2 / 0.5)).toBeCloseTo(0.5, 12);
  });
});

describe('finite-difference solver (Courant-limited)', () => {
  const pulse = (x: number) => Math.exp(-(((x - 0.3) / 0.03) ** 2));
  it('rejects unstable time steps (Courant > 1)', () => {
    expect(() => createFD(1, 201, 10, 0.001, pulse)).toThrow(CourantError); // C = 2
    expect(courant(10, 0.0004, 0.005)).toBeCloseTo(0.8, 12);
  });
  it('pulse splits into two halves travelling at ±v', () => {
    const s = createFD(1, 401, 1, 0.002, pulse);
    advanceFD(s, 0.2);
    const xAt = (lo: number, hi: number) => { let best = 0, bx = 0; for (let i = 0; i < s.N; i++) { const x = i * s.dx; if (x < lo || x > hi) continue; if (s.y[i] > best) { best = s.y[i]; bx = x; } } return { bx, best }; };
    const right = xAt(0.35, 1), left = xAt(0, 0.25);
    expect(right.bx).toBeCloseTo(0.5, 1); expect(left.bx).toBeCloseTo(0.1, 1);
    expect(right.best).toBeCloseTo(0.5, 1);
  });
  it('reflection: inverted at a fixed end, upright at a free end', () => {
    const fixed = createFD(1, 401, 1, 0.002, pulse, 'fixed', 'fixed');
    const free = createFD(1, 401, 1, 0.002, pulse, 'free', 'free');
    advanceFD(fixed, 0.6); advanceFD(free, 0.6); // left half has reflected from x = 0 and is now near x = 0.3
    const near = (s: typeof fixed) => s.y[Math.round(0.3 / s.dx)];
    expect(near(fixed)).toBeLessThan(-0.3);
    expect(near(free)).toBeGreaterThan(0.3);
  });
  it('energy is approximately conserved (C = 0.8, 1000 steps, < 2 %)', () => {
    const s = createFD(1, 401, 1, 0.002, pulse);
    advanceFD(s, 0.02); const e0 = fdEnergy(s);
    advanceFD(s, 2.0);
    expect(Math.abs(fdEnergy(s) / e0 - 1)).toBeLessThan(0.02);
  });
  it('result depends on simulated time only, not on how the render loop slices it', () => {
    const a = createFD(1, 201, 1, 0.004, pulse), b = createFD(1, 201, 1, 0.004, pulse);
    advanceFD(a, 0.5);
    for (let i = 0; i < 53; i++) advanceFD(b, 0.5 / 53);
    expect(Math.abs(a.t - b.t)).toBeLessThan(1e-12);
    for (let i = 0; i < a.N; i += 17) expect(a.y[i]).toBe(b.y[i]);
  });
});

describe('media enforce physical propagation speeds', () => {
  it('string: v = √(T/μ) = 100 m/s for 100 N, 0.01 kg/m', () => expect(getMedium('string').speed(st)).toBeCloseTo(100, 12));
  it('dry air: M derived from NSSDC composition = 28.96 g/mol; c(20 °C) ≈ 343 m/s', () => {
    expect(AIR_MOLAR_MASS * 1000).toBeCloseTo(28.96, 1);
    expect(getMedium('air').speed(st)!).toBeCloseTo(343.2, 0);
  });
  it('water (IAPWS-95 via NIST) is ~4.3× faster than air at 20 °C; helium ~2.9×', () => {
    const air = getMedium('air').speed(st)!;
    expect(getMedium('water').speed(st)! / air).toBeGreaterThan(4.2);
    expect(getMedium('helium').speed(st)! / air).toBeGreaterThan(2.8);
  });
  it('vacuum: no sound speed — mechanical waves do not propagate', () => expect(getMedium('vacuum').speed(st)).toBeNull());
  it('outside a table’s temperature range the speed is unknown (null), not extrapolated', () => expect(getMedium('water').speed({ ...st, temperatureK: 400 })).toBeNull());
});

import { migrateExperiment } from '@/shared/notebook';
describe('experiment persistence (discriminated union)', () => {
  it('legacy gravitational records (no kind) migrate unchanged; wave records are recognised; junk is dropped', () => {
    const legacy = { id: 'exp-1', name: 'old', mode: 'gravitational-sandbox', createdAt: '2026-01-01' };
    expect(migrateExperiment(legacy)).toMatchObject({ ...legacy, kind: 'gravitational' });
    expect(migrateExperiment({ id: 'w', kind: 'wave', mode: 'wave-lab', createdAt: 'x' })!.kind).toBe('wave');
    expect(migrateExperiment({ id: 'z', mode: 'unknown' })).toBeNull();
    expect(migrateExperiment(null)).toBeNull();
  });
});
