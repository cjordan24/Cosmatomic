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
import { fetchJson, writeDataset, sha256 } from './lib/ingest.ts';
const PROPS = 'Title,IUPACName,MolecularFormula,MolecularWeight,ExactMass,SMILES,ConnectivitySMILES,InChI,InChIKey,Charge,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity';

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const RATE = { minIntervalMs: 300 };

/**
 * Curated library. `ism` = detected in the interstellar/circumstellar medium per the census of
 * McGuire (2022), ApJS 259, 30 ("2021 Census of Interstellar, Circumstellar, Extragalactic,
 * Protoplanetary Disk, and Exoplanetary Molecules"). Only well-established detections are flagged.
 * Salts, minerals and metals are deliberately excluded — they are extended lattices (Phase 4), not molecules.
 */
const CURATED: { name: string; category: string; ism?: boolean; context?: string }[] = [
  // ---- fundamental / atmospheric / inorganic
  { name: 'nitrogen', category: 'fundamental', context: "~78% of Earth's dry atmosphere by volume." },
  { name: 'oxygen', category: 'fundamental', context: "~21% of Earth's dry atmosphere by volume." },
  { name: 'ozone', category: 'fundamental', context: 'Stratospheric ozone absorbs solar UV-B and UV-C.' },
  { name: 'water', category: 'fundamental', ism: true, context: 'Bent molecule (H–O–H ≈ 104.5°); detected in comets, moons, exoplanet atmospheres and the ISM.' },
  { name: 'hydrogen peroxide', category: 'fundamental', ism: true },
  { name: 'carbon dioxide', category: 'fundamental', ism: true, context: 'Dominant constituent of the atmospheres of Venus and Mars.' },
  { name: 'carbon monoxide', category: 'fundamental', ism: true, context: 'Principal tracer of molecular gas in galaxies (CO rotational lines).' },
  { name: 'ammonia', category: 'fundamental', ism: true, context: 'First polyatomic molecule detected in the ISM (1968).' },
  { name: 'methane', category: 'fundamental', ism: true, context: 'Major component of the atmospheres of Titan, Uranus and Neptune.' },
  { name: 'nitrous oxide', category: 'fundamental', ism: true },
  { name: 'nitrogen dioxide', category: 'fundamental' },
  { name: 'sulfuric acid', category: 'fundamental', context: 'Main constituent of the cloud droplets of Venus.' },
  { name: 'nitric acid', category: 'fundamental' },
  { name: 'phosphoric acid', category: 'fundamental' },
  { name: 'hydrogen chloride', category: 'fundamental', ism: true },
  { name: 'hydrogen fluoride', category: 'fundamental', ism: true },
  { name: 'phosphine', category: 'fundamental', ism: true, context: 'Detected in the atmospheres of Jupiter and Saturn.' },
  { name: 'silane', category: 'fundamental', ism: true },
  { name: 'sulfur hexafluoride', category: 'fundamental', context: 'Octahedral molecule; potent greenhouse gas.' },
  { name: 'carbonyl sulfide', category: 'fundamental', ism: true },
  { name: 'hydrazine', category: 'fundamental', context: 'Spacecraft monopropellant — Voyager’s attitude-control thrusters burn hydrazine.' },
  // ---- organic
  { name: 'ethane', category: 'organic' },
  { name: 'ethylene', category: 'organic', ism: true },
  { name: 'acetylene', category: 'organic', ism: true },
  { name: 'propane', category: 'organic' },
  { name: 'propene', category: 'organic', ism: true },
  { name: 'butane', category: 'organic' },
  { name: 'isobutane', category: 'organic' },
  { name: 'hexane', category: 'organic' },
  { name: 'octane', category: 'organic' },
  { name: 'cyclopropane', category: 'organic' },
  { name: 'cyclohexane', category: 'organic' },
  { name: 'isoprene', category: 'organic' },
  { name: 'benzene', category: 'organic', ism: true, context: 'Prototype aromatic ring; C–C bonds are equivalent (~1.39 Å). Detected in the proto-planetary nebula CRL 618.' },
  { name: 'toluene', category: 'organic' },
  { name: 'styrene', category: 'organic' },
  { name: 'phenol', category: 'organic' },
  { name: 'aniline', category: 'organic' },
  { name: 'pyridine', category: 'organic' },
  { name: 'furan', category: 'organic' },
  { name: 'naphthalene', category: 'organic' },
  { name: 'anthracene', category: 'organic' },
  { name: 'methanol', category: 'organic', ism: true },
  { name: 'ethanol', category: 'organic', ism: true },
  { name: 'ethylene glycol', category: 'organic', ism: true },
  { name: 'glycerol', category: 'organic' },
  { name: 'dimethyl ether', category: 'organic', ism: true },
  { name: 'diethyl ether', category: 'organic' },
  { name: 'acetaldehyde', category: 'organic', ism: true },
  { name: 'acetone', category: 'organic', ism: true },
  { name: 'formic acid', category: 'organic', ism: true },
  { name: 'acetic acid', category: 'organic', ism: true },
  { name: 'propanoic acid', category: 'organic' },
  { name: 'ethyl acetate', category: 'organic' },
  { name: 'chloroform', category: 'organic' },
  { name: 'dichloromethane', category: 'organic' },
  { name: 'carbon tetrachloride', category: 'organic' },
  { name: 'methylamine', category: 'organic', ism: true },
  { name: 'acetonitrile', category: 'organic', ism: true },
  { name: 'formamide', category: 'organic', ism: true },
  { name: 'urea', category: 'biological', ism: true },
  // ---- astrophysical / interstellar
  { name: 'hydrogen cyanide', category: 'astrophysical', ism: true, context: "Detected in comets, Titan's atmosphere and the ISM." },
  { name: 'formaldehyde', category: 'astrophysical', ism: true, context: 'First organic polyatomic molecule detected in the ISM (1969).' },
  { name: 'hydrogen sulfide', category: 'astrophysical', ism: true },
  { name: 'sulfur dioxide', category: 'astrophysical', ism: true, context: "Major constituent of Io's thin atmosphere." },
  { name: 'cyanoacetylene', category: 'astrophysical', ism: true },
  { name: 'glycolaldehyde', category: 'astrophysical', ism: true, context: 'Simplest sugar-related molecule detected in the ISM (Sgr B2, 2000).' },
  { name: 'methyl formate', category: 'astrophysical', ism: true },
  { name: 'isocyanic acid', category: 'astrophysical', ism: true },
  { name: 'ketene', category: 'astrophysical', ism: true },
  { name: 'ethylene oxide', category: 'astrophysical', ism: true },
  { name: 'propylene oxide', category: 'astrophysical', ism: true, context: 'First chiral molecule detected in the ISM (Sgr B2, 2016).' },
  { name: 'vinyl alcohol', category: 'astrophysical', ism: true },
  { name: 'cyanamide', category: 'astrophysical', ism: true },
  { name: 'methanethiol', category: 'astrophysical', ism: true },
  { name: 'thioformaldehyde', category: 'astrophysical', ism: true },
  { name: 'benzonitrile', category: 'astrophysical', ism: true, context: 'First specific aromatic molecule identified by radio astronomy (TMC-1, 2018).' },
  // ---- biological: amino acids (L-forms)
  ...['glycine', 'L-alanine', 'L-valine', 'L-leucine', 'L-isoleucine', 'L-proline', 'L-phenylalanine', 'L-tryptophan', 'L-methionine', 'L-serine',
      'L-threonine', 'L-cysteine', 'L-tyrosine', 'L-asparagine', 'L-glutamine', 'L-aspartic acid', 'L-glutamic acid', 'L-lysine', 'L-arginine', 'L-histidine']
    .map((n) => ({ name: n, category: 'amino acid', context: n === 'glycine' ? 'Simplest amino acid; found in samples from comet 81P/Wild 2 (Stardust) and asteroid Ryugu.' : 'Proteinogenic amino acid (L-form).' })),
  // ---- biological: nucleobases, sugars, lipids, metabolism
  { name: 'adenine', category: 'nucleic acid' }, { name: 'guanine', category: 'nucleic acid' }, { name: 'cytosine', category: 'nucleic acid' },
  { name: 'thymine', category: 'nucleic acid' }, { name: 'uracil', category: 'nucleic acid' },
  { name: 'adenosine monophosphate', category: 'nucleic acid' },
  { name: 'adenosine triphosphate', category: 'nucleic acid', context: 'Principal energy currency of the cell.' },
  { name: 'D-ribose', category: 'carbohydrate' }, { name: 'deoxyribose', category: 'carbohydrate' },
  { name: 'glucose', category: 'carbohydrate', context: 'Primary metabolic fuel; open-chain/ring forms interconvert in solution.' },
  { name: 'fructose', category: 'carbohydrate' }, { name: 'galactose', category: 'carbohydrate' },
  { name: 'sucrose', category: 'carbohydrate' }, { name: 'lactose', category: 'carbohydrate' }, { name: 'maltose', category: 'carbohydrate' },
  { name: 'palmitic acid', category: 'lipid' }, { name: 'stearic acid', category: 'lipid' }, { name: 'oleic acid', category: 'lipid' },
  { name: 'linoleic acid', category: 'lipid' }, { name: 'cholesterol', category: 'lipid' },
  { name: 'lactic acid', category: 'metabolite' }, { name: 'pyruvic acid', category: 'metabolite' }, { name: 'citric acid', category: 'metabolite' },
  // ---- neurotransmitters, hormones, vitamins, drugs
  { name: 'dopamine', category: 'neurochemical' }, { name: 'serotonin', category: 'neurochemical' }, { name: 'epinephrine', category: 'neurochemical' },
  { name: 'histamine', category: 'neurochemical' }, { name: 'melatonin', category: 'neurochemical' }, { name: 'acetylcholine', category: 'neurochemical' },
  { name: 'testosterone', category: 'hormone' }, { name: 'estradiol', category: 'hormone' },
  { name: 'ascorbic acid', category: 'vitamin' }, { name: 'retinol', category: 'vitamin' }, { name: 'nicotinamide', category: 'vitamin' },
  { name: 'caffeine', category: 'pharmacology' }, { name: 'aspirin', category: 'pharmacology' }, { name: 'ibuprofen', category: 'pharmacology' },
  { name: 'acetaminophen', category: 'pharmacology' }, { name: 'nicotine', category: 'pharmacology' }, { name: 'capsaicin', category: 'pharmacology' },
  { name: 'morphine', category: 'pharmacology' }, { name: 'quinine', category: 'pharmacology' }, { name: 'penicillin G', category: 'pharmacology' },
];

