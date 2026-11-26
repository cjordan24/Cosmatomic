/**
 * Crystallography (Gate 4.3). Pure functions; lengths in Å.
 *
 *  - Lattice vectors for cubic / tetragonal / hexagonal-trigonal cells (a, c; standard settings).
 *  - Unit-cell volume, X-ray density ρ = Σ m_atoms / (N_A · V).
 *  - Coordination: nearest-neighbour shell found over the 27 neighbouring cells (periodic images).
 *  - Hard-sphere packing fraction (single-element structures, r = d_nn / 2).
 *  - d-spacings from the reciprocal metric tensor; Bragg angle 2θ = 2 asin(λ / 2d).
 *  - Structure factor F(hkl) = Σ_j Z_j exp(2πi(hx + ky + lz)) with f_j ≈ Z_j (forward-scattering
 *    limit). This is EXACT for systematic absences (which depend only on the basis symmetry) but is
 *    NOT an intensity model (no angle-dependent form factors, Debye–Waller or Lorentz-polarisation).
 */
import data from '@datasets/materials/crystals.json';
import { CONSTANTS } from '@/core/constants/constants';
import { elementBySymbol } from '@/modes/atomic/atoms/elements';

export type V3 = [number, number, number];
export interface Site { el: string; xyz: V3 }
export interface Crystal {
  id: string; name: string; formula: string; structureType: string;
  system: 'cubic' | 'hexagonal' | 'tetragonal' | 'trigonal';
  spaceGroup: string; spaceGroupNumber: number;
  a: number; c?: number; temperatureC: number; sites: Site[];
  xrayDensityNBS: number | null; latticeSource: string; positionsSource: string; sources: string[]; transcribed: true; materialId: string;
}

export const CRYSTALS: Crystal[] = (data as unknown as { crystals: Crystal[] }).crystals;
export const getCrystal = (id: string) => CRYSTALS.find((c) => c.id === id);

/** Real-space lattice vectors (rows), Å. Hexagonal: a1 along x, a2 at 120°, c along z. */
export function latticeVectors(x: Crystal): [V3, V3, V3] {
  const c = x.c ?? x.a;
  if (x.system === 'hexagonal' || x.system === 'trigonal') return [[x.a, 0, 0], [-x.a / 2, (x.a * Math.sqrt(3)) / 2, 0], [0, 0, c]];
  return [[x.a, 0, 0], [0, x.a, 0], [0, 0, c]];
}

const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];

export const cellVolume = (x: Crystal) => { const [a, b, c] = latticeVectors(x); return Math.abs(dot(a, cross(b, c))); };

export function toCartesian(x: Crystal, f: V3): V3 {
  const [a, b, c] = latticeVectors(x);
  return [0, 1, 2].map((k) => f[0] * a[k] + f[1] * b[k] + f[2] * c[k]) as V3;
}

export const atomicMass = (el: string) => elementBySymbol(el)?.atomicWeight ?? NaN;
export const atomicNumber = (el: string) => elementBySymbol(el)?.Z ?? 0;

/** Formula units per cell from the basis composition. */
export function formulaUnits(x: Crystal): number {
  const counts = new Map<string, number>();
  x.sites.forEach((s) => counts.set(s.el, (counts.get(s.el) ?? 0) + 1));
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  return [...counts.values()].reduce(g);
}

/** X-ray density in g/cm³ (1 Å³ = 10⁻²⁴ cm³). */
export function xrayDensity(x: Crystal): number {
  const m = x.sites.reduce((s, a) => s + atomicMass(a.el), 0);
  return m / (CONSTANTS.NA.value * cellVolume(x) * 1e-24);
}

export interface Neighbour { el: string; d: number; to: V3 }
/** Neighbours of basis site i within rMax (periodic images over the 5×5×5 block). */
export function neighbours(x: Crystal, i: number, rMax: number): Neighbour[] {
  const p = toCartesian(x, x.sites[i].xyz);
  const out: Neighbour[] = [];
  for (let u = -2; u <= 2; u++) for (let v = -2; v <= 2; v++) for (let w = -2; w <= 2; w++) {
    x.sites.forEach((s, j) => {
      const q = toCartesian(x, [s.xyz[0] + u, s.xyz[1] + v, s.xyz[2] + w]);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > 1e-6 && d <= rMax) out.push({ el: s.el, d, to: q });
      void j;
    });
  }
  return out.sort((a, b) => a.d - b.d);
}

/** First coordination shell of site i (neighbours within 3 % of the nearest distance). */
export function coordination(x: Crystal, i: number, tol = 0.03) {
  const all = neighbours(x, i, Math.max(x.a, x.c ?? 0) * 1.2);
  const d0 = all[0].d;
  const shell = all.filter((n) => n.d <= d0 * (1 + tol));
  return { cn: shell.length, d: d0, shell };
}

