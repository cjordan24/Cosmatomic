/**
 * Encyclopedia, molecules (Gate E.2c) → datasets/encyclopedia/molecules.json
 *
 *   node --experimental-strip-types scripts/ingestion/encyclopedia-molecules.ts
 *
 * For each molecule of the library (datasets/molecular/molecules.json) the “Record Description” section of its
 * PubChem record is read through PUG View (pubchem.ncbi.nlm.nih.gov/rest/pug_view, a programmatic API; 1 request
 * per second, below PubChem’s 5/s limit). Only descriptions from openly licensed sources are kept, quoted
 * verbatim and credited to the original source:
 *   - ChEBI (EMBL-EBI) definitions: CC BY 4.0 (stated on ChEBI’s “About” page, read 2026-11-27);
 *   - NCI Thesaurus (NCIt): “all text within NCI products is free of copyright and may be reused without our
 *     permission. Credit the National Cancer Institute as the source.” (licence note carried by PubChem).
 * The ChEBI text in PubChem is PubChem’s description built from ChEBI’s definition and ontology roles (“X is a …
 * It has a role as …”); it is quoted exactly as PubChem words it and credited to ChEBI (CC BY 4.0 allows adaptation).
 * PubChem’s ChEBI mapping is occasionally for another entity (hydrogen sulfide → “Sulfur atom”); such items are
 * rejected: any ChEBI name ending in “atom”, and the reviewed class-level mismatches in REJECT_CHEBI.
 * One source per entry: ChEBI when it has a definition, otherwise the NCIt concept whose name equals the
 * molecule’s PubChem title. Not used: MeSH notes (several quote copyrighted dictionaries), DrugBank (CC BY-NC),
 * CAMEO Chemicals (third-party copyright), and descriptions without a stated open licence.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, fetchText, writeDataset } from './lib/ingest.ts';

interface Molecule { id: string; name: string; title?: string; pubchemCid: number }
const MOLS = JSON.parse(readFileSync(join(ROOT, 'datasets/molecular/molecules.json'), 'utf8')) as Molecule[];

/** Reviewed 2026-11-27: PubChem CIDs whose ChEBI description is for a class, not the compound. */
const REJECT_CHEBI: Record<number, string> = { 784: 'Peroxides (a class) for hydrogen peroxide', 8418: 'Acene (a class) for anthracene' };

const LICENSE = {
  chebi: 'Built by PubChem from ChEBI data (EMBL-EBI), available under CC BY 4.0 (creativecommons.org/licenses/by/4.0); quoted exactly as PubChem words it.',
  ncit: 'NCI Thesaurus: “Unless otherwise indicated, all text within NCI products is free of copyright and may be reused without our permission. Credit the National Cancer Institute as the source.” (cancer.gov/policies/copyright-reuse)',
};

interface Ref { ReferenceNumber: number; SourceName: string; SourceID?: string; Name?: string; URL?: string }
interface Info { ReferenceNumber: number; Value: { StringWithMarkup?: { String: string }[] } }
interface Sec { TOCHeading: string; Information?: Info[]; Section?: Sec[] }

