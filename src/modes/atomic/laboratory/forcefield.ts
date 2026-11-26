/**
 * VGFF-1 — Voyager Generic Valence Force Field (version 1).
 *
 * PURPOSE: turn builder starting guesses into chemically reasonable geometries. It is NOT a
 * thermochemical force field: energies are relative strain energies (kcal/mol-like scale) and
 * must not be compared between different molecules.
 *
 * Every parameter is traceable:
 *  - r0 (bond):  Cordero 2008 covalent radii with Pauling's bond-order relation
 *                r_n = r_1 − 0.71 Å · log10(n); aromatic rings use n = 1.5.
 *                Single bonds between heavy atoms use Cordero's hybridisation-specific carbon radii (sp³ 0.76,
 *                sp² 0.73, sp 0.69 Å); C–H always uses 0.76 (Cordero's H radius is calibrated against it).
 *                Resonance: a single bond from an sp² carbon to a lone-pair N/O (amides, acids, esters,
 *                enols, nucleobases) is given n = 1.25 — ONE empirical constant, CALIBRATED on experimental
 *                formamide C–N (1.352 Å) and formic-acid C–OH (1.343 Å); both are reproduced to ≤ 0.025 Å.
 *  - θ0 (angle): VSEPR by perceived hybridisation (sp 180°, sp² 120°, sp³ 109.47°); sp³ centres
 *                with lone pairs use their parent hydride's experimental gas-phase angle:
 *                H₂O 104.5°, NH₃ 106.7°, H₂S 92.1°, PH₃ 93.8°.
 *  - torsion:    double/aromatic bonds planar (2-fold), conjugated single bonds weakly planar,
 *                sp³–sp³ 3-fold staggered (ethane-like barrier).
 *  - non-bonded: soft repulsion only (no attraction, no electrostatics) for pairs ≥ 3 bonds apart,
 *                contact distance 0.8 × sum of PubChem van der Waals radii (1-4 pairs scaled 0.5).
 * Validity: main-group organic/biomolecular structures. Hypervalent centres with > 4 neighbours
 * get no angle terms; transition metals, fullerenes and strained cages are not parameterised.
 */
import curated from '@datasets/curated/curated-reference.json';
import { ELEMENTS, tablePosition } from '../atoms/elements';
import type { Structure } from './builder';

export const VGFF_VERSION = 'VGFF-1.0';
const RADII = curated.covalentRadii.radii as Record<string, number>;
const sym = (Z: number) => ELEMENTS[Z - 1].symbol;
const vdw = (Z: number) => (ELEMENTS[Z - 1].vanDerWaalsRadiusPm ?? 180) / 100;

// force constants (kcal/mol units, Å)
const K_BOND = 700; // per Å²
const K_ANGLE = 120; // multiplies (cosθ − cosθ0)²
const K_TORSION_DOUBLE = 12;
const K_TORSION_CONJ = 2.5;
const K_TORSION_SP3 = 0.35;
const K_REPEL = 50;

export interface BondTerm { i: number; j: number; r0: number; k: number }
export interface AngleTerm { i: number; j: number; k: number; cos0: number; K: number }
export interface TorsionTerm { i: number; j: number; k: number; l: number; n: 2 | 3; V: number }
export interface PairTerm { i: number; j: number; d0: number; K: number }
export interface ForceField { bonds: BondTerm[]; angles: AngleTerm[]; torsions: TorsionTerm[]; pairs: PairTerm[]; hybrid: Hybrid[]; aromaticBonds: Set<number>; version: string }
export type Hybrid = 'sp' | 'sp2' | 'sp3' | 'none';

// ------------------------------------------------------------------ perception
function adjacency(s: Structure) {
  const adj: { j: number; order: number; bond: number }[][] = s.atoms.map(() => []);
  s.bonds.forEach((b, k) => { adj[b.a].push({ j: b.b, order: b.order, bond: k }); adj[b.b].push({ j: b.a, order: b.order, bond: k }); });
  return adj;
}

