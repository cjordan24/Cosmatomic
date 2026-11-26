/** Molecular builder: pure operations and the valence model. */
import { describe, expect, it } from 'vitest';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { hillFormula } from '@/modes/atomic/molecules/molecules';
import { EMPTY, addAtom, addBondedAtom, addHydrogens, toggleBond, deleteAtom, cycleCharge, validateValence, rotateAboutBond, duplicateFragment, fragmentOf, bondInRing, replaceElement, openValence, type Structure } from '@/modes/atomic/laboratory/builder';
import { norm, sub } from '@/core/mathematics/vec3';

const P = (s: Structure, i: number): [number, number, number] => [s.atoms[i].x, s.atoms[i].y, s.atoms[i].z];
const minDistance = (s: Structure) => { let m = Infinity; for (let i = 0; i < s.atoms.length; i++) for (let j = i + 1; j < s.atoms.length; j++) m = Math.min(m, norm(sub(P(s, i), P(s, j)))); return m; };

describe('Valence model', () => {
  it('every curated library molecule validates with zero errors; the only warning is the NO radical', () => {
    const warned: string[] = [];
    for (const m of MOLECULES) {
      const issues = validateValence({ atoms: m.atoms, bonds: m.bonds });
      expect(issues.filter((x) => x.severity === 'error'), m.name).toEqual([]);
      if (issues.some((x) => x.severity === 'warning')) warned.push(m.name);
    }
    expect(warned).toEqual(['Nitric oxide']);
  });
  it('flags pentavalent carbon as an error and accepts ammonium N⁺ with four bonds', () => {
    let s = addAtom(EMPTY, 6, [0, 0, 0]);
    for (let k = 0; k < 5; k++) s = addBondedAtom(s, 0, 1);
    expect(validateValence(s).some((x) => x.severity === 'error' && /exceeds maximum valence 4/.test(x.message))).toBe(true);
    let n = addAtom(EMPTY, 7, [0, 0, 0]);
    n = cycleCharge(n, 0); // N⁺
    for (let k = 0; k < 4; k++) n = addBondedAtom(n, 0, 1);
    expect(validateValence(n)).toEqual([]);
  });
  it('open valence: C with one bond has 3; O⁻ with one bond has 0', () => {
    const s = addBondedAtom(addAtom(EMPTY, 6, [0, 0, 0]), 0, 6);
    expect(openValence(s, 0)).toBe(3);
    const o = cycleCharge(cycleCharge(addBondedAtom(addAtom(EMPTY, 8, [0, 0, 0]), 0, 6), 0), 0); // 0 → +1 → −1
    expect(o.atoms[0].charge).toBe(-1);
    expect(openValence(o, 0)).toBe(0);
  });
});

describe('Building structures', () => {
  it('builds ethanol from scratch: C–C–O + hydrogens → C2H6O, valid, no overlapping atoms', () => {
    let s = addAtom(EMPTY, 6, [0, 0, 0]);
    s = addBondedAtom(s, 0, 6);
    s = addBondedAtom(s, 1, 8);
    s = addHydrogens(s);
    expect(hillFormula(s.atoms)).toBe('C2H6O');
    expect(validateValence(s)).toEqual([]);
    expect(minDistance(s)).toBeGreaterThan(0.9);
    expect(addHydrogens(s).atoms.length).toBe(s.atoms.length); // idempotent
  });
  it('bond-order cycling makes ethylene and acetylene with the right hydrogen counts', () => {
    const base = addBondedAtom(addAtom(EMPTY, 6, [0, 0, 0]), 0, 6);
    expect(hillFormula(addHydrogens(toggleBond(base, 0, 1)).atoms)).toBe('C2H4');
    expect(hillFormula(addHydrogens(toggleBond(toggleBond(base, 0, 1), 0, 1)).atoms)).toBe('C2H2');
  });
  it('deleteAtom re-indexes bonds; replaceElement keeps connectivity', () => {
    let s = addBondedAtom(addBondedAtom(addAtom(EMPTY, 6, [0, 0, 0]), 0, 6), 1, 8);
    s = deleteAtom(s, 0);
    expect(s.atoms.map((a) => a.Z)).toEqual([6, 8]);
    expect(s.bonds).toEqual([{ a: 0, b: 1, order: 1 }]);
    expect(replaceElement(s, 1, 16).bonds).toEqual(s.bonds);
  });
  it('rotation about a single bond preserves every bond length (1e-9 Å) and changes the dihedral; ring bonds are refused', () => {
    const butane = MOLECULES.find((m) => m.name === 'Butane')!;
    const s: Structure = { atoms: butane.atoms, bonds: butane.bonds };
    const cc = s.bonds.findIndex((b) => s.atoms[b.a].Z === 6 && s.atoms[b.b].Z === 6 && !bondInRing(s, s.bonds.indexOf(b)));
    const r = rotateAboutBond(s, cc, Math.PI / 3);
    for (const b of s.bonds) expect(Math.abs(norm(sub(P(r, b.a), P(r, b.b))) - norm(sub(P(s, b.a), P(s, b.b))))).toBeLessThan(1e-9);
    expect(r.atoms.some((a, i) => Math.abs(a.x - s.atoms[i].x) > 0.1)).toBe(true);
    const benzene = MOLECULES.find((m) => m.name === 'Benzene')!;
    const bz: Structure = { atoms: benzene.atoms, bonds: benzene.bonds };
    const ring = bz.bonds.findIndex((b) => bz.atoms[b.a].Z === 6 && bz.atoms[b.b].Z === 6);
    expect(bondInRing(bz, ring)).toBe(true);
    expect(() => rotateAboutBond(bz, ring, 1)).toThrow(/ring/);
  });
  it('duplicateFragment copies atoms and internal bonds with an offset', () => {
    const w = MOLECULES.find((m) => m.name === 'Water')!;
    const d = duplicateFragment({ atoms: w.atoms, bonds: w.bonds }, 0, [3, 0, 0]);
    expect(d.atoms).toHaveLength(6);
    expect(d.bonds).toHaveLength(4);
    expect(fragmentOf(d, 3)).toEqual([3, 4, 5]);
    expect(Math.abs(d.atoms[3].x - w.atoms[0].x - 3)).toBeLessThan(1e-12);
  });
});