interface PropRes { PropertyTable: { Properties: Record<string, string | number>[] } }
interface Rec3D { PC_Compounds: { atoms: { aid: number[]; element: number[]; charge?: { aid: number; value: number }[] }; bonds?: { aid1: number[]; aid2: number[]; order: number[] }; coords: { conformers: { x: number[]; y: number[]; z: number[] }[] }[] }[] }

async function main() {
  const warnings: string[] = [];
  const molecules: ({ pubchemCid: number } & Record<string, unknown>)[] = [];
  for (const [i, item] of CURATED.entries()) {
    process.stdout.write(`\r  ${i + 1}/${CURATED.length} ${item.name.padEnd(28)}`);
    const slug = item.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    let cid: number;
    try {
      const r = await fetchJson<{ IdentifierList: { CID: number[] } }>(`${BASE}/compound/name/${encodeURIComponent(item.name)}/cids/JSON`, { ...RATE, cacheKey: `pubchem/mol-cid-${slug}.json` });
      cid = r.IdentifierList.CID[0];
    } catch (e) { warnings.push(`${item.name}: name lookup failed (${(e as Error).message})`); continue; }

    const props = (await fetchJson<PropRes>(
      `${BASE}/compound/cid/${cid}/property/${PROPS}/JSON`,
      // cache key includes a hash of the requested property list so adding properties never reuses stale responses
      { ...RATE, cacheKey: `pubchem/mol-props-${cid}-${sha256(PROPS).slice(0, 8)}.json` },
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

    if (molecules.some((m) => m.pubchemCid === cid)) { warnings.push(`${item.name}: duplicate CID ${cid} skipped`); continue; }
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
      computed: {
        source: 'PubChem computed descriptors (Cactvs / XLogP3 / PubChem)', provenance: 'derived',
        exactMassU: props.ExactMass !== undefined ? Number(props.ExactMass) : null,
        xlogp: props.XLogP !== undefined ? Number(props.XLogP) : null,
        tpsaA2: props.TPSA !== undefined ? Number(props.TPSA) : null,
        hBondDonors: props.HBondDonorCount !== undefined ? Number(props.HBondDonorCount) : null,
        hBondAcceptors: props.HBondAcceptorCount !== undefined ? Number(props.HBondAcceptorCount) : null,
        rotatableBonds: props.RotatableBondCount !== undefined ? Number(props.RotatableBondCount) : null,
        complexity: props.Complexity !== undefined ? Number(props.Complexity) : null,
      },
      atoms,
      bonds,
      geometry: { source: 'PubChem3D computed conformer (MMFF94s)', units: 'angstrom', provenance: 'derived', experimental: false },
      sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    });
  }
  process.stdout.write('\n');
  writeDataset('datasets/molecular/molecules.json', molecules, {
    dataset: 'molecules', version: '1', records: molecules.length, adapter: 'scripts/ingestion/pubchem-molecules.ts', warnings,
    sources: [{ institution: 'PubChem (NCBI/NLM)', url: 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest', license: 'https://www.ncbi.nlm.nih.gov/home/about/policies/', notes: '3D coordinates are PubChem3D computed conformers, not experimental structures.' },
      { institution: 'McGuire (2022) ApJS 259:30 — census of interstellar molecules', url: 'https://doi.org/10.3847/1538-4365/ac2a48', notes: 'Basis for detectedInISM flags (manually curated list).' }],
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
