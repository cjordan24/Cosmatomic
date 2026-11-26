/**
 * Molecular builder — pure, immutable operations on a structure (atoms + bonds).
 * Geometry produced here is a STARTING GUESS (covalent-radius bond lengths, VSEPR-like
 * directions); it becomes physical only after force-field optimisation (Gate 2.3).
 * Valence rules are textbook main-group rules and are reported, never silently enforced.
 */
import curated from '@datasets/curated/curated-reference.json';
import { ELEMENTS, tablePosition } from '../atoms/elements';
import type { MolAtom, MolBond } from '../molecules/molecules';
import { type Vec3, add, cross, norm, normalize, scale, sub, dot } from '@/core/mathematics/vec3';

export interface Structure { atoms: MolAtom[]; bonds: MolBond[] }
export const EMPTY: Structure = { atoms: [], bonds: [] };

const RADII = curated.covalentRadii.radii as Record<string, number>;
const sym = (Z: number) => ELEMENTS[Z - 1].symbol;
const pos = (a: MolAtom): Vec3 => [a.x, a.y, a.z];
const withPos = (a: MolAtom, p: Vec3): MolAtom => ({ ...a, x: p[0], y: p[1], z: p[2] });

/** Approximate bond length (Å): sum of covalent radii, shortened for multiple bonds. Starting guess only. */
export function idealBondLength(Z1: number, Z2: number, order = 1): number {
  const r = (RADII[sym(Z1)] ?? 1.5) + (RADII[sym(Z2)] ?? 1.5);
  return r * (order === 1 ? 1 : order === 2 ? 0.87 : 0.78);
}

export const neighbours = (s: Structure, i: number) => s.bonds.filter((b) => b.a === i || b.b === i).map((b) => (b.a === i ? b.b : b.a));
export const bondIndex = (s: Structure, i: number, j: number) => s.bonds.findIndex((b) => (b.a === i && b.b === j) || (b.a === j && b.b === i));
export const bondOrderSum = (s: Structure, i: number) => s.bonds.filter((b) => b.a === i || b.b === i).reduce((t, b) => t + b.order, 0);

// ------------------------------------------------------------------ valence model
/**
 * Allowed total bond-order sums per element for formal charge 0, and the isoelectronic shift
 * for charges (e.g. N⁺ → 4, O⁻ → 1). Hypervalent states listed for P, S, halogens, Xe.
 */
const VALENCE: Record<string, number[]> = {
  H: [1], He: [0], Li: [1], Be: [2], B: [3], C: [4], N: [3], O: [2], F: [1], Ne: [0],
  Na: [1], Mg: [2], Al: [3], Si: [4], P: [3, 5], S: [2, 4, 6], Cl: [1, 3, 5, 7], Ar: [0],
  K: [1], Ca: [2], Ge: [4], As: [3, 5], Se: [2, 4, 6], Br: [1, 3, 5], Kr: [0, 2], I: [1, 3, 5, 7], Xe: [0, 2, 4, 6], Sn: [2, 4], Sb: [3, 5], Te: [2, 4, 6],
};
/** Charge adjustment: Group 13–14 (B, C, Si…) gain valence with −, Group 15–17 gain with + and lose with −. */
function allowedValences(Z: number, charge: number): number[] | null {
  const base = VALENCE[sym(Z)];
  if (!base) return null; // transition metals etc.: no simple rule — not checked
  if (charge === 0) return base;
  const group = tablePosition(Z).group ?? 0; // derived from Z (PubChem's group field is sparse)
  const shift = group >= 15 ? charge : group === 13 ? -charge : -Math.abs(charge); // C⁺/C⁻ → 3; B⁻ → 4; N⁺ → 4; O⁻ → 1
  return base.map((v) => v + shift).filter((v) => v >= 0);
}

export interface ValenceIssue { atom: number; severity: 'error' | 'warning'; message: string }

export function validateValence(s: Structure): ValenceIssue[] {
  const issues: ValenceIssue[] = [];
  s.atoms.forEach((a, i) => {
    const used = bondOrderSum(s, i);
    const allowed = allowedValences(a.Z, a.charge);
    const label = `${sym(a.Z)}${i + 1}${a.charge ? (a.charge > 0 ? `${a.charge > 1 ? a.charge : ''}+` : `${a.charge < -1 ? -a.charge : ''}−`) : ''}`;
    if (!allowed) { issues.push({ atom: i, severity: 'warning', message: `${label}: no simple valence rule for ${ELEMENTS[a.Z - 1].name} — not checked` }); return; }
    const max = Math.max(...allowed);
    if (used > max) issues.push({ atom: i, severity: 'error', message: `${label}: bond-order sum ${used} exceeds maximum valence ${max}` });
    else if (!allowed.includes(used)) {
      const next = allowed.find((v) => v >= used)!;
      issues.push({ atom: i, severity: 'warning', message: `${label}: bond-order sum ${used} — ${next - used} open valence (radical or missing hydrogens)` });
    }
  });
  for (const b of s.bonds) {
    const d = norm(sub(pos(s.atoms[b.a]), pos(s.atoms[b.b])));
    if (d < 0.5) issues.push({ atom: b.a, severity: 'error', message: `${sym(s.atoms[b.a].Z)}${b.a + 1}–${sym(s.atoms[b.b].Z)}${b.b + 1}: atoms overlap (${d.toFixed(2)} Å)` });
  }
  return issues;
}

