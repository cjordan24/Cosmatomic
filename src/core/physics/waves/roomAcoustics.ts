/**
 * Voyager Physics Engine — room acoustics and resonance (Phase 9, Gate 9.7). SI units.
 *
 * Normal modes of a rigid rectangular room (Rayleigh, The Theory of Sound, Vol. II, 2nd ed., 1896, §267): the velocity potential
 *   φ = cos(pπx/α) cos(qπy/β) cos(rπz/γ) cos(kat) satisfies the wave equation and ∂φ/∂n = 0 on all six walls when
 *   k² = π²(p²/α² + q²/β² + r²/γ²), p, q, r = 0, 1, 2, …; with a the speed of sound the frequency is
 *   f = ka/2π = (a/2)√((p/α)² + (q/β)² + (r/γ)²). The gravest mode runs along the longest edge (p = 1, q = r = 0).
 * Reverberation (W. C. Sabine, Collected Papers on Acoustics, 1922): the duration of the residual sound after a source
 *   producing 10⁶ times the minimum audible intensity stops is t = K·V/a with K = 0.164 (V in m³; a, the absorbing
 *   power, in square metres of open window, a = Σ (area × coefficient)). Sabine's coefficients were measured at
 *   512 vibrations per second. A 10⁶ intensity ratio is a 60 dB decay.
 * Numerical check: a 2-D finite-difference (leapfrog) solution of the pressure wave equation p_tt = c²∇²p in a rigid
 *   rectangle (zero normal gradient at the walls, mirrored ghost cells), stable for c Δt √(1/Δx² + 1/Δy²) ≤ 1; the
 *   spectrum of a probe signal shows the room's modes at the analytic frequencies (q, r restricted to the plane).
 * Validity: rigid, perfectly reflecting walls for the modes; Sabine's formula assumes a diffuse sound field and does not
 *   hold for very absorbent rooms; the FDTD solver is lossless and two-dimensional.
 */
export interface RoomDims { L: number; W: number; H: number }
export type ModeKind = 'axial' | 'tangential' | 'oblique';
export interface Mode { p: number; q: number; r: number; f: number; kind: ModeKind }

export const modeFrequency = (d: RoomDims, c: number, p: number, q: number, r: number) => (c / 2) * Math.hypot(p / d.L, q / d.W, r / d.H);
const kindOf = (p: number, q: number, r: number): ModeKind => { const n = [p, q, r].filter((x) => x > 0).length; return n === 1 ? 'axial' : n === 2 ? 'tangential' : 'oblique'; };
/** All modes below fMax, sorted by frequency (the (0,0,0) uniform pressure is excluded). */
export function roomModes(d: RoomDims, c: number, fMax: number): Mode[] {
  const out: Mode[] = [];
  const P = Math.ceil((2 * fMax * d.L) / c), Q = Math.ceil((2 * fMax * d.W) / c), R = Math.ceil((2 * fMax * d.H) / c);
  for (let p = 0; p <= P; p++) for (let q = 0; q <= Q; q++) for (let r = 0; r <= R; r++) {
    if (p + q + r === 0) continue;
    const f = modeFrequency(d, c, p, q, r);
    if (f <= fMax) out.push({ p, q, r, f, kind: kindOf(p, q, r) });
  }
  return out.sort((a, b) => a.f - b.f);
}
/** Pressure shape of a mode at (x, y, z): cos(pπx/L) cos(qπy/W) cos(rπz/H). */
export const modeShape = (d: RoomDims, m: Mode, x: number, y: number, z: number) =>
  Math.cos((m.p * Math.PI * x) / d.L) * Math.cos((m.q * Math.PI * y) / d.W) * Math.cos((m.r * Math.PI * z) / d.H);

