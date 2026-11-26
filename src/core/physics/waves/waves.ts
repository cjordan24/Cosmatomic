/**
 * Voyager Physics Engine — shared wave physics (Gate 4.5). SI units throughout (m, s, Hz, rad).
 *
 * Kinematics:     v = fλ,  T = 1/f,  ω = 2πf,  k = 2π/λ
 * Travelling:     y(x,t) = A sin(kx − ωt + φ)            (direction +1; −1 uses kx + ωt)
 * Superposition:  linear media → y = Σ yᵢ
 * Standing:       string fixed–fixed / pipe open–open  fₙ = n v / 2L
 *                 pipe open–closed (string fixed–free)  fₙ = (2n − 1) v / 4L
 * Beats:          f_beat = |f₁ − f₂|
 * Dispersion:     deep-water gravity waves ω² = g k  → v_g = v_p / 2
 * Doppler (sound, medium at rest): f' = f (v + v_o)/(v − v_s), observer/source velocities positive towards each other
 * Finite differences: explicit leapfrog for ∂²y/∂t² = v² ∂²y/∂x², stable only for Courant C = v Δt/Δx ≤ 1.
 *
 * Mechanical waves need a medium. A vacuum "medium" has no sound speed: models return null and the
 * wave does not propagate. Electromagnetic waves are handled separately (Gate 4.6), not by this model.
 */
export const TAU = 2 * Math.PI;
/** Standard acceleration of gravity, exact by definition (CGPM 1901). */
export const G_STANDARD = 9.80665;

export interface Kinematics { f: number; T: number; omega: number; lambda: number; k: number; v: number }

/** Derive all kinematic quantities from frequency and propagation speed (the independent pair). */
export function kinematics(f: number, v: number): Kinematics {
  if (!(f > 0) || !(v > 0)) throw new RangeError('frequency and speed must be positive');
  return { f, T: 1 / f, omega: TAU * f, lambda: v / f, k: (TAU * f) / v, v };
}
/** Solve frequency for a requested wavelength in a medium of speed v (λ is never set independently). */
export const frequencyForWavelength = (lambda: number, v: number) => v / lambda;

export interface Sinusoid { A: number; f: number; v: number; phi: number; dir: 1 | -1 }
export function sinusoid(w: Sinusoid, x: number, t: number): number {
  const k = (TAU * w.f) / w.v, om = TAU * w.f;
  return w.A * Math.sin(k * x - w.dir * om * t + w.phi);
}
export const superpose = (ws: Sinusoid[], x: number, t: number) => ws.reduce((s, w) => s + sinusoid(w, x, t), 0);

/** Amplitude of two equal-frequency, co-propagating waves with phase difference Δφ: |A₁ + A₂e^{iΔφ}|. */
export const resultantAmplitude = (A1: number, A2: number, dphi: number) => Math.sqrt(A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos(dphi));
export const beatFrequency = (f1: number, f2: number) => Math.abs(f1 - f2);

export type Boundary = 'fixed-fixed' | 'open-open' | 'open-closed';
/** Allowed frequency of mode n (n = 1, 2, …). */
export function modeFrequency(b: Boundary, n: number, L: number, v: number): number {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('mode index must be a positive integer');
  return b === 'open-closed' ? ((2 * n - 1) * v) / (4 * L) : (n * v) / (2 * L);
}
/**
 * Standing-wave displacement (string) or pressure (pipe) for mode n, amplitude A of each travelling component.
 * fixed-fixed: displacement nodes at both ends; open-open: pressure nodes at both ends (cos form for
 * displacement, but we plot PRESSURE so nodes sit at the open ends: p ∝ sin(kx)); open-closed: pressure
 * node at x = 0 (open), antinode at x = L (closed).
 */
export function standingWave(b: Boundary, n: number, L: number, v: number, A: number, x: number, t: number): number {
  const f = modeFrequency(b, n, L, v), k = (TAU * f) / v, om = TAU * f;
  return 2 * A * Math.sin(k * x) * Math.cos(om * t);
}

/** Gaussian wave packet: carrier k0 with envelope width σx; dispersion relation ω(k) given. Computed by superposing M Fourier components. */
export interface Packet { A: number; k0: number; sigmaK: number; omega: (k: number) => number; x0: number }
export function packet(p: Packet, x: number, t: number, M = 81): number {
  let s = 0, norm = 0;
  for (let j = 0; j < M; j++) {
    const k = p.k0 + p.sigmaK * (-4 + (8 * j) / (M - 1));
    const w = Math.exp(-((k - p.k0) ** 2) / (2 * p.sigmaK ** 2));
    s += w * Math.cos(k * (x - p.x0) - p.omega(k) * t);
    norm += w;
  }
  return (p.A * s) / norm;
}
export const nonDispersive = (v: number) => (k: number) => v * k;
export const deepWater = (g = G_STANDARD) => (k: number) => Math.sqrt(g * Math.abs(k));
/** Phase and group velocity from a dispersion relation (numerical derivative). */
export function velocities(omega: (k: number) => number, k: number) {
  const h = k * 1e-6;
  return { phase: omega(k) / k, group: (omega(k + h) - omega(k - h)) / (2 * h) };
}