/** Aromatic rings: 6-rings with 3 alternating double bonds; 5-rings with 2 doubles + one N/O/S lone-pair atom. */
export function perceiveAromatic(s: Structure): Set<number> {
  const adj = adjacency(s);
  const aromatic = new Set<number>();
  const rings: number[][] = [];
  // enumerate simple cycles of length 5–6 by DFS from each start (dedupe by sorted key)
  const seen = new Set<string>();
  const dfs = (start: number, cur: number, path: number[]) => {
    if (path.length > 6) return;
    for (const { j } of adj[cur]) {
      if (j === start && path.length >= 5) { const key = [...path].sort((a, b) => a - b).join(','); if (!seen.has(key)) { seen.add(key); rings.push([...path]); } continue; }
      if (path.includes(j) || j < start) continue;
      dfs(start, j, [...path, j]);
    }
  };
  for (let i = 0; i < s.atoms.length; i++) dfs(i, i, [i]);
  for (const ring of rings) {
    const bonds = ring.map((a, n) => s.bonds.findIndex((b) => (b.a === a && b.b === ring[(n + 1) % ring.length]) || (b.b === a && b.a === ring[(n + 1) % ring.length])));
    if (bonds.some((k) => k < 0)) continue;
    const doubles = bonds.filter((k) => s.bonds[k].order === 2).length;
    const triplesOrExo = bonds.some((k) => s.bonds[k].order === 3);
    if (triplesOrExo) continue;
    const ok6 = ring.length === 6 && doubles === 3 && ring.every((a) => adj[a].some((x) => x.order === 2 && ring.includes(x.j)));
    const hetero = ring.filter((a) => [7, 8, 16].includes(s.atoms[a].Z) && !adj[a].some((x) => x.order === 2));
    const ok5 = ring.length === 5 && doubles === 2 && hetero.length === 1;
    if (ok6 || ok5) bonds.forEach((k) => aromatic.add(k));
  }
  return aromatic;
}

export function perceiveHybrid(s: Structure, aromatic: Set<number>): Hybrid[] {
  const adj = adjacency(s);
  const base = s.atoms.map((a, i): Hybrid => {
    const nb = adj[i];
    if (nb.length <= 1 && a.Z === 1) return 'none';
    const triples = nb.filter((x) => x.order === 3).length;
    const doubles = nb.filter((x) => x.order === 2).length;
    if (triples > 0 || doubles >= 2) return nb.length <= 2 ? 'sp' : 'sp2';
    if (doubles === 1 || nb.some((x) => aromatic.has(x.bond))) return 'sp2';
    const group = tablePosition(a.Z).group ?? 0;
    if (group === 13 && nb.length === 3) return 'sp2'; // boranes
    if (a.Z === 6 && a.charge !== 0 && nb.length === 3) return 'sp2'; // carbocation/carbanion (planar approximation)
    return 'sp3';
  });
  // conjugated N/O lone pairs (amides, anilines, pyrrole-type N): planarise N with 3 neighbours next to an sp2 atom
  return base.map((h, i) => (h === 'sp3' && s.atoms[i].Z === 7 && adj[i].length === 3 && adj[i].some((x) => base[x.j] === 'sp2') ? 'sp2' : h));
}

const LONE_PAIR_ANGLE: Record<string, number> = { O: 104.5, N: 106.7, S: 92.1, P: 93.8 }; // parent hydrides (gas phase)

function idealAngle(s: Structure, j: number, h: Hybrid, degree: number): number | null {
  if (degree > 4) return null; // hypervalent: not parameterised
  if (h === 'sp') return 180;
  if (h === 'sp2') return 120;
  if (h === 'sp3') {
    const e = sym(s.atoms[j].Z);
    const lonePairs = (e === 'O' && degree === 2) || (e === 'N' && degree === 3 && s.atoms[j].charge === 0) || (e === 'S' && degree === 2) || (e === 'P' && degree === 3);
    return lonePairs ? LONE_PAIR_ANGLE[e] : 109.4712;
  }
  return null;
}

const CARBON_HYBRID_RADIUS: Record<Hybrid, number> = { sp3: 0.76, sp2: 0.73, sp: 0.69, none: 0.76 }; // Cordero 2008

export function bondRestLength(Z1: number, Z2: number, order: number, h1: Hybrid = 'sp3', h2: Hybrid = 'sp3'): number {
  // hybridisation-specific carbon radii apply to single (and resonance-shortened single) bonds only;
  // multiple and aromatic bonds use the single-bond (sp³) radius with Pauling's order correction
  // …and only between heavy atoms: Cordero's H radius (0.31 Å) is calibrated against C(sp³)–H, so applying the
  // shorter sp²/sp carbon radii to C–H would under-shoot C(sp²)–H 1.08 Å and C(sp)–H 1.06 Å.
  const single = order < 1.5 && Z1 !== 1 && Z2 !== 1;
  const r = (Z: number, h: Hybrid) => (Z === 6 && single ? CARBON_HYBRID_RADIUS[h] : RADII[sym(Z)] ?? 1.5);
  return r(Z1, h1) + r(Z2, h2) - 0.71 * Math.log10(order);
}

