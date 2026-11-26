/**
 * Analytic hydrogen-like wavefunctions ψ_nlm(r, θ, φ) = R_nl(r) · Y_lm(θ, φ)
 * using REAL spherical harmonics (the px/py/pz, dxy … orbitals chemists draw).
 *
 * Units: r in Bohr radii a₀. For nuclear charge Z, R_nl uses ρ = 2Zr/n.
 * Exact (non-relativistic, infinite nuclear mass) for one-electron systems.
 * For multi-electron atoms the same functions are used with Z → Z_eff
 * (Slater) — a qualitative approximation, labelled as such in the UI.
 */
import type { L } from '../atoms/configuration';

export interface OrbitalId { n: number; l: L; m: number }

function factorial(k: number): number { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; }

/** Generalised Laguerre polynomial L_k^α(x) by three-term recurrence. */
export function laguerre(k: number, alpha: number, x: number): number {
  if (k === 0) return 1;
  let Lm1 = 1, L0 = 1 + alpha - x;
  for (let j = 1; j < k; j++) {
    const Lp1 = ((2 * j + 1 + alpha - x) * L0 - (j + alpha) * Lm1) / (j + 1);
    Lm1 = L0; L0 = Lp1;
  }
  return L0;
}

/** Normalised radial function R_nl(r) with ∫ R² r² dr = 1 (r in a₀). */
export function radial(n: number, l: number, Z: number, r: number): number {
  const rho = (2 * Z * r) / n;
  const norm = Math.sqrt(((2 * Z) / n) ** 3 * (factorial(n - l - 1) / (2 * n * factorial(n + l))));
  return norm * Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho);
}

/** Real spherical harmonics for l ≤ 3 evaluated on a unit vector (x, y, z). Normalised on the sphere. */
export function realYlm(l: number, m: number, x: number, y: number, z: number): number {
  const PI = Math.PI;
  switch (l) {
    case 0: return 0.5 * Math.sqrt(1 / PI);
    case 1: {
      const c = Math.sqrt(3 / (4 * PI));
      return c * (m === -1 ? y : m === 0 ? z : x);
    }
    case 2:
      switch (m) {
        case -2: return 0.5 * Math.sqrt(15 / PI) * x * y;
        case -1: return 0.5 * Math.sqrt(15 / PI) * y * z;
        case 0: return 0.25 * Math.sqrt(5 / PI) * (3 * z * z - 1);
        case 1: return 0.5 * Math.sqrt(15 / PI) * x * z;
        case 2: return 0.25 * Math.sqrt(15 / PI) * (x * x - y * y);
      }
      break;
    case 3:
      switch (m) {
        case -3: return 0.25 * Math.sqrt(35 / (2 * PI)) * y * (3 * x * x - y * y);
        case -2: return 0.5 * Math.sqrt(105 / PI) * x * y * z;
        case -1: return 0.25 * Math.sqrt(21 / (2 * PI)) * y * (5 * z * z - 1);
        case 0: return 0.25 * Math.sqrt(7 / PI) * (5 * z * z * z - 3 * z);
        case 1: return 0.25 * Math.sqrt(21 / (2 * PI)) * x * (5 * z * z - 1);
        case 2: return 0.25 * Math.sqrt(105 / PI) * z * (x * x - y * y);
        case 3: return 0.25 * Math.sqrt(35 / (2 * PI)) * x * (x * x - 3 * y * y);
      }
  }
  throw new RangeError(`realYlm supports l ≤ 3, |m| ≤ l (got l=${l}, m=${m})`);
}

export const ORBITAL_NAMES: Record<number, Record<number, string>> = {
  0: { 0: 's' },
  1: { [-1]: 'py', 0: 'pz', 1: 'px' },
  2: { [-2]: 'dxy', [-1]: 'dyz', 0: 'dz²', 1: 'dxz', 2: 'dx²−y²' },
  3: { [-3]: 'fy(3x²−y²)', [-2]: 'fxyz', [-1]: 'fyz²', 0: 'fz³', 1: 'fxz²', 2: 'fz(x²−y²)', 3: 'fx(x²−3y²)' },
};
export const orbitalName = (o: OrbitalId) => `${o.n}${ORBITAL_NAMES[o.l][o.m]}`;