/** Hard-sphere packing fraction for single-element structures (spheres touch at d_nn). */
export function packingFraction(x: Crystal): number | null {
  if (new Set(x.sites.map((s) => s.el)).size !== 1) return null;
  const r = coordination(x, 0).d / 2;
  return (x.sites.length * (4 / 3) * Math.PI * r ** 3) / cellVolume(x);
}

/** Interplanar spacing d(hkl), Å, via the reciprocal metric tensor. */
export function dSpacing(x: Crystal, h: number, k: number, l: number): number {
  const [a, b, c] = latticeVectors(x);
  const V = dot(a, cross(b, c));
  const as = cross(b, c).map((t) => t / V) as V3, bs = cross(c, a).map((t) => t / V) as V3, cs = cross(a, b).map((t) => t / V) as V3;
  const g: V3 = [0, 1, 2].map((i) => h * as[i] + k * bs[i] + l * cs[i]) as V3;
  return 1 / Math.hypot(...g);
}

/** |F(hkl)| with f ≈ Z (absence test only). */
export function structureFactor(x: Crystal, h: number, k: number, l: number): number {
  let re = 0, im = 0;
  for (const s of x.sites) {
    const ph = 2 * Math.PI * (h * s.xyz[0] + k * s.xyz[1] + l * s.xyz[2]);
    const f = atomicNumber(s.el);
    re += f * Math.cos(ph); im += f * Math.sin(ph);
  }
  return Math.hypot(re, im);
}

/** Cu Kα₁ wavelength used for 2θ display, Å (Hölzer et al. 1997, as adopted by NIST SRM certificates: 1.5405929 Å). */
export const CU_KA1 = 1.5405929;

export interface Reflection { hkl: [number, number, number]; d: number; twoTheta: number | null; F: number; allowed: boolean; multiplicity: number }

/** Distinct reflections (grouped by d, Laue-equivalent by sorted |indices| for cubic) up to dMin. */
export function reflections(x: Crystal, dMin = 0.9, lambda = CU_KA1): Reflection[] {
  const seen = new Map<string, Reflection>();
  const N = 6;
  for (let h = -N; h <= N; h++) for (let k = -N; k <= N; k++) for (let l = -N; l <= N; l++) {
    if (!h && !k && !l) continue;
    const d = dSpacing(x, h, k, l);
    if (d < dMin) continue;
    const F = structureFactor(x, h, k, l);
    const key = d.toFixed(5) + (F > 1e-6 ? 'a' : 'x');
    const r = seen.get(key);
    if (r) { r.multiplicity++; continue; }
    const s = lambda / (2 * d);
    const canonical = [h, k, l].map(Math.abs).sort((p, q) => q - p) as [number, number, number];
    seen.set(key, { hkl: x.system === 'cubic' ? canonical : [h, k, l].map(Math.abs) as [number, number, number], d, twoTheta: s <= 1 ? (2 * Math.asin(s) * 180) / Math.PI : null, F, allowed: F > 1e-6, multiplicity: 1 });
  }
  return [...seen.values()].sort((p, q) => q.d - p.d);
}

/** Polygon (Cartesian) where the plane (hkl) through fractional intercepts cuts the unit cell. */
export function planePolygon(x: Crystal, h: number, k: number, l: number, offset = 1): V3[] {
  const corners: V3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 4], [2, 6], [3, 5], [3, 6], [4, 7], [5, 7], [6, 7]];
  const val = (f: V3) => h * f[0] + k * f[1] + l * f[2] - offset;
  const pts: V3[] = [];
  for (const [i, j] of edges) {
    const a = val(corners[i]), b = val(corners[j]);
    if (Math.abs(a) < 1e-12) pts.push(corners[i]);
    if (Math.abs(b) < 1e-12) pts.push(corners[j]);
    if (a * b < 0) { const t = a / (a - b); pts.push(corners[i].map((v, n) => v + t * (corners[j][n] - v)) as V3); }
  }
  const uniq = pts.filter((p, i) => pts.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-9) === i).map((f) => toCartesian(x, f));
  if (uniq.length < 3) return [];
  const c = uniq.reduce((s, p) => s.map((v, n) => v + p[n] / uniq.length) as V3, [0, 0, 0] as V3);
  const nrm = (() => { const e1 = uniq[0].map((v, n) => v - c[n]) as V3; const e2 = uniq[1].map((v, n) => v - c[n]) as V3; return cross(e1, e2); })();
  const e1 = uniq[0].map((v, n) => v - c[n]) as V3; const e2 = cross(nrm, e1);
  return uniq.sort((p, q) => {
    const vp = p.map((v, n) => v - c[n]) as V3, vq = q.map((v, n) => v - c[n]) as V3;
    return Math.atan2(dot(vp, e2), dot(vp, e1)) - Math.atan2(dot(vq, e2), dot(vq, e1));
  });
}
