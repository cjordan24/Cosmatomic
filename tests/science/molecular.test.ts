/**
 * Scientific validation — molecular records.
 * Geometries are PubChem3D MMFF94s conformers (computed), so tolerances are
 * set against experimental gas-phase values with force-field-level slack.
 */
import { describe, expect, it } from 'vitest';
import { MOLECULES, hillFormula, molecularMass, bondLength, bondAngle, neighbours, bondStats, radiusOfGyration, type MoleculeRecord } from '@/modes/atomic/molecules/molecules';

/** MMFF94s typically deviates ≤ 0.04 Å from experimental bond lengths (CO₂ C=O: 1.197 vs 1.160 Å observed). */
const MMFF_BOND_TOL = 0.05;
const byName = (n: string) => MOLECULES.find((m) => m.name.toLowerCase() === n)!;
const firstOf = (m: MoleculeRecord, Z: number) => m.atoms.findIndex((a) => a.Z === Z);

describe('Molecular formulas and masses', () => {
  it('Hill formula computed from 3D atoms equals the PubChem formula for every record', () => {
    for (const m of MOLECULES) expect(hillFormula(m.atoms), m.name).toBe(m.formula);
  });
  // PubChem reports MW at varying precision (e.g. 280.4 for linoleic acid). Tolerance = half a unit in the last
  // reported decimal + 0.006 u for atomic-weight uncertainty.
  it('molecular mass from IUPAC atomic weights matches PubChem MW within its reported precision', () => {
    for (const m of MOLECULES) {
      const mm = molecularMass(m.atoms);
      const decimals = (String(m.molecularWeight).split('.')[1] ?? '').length;
      expect(Math.abs(mm - m.molecularWeight), m.name).toBeLessThan(0.5 * 10 ** -decimals + 0.006);
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
  it('C60: 60 atoms, 90 bonds (30 6:6 at 1.401 Å, 60 5:6 at 1.458 Å, ±1e-9), every carbon 3-coordinate, radius 3.55 Å (±0.02)', () => {
    const m = byName('buckminsterfullerene');
    expect(m.atoms).toHaveLength(60);
    expect(m.bonds).toHaveLength(90);
    const d66 = m.bonds.filter((b) => b.order === 2).map((b) => bondLength(m, b.a, b.b));
    const d56 = m.bonds.filter((b) => b.order === 1).map((b) => bondLength(m, b.a, b.b));
    expect(d66).toHaveLength(30); expect(d56).toHaveLength(60);
    for (const x of d66) expect(Math.abs(x - 1.401)).toBeLessThan(1e-9);
    for (const x of d56) expect(Math.abs(x - 1.458)).toBeLessThan(1e-9);
    for (let i = 0; i < 60; i++) expect(neighbours(m, i)).toHaveLength(3);
    const r = Math.hypot(m.atoms[0].x, m.atoms[0].y, m.atoms[0].z);
    expect(Math.abs(r - 3.55)).toBeLessThan(0.02);
  });
  it('every PubChem-sourced record carries computed descriptors (guards against stale ingestion caches)', () => {
    for (const m of MOLECULES.filter((x) => x.id.startsWith('pubchem-'))) {
      expect(m.computed, m.name).toBeDefined();
      expect(m.computed!.exactMassU, m.name).not.toBeNull();
    }
    expect(byName('ethanol').computed!.xlogp).toBe(-0.1);
  });
  it('library holds ≥ 100 validated records with unique identifiers', () => {
    expect(MOLECULES.length).toBeGreaterThanOrEqual(100);
    expect(new Set(MOLECULES.map((m) => m.id)).size).toBe(MOLECULES.length);
  });
  it('H₂ uses experimental r_e = 0.74144 Å (observed provenance)', () => {
    const m = byName('hydrogen');
    expect(bondLength(m, 0, 1)).toBeCloseTo(0.74144, 5);
    expect(m.geometry.experimental).toBe(true);
  });
});

describe('Comparison statistics', () => {
  it('benzene bond stats: 3 C–C + 3 C=C Kekulé bonds all ≈ 1.397 Å, 6 C–H; counts sum to the bond total', () => {
    const m = byName('benzene');
    const st = bondStats(m);
    expect(st.reduce((t, s) => t + s.n, 0)).toBe(m.bonds.length);
    expect(st.find((s) => s.pair === 'C–H')!.n).toBe(6);
    for (const s of st.filter((s) => s.pair.startsWith('C') && s.pair.endsWith('C'))) expect(Math.abs(s.mean - 1.397)).toBeLessThan(0.03);
  });
  it('C60 radius of gyration equals its cage radius (all atoms equidistant from the centre)', () => {
    const m = byName('buckminsterfullerene');
    expect(Math.abs(radiusOfGyration(m) - Math.hypot(m.atoms[0].x, m.atoms[0].y, m.atoms[0].z))).toBeLessThan(1e-9);
  });
});