/** Resonance-shortened single bond: sp² carbon to an N/O that carries a lone pair (n = 1.25, calibrated — see header). */
export const RESONANCE_ORDER = 1.25;
function resonanceOrder(s: Structure, b: { a: number; b: number; order: number }, hybrid: Hybrid[], adj: { j: number; order: number }[][]): number {
  if (b.order !== 1) return b.order;
  const pair = [[b.a, b.b], [b.b, b.a]] as const;
  for (const [c, x] of pair) {
    const Zx = s.atoms[x].Z;
    const lonePairDonor = (Zx === 7 && adj[x].every((n) => n.order === 1) && adj[x].length <= 3 && s.atoms[x].charge <= 0) || (Zx === 8 && adj[x].every((n) => n.order === 1) && adj[x].length <= 2);
    if (s.atoms[c].Z === 6 && hybrid[c] === 'sp2' && lonePairDonor) return RESONANCE_ORDER;
  }
  return 1;
}

// ------------------------------------------------------------------ setup
export function buildForceField(s: Structure): ForceField {
  const adj = adjacency(s);
  const aromatic = perceiveAromatic(s);
  const hybrid = perceiveHybrid(s, aromatic);
  const bonds: BondTerm[] = s.bonds.map((b, k) => ({ i: b.a, j: b.b, k: K_BOND,
    r0: bondRestLength(s.atoms[b.a].Z, s.atoms[b.b].Z, aromatic.has(k) ? 1.5 : resonanceOrder(s, b, hybrid, adj), hybrid[b.a], hybrid[b.b]) }));
  const angles: AngleTerm[] = [];
  adj.forEach((nb, j) => {
    const theta = idealAngle(s, j, hybrid[j], nb.length);
    if (theta === null) return;
    for (let x = 0; x < nb.length; x++) for (let y = x + 1; y < nb.length; y++) angles.push({ i: nb[x].j, j, k: nb[y].j, cos0: Math.cos((theta * Math.PI) / 180), K: K_ANGLE });
  });
  const torsions: TorsionTerm[] = [];
  s.bonds.forEach((b, kb) => {
    const j = b.a, k = b.b;
    const hj = hybrid[j], hk = hybrid[k];
    let n: 2 | 3 | 0 = 0, V = 0;
    if (b.order === 2 || aromatic.has(kb)) { n = 2; V = K_TORSION_DOUBLE; }
    else if (b.order === 1 && hj === 'sp2' && hk === 'sp2') { n = 2; V = K_TORSION_CONJ; }
    else if (b.order === 1 && hj === 'sp3' && hk === 'sp3') { n = 3; V = K_TORSION_SP3; }
    if (!n) return;
    for (const a of adj[j]) for (const d of adj[k]) {
      if (a.j === k || d.j === j || a.j === d.j) continue;
      torsions.push({ i: a.j, j, k, l: d.j, n, V });
    }
  });
  // topological distance ≤ 2 excluded; distance 3 scaled 0.5
  const pairs: PairTerm[] = [];
  const N = s.atoms.length;
  const dist = s.atoms.map((_, i) => { const d = new Array(N).fill(99); d[i] = 0; const q = [i]; while (q.length) { const u = q.shift()!; if (d[u] >= 3) continue; for (const { j } of adj[u]) if (d[j] > d[u] + 1) { d[j] = d[u] + 1; q.push(j); } } return d; });
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    if (dist[i][j] <= 2) continue;
    pairs.push({ i, j, d0: 0.8 * (vdw(s.atoms[i].Z) + vdw(s.atoms[j].Z)), K: dist[i][j] === 3 ? K_REPEL * 0.5 : K_REPEL });
  }
  return { bonds, angles, torsions, pairs, hybrid, aromaticBonds: aromatic, version: VGFF_VERSION };
}