/** Open valences = smallest allowed valence ≥ current bond-order sum, minus that sum. */
export function openValence(s: Structure, i: number): number {
  const allowed = allowedValences(s.atoms[i].Z, s.atoms[i].charge);
  if (!allowed) return 0;
  const used = bondOrderSum(s, i);
  const next = allowed.find((v) => v >= used);
  return next === undefined ? 0 : next - used;
}

// ------------------------------------------------------------------ geometry helpers
/** Direction for a new substituent on atom i: opposite the mean of existing bond directions (VSEPR-like). */
export function freeDirection(s: Structure, i: number, seed = 0): Vec3 {
  const p = pos(s.atoms[i]);
  const dirs = neighbours(s, i).map((j) => normalize(sub(pos(s.atoms[j]), p)));
  if (!dirs.length) return [1, 0, 0];
  if (dirs.length === 1) {
    // ~109.5° from the existing bond, rotated by seed around it
    const d0 = dirs[0];
    const perp = normalize(Math.abs(d0[0]) < 0.9 ? cross(d0, [1, 0, 0]) : cross(d0, [0, 1, 0]));
    const perp2 = cross(d0, perp);
    const phi = (seed * 2 * Math.PI) / 3;
    const side = add(scale(perp, Math.cos(phi)), scale(perp2, Math.sin(phi)));
    return normalize(add(scale(d0, -0.334), scale(side, 0.943)));
  }
  const sum = dirs.reduce((t, d) => add(t, d), [0, 0, 0] as Vec3);
  if (norm(sum) > 1e-3) {
    let d = normalize(scale(sum, -1));
    if (dirs.length === 2 && seed % 2 === 1) {
      // second substituent on an sp3 centre with two neighbours: tilt out of their plane
      const n = normalize(cross(dirs[0], dirs[1]));
      d = normalize(add(scale(d, 0.58), scale(n, seed % 4 === 1 ? 0.81 : -0.81)));
    } else if (dirs.length === 2) {
      const n = normalize(cross(dirs[0], dirs[1]));
      d = normalize(add(scale(d, 0.58), scale(n, 0.81)));
    }
    return d;
  }
  // neighbours cancel (e.g. linear): pick a perpendicular
  return normalize(Math.abs(dirs[0][0]) < 0.9 ? cross(dirs[0], [1, 0, 0]) : cross(dirs[0], [0, 1, 0]));
}

// ------------------------------------------------------------------ operations (all pure)
export function addAtom(s: Structure, Z: number, at: Vec3): Structure {
  return { atoms: [...s.atoms, { Z, x: at[0], y: at[1], z: at[2], charge: 0 }], bonds: s.bonds };
}

/** Add a new atom bonded (single) to atom `parent`, placed along a free direction. */
export function addBondedAtom(s: Structure, parent: number, Z: number, seed = neighbours(s, parent).length): Structure {
  const d = freeDirection(s, parent, seed);
  const p = add(pos(s.atoms[parent]), scale(d, idealBondLength(s.atoms[parent].Z, Z)));
  const t = addAtom(s, Z, p);
  return { ...t, bonds: [...t.bonds, { a: parent, b: t.atoms.length - 1, order: 1 }] };
}

/** Create a single bond, or cycle an existing bond's order 1 → 2 → 3 → 1. */
export function toggleBond(s: Structure, i: number, j: number): Structure {
  if (i === j) return s;
  const k = bondIndex(s, i, j);
  if (k < 0) return { ...s, bonds: [...s.bonds, { a: i, b: j, order: 1 }] };
  return { ...s, bonds: s.bonds.map((b, n) => (n === k ? { ...b, order: (b.order % 3) + 1 } : b)) };
}

export function setBondOrder(s: Structure, k: number, order: number): Structure {
  return { ...s, bonds: s.bonds.map((b, n) => (n === k ? { ...b, order } : b)) };
}

export function deleteBond(s: Structure, k: number): Structure {
  return { ...s, bonds: s.bonds.filter((_, n) => n !== k) };
}

