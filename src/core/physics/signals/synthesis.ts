/**
 * Voyager Physics Engine — Fourier synthesis of periodic waveforms (Phase 9, Gate 9.6).
 *
 * Johnson, Fundamentals of Electrical Engineering I, §4.3 (classic Fourier series):
 *   s(t) = a₀ + Σ a_k cos(2πkt/T) + Σ b_k sin(2πkt/T),
 *   a₀ = (1/T)∫₀ᵀ s dt,  a_k = (2/T)∫₀ᵀ s cos(2πkt/T) dt,  b_k = (2/T)∫₀ᵀ s sin(2πkt/T) dt.
 *   Unit-amplitude square wave: b_k = 4/(πk) for odd k, 0 otherwise (closed form, used to check the integrals).
 * Coefficients of the other shapes are computed here by numerical integration of those formulas over one period.
 */
export type Shape = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'half-rectified';
export const SHAPE_LABEL: Record<Shape, string> = { sine: 'Sine', square: 'Square', sawtooth: 'Sawtooth', triangle: 'Triangle', 'half-rectified': 'Half-wave rectified sine' };

/** One period of each shape, u = t/T ∈ [0, 1). Peak amplitude 1. */
export function shapeValue(s: Shape, u: number): number {
  const x = u - Math.floor(u);
  switch (s) {
    case 'sine': return Math.sin(2 * Math.PI * x);
    case 'square': return x < 0.5 ? 1 : -1;
    case 'sawtooth': return x < 0.5 ? 2 * x : 2 * x - 2;                 // rises from 0 to 1, jumps to −1, rises to 0
    case 'triangle': return x < 0.25 ? 4 * x : x < 0.75 ? 2 - 4 * x : 4 * x - 4;
    case 'half-rectified': return x < 0.5 ? Math.sin(2 * Math.PI * x) : 0;   // Johnson §4.3 example
  }
}
export interface Coeffs { a0: number; a: Float64Array; b: Float64Array }
/** a_k, b_k for k = 1 … K by the midpoint rule with M samples per period. */
export function fourierCoefficients(s: Shape, K: number, M = 8192): Coeffs {
  const a = new Float64Array(K + 1), b = new Float64Array(K + 1);
  let a0 = 0;
  for (let i = 0; i < M; i++) {
    const u = (i + 0.5) / M, v = shapeValue(s, u);
    a0 += v;
    for (let k = 1; k <= K; k++) { a[k] += v * Math.cos(2 * Math.PI * k * u); b[k] += v * Math.sin(2 * Math.PI * k * u); }
  }
  for (let k = 1; k <= K; k++) { a[k] *= 2 / M; b[k] *= 2 / M; }
  return { a0: a0 / M, a, b };
}
/** Closed form for the square wave (Johnson §4.3). */
export const squareB = (k: number) => (k % 2 === 1 ? 4 / (Math.PI * k) : 0);
/** Partial sum with harmonics 1 … n at u = t/T. */
export function partialSum(c: Coeffs, n: number, u: number): number {
  let v = c.a0;
  for (let k = 1; k <= n && k < c.a.length; k++) v += c.a[k] * Math.cos(2 * Math.PI * k * u) + c.b[k] * Math.sin(2 * Math.PI * k * u);
  return v;
}
/** Amplitude of harmonic k: √(a_k² + b_k²). */
export const harmonicAmplitude = (c: Coeffs, k: number) => Math.hypot(c.a[k], c.b[k]);
/** Samples of the partial sum at sample rate fs for duration d (s), fundamental f0; harmonics at or above fs/2 are left out (they would alias, §5.3). */
export function synthesize(c: Coeffs, n: number, f0: number, fs: number, d: number): { samples: Float32Array; used: number } {
  const used = Math.max(0, Math.min(n, Math.floor((fs / 2 - 1e-9) / f0)));
  const N = Math.round(fs * d), out = new Float32Array(N);
  for (let i = 0; i < N; i++) out[i] = partialSum(c, used, (f0 * i) / fs);
  return { samples: out, used };
}