const retrieved = new Date().toISOString().slice(0, 10);
const entries = [];
const missing: string[] = [];
for (const m of MOLS) {
  const api = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${m.pubchemCid}/JSON?heading=Record+Description`;
  let json: { Record: { RecordTitle?: string; Section: Sec[]; Reference: Ref[] } };
  try { json = JSON.parse(await fetchText(api, { minIntervalMs: 1000, cacheKey: `pubchem-desc/${m.pubchemCid}.json`, maxBytes: 2_000_000 })); }
  catch { missing.push(`${m.name} (no Record Description)`); continue; }
  const refs = new Map(json.Record.Reference.map((r) => [r.ReferenceNumber, r]));
  const infos: { ref: Ref; text: string }[] = [];
  const walk = (secs: Sec[]) => { for (const s of secs) { for (const i of s.Information ?? []) for (const sw of i.Value.StringWithMarkup ?? []) infos.push({ ref: refs.get(i.ReferenceNumber)!, text: sw.String.trim() }); walk(s.Section ?? []); } };
  walk(json.Record.Section);
  const title = json.Record.RecordTitle ?? m.name;
  const rejected = infos.filter((x) => x.ref?.SourceName === 'ChEBI' && (/\batom$/i.test(x.ref.Name ?? '') || REJECT_CHEBI[m.pubchemCid]));
  for (const r of rejected) console.log(`  ${m.name}: rejected ChEBI “${r.ref.Name}”`);
  const chebi = infos.filter((x) => x.ref?.SourceName === 'ChEBI' && x.text.length > 40 && !rejected.includes(x));
  const ncit = infos.filter((x) => x.ref?.SourceName === 'NCI Thesaurus (NCIt)' && (x.ref.Name ?? '').toLowerCase() === title.toLowerCase() && x.text.length > 40);
  const pick = chebi.length ? { src: 'chebi' as const, items: chebi.slice(0, 1) } : ncit.length ? { src: 'ncit' as const, items: ncit.slice(0, 1) } : null;
  if (!pick) { missing.push(`${m.name} (no ChEBI or matching NCIt text)`); continue; }
  const ref = pick.items[0].ref;
  const url = ref.URL ?? `https://pubchem.ncbi.nlm.nih.gov/compound/${m.pubchemCid}`;
  entries.push({
    id: `molecule-${m.id}`, entity: `molecule:${m.id}`, category: 'molecule', title: m.name, pageTitle: ref.Name ?? title, url,
    source: pick.src === 'chebi' ? 'chebi' : 'nci-thesaurus', license: LICENSE[pick.src],
    citation: pick.src === 'chebi'
      ? `PubChem description of CID ${m.pubchemCid} from ChEBI data (EMBL-EBI, CC BY 4.0): ${ref.Name ?? title}${ref.SourceID ? ` (${ref.SourceID.replace('CHEBI:OBO:', 'CHEBI:')})` : ''}. Retrieved ${retrieved}.`
      : `National Cancer Institute. NCI Thesaurus: ${ref.Name ?? title}${ref.SourceID ? ` (${ref.SourceID})` : ''}. Retrieved ${retrieved} through PubChem CID ${m.pubchemCid}.`,
    match: [], seeAlso: [], exampleWavelengthM: null,
    sections: [{ heading: pick.src === 'chebi' ? 'Description (ChEBI data, as worded by PubChem)' : 'NCI Thesaurus definition', paragraphs: pick.items.map((x) => x.text) }],
    omittedSentences: 0,
  });
  console.log(`  ${m.name}: ${pick.src} — ${pick.items[0].text.slice(0, 70)}`);
}
console.log(`  without an open-licence description: ${missing.length}`);
for (const x of missing) console.log(`     ${x}`);

writeDataset('datasets/encyclopedia/molecules.json', {
  version: '1.0.0',
  note: 'Verbatim from each molecule’s PubChem record: PubChem’s description built from ChEBI data (CC BY 4.0), or the NCI Thesaurus definition (free of copyright, credit NCI). Molecules without an openly licensed description have no entry.',
  entries,
}, {
  dataset: 'encyclopedia-molecules',
  version: '1.0.0',
  records: entries.length,
  sources: [
    { institution: 'ChEBI, EMBL-European Bioinformatics Institute (via PubChem PUG View)', url: 'https://www.ebi.ac.uk/chebi/', license: 'CC BY 4.0', notes: 'definitions' },
    { institution: 'NCI Thesaurus, National Cancer Institute (via PubChem PUG View)', url: 'https://ncit.nci.nih.gov/', license: 'free of copyright; credit NCI', notes: 'definitions where ChEBI has none' },
  ],
  adapter: 'scripts/ingestion/encyclopedia-molecules.ts',
  warnings: [`${missing.length} of ${MOLS.length} molecules have no openly licensed description and no entry.`, 'Text was read from PubChem’s copy of each source and is credited to the original source.'],
});
