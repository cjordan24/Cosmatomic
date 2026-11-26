/**
 * RDKit-JS (MinimalLib, BSD-3-Clause) — lazy loader and structure identification.
 *
 * Used for: sanitisation (valence/aromaticity perception = an independent second validator),
 * canonical SMILES, InChI and InChIKey. The InChIKey is the shared identifier used to ask
 * PubChem whether a built structure is a known compound. MinimalLib has NO 3D embedding or
 * force fields, so geometry optimisation is implemented separately (Gate 2.3).
 *
 * Browser: the runtime is served from /vendor/rdkit (copied from node_modules at build time) and
 * injected only when the Laboratory first needs it (~7.4 MB WASM, cached by the browser).
 */
import type { MainModule as RDKitModule } from '@rdkit/rdkit';
import { toMolV2000 } from '../molecules/formats';
import type { MoleculeRecord } from '../molecules/molecules';
import type { Structure } from './builder';

let mod: RDKitModule | null = null;
let loading: Promise<RDKitModule> | null = null;

/** Test hook: provide an already-initialised module (Vitest loads the npm package directly). */
export const setRDKit = (m: RDKitModule) => { mod = m; };

export function loadRDKit(): Promise<RDKitModule> {
  if (mod) return Promise.resolve(mod);
  loading ??= new Promise<RDKitModule>((resolve, reject) => {
    const base = `${import.meta.env.BASE_URL}vendor/rdkit/`;
    const go = () => {
      const init = (window as unknown as { initRDKitModule?: (o: object) => Promise<RDKitModule> }).initRDKitModule;
      if (!init) { reject(new Error('RDKit-JS failed to load')); return; }
      init({ locateFile: (f: string) => base + f }).then((m) => { mod = m; resolve(m); }, reject);
    };
    if ((window as unknown as { initRDKitModule?: unknown }).initRDKitModule) { go(); return; }
    const s = document.createElement('script');
    s.src = `${base}RDKit_minimal.js`;
    s.async = true;
    s.onload = go;
    s.onerror = () => reject(new Error('Could not download RDKit-JS'));
    document.head.appendChild(s);
  });
  return loading;
}

export interface Identity {
  /** false when RDKit refuses to sanitise the structure (impossible valence, bad aromaticity, …) */
  valid: boolean;
  smiles: string | null;
  inchi: string | null;
  inchiKey: string | null;
  rdkitVersion: string;
  error: string | null;
}

/** Wrap a builder structure as a minimal record so the shared MOL writer can serialise it. */
export function structureRecord(s: Structure, name = 'Built structure'): MoleculeRecord {
  return {
    id: 'builder', name, iupacName: null, category: 'built', detectedInISM: false, context: null, formula: '', molecularWeight: 0,
    netCharge: s.atoms.reduce((t, a) => t + a.charge, 0), smiles: null, inchi: null, inchiKey: null, pubchemCid: null,
    atoms: s.atoms, bonds: s.bonds, geometry: { source: 'Voyager builder', units: 'angstrom', provenance: 'hypothetical', experimental: false }, sourceUrl: '',
  };
}

/** Sanitise with RDKit and derive canonical identifiers. Never throws for chemistry problems. */
export function identify(rdkit: RDKitModule, s: Structure): Identity {
  const version = rdkit.version();
  if (!s.atoms.length) return { valid: false, smiles: null, inchi: null, inchiKey: null, rdkitVersion: version, error: 'Empty structure' };
  let molblock: string;
  try { molblock = toMolV2000(structureRecord(s)); } catch (e) { return { valid: false, smiles: null, inchi: null, inchiKey: null, rdkitVersion: version, error: (e as Error).message }; }
  const mol = rdkit.get_mol(molblock, JSON.stringify({ sanitize: true, removeHs: false }));
  if (!mol || !mol.is_valid()) {
    mol?.delete();
    return { valid: false, smiles: null, inchi: null, inchiKey: null, rdkitVersion: version, error: 'RDKit could not sanitise this structure (chemically impossible valence or bonding).' };
  }
  try {
    // canonical SMILES in the conventional implicit-hydrogen form (validation above keeps every explicit H)
    const light = rdkit.get_mol(mol.remove_hs());
    const smiles = light ? light.get_smiles() : mol.get_smiles();
    light?.delete();
    const inchi = mol.get_inchi() || null;
    const inchiKey = inchi ? rdkit.get_inchikey_for_inchi(inchi) || null : null;
    return { valid: true, smiles, inchi, inchiKey, rdkitVersion: version, error: null };
  } finally {
    mol.delete();
  }
}
