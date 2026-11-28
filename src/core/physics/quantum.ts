/**
 * Quantum lab (Phase 14, Gate 14.2): the one-dimensional time-independent Schrödinger equation
 *   −(ħ²/2m) ψ″ + V(x) ψ = E ψ
 * solved numerically and checked against its exact solutions.
 *
 *  - Finite differences on a uniform grid with ψ = 0 at both ends: a symmetric tridiagonal matrix with diagonal
 *    ħ²/(m dx²) + Vᵢ and off-diagonal −ħ²/(2m dx²). Eigenvalues by Sturm-sequence bisection (exact count of
 *    eigenvalues below a trial energy), eigenvectors by inverse iteration — no library, deterministic.
 *  - Exact checks: the infinite square well Eₙ = n²h²/(8mL²); the harmonic oscillator Eₙ = (n + ½)hν.
 *  - Tunnelling: transmission through any piecewise-constant potential by transfer matrices (continuity of ψ and
 *    ψ′ at each step), and the closed form for one rectangular barrier as a check.
 *
 * Units: energies in eV, lengths in nm, masses in electron masses; ħ²/(2mₑ) in eV·nm² from CODATA constants.
 */
import { CONSTANTS } from '@/core/constants/constants';

const { hbar, me, e, h } = { hbar: CONSTANTS.hbar.value, me: CONSTANTS.me.value, e: CONSTANTS.e.value, h: CONSTANTS.h.value };
/** ħ²/(2mₑ) in eV·nm² (≈ 0.0381). */
export const HB2M = (hbar * hbar) / (2 * me) / e * 1e18;

/** Infinite square well: Eₙ = n²h²/(8mL²), eV, L in nm, m in electron masses. */
export const boxEnergyEV = (n: number, Lnm: number, mRel = 1) => (n * n * h * h) / (8 * mRel * me * (Lnm * 1e-9) ** 2) / e;
/** Harmonic oscillator: Eₙ = (n + ½)ħω, with ħω in eV. */
export const oscillatorEnergyEV = (n: number, hbarOmegaEV: number) => (n + 0.5) * hbarOmegaEV;
/** Potential ½mω²x² in eV for ħω (eV), x (nm), m (electron masses): ½(ħω)² x² / (2·HB2M/m) … written out. */
export const oscillatorPotentialEV = (xnm: number, hbarOmegaEV: number, mRel = 1) => (mRel * hbarOmegaEV * hbarOmegaEV * xnm * xnm) / (4 * HB2M);

export interface Grid { x: number[]; dx: number }
export const grid = (a: number, b: number, n: number): Grid => {
  const dx = (b - a) / (n + 1);
  return { x: Array.from({ length: n }, (_, i) => a + (i + 1) * dx), dx };
};

/** Number of eigenvalues of the tridiagonal (d, off) below E (Sturm sequence). */
function countBelow(d: number[], off: number, E: number): number {
  let q = d[0] - E, c = q < 0 ? 1 : 0;
  for (let i = 1; i < d.length; i++) {
    q = d[i] - E - (off * off) / (q === 0 ? 1e-300 : q);
    if (q < 0) c++;
  }
  return c;
}

/** Lowest k eigenvalues (eV) and normalised eigenvectors for V (eV) on the grid (nm), mass in electron masses. */
export function solve1D(V: number[], dx: number, k: number, mRel = 1): { E: number[]; psi: number[][] } {
  const t = HB2M / mRel / (dx * dx);
  const d = V.map((v) => 2 * t + v), off = -t;
  let lo = Math.min(...d) - 2 * Math.abs(off), hi = Math.max(...d) + 2 * Math.abs(off);
  const E: number[] = [];
  for (let j = 0; j < k; j++) {
    let a = lo, b = hi;
    for (let it = 0; it < 200 && b - a > 1e-13 * Math.max(1, Math.abs(b)); it++) {
      const m = (a + b) / 2;
      if (countBelow(d, off, m) > j) b = m; else a = m;
    }
    E.push((a + b) / 2);
  }
  const psi = E.map((Ej) => inverseIteration(d, off, Ej, dx));
  return { E, psi };
}