// ------------------------------------------------------------------ energy + analytic gradient
/** Energy and gradient for flat coordinates x = [x0,y0,z0, x1,…]. */
export function energyGradient(ff: ForceField, x: Float64Array, grad?: Float64Array): number {
  let E = 0;
  const g = grad;
  if (g) g.fill(0);
  const P = (i: number) => [x[3 * i], x[3 * i + 1], x[3 * i + 2]];
  const addG = (i: number, v: number[], s: number) => { if (g) { g[3 * i] += v[0] * s; g[3 * i + 1] += v[1] * s; g[3 * i + 2] += v[2] * s; } };

  for (const b of ff.bonds) {
    const pi = P(b.i), pj = P(b.j);
    const d = [pi[0] - pj[0], pi[1] - pj[1], pi[2] - pj[2]];
    const r = Math.hypot(d[0], d[1], d[2]) || 1e-12;
    const dr = r - b.r0;
    E += b.k * dr * dr;
    const f = (2 * b.k * dr) / r;
    addG(b.i, d, f); addG(b.j, d, -f);
  }
  for (const a of ff.angles) {
    const pi = P(a.i), pj = P(a.j), pk = P(a.k);
    const u = [pi[0] - pj[0], pi[1] - pj[1], pi[2] - pj[2]];
    const v = [pk[0] - pj[0], pk[1] - pj[1], pk[2] - pj[2]];
    const lu = Math.hypot(u[0], u[1], u[2]) || 1e-12, lv = Math.hypot(v[0], v[1], v[2]) || 1e-12;
    const c = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (lu * lv);
    const dc = c - a.cos0;
    E += a.K * dc * dc;
    if (g) {
      const f = 2 * a.K * dc;
      // ∂c/∂u = v/(|u||v|) − c·u/|u|², ∂c/∂v = u/(|u||v|) − c·v/|v|²
      const gu = [0, 1, 2].map((t) => v[t] / (lu * lv) - (c * u[t]) / (lu * lu));
      const gv = [0, 1, 2].map((t) => u[t] / (lu * lv) - (c * v[t]) / (lv * lv));
      addG(a.i, gu, f); addG(a.k, gv, f);
      addG(a.j, gu, -f); addG(a.j, gv, -f);
    }
  }
  for (const t of ff.torsions) {
    // dihedral φ via the standard Bekker/Blondel formulation; E = V/2·(1 − cos nφ) for n=2 (minima 0,180), V/2·(1 + cos 3φ) for n=3 (staggered)
    const p1 = P(t.i), p2 = P(t.j), p3 = P(t.k), p4 = P(t.l);
    const b1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const b2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];
    const b3 = [p4[0] - p3[0], p4[1] - p3[1], p4[2] - p3[2]];
    const cr = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dt = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const m = cr(b1, b2), n = cr(b2, b3);
    const mm = dt(m, m), nn = dt(n, n);
    if (mm < 1e-10 || nn < 1e-10) continue; // collinear: torsion undefined
    const lb2 = Math.sqrt(dt(b2, b2));
    const phi = Math.atan2(lb2 * dt(b1, n), dt(m, n));
    const sign = t.n === 2 ? -1 : 1;
    E += (t.V / 2) * (1 + sign * Math.cos(t.n * phi));
    if (g) {
      const dEdphi = (-t.V / 2) * sign * t.n * Math.sin(t.n * phi);
      // gradient of φ (after Blondel & Karplus 1996), written for b1 = p2 − p1, b2 = p3 − p2, b3 = p4 − p3.
      // Verified against finite differences; the four terms sum to zero (translation invariance).
      const f1 = m.map((q) => (-lb2 / mm) * q);
      const f4 = n.map((q) => (lb2 / nn) * q);
      const a1 = dt(b1, b2) / (lb2 * lb2), a2 = dt(b3, b2) / (lb2 * lb2);
      const f2 = [0, 1, 2].map((q) => -(1 + a1) * f1[q] + a2 * f4[q]);
      const f3 = [0, 1, 2].map((q) => -(1 + a2) * f4[q] + a1 * f1[q]);
      addG(t.i, f1, dEdphi); addG(t.j, f2, dEdphi); addG(t.k, f3, dEdphi); addG(t.l, f4, dEdphi);
    }
  }
  for (const p of ff.pairs) {
    const pi = P(p.i), pj = P(p.j);
    const d = [pi[0] - pj[0], pi[1] - pj[1], pi[2] - pj[2]];
    const r = Math.hypot(d[0], d[1], d[2]) || 1e-12;
    if (r >= p.d0) continue;
    const dr = p.d0 - r;
    E += p.K * dr * dr;
    const f = (-2 * p.K * dr) / r;
    addG(p.i, d, f); addG(p.j, d, -f);
  }
  return E;
}

