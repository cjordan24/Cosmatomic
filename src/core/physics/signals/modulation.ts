/**
 * Voyager Physics Engine — modulation and digital communication (Phase 9, Gate 9.4).
 *
 *  AM   x(t) = A_c(1 + m(t)) cos(2πf_c t), |m(t)| < 1; spectrum occupies [f_c − W, f_c + W]; coherent receiver
 *       LPF(x(t) cos 2πf_c t) = (A_c/2)(1 + m(t))                       (Johnson, Fundamentals of EE I, §6.11)
 *  FM   instantaneous frequency f_c + Δf·m(t) (47 CFR §73.310(a)(17): “the instantaneous radio frequency varies in
 *       proportion to the instantaneous amplitude of the modulating signal”); for m(t) = sin 2πf_m t the phase is
 *       β sin 2πf_m t with β = Δf/f_m, and e^{iβ sinθ} = Σ J_n(β) e^{inθ} (NIST DLMF 10.12.1) puts lines at f_c + n f_m with
 *       amplitudes J_n(β). U.S. FM broadcasting defines ±75 kHz deviation as 100 % modulation (§73.310(a)).
 *       J_n(x) = (x/2)^n Σ_k (−x²/4)^k / (k! (n+k)!)  (DLMF 10.2.2, integer order).
 *  BPSK s₀(t) = A sin(2πkt/T), s₁(t) = −s₀(t) per bit interval T; R = 1/T          (Johnson §6.14)
 *  FSK  s₀ = A sin 2πf₀t, s₁ = A sin 2πf₁t with f₀ = k₀/T, f₁ = k₁/T                (Johnson §6.15)
 *  Receiver: correlate r(t) with each s_i over the bit and choose the largest      (Johnson §6.16)
 *  Noise: white, power spectrum N₀/2; error probability p_e = Q(√(∫(s₁ − s₀)²dt / 2N₀))
 *       BPSK p_e = Q(√(2α²E_b/N₀)), FSK p_e = Q(√(α²E_b/N₀))                            (Johnson §§6.8, 6.17, 6.18)
 *  Q(x) = ½ erfc(x/√2), the tail probability of a unit normal variable (erfc: DLMF 7.2.2).
 *  Capacity C = W log₂(1 + SNR) bits/s                                              (Johnson §6.30–6.31, after Shannon 1948)
 */
import { mulberry32 } from '@/core/simulation/random';