/** Acoustic Doppler shift (medium at rest). vs: source speed towards observer; vo: observer speed towards source. */
export function doppler(f: number, v: number, vs: number, vo: number): number | null {
  if (vs >= v) return null; // supersonic source: shock cone, formula invalid
  return (f * (v + vo)) / (v - vs);
}

/** Amplitude attenuation A(x) = A₀ e^(−αx), α in Np/m. */
export const attenuated = (A0: number, alpha: number, x: number) => A0 * Math.exp(-alpha * x);

/** Two coherent point sources in a plane (2D, cylindrical spreading ignored → shows the interference pattern only). */
export function twoSourceField(x: number, y: number, t: number, s1: [number, number], s2: [number, number], k: number, omega: number, dphi = 0): number {
  const r1 = Math.hypot(x - s1[0], y - s1[1]), r2 = Math.hypot(x - s2[0], y - s2[1]);
  return Math.sin(k * r1 - omega * t) + Math.sin(k * r2 - omega * t + dphi);
}

// ---------------------------------------------------------------- finite-difference string
export type FDBoundary = 'fixed' | 'free';
export interface FDString { N: number; dx: number; v: number; dt: number; y: Float64Array; yPrev: Float64Array; t: number; left: FDBoundary; right: FDBoundary; carry: number }
export class CourantError extends Error {}

export const courant = (v: number, dt: number, dx: number) => (v * dt) / dx;

/** Create a string of length L with N points, initial displacement y0(x), at rest. Rejects unstable time steps. */
export function createFD(L: number, N: number, v: number, dt: number, y0: (x: number) => number, left: FDBoundary = 'fixed', right: FDBoundary = 'fixed'): FDString {
  const dx = L / (N - 1);
  const C = courant(v, dt, dx);
  if (C > 1) throw new CourantError(`Courant number ${C.toFixed(3)} > 1: explicit scheme unstable (reduce Δt or increase Δx)`);
  const y = new Float64Array(N);
  for (let i = 0; i < N; i++) y[i] = y0(i * dx);
  // first step for a string initially at rest: y(−dt) = y(0) + O(dt²) symmetric start
  const yPrev = Float64Array.from(y);
  const s: FDString = { N, dx, v, dt, y, yPrev, t: 0, left, right, carry: 0 };
  applyBC(s, s.y); applyBC(s, s.yPrev);
  // half-step correction for a zero initial velocity: yPrev = y + (C²/2) Δ²y
  const c2 = C * C, tmp = Float64Array.from(y);
  for (let i = 1; i < N - 1; i++) tmp[i] = y[i] + 0.5 * c2 * (y[i + 1] - 2 * y[i] + y[i - 1]);
  applyBC(s, tmp); s.yPrev = tmp;
  return s;
}
function applyBC(s: FDString, a: Float64Array) {
  if (s.left === 'fixed') a[0] = 0; else a[0] = a[1];
  if (s.right === 'fixed') a[s.N - 1] = 0; else a[s.N - 1] = a[s.N - 2];
}
export function stepFD(s: FDString) {
  const c2 = courant(s.v, s.dt, s.dx) ** 2;
  const next = new Float64Array(s.N);
  for (let i = 1; i < s.N - 1; i++) next[i] = 2 * s.y[i] - s.yPrev[i] + c2 * (s.y[i + 1] - 2 * s.y[i] + s.y[i - 1]);
  applyBC(s, next);
  s.yPrev = s.y; s.y = next; s.t += s.dt;
}
/** Advance a span of simulated time in fixed Δt steps (remainder carried) — independent of render rate. */
export function advanceFD(s: FDString, span: number, maxSteps = 200000) {
  let t = s.carry + span, n = 0;
  while (t >= s.dt - 1e-15 && n < maxSteps) { stepFD(s); t -= s.dt; n++; }
  s.carry = t;
  return n;
}
/** Discrete energy proxy: Σ [(Δy/Δt)² + v²(Δy/Δx)²] Δx / 2 (per unit linear density). */
export function fdEnergy(s: FDString): number {
  let e = 0;
  for (let i = 0; i < s.N - 1; i++) {
    const vel = (s.y[i] - s.yPrev[i]) / s.dt;
    const grad = (s.y[i + 1] - s.y[i]) / s.dx;
    e += 0.5 * (vel * vel + s.v * s.v * grad * grad) * s.dx;
  }
  return e;
}
