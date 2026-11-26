/**
 * Adapter: PubChem PUG REST — curated molecule set with 3D conformers.
 *
 * Source docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
 *   name → CID:     /rest/pug/compound/name/{name}/cids/JSON
 *   properties:     /rest/pug/compound/cid/{cid}/property/.../JSON
 *   3D conformer:   /rest/pug/compound/cid/{cid}/record/JSON?record_type=3d
 * PubChem 3D conformers are COMPUTED (MMFF94s-optimised), not experimental
 * structures; every record is labelled provenance "derived" accordingly.
 *
 * Output: datasets/molecular/molecules.json
 */
import { fetchJson, writeDataset } from './lib/ingest.ts';

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const RATE = { minIntervalMs: 300 };

/** Curated Phase-1 list. `tags` are factual categories; `ism` = detected in the interstellar medium. */
const CURATED: { name: string; category: string; ism?: boolean; context?: string }[] = [
  { name: 'hydrogen', category: 'fundamental', ism: true, context: 'Most abundant molecule in the universe; main constituent of molecular clouds.' },
  { name: 'nitrogen', category: 'fundamental', context: '~78% of Earth\'s dry atmosphere by volume.' },
  { name: 'oxygen', category: 'fundamental', context: '~21% of Earth\'s dry atmosphere by volume.' },
  { name: 'ozone', category: 'fundamental', context: 'Stratospheric ozone absorbs solar UV-B and UV-C.' },
  { name: 'water', category: 'fundamental', ism: true, context: 'Bent molecule (H–O–H ≈ 104.5°); detected in comets, moons, exoplanet atmospheres and the ISM.' },
  { name: 'hydrogen peroxide', category: 'fundamental' },
  { name: 'carbon dioxide', category: 'fundamental', ism: true, context: 'Dominant constituent of the atmospheres of Venus and Mars.' },
  { name: 'carbon monoxide', category: 'fundamental', ism: true, context: 'Principal tracer of molecular gas in galaxies (CO rotational lines).' },
  { name: 'ammonia', category: 'fundamental', ism: true, context: 'First polyatomic molecule detected in the ISM (1968).' },
  { name: 'methane', category: 'fundamental', ism: true, context: 'Major component of the atmospheres of Titan, Uranus and Neptune.' },
  { name: 'ethane', category: 'organic' },
  { name: 'ethylene', category: 'organic' },
  { name: 'acetylene', category: 'organic' },
  { name: 'propane', category: 'organic' },
  { name: 'butane', category: 'organic' },
  { name: 'benzene', category: 'organic', context: 'Prototype aromatic ring; C–C bonds are equivalent (~1.39 Å).' },
  { name: 'ethanol', category: 'organic', ism: true },
  { name: 'methanol', category: 'organic', ism: true },
  { name: 'acetone', category: 'organic', ism: true },
  { name: 'acetic acid', category: 'organic', ism: true },
  { name: 'formic acid', category: 'organic', ism: true },
  { name: 'cyclohexane', category: 'organic' },
  { name: 'naphthalene', category: 'organic' },
  { name: 'glucose', category: 'biological', context: 'Primary metabolic fuel; open-chain/ring forms interconvert in solution.' },
  { name: 'fructose', category: 'biological' },
  { name: 'sucrose', category: 'biological' },
  { name: 'glycine', category: 'biological', context: 'Simplest amino acid; detected in samples from comet 67P and asteroid Ryugu/Bennu returns.' },
  { name: 'L-alanine', category: 'biological' },
  { name: 'L-tryptophan', category: 'biological' },
  { name: 'palmitic acid', category: 'biological' },
  { name: 'adenine', category: 'biological' },
  { name: 'cytosine', category: 'biological' },
  { name: 'adenosine triphosphate', category: 'biological', context: 'Principal energy currency of the cell.' },
  { name: 'caffeine', category: 'biological' },
  { name: 'cholesterol', category: 'biological' },
  { name: 'hydrogen cyanide', category: 'astrophysical', ism: true, context: 'Detected in comets, Titan\'s atmosphere and the ISM.' },
  { name: 'formaldehyde', category: 'astrophysical', ism: true, context: 'First organic polyatomic molecule detected in the ISM (1969).' },
  { name: 'hydrogen sulfide', category: 'astrophysical', ism: true },
  { name: 'sulfur dioxide', category: 'astrophysical', ism: true, context: 'Major constituent of Io\'s thin atmosphere and Venus\'s clouds chemistry.' },
  { name: 'nitric oxide', category: 'astrophysical', ism: true },
  { name: 'cyanoacetylene', category: 'astrophysical', ism: true },
  { name: 'glycolaldehyde', category: 'astrophysical', ism: true },
  { name: 'methyl formate', category: 'astrophysical', ism: true },
  { name: 'nitrous oxide', category: 'fundamental' },
  { name: 'sulfuric acid', category: 'fundamental' },
  { name: 'nitric acid', category: 'fundamental' },
  { name: 'phosphoric acid', category: 'fundamental' },
  { name: 'urea', category: 'biological' },
  { name: 'aspirin', category: 'organic' },
  { name: 'buckminsterfullerene', category: 'materials', ism: true, context: 'C60 was identified in the ISM via its infrared bands (2010) and diffuse interstellar bands (C60+, 2015).' },
];