function inverseIteration(d: number[], off: number, E: number, dx: number): number[] {
  const n = d.length, shift = E + 1e-10 * Math.max(1, Math.abs(E));
  let v = Array.from({ length: n }, (_, i) => 1 + 0.01 * Math.sin(i));
  for (let it = 0; it < 4; it++) {
    // Thomas algorithm for (d − shift) on the diagonal, off on both off-diagonals
    const c = new Array(n), y = new Array(n);
    let b0 = d[0] - shift; c[0] = off / b0; y[0] = v[0] / b0;
    for (let i = 1; i < n; i++) {
      const m = d[i] - shift - off * c[i - 1];
      c[i] = off / m; y[i] = (v[i] - off * y[i - 1]) / m;
    }
    for (let i = n - 2; i >= 0; i--) y[i] -= c[i] * y[i + 1];
    const norm = Math.sqrt(y.reduce((s, z) => s + z * z, 0) * dx);
    v = y.map((z) => z / norm);
    b0 = 0;
  }
  // sign convention: positive near the left edge
  const first = v.find((z) => Math.abs(z) > 1e-6) ?? 1;
  return first < 0 ? v.map((z) => -z) : v;
}

/** Transmission through a piecewise-constant potential: regions [width nm, V eV] between free space (V = 0) on both sides. */
export function transmission(E: number, regions: [number, number][], mRel = 1): number {
  // complex helpers
  type C = [number, number];
  const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]], sub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
  const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const div = (a: C, b: C): C => { const q = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / q, (a[1] * b[0] - a[0] * b[1]) / q]; };
  const cexp = (z: C): C => [Math.exp(z[0]) * Math.cos(z[1]), Math.exp(z[0]) * Math.sin(z[1])];
  const kOf = (V: number): C => { const q = (mRel * (E - V)) / HB2M; return q >= 0 ? [Math.sqrt(q), 0] : [0, Math.sqrt(-q)]; };
  // state: (A, B) amplitudes of e^{ikx}, e^{−ikx}; propagate a transfer matrix from right to left boundary
  const layers: { k: C; x0: number; x1: number }[] = [];
  let x = 0;
  for (const [w, V] of regions) { layers.push({ k: kOf(V), x0: x, x1: x + w }); x += w; }
  const k0 = kOf(0);
  // On the right only the transmitted wave t·e^{ik₀x}, with t = 1
  let A: C = [1, 0], B: C = [0, 0];
  const iC = (z: C): C => [-z[1], z[0]];
  // Walk the boundaries from right to left, matching ψ and ψ′ between the medium on each side
  const bounds: { at: number; kL: C; kR: C }[] = [];
  const ks = [k0, ...layers.map((l) => l.k), k0];
  const xs = [0, ...layers.map((l) => l.x1)];
  for (let i = xs.length - 1; i >= 0; i--) bounds.push({ at: xs[i], kL: ks[i], kR: ks[i + 1] });
  for (const bd of bounds) {
    const ikx = (kk: C, s: number): C => cexp(mul(iC(kk), [s * bd.at, 0]));
    const psi = add(mul(A, ikx(bd.kR, 1)), mul(B, ikx(bd.kR, -1)));
    const dpsi = mul(iC(bd.kR), sub(mul(A, ikx(bd.kR, 1)), mul(B, ikx(bd.kR, -1))));
    // Solve A' e^{ikL x} + B' e^{−ikL x} = psi; ikL(A' e^{..} − B' e^{..}) = dpsi
    const q = div(dpsi, iC(bd.kL));
    const half: C = [0.5, 0];
    A = mul(mul(half, add(psi, q)), ikx(bd.kL, -1));
    B = mul(mul(half, sub(psi, q)), ikx(bd.kL, 1));
  }
  // incident amplitude A on the left; T = |t|²/|A|² (same medium both sides)
  return 1 / (A[0] * A[0] + A[1] * A[1]);
}

/** Closed form for one rectangular barrier of height V0 (eV) and width a (nm), E < V0 or E > V0. */
export function barrierTransmission(E: number, V0: number, a: number, mRel = 1): number {
  if (E === V0) return 1 / (1 + (mRel * V0 * a * a) / (4 * HB2M));
  const q = (mRel * Math.abs(V0 - E)) / HB2M, s = E < V0 ? Math.sinh(Math.sqrt(q) * a) : Math.sin(Math.sqrt(q) * a);
  return 1 / (1 + (V0 * V0 * s * s) / (4 * E * Math.abs(V0 - E)));
}
