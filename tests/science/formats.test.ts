/** Structure-format round trips and connectivity inference, over the whole curated library. */
import { describe, expect, it } from 'vitest';
import { MOLECULES, type MoleculeRecord } from '@/modes/atomic/molecules/molecules';
import { toMolV2000, parseMol, toSDF, parseSDF, toPDB, parsePDB, toXYZ, parseXYZ, inferBonds, FormatError, parseByExtension } from '@/modes/atomic/molecules/formats';

const bondSet = (m: MoleculeRecord, withOrder = true) => new Set(m.bonds.map((b) => `${Math.min(b.a, b.b)}-${Math.max(b.a, b.b)}${withOrder ? `:${b.order}` : ''}`));
const maxCoordErr = (a: MoleculeRecord, b: MoleculeRecord) => Math.max(...a.atoms.map((x, i) => Math.hypot(x.x - b.atoms[i].x, x.y - b.atoms[i].y, x.z - b.atoms[i].z)));

describe('MOL / SDF V2000', () => {
  it('round-trips every library molecule: elements, charges, bond orders exact; coordinates within 1e-4 Å', () => {
    for (const m of MOLECULES) {
      const r = parseMol(toMolV2000(m));
      expect(r.atoms.map((a) => [a.Z, a.charge]), m.name).toEqual(m.atoms.map((a) => [a.Z, a.charge]));
      expect(bondSet(r), m.name).toEqual(bondSet(m));
      expect(maxCoordErr(r, m), m.name).toBeLessThan(1e-4 * Math.sqrt(3) + 1e-9);
      expect(r.formula, m.name).toBe(m.formula);
    }
  });
  it('SDF first record parses identically to MOL', () => {
    const m = MOLECULES.find((x) => x.name === 'Caffeine')!;
    expect(bondSet(parseSDF(toSDF(m)))).toEqual(bondSet(m));
  });
  it('rejects aromatic bond type 4 and V3000 with explicit errors', () => {
    const benzene = toMolV2000(MOLECULES.find((x) => x.name === 'Benzene')!).replace(/(\n\s+1\s+2\s+)[12](\s+0)/, '$14$2');
    expect(() => parseMol(benzene)).toThrow(FormatError);
    expect(() => parseMol('x\n\n\n  0  0  0     0  0            999 V3000\n')).toThrow(/V3000/);
  });
});

describe('PDB', () => {
  it('round-trips connectivity and bond orders (via repeated CONECT) for every library molecule', () => {
    for (const m of MOLECULES) {
      const r = parsePDB(toPDB(m));
      expect(r.atoms.map((a) => a.Z), m.name).toEqual(m.atoms.map((a) => a.Z));
      expect(bondSet(r), m.name).toEqual(bondSet(m));
      expect(maxCoordErr(r, m), m.name).toBeLessThan(1e-3 * Math.sqrt(3) + 1e-9);
    }
  });
});

describe('XYZ + covalent-radius connectivity inference', () => {
  it('inferred connectivity equals the PubChem connectivity for every library molecule (orders ignored)', () => {
    for (const m of MOLECULES) {
      const { bonds, missingRadii } = inferBonds(m.atoms);
      expect(missingRadii, m.name).toEqual([]);
      expect(new Set(bonds.map((b) => `${b.a}-${b.b}`)), m.name).toEqual(bondSet(m, false));
    }
  });
  it('XYZ round trip preserves elements and coordinates (1e-6 Å) and labels bonds as inferred', () => {
    const m = MOLECULES.find((x) => x.name === 'Glucose')!;
    const r = parseXYZ(toXYZ(m));
    expect(maxCoordErr(r, m)).toBeLessThan(2e-6);
    expect(r.geometry.source).toMatch(/inferred/);
    expect(r.geometry.provenance).toBe('hypothetical');
  });
  it('rejects malformed input and unknown file types', () => {
    expect(() => parseXYZ('two\n\nC 0 0 0')).toThrow(FormatError);
    expect(() => parseXYZ('1\n\nXx 0 0 0')).toThrow(/Unknown element/);
    expect(() => parseByExtension('a.cif', '')).toThrow(/Unsupported/);
  });
});
