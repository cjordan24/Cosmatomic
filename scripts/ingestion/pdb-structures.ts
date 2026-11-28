/**
 * Protein and DNA structures from the Protein Data Bank (Phase 11, Gates 11.1 and 11.3)
 *   → datasets/biology/pdb/<ID>.json (one file per entry, loaded lazily) + datasets/biology/pdb-index.json
 *
 *   node --experimental-strip-types scripts/ingestion/pdb-structures.ts
 *
 * Source: legacy-format coordinate files from https://files.rcsb.org/download/<ID>.pdb (files.rcsb.org has no
 * robots.txt; data.rcsb.org/rest is disallowed by robots.txt and is NOT used). Licence (wwPDB usage policies):
 * “Data files contained in the PDB archive are available under the CC0 1.0 Universal (CC0 1.0) Public Domain
 * Dedication. Users of PDB data are encouraged to attribute the original authors of the PDB structure data
 * where possible.” Every entry keeps its primary citation from the JRNL records of its own file.
 *
 * Parsed: HEADER (classification, deposition date), TITLE, SOURCE ORGANISM_SCIENTIFIC, EXPDTA, REMARK 2 resolution,
 * JRNL (AUTH/TITL/REF/DOI), HELIX and SHEET records (secondary structure as assigned by the depositors or the PDB),
 * and ATOM/HETATM coordinates (first model, first altloc only). Waters (HOH) are dropped.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, fetchText, sha256, writeDataset } from './lib/ingest.ts';

const ENTRIES = ['1BNA', '1MBN', '1A6M', '4HHB', '4INS', '1EMA', '1LYZ'];

interface Atom { name: string; res: string; chain: string; seq: number; el: string; het: boolean; x: number; y: number; z: number }

function parse(id: string, text: string) {
  const lines = text.split('\n');
  const rec = (k: string) => lines.filter((l) => l.startsWith(k));
  const cont = (k: string) => rec(k).map((l) => l.slice(10).trim()).join(' ').replace(/\s+/g, ' ').trim();
  const header = rec('HEADER')[0] ?? '';
  const classification = header.slice(10, 50).trim();
  const deposited = header.slice(50, 59).trim();
  const title = cont('TITLE ');
  const organisms = [...new Set(rec('SOURCE').map((l) => l.slice(10).trim()).filter((s) => s.startsWith('ORGANISM_SCIENTIFIC:')).map((s) => s.replace('ORGANISM_SCIENTIFIC:', '').replace(/;$/, '').trim()))];
  const synthetic = rec('SOURCE').some((l) => /SYNTHETIC: YES/.test(l));
  const method = cont('EXPDTA');
  const resLine = rec('REMARK   2').find((l) => /RESOLUTION\./.test(l));
  const resolution = resLine ? Number(resLine.match(/RESOLUTION\.\s*([\d.]+)/)?.[1]) : null;
  const jrnl = (k: string) => rec('JRNL').filter((l) => l.slice(12, 16).trim() === k).map((l) => l.slice(19).trim()).join(k === 'AUTH' ? '' : ' ').replace(/\s+/g, ' ').trim();
  const doi = jrnl('DOI') || null;
  const ref = jrnl('REF');
  const citation = { authors: jrnl('AUTH').replace(/,/g, ', '), title: jrnl('TITL'), ref, doi };

  // COMPND: molecule names per MOL_ID with their chains; KEYWDS; HETNAM (hetero-group names); SEQRES (deposited sequence)
  const compnd = cont('COMPND').split(/;\s*/).map((x) => x.trim()).filter(Boolean);
  const molecules: { name: string; chains: string[] }[] = [];
  for (const f of compnd) {
    const [k, ...v] = f.split(':'); const val = v.join(':').trim();
    if (k.trim() === 'MOLECULE') molecules.push({ name: val, chains: [] });
    else if (k.trim() === 'CHAIN' && molecules.length) molecules[molecules.length - 1].chains = val.split(',').map((c) => c.trim());
  }
  const keywords = cont('KEYWDS').split(',').map((x) => x.trim()).filter(Boolean);
  const hetnam: Record<string, string> = {};
  for (const l of rec('HETNAM')) { const code = l.slice(11, 14).trim(); hetnam[code] = ((hetnam[code] ?? '') + l.slice(15).trim()).trim(); }
  const seqres: Record<string, string[]> = {};
  for (const l of rec('SEQRES')) { const ch = l[11]; (seqres[ch] ??= []).push(...l.slice(19).trim().split(/\s+/).filter(Boolean)); }
  const helices = rec('HELIX').map((l) => ({ chain: l[19], from: Number(l.slice(21, 25)), to: Number(l.slice(33, 37)) }));
  const sheets = rec('SHEET').map((l) => ({ chain: l[21], from: Number(l.slice(22, 26)), to: Number(l.slice(33, 37)) }));

  const atoms: Atom[] = [];
  for (const l of lines) {
    if (l.startsWith('ENDMDL')) break;
    if (!l.startsWith('ATOM') && !l.startsWith('HETATM')) continue;
    const alt = l[16];
    if (alt !== ' ' && alt !== 'A') continue;
    const res = l.slice(17, 20).trim();
    if (res === 'HOH') continue;
    const name = l.slice(12, 16).trim();
    let el = l.slice(76, 78).trim();
    if (!el) el = name.replace(/[^A-Z]/g, '').slice(0, 1); // old files without the element column
    atoms.push({ name, res, chain: l[21], seq: Number(l.slice(22, 26)), el: el[0] + el.slice(1).toLowerCase(), het: l.startsWith('HETATM'),
      x: Number(l.slice(30, 38)), y: Number(l.slice(38, 46)), z: Number(l.slice(46, 54)) });
  }
  return { id, classification, deposited, title, organisms, synthetic, method, resolutionA: resolution, citation, molecules, keywords, hetnam, seqres, helices, sheets, atoms };
}

