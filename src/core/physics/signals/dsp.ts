/**
 * Voyager Physics Engine — discrete-time signal processing (Phase 9, Gates 9.4 and 9.6).
 *
 * Source: D. H. Johnson, Fundamentals of Electrical Engineering I (Rice University / OpenStax CNX, CC BY 1.0), ch. 5:
 *   DFT  S(k) = Σ_{n=0}^{N−1} s(n) e^{−i2πnk/N}, s(n) = (1/N) Σ S(k) e^{i2πnk/N}                           (§5.7)
 *   FFT  (Cooley & Tukey 1965): the length is halved log₂N times, so the cost is O(N log N), not O(N²)    (§5.8, §5.9)
 *   Sampling theorem: the Nyquist frequency 1/2T_s is the highest frequency a signal may contain; above it
 *        components alias to lower apparent frequencies                                                  (§5.3)
 *   Spectrogram: overlapping frames, each multiplied by the Hanning window w(n) = ½(1 − cos(2πn/N)) to
 *        reduce the oscillations a rectangular window causes, then transformed                             (§5.10)
 */
export type CxArr = { re: Float64Array; im: Float64Array };

export const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** In-place iterative radix-2 FFT (decimation in time). Length must be a power of two. */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  if (!isPow2(n) || im.length !== n) throw new RangeError('FFT length must be a power of two');
  for (let i = 1, j = 0; i < n; i++) {            // bit-reversal permutation
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
/** Direct O(N²) DFT, for checking the FFT. */
export function dft(x: ArrayLike<number>): CxArr {
  const n = x.length, re = new Float64Array(n), im = new Float64Array(n);
  for (let k = 0; k < n; k++) for (let t = 0; t < n; t++) { const a = (-2 * Math.PI * t * k) / n; re[k] += x[t] * Math.cos(a); im[k] += x[t] * Math.sin(a); }
  return { re, im };
}

export type WindowKind = 'rectangular' | 'hann';
/** Window w(n), n = 0 … N−1. Hanning (Johnson §5.10): ½(1 − cos(2πn/N)); rectangular: 1. */
export function windowFn(kind: WindowKind, N: number): Float64Array {
  const w = new Float64Array(N);
  for (let n = 0; n < N; n++) w[n] = kind === 'hann' ? 0.5 * (1 - Math.cos((2 * Math.PI * n) / N)) : 1;
  return w;
}

/**
 * One-sided amplitude spectrum of a real signal sampled at fs: bins 0 … N/2 with frequencies k fs/N and the
 * amplitude of a sinusoid (2|S(k)|/Σw, DC and Nyquist not doubled), so a sinusoid of amplitude A reads ≈ A at its bin.
 */
export function amplitudeSpectrum(x: ArrayLike<number>, fs: number, win: WindowKind = 'hann'): { f: Float64Array; amp: Float64Array } {
  const N = x.length;
  const w = windowFn(win, N);
  const re = new Float64Array(N), im = new Float64Array(N);
  let sw = 0;
  for (let i = 0; i < N; i++) { re[i] = x[i] * w[i]; sw += w[i]; }
  fft(re, im);
  const M = N / 2 + 1, f = new Float64Array(M), amp = new Float64Array(M);
  for (let k = 0; k < M; k++) { f[k] = (k * fs) / N; amp[k] = ((k === 0 || k === N / 2 ? 1 : 2) * Math.hypot(re[k], im[k])) / sw; }
  return { f, amp };
}
/** Power spectrum of a complex baseband signal (two-sided, bins shifted so 0 Hz is in the middle). */
export function basebandPower(re0: ArrayLike<number>, im0: ArrayLike<number>, fs: number, win: WindowKind = 'hann'): { f: Float64Array; p: Float64Array } {
  const N = re0.length, w = windowFn(win, N);
  const re = new Float64Array(N), im = new Float64Array(N);
  let sw2 = 0;
  for (let i = 0; i < N; i++) { re[i] = re0[i] * w[i]; im[i] = im0[i] * w[i]; sw2 += w[i] * w[i]; }
  fft(re, im);
  const f = new Float64Array(N), p = new Float64Array(N);
  for (let k = 0; k < N; k++) { const s = (k + N / 2) % N; f[k] = ((k - N / 2) * fs) / N; p[k] = (re[s] ** 2 + im[s] ** 2) / (N * sw2); }
  return { f, p };
}
/** Spectrogram: amplitude spectra (dB) of frames of length N advanced by `hop` samples. */
export function spectrogram(x: ArrayLike<number>, fs: number, N: number, hop: number, win: WindowKind = 'hann'): { t: number[]; f: Float64Array; db: Float32Array[] } {
  const t: number[] = [], db: Float32Array[] = [];
  let f: Float64Array = new Float64Array(0);
  for (let s = 0; s + N <= x.length; s += hop) {
    const frame = Array.prototype.slice.call(x, s, s + N) as number[];
    const sp = amplitudeSpectrum(frame, fs, win);
    f = sp.f;
    db.push(Float32Array.from(sp.amp, (a) => 20 * Math.log10(a + 1e-12)));
    t.push((s + N / 2) / fs);
  }
  return { t, f, db };
}
/** Apparent frequency of a sinusoid of frequency f sampled at fs (aliasing into 0 … fs/2). */
export function aliasFrequency(f: number, fs: number): number {
  const r = ((f % fs) + fs) % fs;
  return r > fs / 2 ? fs - r : r;
}
