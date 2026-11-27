/**
 * Phase 9, Gate 9.7 — room acoustics. Rayleigh §267 room modes, Sabine reverberation, and a 2-D finite-difference
 * solver whose spectrum must show the analytic modes.
 */
import { describe, expect, it } from 'vitest';
import { SABINE_COEFFICIENTS, SABINE_K, absorbingPower, addPulse, courant2D, createFdtd, modeFrequency, roomModes, sabineTime, sampleAt, stepFdtd } from '@/core/physics/waves/roomAcoustics';
import { amplitudeSpectrum } from '@/core/physics/signals/dsp';

describe('room modes (Rayleigh §267)', () => {
  const d = { L: 6, W: 4, H: 3 }, c = 343;
  it('f = (c/2)√((p/L)² + (q/W)² + (r/H)²); the gravest mode runs along the longest edge', () => {
    const m = roomModes(d, c, 200);
    expect(m[0]).toMatchObject({ p: 1, q: 0, r: 0, kind: 'axial' });
    expect(m[0].f).toBeCloseTo(c / 12, 10);
    for (let i = 1; i < m.length; i++) expect(m[i].f).toBeGreaterThanOrEqual(m[i - 1].f);
    expect(m.find((x) => x.p === 1 && x.q === 1 && x.r === 1)!.kind).toBe('oblique');
  });
  it('cubical box: λ = 2a, √2 a, 2a/√3 for (1,0,0), (1,1,0), (1,1,1) (Rayleigh eq. 7)', () => {
    const a = 2, cube = { L: a, W: a, H: a };
    expect(c / modeFrequency(cube, c, 1, 0, 0)).toBeCloseTo(2 * a, 12);
    expect(c / modeFrequency(cube, c, 1, 1, 0)).toBeCloseTo(Math.SQRT2 * a, 12);
    expect(c / modeFrequency(cube, c, 1, 1, 1)).toBeCloseTo((2 * a) / Math.sqrt(3), 12);
  });
  it('the number of modes below f grows roughly as f³ (dense at high frequency)', () => {
    expect(roomModes(d, c, 200).length / roomModes(d, c, 100).length).toBeGreaterThan(4);
  });
});

describe('Sabine reverberation', () => {
  it('t = 0.164 V/a; doubling the absorbing power halves the time; a closed box of open windows', () => {
    expect(SABINE_K).toBe(0.164);
    expect(sabineTime(1000, 100)).toBeCloseTo(1.64, 12);
    expect(sabineTime(1000, 200)).toBeCloseTo(0.82, 12);
    expect(sabineTime(100, 0)).toBe(Infinity);
  });
  it('absorbing power sums area × coefficient (Sabine’s Boston Public Library check: 70 m² × .061 = 4.3, 72 m² × .027 = 1.9)', () => {
    const wood = SABINE_COEFFICIENTS.find((x) => x.id === 'wood-sheathing')!.value, glass = SABINE_COEFFICIENTS.find((x) => x.id === 'glass')!.value;
    expect(absorbingPower([{ label: 'pine platform', area: 70, coefficient: wood }])).toBeCloseTo(4.3, 1);
    expect(absorbingPower([{ label: 'windows', area: 72, coefficient: glass }])).toBeCloseTo(1.9, 1);
    for (const x of SABINE_COEFFICIENTS) { expect(x.value).toBeGreaterThan(0); expect(x.value).toBeLessThanOrEqual(1); }
  });
});

describe('2-D finite-difference room (numerical check)', () => {
  it('is created at a stable Courant number', () => {
    const s = createFdtd(4, 3, 40, 343, 0.5);
    expect(courant2D(343, s.dt, s.dx, s.dy)).toBeCloseTo(0.5, 9);
  });
  it('a pulse in a rigid 4 m × 3 m room rings at the analytic modes (1,0) and (0,1) within 2 %', () => {
    const c = 343, s = createFdtd(4, 3, 40, c, 0.5);
    addPulse(s, 0.9, 0.8, 0.15);
    const fsamp = 1 / s.dt, n = 4096, sig = new Float64Array(n);
    for (let i = 0; i < n; i++) { stepFdtd(s); sig[i] = sampleAt(s, 3.6, 2.7); }
    const sp = amplitudeSpectrum(sig, fsamp, 'hann');
    const peakNear = (f: number) => { let best = -1, bf = 0; for (let k = 1; k < sp.f.length; k++) if (Math.abs(sp.f[k] - f) < 0.15 * f && sp.amp[k] > best) { best = sp.amp[k]; bf = sp.f[k]; } return bf; };
    const f10 = (c / 2) / 4, f01 = (c / 2) / 3;
    expect(Math.abs(peakNear(f10) / f10 - 1)).toBeLessThan(0.02 + sp.f[1] / f10);
    expect(Math.abs(peakNear(f01) / f01 - 1)).toBeLessThan(0.02 + sp.f[1] / f01);
  });
});
