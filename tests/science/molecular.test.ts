/**
 * Scientific validation — molecular records.
 * Geometries are PubChem3D MMFF94s conformers (computed), so tolerances are
 * set against experimental gas-phase values with force-field-level slack.
 */
import { describe, expect, it } from 'vitest';
import { MOLECULES, hillFormula, molecularMass, bondLength, bondAngle, neighbours, type MoleculeRecord } from '@/modes/atomic/molecules/molecules';

/** MMFF94s typically deviates ≤ 0.04 Å from experimental bond lengths (CO₂ C=O: 1.197 vs 1.160 Å observed). */
const MMFF_BOND_TOL = 0.05;
const byName = (n: string) => MOLECULES.find((m) => m.name.toLowerCase() === n)!;
const firstOf = (m: MoleculeRecord, Z: number) => m.atoms.findIndex((a) => a.Z === Z);

describe('Molecular formulas and masses', () => {
  it('Hill formula computed from 3D atoms equals the PubChem formula for every record', () => {
    for (const m of MOLECULES) expect(hillFormula(m.atoms), m.name).toBe(m.formula);
  });
  it('molecular mass from IUPAC atomic weights matches PubChem MW within 0.02 u (or 0.01 %)', () => {
    for (const m of MOLECULES) {
      const mm = molecularMass(m.atoms);
      expect(Math.abs(mm - m.molecularWeight), m.name).toBeLessThan(Math.max(0.02, m.molecularWeight * 1e-4));
    }
  });
  it('every bond references valid atoms, has order 1–3, and no atom pair is bonded twice', () => {
    for (const m of MOLECULES) {
      const seen = new Set<string>();
      for (const b of m.bonds) {
        expect(b.a).toBeGreaterThanOrEqual(0); expect(b.b).toBeLessThan(m.atoms.length);
        expect([1, 2, 3]).toContain(b.order);
        const k = [Math.min(b.a, b.b), Math.max(b.a, b.b)].join('-');
        expect(seen.has(k), `${m.name} duplicate bond ${k}`).toBe(false); seen.add(k);
      }
    }
  });
  it('bonded distances are physically plausible (0.6–2.5 Å)', () => {
    for (const m of MOLECULES) for (const b of m.bonds) {
      const d = bondLength(m, b.a, b.b);
      expect(d, `${m.name} ${b.a}-${b.b}`).toBeGreaterThan(0.6); expect(d).toBeLessThan(2.5);
    }
  });
});

describe('Reference geometries (experimental values; MMFF tolerance)', () => {
  it('water: O–H = 0.958 Å (±0.03), H–O–H = 104.5° (±2.5°)', () => {
    const w = byName('water'); const o = firstOf(w, 8); const [h1, h2] = neighbours(w, o);
    expect(Math.abs(bondLength(w, o, h1) - 0.958)).toBeLessThan(0.03);
    expect(Math.abs(bondAngle(w, h1, o, h2) - 104.5)).toBeLessThan(2.5);
  });
  it('carbon dioxide is linear: O=C=O = 180° (±1°), C=O = 1.160 Å (±MMFF_BOND_TOL 0.05)', () => {
    const m = byName('carbon dioxide'); const c = firstOf(m, 6); const [o1, o2] = neighbours(m, c);
    expect(Math.abs(bondAngle(m, o1, c, o2) - 180)).toBeLessThan(1);
    expect(Math.abs(bondLength(m, c, o1) - 1.16)).toBeLessThan(MMFF_BOND_TOL);
  });
  it('methane is tetrahedral: H–C–H = 109.47° (±1°), C–H = 1.087 Å (±0.03)', () => {
    const m = byName('methane'); const c = firstOf(m, 6); const hs = neighbours(m, c);
    for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) expect(Math.abs(bondAngle(m, hs[i], c, hs[j]) - 109.47)).toBeLessThan(1);
    expect(Math.abs(bondLength(m, c, hs[0]) - 1.087)).toBeLessThan(0.03);
  });
  it('ammonia is pyramidal: H–N–H = 106.7° (±3°)', () => {
    const m = byName('ammonia'); const n = firstOf(m, 7); const [a, b] = neighbours(m, n);
    expect(Math.abs(bondAngle(m, a, n, b) - 106.7)).toBeLessThan(3);
  });
  it('benzene: all six ring C–C bonds = 1.397 Å (±0.03) despite Kekulé bond orders', () => {
    const m = byName('benzene');
    const cc = m.bonds.filter((b) => m.atoms[b.a].Z === 6 && m.atoms[b.b].Z === 6);
    expect(cc).toHaveLength(6);
    for (const b of cc) expect(Math.abs(bondLength(m, b.a, b.b) - 1.397)).toBeLessThan(0.03);
  });
  it('H₂ uses experimental r_e = 0.74144 Å (observed provenance)', () => {
    const m = byName('hydrogen');
    expect(bondLength(m, 0, 1)).toBeCloseTo(0.74144, 5);
    expect(m.geometry.experimental).toBe(true);
  });
});
