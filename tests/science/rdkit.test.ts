/**
 * Independent cross-validation with RDKit (MinimalLib): our 3D coordinates + bonds must reproduce
 * PubChem's published InChIKeys, and RDKit sanitisation must agree with the in-house valence model.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import initRDKitModule from '@rdkit/rdkit';
import type { MainModule as RDKitModule } from '@rdkit/rdkit';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { identify } from '@/modes/atomic/laboratory/rdkit';
import { EMPTY, addAtom, addBondedAtom, addHydrogens, validateValence } from '@/modes/atomic/laboratory/builder';

let rdkit: RDKitModule;
beforeAll(async () => { rdkit = await (initRDKitModule as unknown as () => Promise<RDKitModule>)(); }, 60_000);

describe('RDKit cross-validation', () => {
  it('InChIKey connectivity layer (first 14 chars) matches PubChem for every PubChem record', () => {
    const recs = MOLECULES.filter((m) => m.inchiKey);
    expect(recs.length).toBeGreaterThan(130);
    for (const m of recs) {
      const id = identify(rdkit, { atoms: m.atoms, bonds: m.bonds });
      expect(id.valid, m.name).toBe(true);
      expect(id.inchiKey?.slice(0, 14), m.name).toBe(m.inchiKey!.slice(0, 14));
    }
  });
  // A 3D conformer always has a definite configuration at every stereocentre, whereas PubChem leaves some undefined
  // (racemates such as ibuprofen, lactic acid, propylene oxide; the anomeric carbon of sugars). Full-key mismatches are
  // therefore allowed ONLY when RDKit perceives more stereo descriptors than PubChem specifies.
  it('full InChIKey matches PubChem except where the 3D conformer fixes stereo PubChem leaves undefined', () => {
    // count stereo DESCRIPTORS: '@' and '@@' are one tetrahedral centre each; '/' and '\\' mark double-bond stereo
    const stereo = (smi: string) => (smi.match(/@@?|\/|\\/g) ?? []).length;
    const recs = MOLECULES.filter((m) => m.inchiKey);
    let exact = 0;
    for (const m of recs) {
      const id = identify(rdkit, { atoms: m.atoms, bonds: m.bonds });
      if (id.inchiKey === m.inchiKey) { exact++; continue; }
      expect(stereo(id.smiles!), `${m.name}: RDKit ${id.smiles} vs PubChem ${m.smiles}`).toBeGreaterThan(stereo(m.smiles ?? ''));
    }
    expect(exact / recs.length).toBeGreaterThan(0.9);
  });
  it('a builder-made ethanol is identified as ethanol (InChIKey LFQSCWFLJHTTHZ-UHFFFAOYSA-N)', () => {
    let s = addAtom(EMPTY, 6, [0, 0, 0]);
    s = addHydrogens(addBondedAtom(addBondedAtom(s, 0, 6), 1, 8));
    expect(identify(rdkit, s)).toMatchObject({ valid: true, smiles: 'CCO', inchiKey: 'LFQSCWFLJHTTHZ-UHFFFAOYSA-N' });
  });
  it('RDKit refuses pentavalent carbon, agreeing with the in-house valence model', () => {
    let s = addAtom(EMPTY, 6, [0, 0, 0]);
    for (let k = 0; k < 5; k++) s = addBondedAtom(s, 0, 1);
    expect(validateValence(s).some((i) => i.severity === 'error')).toBe(true);
    expect(identify(rdkit, s).valid).toBe(false);
  });
});