interface PropRes { PropertyTable: { Properties: Record<string, string | number>[] } }
interface Rec3D { PC_Compounds: { atoms: { aid: number[]; element: number[]; charge?: { aid: number; value: number }[] }; bonds?: { aid1: number[]; aid2: number[]; order: number[] }; coords: { conformers: { x: number[]; y: number[]; z: number[] }[] }[] }[] }

async function main() {
  const warnings: string[] = [];
  const molecules = [];
  for (const [i, item] of CURATED.entries()) {
    process.stdout.write(`\r  ${i + 1}/${CURATED.length} ${item.name.padEnd(28)}`);
    const slug = item.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    let cid: number;
    try {
      const r = await fetchJson<{ IdentifierList: { CID: number[] } }>(`${BASE}/compound/name/${encodeURIComponent(item.name)}/cids/JSON`, { ...RATE, cacheKey: `pubchem/mol-cid-${slug}.json` });
      cid = r.IdentifierList.CID[0];
    } catch (e) { warnings.push(`${item.name}: name lookup failed (${(e as Error).message})`); continue; }

    const props = (await fetchJson<PropRes>(
      `${BASE}/compound/cid/${cid}/property/Title,IUPACName,MolecularFormula,MolecularWeight,SMILES,ConnectivitySMILES,InChI,InChIKey,Charge/JSON`,
      { ...RATE, cacheKey: `pubchem/mol-props-${cid}.json` },
    )).PropertyTable.Properties[0];

    let rec: Rec3D;
    try {
      rec = await fetchJson<Rec3D>(`${BASE}/compound/cid/${cid}/record/JSON?record_type=3d`, { ...RATE, cacheKey: `pubchem/mol-3d-${cid}.json` });
    } catch (e) {
      warnings.push(`${item.name} (CID ${cid}): no PubChem 3D conformer (${(e as Error).message}); skipped`);
      continue;
    }
    const c = rec.PC_Compounds[0];
    const conf = c.coords[0].conformers[0];
    const charges = new Map((c.atoms.charge ?? []).map((q) => [q.aid, q.value]));
    const atoms = c.atoms.aid.map((aid, k) => ({ Z: c.atoms.element[k], x: conf.x[k], y: conf.y[k], z: conf.z[k], charge: charges.get(aid) ?? 0 }));
    const aidIndex = new Map(c.atoms.aid.map((aid, k) => [aid, k]));
    const bonds = (c.bonds?.aid1 ?? []).map((a1, k) => ({ a: aidIndex.get(a1)!, b: aidIndex.get(c.bonds!.aid2[k])!, order: c.bonds!.order[k] }));

    molecules.push({
      id: `pubchem-${cid}`,
      name: item.name.replace(/^./, (m) => m.toUpperCase()),
      title: props.Title,
      iupacName: props.IUPACName ?? null,
      category: item.category,
      detectedInISM: item.ism ?? false,
      context: item.context ?? null,
      formula: props.MolecularFormula,
      molecularWeight: Number(props.MolecularWeight),
      netCharge: Number(props.Charge ?? 0),
      smiles: props.SMILES ?? null,
      connectivitySmiles: props.ConnectivitySMILES ?? null,
      inchi: props.InChI ?? null,
      inchiKey: props.InChIKey ?? null,
      pubchemCid: cid,
      atoms,
      bonds,
      geometry: { source: 'PubChem3D computed conformer (MMFF94s)', units: 'angstrom', provenance: 'derived', experimental: false },
      sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    });
  }
  process.stdout.write('\n');
  writeDataset('datasets/molecular/molecules.json', molecules, {
    dataset: 'molecules', version: '1', records: molecules.length, adapter: 'scripts/ingestion/pubchem-molecules.ts', warnings,
    sources: [{ institution: 'PubChem (NCBI/NLM)', url: 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest', license: 'https://www.ncbi.nlm.nih.gov/home/about/policies/', notes: '3D coordinates are PubChem3D computed conformers, not experimental structures.' }],
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