// ---------------------------------------------------------------- Sabine reverberation
export const SABINE_K = 0.164;   // s/m, Sabine's adopted value (V in m³, absorbing power in m² of open window)
export interface Surface { label: string; area: number; coefficient: number }
export const absorbingPower = (surfaces: Surface[]) => surfaces.reduce((s, x) => s + x.area * x.coefficient, 0);
export const sabineTime = (V: number, a: number) => (a > 0 ? (SABINE_K * V) / a : Infinity);
/** Sabine's coefficients (absorbing power per m², unit = 1 m² of open window; C4 = 512 vibrations per second). */
export const SABINE_COEFFICIENTS: { id: string; label: string; value: number; per: 'm²' | 'person' | 'seat'; table: string }[] = [
  { id: 'open-window', label: 'Open window', value: 1.0, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'wood-sheathing', label: 'Wood sheathing (hard pine)', value: 0.061, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'plaster-wood-lath', label: 'Plaster on wood lath', value: 0.034, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'plaster-wire-lath', label: 'Plaster on wire lath', value: 0.033, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'glass', label: 'Glass, single thickness', value: 0.027, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'plaster-tile', label: 'Plaster on tile', value: 0.025, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'brick-cement', label: 'Brick set in Portland cement', value: 0.025, per: 'm²', table: 'Absorbing power of wall-surfaces' },
  { id: 'audience-m2', label: 'Audience, per square metre', value: 0.96, per: 'm²', table: 'Absorbing power of an audience' },
  { id: 'audience-person', label: 'Audience, per person', value: 0.44, per: 'person', table: 'Absorbing power of an audience' },
  { id: 'oil-paintings', label: 'Oil paintings, inclusive of frames', value: 0.28, per: 'm²', table: 'Miscellaneous' },
  { id: 'carpet-rugs', label: 'Carpet rugs', value: 0.20, per: 'm²', table: 'Miscellaneous' },
  { id: 'oriental-rugs', label: 'Oriental rugs, extra heavy', value: 0.29, per: 'm²', table: 'Miscellaneous' },
  { id: 'cretonne', label: 'Cretonne cloth', value: 0.15, per: 'm²', table: 'Miscellaneous' },
  { id: 'hairfelt', label: 'Hairfelt, 2.5 cm thick, 8 cm from wall', value: 0.78, per: 'm²', table: 'Miscellaneous' },
  { id: 'cork', label: 'Cork, 2.5 cm thick, loose on floor', value: 0.16, per: 'm²', table: 'Miscellaneous' },
  { id: 'linoleum', label: 'Linoleum, loose on floor', value: 0.12, per: 'm²', table: 'Miscellaneous' },
];

// ---------------------------------------------------------------- 2-D FDTD pressure field
export interface Fdtd2D { nx: number; ny: number; dx: number; dy: number; dt: number; c: number; p: Float64Array; pPrev: Float64Array; t: number }
export const courant2D = (c: number, dt: number, dx: number, dy: number) => c * dt * Math.sqrt(1 / (dx * dx) + 1 / (dy * dy));
export function createFdtd(L: number, W: number, nx: number, c: number, courant = 0.5): Fdtd2D {
  const dx = L / nx, ny = Math.max(2, Math.round(W / dx)), dy = W / ny;
  const dt = courant / (c * Math.sqrt(1 / (dx * dx) + 1 / (dy * dy)));
  return { nx, ny, dx, dy, dt, c, p: new Float64Array(nx * ny), pPrev: new Float64Array(nx * ny), t: 0 };
}
/** Gaussian pressure pulse of width σ (m) at (x0, y0), at rest. */
export function addPulse(s: Fdtd2D, x0: number, y0: number, sigma: number, amp = 1) {
  for (let j = 0; j < s.ny; j++) for (let i = 0; i < s.nx; i++) {
    const x = (i + 0.5) * s.dx, y = (j + 0.5) * s.dy, v = amp * Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * sigma * sigma));
    s.p[j * s.nx + i] += v; s.pPrev[j * s.nx + i] += v;
  }
}
/** One leapfrog step; rigid walls via mirrored neighbours (zero normal gradient at cell faces). */
export function stepFdtd(s: Fdtd2D) {
  const { nx, ny, p, pPrev } = s, cx = (s.c * s.dt / s.dx) ** 2, cy = (s.c * s.dt / s.dy) ** 2;
  const next = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const jm = j > 0 ? j - 1 : 0, jp = j < ny - 1 ? j + 1 : ny - 1;
    for (let i = 0; i < nx; i++) {
      const im = i > 0 ? i - 1 : 0, ip = i < nx - 1 ? i + 1 : nx - 1, k = j * nx + i;
      next[k] = 2 * p[k] - pPrev[k] + cx * (p[j * nx + ip] - 2 * p[k] + p[j * nx + im]) + cy * (p[jp * nx + i] - 2 * p[k] + p[jm * nx + i]);
    }
  }
  s.pPrev = p; s.p = next; s.t += s.dt;
}
export const sampleAt = (s: Fdtd2D, x: number, y: number) => s.p[Math.min(s.ny - 1, Math.floor(y / s.dy)) * s.nx + Math.min(s.nx - 1, Math.floor(x / s.dx))];