/** Remove an atom and its bonds; re-index the remaining bonds. */
export function deleteAtom(s: Structure, i: number): Structure {
  const map = (j: number) => (j > i ? j - 1 : j);
  return {
    atoms: s.atoms.filter((_, n) => n !== i),
    bonds: s.bonds.filter((b) => b.a !== i && b.b !== i).map((b) => ({ ...b, a: map(b.a), b: map(b.b) })),
  };
}

export function replaceElement(s: Structure, i: number, Z: number): Structure {
  return { ...s, atoms: s.atoms.map((a, n) => (n === i ? { ...a, Z } : a)) };
}

/** Cycle formal charge 0 → +1 → −1 → 0. */
export function cycleCharge(s: Structure, i: number): Structure {
  const next = (q: number) => (q === 0 ? 1 : q === 1 ? -1 : 0);
  return { ...s, atoms: s.atoms.map((a, n) => (n === i ? { ...a, charge: next(a.charge) } : a)) };
}

export function moveAtom(s: Structure, i: number, to: Vec3): Structure {
  return { ...s, atoms: s.atoms.map((a, n) => (n === i ? withPos(a, to) : a)) };
}

/** Atoms connected to i (its fragment), optionally not crossing the bond (i, blocked). */
export function fragmentOf(s: Structure, i: number, blocked?: number): number[] {
  const seen = new Set([i]);
  const stack = [i];
  while (stack.length) {
    const k = stack.pop()!;
    for (const j of neighbours(s, k)) {
      if (k === i && j === blocked) continue;
      if (!seen.has(j)) { seen.add(j); stack.push(j); }
    }
  }
  return [...seen].sort((a, b) => a - b);
}

export function translateAtoms(s: Structure, idx: number[], delta: Vec3): Structure {
  const set = new Set(idx);
  return { ...s, atoms: s.atoms.map((a, n) => (set.has(n) ? withPos(a, add(pos(a), delta)) : a)) };
}

/** Duplicate the fragment containing atom i, offset by `offset` Å. */
export function duplicateFragment(s: Structure, i: number, offset: Vec3 = [3, 0, 0]): Structure {
  const frag = fragmentOf(s, i);
  const base = s.atoms.length;
  const remap = new Map(frag.map((k, n) => [k, base + n]));
  const atoms = [...s.atoms, ...frag.map((k) => withPos(s.atoms[k], add(pos(s.atoms[k]), offset)))];
  const bonds = [...s.bonds, ...s.bonds.filter((b) => remap.has(b.a) && remap.has(b.b)).map((b) => ({ ...b, a: remap.get(b.a)!, b: remap.get(b.b)! }))];
  return { atoms, bonds };
}

/** True if the bond lies in a ring (removing it leaves its ends connected). */
export function bondInRing(s: Structure, k: number): boolean {
  const b = s.bonds[k];
  return fragmentOf(s, b.a, b.b).includes(b.b);
}

/**
 * Rotate the side of bond k that contains atom `side` about the bond axis by `angleRad`
 * (dihedral rotation). Refused for ring bonds.
 */
export function rotateAboutBond(s: Structure, k: number, angleRad: number, side?: number): Structure {
  if (bondInRing(s, k)) throw new Error('Cannot rotate about a ring bond');
  const b = s.bonds[k];
  const moving = side ?? b.b;
  const pivot = moving === b.b ? b.a : b.b;
  const frag = fragmentOf(s, moving, pivot);
  const o = pos(s.atoms[pivot]);
  const axis = normalize(sub(pos(s.atoms[moving]), o));
  const c = Math.cos(angleRad), sn = Math.sin(angleRad);
  const set = new Set(frag);
  return {
    ...s,
    atoms: s.atoms.map((a, n) => {
      if (!set.has(n)) return a;
      const v = sub(pos(a), o);
      // Rodrigues rotation
      const r = add(add(scale(v, c), scale(cross(axis, v), sn)), scale(axis, dot(axis, v) * (1 - c)));
      return withPos(a, add(o, r));
    }),
  };
}

/** Fill open valences with hydrogens (idempotent). */
export function addHydrogens(s: Structure): Structure {
  let t = s;
  const n0 = s.atoms.length;
  for (let i = 0; i < n0; i++) {
    if (t.atoms[i].Z === 1) continue;
    const need = openValence(t, i);
    for (let k = 0; k < need; k++) t = addBondedAtom(t, i, 1);
  }
  return t;
}

export function centroidOf(s: Structure): Vec3 {
  if (!s.atoms.length) return [0, 0, 0];
  return scale(s.atoms.reduce((t, a) => add(t, pos(a)), [0, 0, 0] as Vec3), 1 / s.atoms.length);
}
