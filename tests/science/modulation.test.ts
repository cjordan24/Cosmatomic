/**
 * Phase 9, Gate 9.4 — modulation lab. AM (Johnson §6.11), FM lines J_n(β) (DLMF 10.12.1), BPSK/FSK bit-error rates
 * against Johnson §§6.17–6.18, Shannon capacity (Johnson §6.31).
 */
import { describe, expect, it } from 'vitest';
import { Q, amSignal, besselJ, capacity, erfc, fmBandwidth, fmLines, fmSignal, simulate, theoreticalBer } from '@/core/physics/signals/modulation';
import { amplitudeSpectrum } from '@/core/physics/signals/dsp';

describe('special functions (NIST DLMF)', () => {
  it('erfc and Q: erfc(0) = 1, Q(0) = ½, Q is the unit-normal tail', () => {
    expect(erfc(0)).toBeCloseTo(1, 7);
    expect(Q(0)).toBeCloseTo(0.5, 7);
    // numerical tail integral of the unit normal density
    const tail = (x: number) => { let s = 0; const h = 1e-3; for (let t = x; t < 12; t += h) s += Math.exp(-((t + h / 2) ** 2) / 2) * h; return s / Math.sqrt(2 * Math.PI); };
    for (const x of [0.5, 1, 2, 3]) expect(Q(x) / tail(x)).toBeCloseTo(1, 5);
  });
  it('J_n: J₀(0) = 1, J_{−n} = (−1)ⁿJ_n (10.4.1), recurrence J_{n−1} + J_{n+1} = (2n/x)J_n, Σ = 1 (10.23.3)', () => {
    expect(besselJ(0, 0)).toBe(1); expect(besselJ(3, 0)).toBe(0);
    expect(besselJ(-3, 1.7)).toBeCloseTo(-besselJ(3, 1.7), 14);
    for (const x of [0.7, 2.4, 5, 9]) {
      for (const n of [1, 2, 5]) expect(besselJ(n - 1, x) + besselJ(n + 1, x)).toBeCloseTo(((2 * n) / x) * besselJ(n, x), 10);
      let s = besselJ(0, x) ** 2; for (let k = 1; k < 60; k++) s += 2 * besselJ(k, x) ** 2;
      expect(s).toBeCloseTo(1, 12);
    }
  });
});

describe('analog modulation', () => {
  it('AM with a tone: carrier A_c and two sidebands of A_c m/2 at f_c ± f_m (spectrum by FFT)', () => {
    const fs = 8192, N = 8192, fc = 1000, fm = 100, m = 0.6;
    const x = Float64Array.from({ length: N }, (_, n) => amSignal(1, (t) => m * Math.cos(2 * Math.PI * fm * t), fc)(n / fs));
    const s = amplitudeSpectrum(x, fs, 'rectangular');
    expect(s.amp[fc]).toBeCloseTo(1, 6);
    expect(s.amp[fc - fm]).toBeCloseTo(m / 2, 6); expect(s.amp[fc + fm]).toBeCloseTo(m / 2, 6);
    expect(s.amp[fc + 2 * fm]).toBeLessThan(1e-9);
  });
  it('FM with a tone: the FFT finds lines at f_c + n f_m with amplitudes |J_n(β)| (DLMF 10.12.1)', () => {
    const fs = 16384, N = 16384, fc = 4000, fm = 200, beta = 2.4;
    const x = Float64Array.from({ length: N }, (_, n) => fmSignal(1, fc, fm, beta * fm)(n / fs));
    const s = amplitudeSpectrum(x, fs, 'rectangular');
    for (const { n, amp } of fmLines(beta, 6)) expect(s.amp[fc + n * fm]).toBeCloseTo(Math.abs(amp), 6);
  });
  it('the 99 % power bandwidth grows with the deviation; at 100 % U.S. broadcast modulation (±75 kHz) and a 15 kHz tone β = 5', () => {
    const narrow = fmBandwidth(0.2, 15e3), wide = fmBandwidth(75e3 / 15e3, 15e3);
    expect(narrow.K).toBe(1);
    expect(wide.bandwidth).toBeGreaterThan(2 * 75e3);
    expect(wide.fraction).toBeGreaterThanOrEqual(0.99);
  });
});

describe('digital communication in white noise (Johnson §§6.14–6.18)', () => {
  it('theory: BPSK beats FSK by 3 dB (p_e = Q(√(2E_b/N₀)) vs Q(√(E_b/N₀)))', () => {
    expect(theoreticalBer('bpsk', 6)).toBeCloseTo(theoreticalBer('fsk', 6 + 10 * Math.log10(2)), 12);
    expect(theoreticalBer('bpsk', 9.6)).toBeLessThan(1.1e-5);
  });
  for (const scheme of ['bpsk', 'fsk'] as const) it(`${scheme}: simulated bit-error rate agrees with theory within 4σ`, () => {
    for (const eb of [0, 4]) {
      const n = 40000, sim = simulate({ scheme, spb: 16, k: 2, A: 1 }, eb, n, 11);
      const p = sim.theory, sd = Math.sqrt((p * (1 - p)) / n);
      expect(Math.abs(sim.ber - p), `${scheme} ${eb} dB: ${sim.ber} vs ${p}`).toBeLessThan(4 * sd);
    }
  });
  it('noise-free bits are all decided correctly; the correlator separates them by the bit energy', () => {
    const sim = simulate({ scheme: 'bpsk', spb: 16, k: 2, A: 1 }, 200, 500, 3);
    expect(sim.errors).toBe(0);
    for (const s of sim.stats.slice(0, 20)) expect(Math.abs(s.d)).toBeCloseTo(1, 6);   // c₀ − c₁ = ±2E_b with E_b = ½
  });
});

describe('Shannon capacity (Johnson §6.31)', () => {
  it('a 3 kHz telephone channel at 30 dB: C = 29.901 kbps (Johnson’s example)', () => {
    expect(capacity(3e3, 1e3) / 1e3).toBeCloseTo(29.901, 2);   // 29.9017 kbps; the text truncates to 29.901
  });
});