const index = [];
mkdirSync(join(ROOT, 'datasets/biology/pdb'), { recursive: true });
for (const id of ENTRIES) {
  const text = await fetchText(`https://files.rcsb.org/download/${id}.pdb`, { minIntervalMs: 1500, cacheKey: `pdb/${id}.pdb` });
  const s = parse(id, text);
  // compact columnar form: coordinates to 0.001 Å as printed
  const out = {
    ...s, atoms: undefined,
    atomCount: s.atoms.length,
    cols: {
      name: s.atoms.map((a) => a.name), res: s.atoms.map((a) => a.res), chain: s.atoms.map((a) => a.chain).join(''), seq: s.atoms.map((a) => a.seq),
      el: s.atoms.map((a) => a.el), het: s.atoms.map((a) => (a.het ? 1 : 0)), xyz: s.atoms.flatMap((a) => [a.x, a.y, a.z]),
    },
    source: `https://files.rcsb.org/download/${id}.pdb`, sha256Source: sha256(text),
  };
  const json = JSON.stringify(out);
  writeFileSync(join(ROOT, `datasets/biology/pdb/${id}.json`), json);
  index.push({ id, title: s.title, molecules: s.molecules, keywords: s.keywords, classification: s.classification, organisms: s.organisms, synthetic: s.synthetic, method: s.method, resolutionA: s.resolutionA, deposited: s.deposited, citation: s.citation, atomCount: s.atoms.length, helices: s.helices.length, strands: s.sheets.length, file: `datasets/biology/pdb/${id}.json`, bytes: json.length, sha256: sha256(json) });
  console.log(`${id}: ${s.atoms.length} atoms, ${s.helices.length} helices, ${s.sheets.length} strands — ${s.title}`);
}

writeDataset('datasets/biology/pdb-index.json', { version: '1.0.0', entries: index }, {
  dataset: 'pdb-structures',
  version: '1.0.0',
  records: index.length,
  sources: [
    { institution: 'Worldwide Protein Data Bank (wwPDB); files served by RCSB PDB', url: 'https://www.wwpdb.org/about/usage-policies', license: 'CC0 1.0 Universal (wwPDB: “Data files contained in the PDB archive are available under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.”)', notes: 'coordinates, secondary structure and primary citations of 1BNA, 1MBN, 1A6M, 4HHB, 4INS, 1EMA, 1LYZ' },
  ],
  adapter: 'scripts/ingestion/pdb-structures.ts',
  warnings: ['First model and first alternate location only; waters removed.', 'Secondary structure is the HELIX/SHEET assignment stored in each file, not recomputed.'],
});
