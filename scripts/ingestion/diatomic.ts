/**
 * Ground-state constants of diatomic molecules (Phase 10, Gate 10.4) → datasets/molecular/diatomic.json
 *
 *   node --experimental-strip-types scripts/ingestion/diatomic.ts
 *
 * Source: NIST Chemistry WebBook, “Constants of diatomic molecules” (Mask=1000), data compiled by K. P. Huber and
 * G. H. Herzberg. robots.txt: crawl-delay 5 s (respected); content signal “ai-input=yes”. The first table of each page
 * is the most abundant isotopologue. Footnote links are dropped; a subscripted last digit is the source's way of marking
 * an uncertain final figure and is kept as a digit. Units: cm⁻¹ except r_e (Å).
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const MOLECULES: { id: string; formula: string; cas: string; atoms: [string, number, number][] }[] = [
  // [symbol, Z, A] of the isotopes in the first (most abundant) isotopologue
  { id: 'h2', formula: 'H₂', cas: 'C1333740', atoms: [['H', 1, 1], ['H', 1, 1]] },
  { id: 'hcl', formula: 'H³⁵Cl', cas: 'C7647010', atoms: [['H', 1, 1], ['Cl', 17, 35]] },
  { id: 'co', formula: '¹²C¹⁶O', cas: 'C630080', atoms: [['C', 6, 12], ['O', 8, 16]] },
  { id: 'n2', formula: '¹⁴N₂', cas: 'C7727379', atoms: [['N', 7, 14], ['N', 7, 14]] },
  { id: 'o2', formula: '¹⁶O₂', cas: 'C7782447', atoms: [['O', 8, 16], ['O', 8, 16]] },
  { id: 'no', formula: '¹⁴N¹⁶O', cas: 'C10102439', atoms: [['N', 7, 14], ['O', 8, 16]] },
];
const COLS = ['state', 'Te', 'we', 'wexe', 'weye', 'Be', 'alphae', 'gammae', 'De', 'betae', 're', 'trans', 'nu00'] as const;

const clean = (cell: string) => cell.replace(/<a [^>]*>.*?<\/a>/gs, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, ' ').trim();
const toNum = (s: string): number | null => { const m = s.replace(/[()[\]]/g, '').match(/^-?[\d.]+(E[-+]?\d+)?/i); return m ? Number(m[0]) : null; };

const out = [];
for (const m of MOLECULES) {
  const url = `https://webbook.nist.gov/cgi/cbook.cgi?ID=${m.cas}&Mask=1000`;
  const page = await fetchText(url, { minIntervalMs: 5000, cacheKey: `webbook-diatomic/${m.cas}.html` });
  const i = page.indexOf('<table class="small data">');
  if (i < 0) throw new Error(`${m.id}: no constants table`);
  const table = page.slice(i, page.indexOf('</table>', i));
  const caption = clean(table.match(/<caption[^>]*>(.*?)<\/caption>/s)?.[1] ?? '');
  const row = [...table.matchAll(/<tr>(.*?)<\/tr>/gs)].map((r) => [...r[1].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((c) => clean(c[1]))).find((c) => c.length >= 11 && c[0].startsWith('X'));
  if (!row) throw new Error(`${m.id}: no X-state row`);
  const rec: Record<string, number | string | null> = {};
  COLS.forEach((k, j) => { rec[k] = k === 'state' || k === 'trans' ? row[j] ?? '' : toNum(row[j] ?? ''); });
  out.push({ id: m.id, formula: m.formula, caption, atoms: m.atoms.map(([s, Z, A]) => ({ symbol: s, Z, A })), url, constants: rec, sources: ['nist-webbook', 'huber-herzberg-1979'] });
  console.log(`  ${m.id.padEnd(4)} ${String(rec.state).padEnd(8)} ωe ${rec.we}  ωexe ${rec.wexe}  Be ${rec.Be}  αe ${rec.alphae}  De ${rec.De}  re ${rec.re}`);
}

writeDataset('datasets/molecular/diatomic.json', { version: '1.0.0', units: { energy: 'cm⁻¹', re: 'Å' }, molecules: out }, {
  dataset: 'diatomic', version: '1.0.0', records: out.length,
  sources: [
    { institution: 'NIST Chemistry WebBook (SRD 69), Constants of diatomic molecules; data compiled by K. P. Huber and G. H. Herzberg', url: 'https://webbook.nist.gov/chemistry/', license: 'NIST Standard Reference Data', notes: 'ground-state (X) constants of the most abundant isotopologue; WebBook crawl-delay 5 s respected' },
  ],
  adapter: 'scripts/ingestion/diatomic.ts',
  warnings: ['Footnoted values are taken as printed; parentheses or brackets (uncertain or derived values in the compilation) are stripped and flagged nowhere else, so check the WebBook page for the notes.'],
});