/** ψ at a Cartesian point (a₀). */
export function psi(o: OrbitalId, Z: number, x: number, y: number, z: number): number {
  const r = Math.hypot(x, y, z);
  if (r === 0) return o.l === 0 ? radial(o.n, 0, Z, 0) * realYlm(0, 0, 0, 0, 1) : 0;
  return radial(o.n, o.l, Z, r) * realYlm(o.l, o.m, x / r, y / r, z / r);
}

/** Radius (a₀) enclosing fraction `p` of the radial probability, by numerical CDF. */
export function radiusEnclosing(n: number, l: number, Z: number, p = 0.99): number {
  const rMax = ((n * n * 6 + 10) / Z);
  const N = 4000;
  let cum = 0;
  const dr = rMax / N;
  for (let i = 1; i <= N; i++) {
    const r = i * dr;
    cum += radial(n, l, Z, r) ** 2 * r * r * dr;
    if (cum >= p) return r;
  }
  return rMax;
}

/** Expectation value ⟨r⟩ = a₀/(2Z) · [3n² − l(l+1)] (analytic). */
export const meanRadius = (n: number, l: number, Z: number) => (3 * n * n - l * (l + 1)) / (2 * Z);

export interface SampleRequest { orbitals: { o: OrbitalId; Z: number; weight: number }[]; count: number; seed: number }
export interface SampleResult { positions: Float32Array; phase: Int8Array; source: Uint16Array }

/**
 * Exact Monte-Carlo sampling of |ψ|²:
 *   r  ~ r² R_nl(r)²   via inverse CDF on a fine grid
 *   Ω  ~ |Y_lm|²       via rejection on the unit sphere
 * Points are independent draws from the probability density — NOT trajectories.
 */
export function sampleOrbitals(req: SampleRequest, rand: () => number): SampleResult {
  const positions = new Float32Array(req.count * 3);
  const phase = new Int8Array(req.count);
  const source = new Uint16Array(req.count);
  const totalW = req.orbitals.reduce((t, x) => t + x.weight, 0);
  const cdfs = req.orbitals.map(({ o, Z }) => {
    const rMax = radiusEnclosing(o.n, o.l, Z, 0.9995) * 1.05;
    const N = 2048;
    const rs = new Float64Array(N + 1), cdf = new Float64Array(N + 1);
    for (let i = 1; i <= N; i++) {
      const r = (i / N) * rMax;
      rs[i] = r;
      cdf[i] = cdf[i - 1] + radial(o.n, o.l, Z, r) ** 2 * r * r;
    }
    for (let i = 0; i <= N; i++) cdf[i] /= cdf[N];
    // max |Y|² bound for rejection
    let yMax = 0;
    for (let k = 0; k < 4000; k++) {
      const [x, y, z] = randomUnit(rand);
      yMax = Math.max(yMax, realYlm(o.l, o.m, x, y, z) ** 2);
    }
    return { rs, cdf, yMax: yMax * 1.05 };
  });
  for (let i = 0; i < req.count; i++) {
    // choose orbital proportionally to weight (electron occupancy)
    let pick = rand() * totalW, k = 0;
    while (k < req.orbitals.length - 1 && (pick -= req.orbitals[k].weight) > 0) k++;
    const { o, Z } = req.orbitals[k];
    const { rs, cdf, yMax } = cdfs[k];
    const u = rand();
    let lo = 0, hi = cdf.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid; else hi = mid; }
    const t = (u - cdf[lo]) / Math.max(1e-300, cdf[hi] - cdf[lo]);
    const r = rs[lo] + t * (rs[hi] - rs[lo]);
    let dir: [number, number, number];
    let yv: number;
    do { dir = randomUnit(rand); yv = realYlm(o.l, o.m, dir[0], dir[1], dir[2]); } while (rand() * yMax > yv * yv);
    positions[3 * i] = r * dir[0];
    positions[3 * i + 1] = r * dir[2]; // render y-up: physics z → screen y
    positions[3 * i + 2] = r * dir[1];
    const sign = Math.sign(radial(o.n, o.l, Z, r) * yv);
    phase[i] = sign >= 0 ? 1 : -1;
    source[i] = k;
  }
  return { positions, phase, source };
}

function randomUnit(rand: () => number): [number, number, number] {
  const z = 2 * rand() - 1;
  const phi = 2 * Math.PI * rand();
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(phi), s * Math.sin(phi), z];
}
