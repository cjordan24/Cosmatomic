/**
 * Phases 9.4/9.6 — discrete-time signal processing (Johnson, Fundamentals of Electrical Engineering I, ch. 5).
 */
import { describe, expect, it } from 'vitest';
import { aliasFrequency, amplitudeSpectrum, basebandPower, dft, fft, spectrogram, windowFn } from '@/core/physics/signals/dsp';

describe('FFT', () => {
  it('equals the direct DFT (§5.7) for a random signal', () => {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
    const x = Array.from({ length: 64 }, rnd);
    const re = Float64Array.from(x), im = new Float64Array(64);
    fft(re, im);
    const d = dft(x);
    for (let k = 0; k < 64; k++) { expect(re[k]).toBeCloseTo(d.re[k], 10); expect(im[k]).toBeCloseTo(d.im[k], 10); }
  });
  it('inverse FFT restores the signal; Parseval: Σ|s|² = (1/N) Σ|S|²', () => {
    const x = Float64Array.from({ length: 128 }, (_, n) => Math.sin(n / 3) + 0.2 * Math.cos(n * 1.7));
    const re = Float64Array.from(x), im = new Float64Array(128);
    fft(re, im);
    const e1 = x.reduce((s, v) => s + v * v, 0), e2 = re.reduce((s, v, k) => s + v * v + im[k] * im[k], 0) / 128;
    expect(e2).toBeCloseTo(e1, 9);
    fft(re, im, true);
    for (let n = 0; n < 128; n++) expect(re[n]).toBeCloseTo(x[n], 12);
  });
  it('rejects lengths that are not powers of two', () => { expect(() => fft(new Float64Array(6), new Float64Array(6))).toThrow(); });
});

describe('spectra, windows, sampling', () => {
  it('Hanning window ½(1 − cos 2πn/N) (§5.10): zero at n = 0, one at n = N/2', () => {
    const w = windowFn('hann', 16); expect(w[0]).toBe(0); expect(w[8]).toBeCloseTo(1, 15);
  });
  it('a sinusoid of amplitude A on a bin reads A at its frequency (rectangular and Hanning)', () => {
    const fs = 1024, N = 1024, f0 = 100, A = 0.7;
    const x = Float64Array.from({ length: N }, (_, n) => A * Math.sin((2 * Math.PI * f0 * n) / fs));
    for (const w of ['rectangular', 'hann'] as const) { const s = amplitudeSpectrum(x, fs, w); expect(s.f[100]).toBe(100); expect(s.amp[100]).toBeCloseTo(A, 6); }
  });
  it('Hanning reduces leakage of an off-bin tone far from the peak', () => {
    const fs = 1024, N = 1024;
    const x = Float64Array.from({ length: N }, (_, n) => Math.sin((2 * Math.PI * 100.5 * n) / fs));
    const r = amplitudeSpectrum(x, fs, 'rectangular'), h = amplitudeSpectrum(x, fs, 'hann');
    expect(h.amp[200]).toBeLessThan(r.amp[200] / 100);
  });
  it('aliasing: 7 kHz sampled at 10 kHz appears at 3 kHz; below the Nyquist frequency nothing changes', () => {
    expect(aliasFrequency(7000, 10000)).toBe(3000);
    expect(aliasFrequency(4000, 10000)).toBe(4000);
    expect(aliasFrequency(12000, 10000)).toBe(2000);
  });
  it('baseband power spectrum is centred on 0 Hz and sums to the mean power', () => {
    const N = 256, fs = 256;
    const re = Float64Array.from({ length: N }, (_, n) => Math.cos((2 * Math.PI * 20 * n) / fs)), im = Float64Array.from({ length: N }, (_, n) => Math.sin((2 * Math.PI * 20 * n) / fs));
    const s = basebandPower(re, im, fs, 'rectangular');
    const k = s.p.indexOf(Math.max(...s.p));
    expect(s.f[k]).toBe(20);
    expect(s.p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });
  it('spectrogram frames track a frequency step', () => {
    const fs = 8000, x = Float64Array.from({ length: 8000 }, (_, n) => Math.sin(2 * Math.PI * (n < 4000 ? 500 : 1500) * n / fs));
    const sg = spectrogram(x, fs, 256, 128);
    const peak = (fr: Float32Array) => sg.f[fr.indexOf(Math.max(...fr))];
    expect(Math.abs(peak(sg.db[2]) - 500)).toBeLessThan(40);
    expect(Math.abs(peak(sg.db[sg.db.length - 3]) - 1500)).toBeLessThan(40);
  });
});