// ---------------------------------------------------------------- special functions
/** Integer-order Bessel function J_n(x) by its power series (DLMF 10.2.2); accurate for |x| ≲ 25. */
export function besselJ(n: number, x: number): number {
  if (n < 0) return (n % 2 === 0 ? 1 : -1) * besselJ(-n, x);   // J_{−n} = (−1)^n J_n (DLMF 10.4.1)
  let term = 1;
  for (let k = 1; k <= n; k++) term *= x / 2 / k;               // (x/2)^n / n!
  let sum = term;
  const q = -(x * x) / 4;
  for (let k = 1; k < 200; k++) {
    term *= q / (k * (n + k));
    sum += term;
    if (Math.abs(term) < 1e-17 * Math.abs(sum)) break;
  }
  return sum;
}
/** Complementary error function (Numerical Recipes-style Chebyshev fit, |relative error| < 1.2 × 10⁻⁷). */
export function erfc(x: number): number {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
export const Q = (x: number) => 0.5 * erfc(x / Math.SQRT2);

// ---------------------------------------------------------------- analog modulation
export interface Tone { /** modulating frequency */ fm: number }
export const amSignal = (Ac: number, m: (t: number) => number, fc: number) => (t: number) => Ac * (1 + m(t)) * Math.cos(2 * Math.PI * fc * t);
/** FM with a sinusoidal message of frequency fm and peak deviation df: cos(2πf_c t + β sin 2πf_m t). */
export const fmSignal = (Ac: number, fc: number, fm: number, df: number) => (t: number) => Ac * Math.cos(2 * Math.PI * fc * t + (df / fm) * Math.sin(2 * Math.PI * fm * t));
/** Spectral lines of a tone-modulated FM carrier: amplitudes J_n(β) at f_c + n f_m. */
export function fmLines(beta: number, nMax = 40): { n: number; amp: number }[] {
  return Array.from({ length: 2 * nMax + 1 }, (_, i) => { const n = i - nMax; return { n, amp: besselJ(n, beta) }; });
}
/** Smallest band f_c ± K f_m that holds a fraction `frac` of the FM signal power (Σ J_n² = 1). */
export function fmBandwidth(beta: number, fm: number, frac = 0.99): { K: number; bandwidth: number; fraction: number } {
  let p = besselJ(0, beta) ** 2, K = 0;
  while (p < frac && K < 200) { K++; p += 2 * besselJ(K, beta) ** 2; }
  return { K, bandwidth: 2 * K * fm, fraction: p };
}

// ---------------------------------------------------------------- digital: BPSK and FSK in white noise
export type Scheme = 'bpsk' | 'fsk';
export interface DigitalConfig { scheme: Scheme; /** samples per bit */ spb: number; /** carrier cycles per bit (BPSK k; FSK k₀, k₁ = k₀ + 1) */ k: number; A: number }
/** Waveform of one bit (0 or 1), sampled at spb points over one bit interval T = 1. */
export function bitWaveform(c: DigitalConfig, bit: 0 | 1): Float64Array {
  const w = new Float64Array(c.spb);
  for (let i = 0; i < c.spb; i++) {
    const t = (i + 0.5) / c.spb;
    w[i] = c.scheme === 'bpsk' ? (bit ? -1 : 1) * c.A * Math.sin(2 * Math.PI * c.k * t) : c.A * Math.sin(2 * Math.PI * (bit ? c.k + 1 : c.k) * t);
  }
  return w;
}
/** Energy per bit E_b = ∫s²dt (T = 1). */
export const bitEnergy = (c: DigitalConfig) => bitWaveform(c, 0).reduce((s, v) => s + v * v, 0) / c.spb;
/** Gaussian deviates (Box–Muller) from a seeded generator, so simulations are reproducible. */
export function gaussian(seed: number) {
  const r = mulberry32(seed);
  let spare: number | null = null;
  return () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    let u = 0; while (u === 0) u = r();
    const v = r(), m = Math.sqrt(-2 * Math.log(u));
    spare = m * Math.sin(2 * Math.PI * v);
    return m * Math.cos(2 * Math.PI * v);
  };
}
export interface Simulation { bits: number; errors: number; ber: number; theory: number; /** correlator outputs (decision statistic per bit) */ stats: { bit: 0 | 1; d: number }[]; rx: Float64Array; tx: Float64Array; sentBits: (0 | 1)[] }
/**
 * Send `nBits` random bits through r = s + n, white noise of two-sided power spectrum N₀/2 (sample variance N₀/2 · spb
 * for unit bit duration), and decide with the correlation receiver. Eb/N0 in dB; α = 1 (no channel attenuation).
 */
export function simulate(c: DigitalConfig, ebN0Db: number, nBits: number, seed = 1, keep = 16): Simulation {
  const Eb = bitEnergy(c), N0 = Eb / 10 ** (ebN0Db / 10);
  const sigma = Math.sqrt((N0 / 2) * c.spb);              // discrete-time white noise of PSD N₀/2 at sample spacing 1/spb
  const g = gaussian(seed), bitsRnd = mulberry32(seed ^ 0x9e3779b9);
  const s0 = bitWaveform(c, 0), s1 = bitWaveform(c, 1);
  let errors = 0;
  const stats: Simulation['stats'] = [];
  const tx = new Float64Array(keep * c.spb), rx = new Float64Array(keep * c.spb), sent: (0 | 1)[] = [];
  for (let b = 0; b < nBits; b++) {
    const bit: 0 | 1 = bitsRnd() < 0.5 ? 0 : 1;
    const s = bit ? s1 : s0;
    let c0 = 0, c1 = 0;
    for (let i = 0; i < c.spb; i++) {
      const r = s[i] + sigma * g();
      c0 += r * s0[i]; c1 += r * s1[i];
      if (b < keep) { tx[b * c.spb + i] = s[i]; rx[b * c.spb + i] = r; }
    }
    c0 /= c.spb; c1 /= c.spb;
    const dec: 0 | 1 = c1 > c0 ? 1 : 0;
    if (dec !== bit) errors++;
    if (stats.length < 2000) stats.push({ bit, d: c0 - c1 });
    if (b < keep) sent.push(bit);
  }
  return { bits: nBits, errors, ber: errors / nBits, theory: theoreticalBer(c.scheme, ebN0Db), stats, rx, tx, sentBits: sent };
}
/** Johnson §6.17–6.18 with α = 1: BPSK Q(√(2E_b/N₀)), FSK Q(√(E_b/N₀)). */
export function theoreticalBer(scheme: Scheme, ebN0Db: number): number {
  const r = 10 ** (ebN0Db / 10);
  return scheme === 'bpsk' ? Q(Math.sqrt(2 * r)) : Q(Math.sqrt(r));
}
/** Shannon capacity C = W log₂(1 + SNR) (bits/s). */
export const capacity = (W: number, snr: number) => W * Math.log2(1 + snr);