// ------------------------------------------------------------------ L-BFGS optimiser
export interface OptimiseResult { structure: Structure; energy: number; initialEnergy: number; iterations: number; gradRms: number; converged: boolean; history: number[]; version: string }

export function optimise(s: Structure, opts: { maxIter?: number; gradTol?: number; onProgress?: (it: number, E: number, x: Float64Array) => void } = {}): OptimiseResult {
  const maxIter = opts.maxIter ?? 2000, gtol = opts.gradTol ?? 1e-3;
  const ff = buildForceField(s);
  const n = s.atoms.length * 3;
  let x = new Float64Array(s.atoms.flatMap((a) => [a.x, a.y, a.z]));
  // tiny deterministic jitter breaks exact symmetry (e.g. perfectly planar starts for sp³ centres)
  x = x.map((v, i) => v + 1e-4 * Math.sin(i * 12.9898));
  let g = new Float64Array(n);
  let E = energyGradient(ff, x, g);
  const E0 = E;
  const history = [E];
  const m = 8;
  const S: Float64Array[] = [], Y: Float64Array[] = [];
  const dot = (a: Float64Array, b: Float64Array) => { let t = 0; for (let i = 0; i < a.length; i++) t += a[i] * b[i]; return t; };
  const rms = (v: Float64Array) => Math.sqrt(dot(v, v) / Math.max(1, v.length));
  let it = 0;
  for (; it < maxIter && rms(g) > gtol; it++) {
    // two-loop recursion
    const q = Float64Array.from(g);
    const alpha: number[] = [];
    for (let k = S.length - 1; k >= 0; k--) { const rho = 1 / dot(Y[k], S[k]); const a = rho * dot(S[k], q); alpha[k] = a; for (let i = 0; i < n; i++) q[i] -= a * Y[k][i]; }
    const gamma = S.length ? dot(S[S.length - 1], Y[Y.length - 1]) / dot(Y[Y.length - 1], Y[Y.length - 1]) : 1 / Math.max(1, Math.sqrt(dot(g, g)));
    for (let i = 0; i < n; i++) q[i] *= gamma;
    for (let k = 0; k < S.length; k++) { const rho = 1 / dot(Y[k], S[k]); const b = rho * dot(Y[k], q); for (let i = 0; i < n; i++) q[i] += S[k][i] * (alpha[k] - b); }
    const d = q.map((v) => -v);
    let slope = dot(g, d);
    if (slope >= 0) { for (let i = 0; i < n; i++) d[i] = -g[i]; slope = -dot(g, g); S.length = 0; Y.length = 0; }
    // cap step length to 0.3 Å per atom
    let maxStep = 0;
    for (let i = 0; i < n; i += 3) maxStep = Math.max(maxStep, Math.hypot(d[i], d[i + 1], d[i + 2]));
    let step = maxStep > 0.3 ? 0.3 / maxStep : 1;
    // backtracking Armijo line search
    const xn = new Float64Array(n), gn = new Float64Array(n);
    let En = Infinity;
    for (let ls = 0; ls < 30; ls++) {
      for (let i = 0; i < n; i++) xn[i] = x[i] + step * d[i];
      En = energyGradient(ff, xn, gn);
      if (En <= E + 1e-4 * step * slope) break;
      step *= 0.5;
    }
    if (!(En < E) && step < 1e-9) break;
    const sv = new Float64Array(n), yv = new Float64Array(n);
    for (let i = 0; i < n; i++) { sv[i] = xn[i] - x[i]; yv[i] = gn[i] - g[i]; }
    if (dot(sv, yv) > 1e-12) { S.push(sv); Y.push(yv); if (S.length > m) { S.shift(); Y.shift(); } }
    x = xn; g = gn; E = En;
    history.push(E);
    if (opts.onProgress && it % 5 === 0) opts.onProgress(it, E, x);
  }
  const structure: Structure = { atoms: s.atoms.map((a, i) => ({ ...a, x: x[3 * i], y: x[3 * i + 1], z: x[3 * i + 2] })), bonds: s.bonds };
  return { structure, energy: E, initialEnergy: E0, iterations: it, gradRms: rms(g), converged: rms(g) <= gtol, history, version: VGFF_VERSION };
}
