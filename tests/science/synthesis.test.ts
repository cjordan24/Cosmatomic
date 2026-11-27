/**
 * Phase 9, Gate 9.6 — Fourier synthesis (Johnson §4.3) and its spectrum (FFT, §5.9).
 */
import { describe, expect, it } from 'vitest';
import { fourierCoefficients, harmonicAmplitude, partialSum, shapeValue, squareB, synthesize } from '@/core/physics/signals/synthesis';
import { amplitudeSpectrum } from '@/core/physics/signals/dsp';

describe('Fourier coefficients', () => {
  it('numerical integrals reproduce the square-wave closed form b_k = 4/(πk), odd k only', () => {
    const c = fourierCoefficients('square', 15);
    for (let k = 1; k <= 15; k++) { expect(c.b[k]).toBeCloseTo(squareB(k), 5); expect(c.a[k]).toBeCloseTo(0, 6); }
    expect(c.a0).toBeCloseTo(0, 9);
  });
  it('a sine has only its fundamental; the half-wave rectified sine has a mean of 1/π and b₁ = ½', () => {
    const s = fourierCoefficients('sine', 6);
    expect(s.b[1]).toBeCloseTo(1, 6); for (let k = 2; k <= 6; k++) expect(harmonicAmplitude(s, k)).toBeLessThan(1e-6);
    const h = fourierCoefficients('half-rectified', 4);
    expect(h.a0).toBeCloseTo(1 / Math.PI, 6); expect(h.b[1]).toBeCloseTo(0.5, 6);
  });
  it('triangle harmonics fall as 1/k², sawtooth as 1/k', () => {
    const t = fourierCoefficients('triangle', 9), w = fourierCoefficients('sawtooth', 9);
    expect(harmonicAmplitude(t, 3) / harmonicAmplitude(t, 1)).toBeCloseTo(1 / 9, 4);
    expect(harmonicAmplitude(w, 3) / harmonicAmplitude(w, 1)).toBeCloseTo(1 / 3, 4);
  });
  it('partial sums converge to the waveform away from its jumps', () => {
    const c = fourierCoefficients('triangle', 201);
    expect(partialSum(c, 201, 0.1)).toBeCloseTo(shapeValue('triangle', 0.1), 3);
  });
});

describe('synthesis and spectrum', () => {
  it('harmonics at or above the Nyquist frequency are left out; the FFT finds the rest at k·f₀ with 4/(πk)', () => {
    const fs = 8192, c = fourierCoefficients('square', 40);
    const { samples, used } = synthesize(c, 40, 256, fs, 1);
    expect(used).toBe(15);   // 15 × 256 = 3840 < 4096 ≤ 16 × 256
    const sp = amplitudeSpectrum(samples, fs, 'rectangular');
    expect(sp.amp[256]).toBeCloseTo(4 / Math.PI, 4);
    expect(sp.amp[3 * 256]).toBeCloseTo(4 / (3 * Math.PI), 4);
    expect(sp.amp[2 * 256]).toBeLessThan(1e-4);
  });
});
