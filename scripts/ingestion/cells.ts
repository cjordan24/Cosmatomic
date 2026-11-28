/**
 * Cells (Phase 11, Gate 11.4) → datasets/biology/cells.json
 *
 *   node --experimental-strip-types scripts/ingestion/cells.ts
 *
 *  - NIGMS glossary (https://nigms.nih.gov/education/glossary; robots allow; “Most of the information on this website
 *    is not copyrighted so you are free to use it with proper attribution”): definitions parsed from the page, verbatim
 *    except that pronunciation guides, “(plural: …)” and the “For more, check out …” blog pointers are omitted, and
 *    spaces left by links (“one- celled”, “ribosomes )”) are closed.
 *  - NHGRI Talking Glossary (public domain): the definition paragraph, verbatim (the narration transcript that
 *    follows on some pages is not used).
 *  - NIGMS Inside the Cell (2005), read on the archive.org page images: p. 7 (n8) the eukaryote/prokaryote table and
 *    the nucleus share; p. 8 (n9) membrane lipids, cytosol and ER; p. 33 (n34) mitochondria in heart and skin cells.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/ ([,.;)])/g, '$1').replace(/(\w)- (\w)/g, '$1-$2').replace(/(\w) -(\w)/g, '$1-$2').replace(/’/g, '’').trim();

// ---------- NIGMS glossary ----------
const nigmsHtml = await fetchText('https://nigms.nih.gov/education/glossary', { minIntervalMs: 2000, cacheKey: 'nigms/glossary.html' });
const nigmsText = clean(nigmsHtml.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n')
  .replace(/&#039;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' '));
const chunks = nigmsText.split('text_to_speech Share definition share');
const termOf = (tail: string) => tail.trim().match(/(\S.*?) \1$/)?.[1] ?? null;
const NIGMS_TERMS = ['Cell', 'Eukaryotic cell', 'Prokaryotic cell', 'Membrane', 'Nucleus', 'Mitochondrion', 'Ribosome', 'Organelle', 'Endoplasmic reticulum (ER)', 'Golgi', 'Lysosome', 'Cytoplasm', 'Bacterium',
  // Gate 11.7
  'Photosynthesis', 'Virus', 'Microbe', 'Microorganism', 'Fungus', 'Yeast', 'Pathogen'];
const nigms: { term: string; text: string }[] = [];
for (let k = 1; k < chunks.length; k++) {
  const term = termOf(chunks[k - 1].slice(-160));
  if (!term || !NIGMS_TERMS.includes(term)) continue;
  let body = chunks[k];
  const next = termOf(body.slice(-160));
  if (next) body = body.slice(0, body.lastIndexOf(`${next} ${next}`));
  body = body.replace(/^\s*\([^)]*\)\s*(\(plural:[^)]*\)\s*)?/, '').split(' For more, check out')[0].trim().replace(/\s[A-Z]$/, '').trim();
  if (term === 'Nucleus') body = body.split(' Chemistry:')[0].replace(/^Biology: /, '');
  nigms.push({ term, text: body });
}
for (const t of NIGMS_TERMS) if (!nigms.some((n) => n.term === t)) throw new Error(`NIGMS term not found: ${t}`);

// ---------- NHGRI glossary ----------
const NHGRI = [['Cell', 'Cell'], ['Nucleus', 'Nucleus'], ['Mitochondria', 'Mitochondria'], ['Ribosome', 'Ribosome'], ['Cell-Membrane', 'Cell-Membrane-Plasma-Membrane'], ['Organelle', 'Organelle'], ['Cytoplasm', 'Cytoplasm'], ['Virus', 'Virus'], ['Bacteria', 'Bacteria']];
const nhgri: { term: string; url: string; text: string }[] = [];
for (const [cache, slug] of NHGRI) {
  const url = `https://www.genome.gov/genetics-glossary/${slug}`;
  const page = await fetchText(url, { minIntervalMs: 2000, cacheKey: `nhgri/${cache}.html` });
  const lines = page.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n').replace(/&#039;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean);
  // the definition is the paragraph after the “Definition” heading (a “Narration” transcript may follow; not used)
  const d = lines.indexOf('Definition');
  const term = lines[lines.lastIndexOf('updated:', d) >= 0 ? d - 2 : d - 2]?.replace('\u200b', '');
  const text = d >= 0 ? lines.slice(d + 1).find((l) => l.length > 80) : undefined;
  if (!text || !term) throw new Error(`no NHGRI definition: ${slug}`);
  nhgri.push({ term, url, text });
}

// ---------- Inside the Cell (hand-transcribed from the page images) ----------
const ITC = 'nigms-inside-the-cell';
const comparison = {
  where: 'p. 7, table “Eukaryotic cells / Prokaryotic cells”', source: ITC,
  caption: 'Virtually all forms of life fall into one of two categories: eukaryotes or prokaryotes.',
  rows: [
    ['The cells of “complex” organisms, including all plants and animals', '“Simple” organisms, including bacteria and blue-green algae'],
    ['Contain a nucleus and many other organelles, each surrounded by a membrane (the nucleus and mitochondrion have two membranes)', 'Lack a nucleus and other membrane-encased organelles'],
    ['Can specialize for certain functions, such as absorbing nutrients from food or transmitting nerve impulses; groups of cells can form large, multicellular organs and organisms', 'Usually exist as single, virtually identical cells'],
    ['Most animal cells are 10–30 micrometers across, and most plant cells are 10–100 micrometers across', 'Most are 1–10 micrometers across'],
  ],
};
const fractions = [
  { id: 'cytosol', label: 'Cytosol', share: { value: 0.5, kind: 'about' }, quote: 'a thick brew (called the cytosol) of salts, nutrients, and proteins that accounts for about 50 percent of the cell’s volume (organelles make up the rest)', where: 'p. 8', source: ITC },
  { id: 'er', label: 'Endoplasmic reticulum', share: { value: 0.1, kind: 'more than' }, quote: 'This network of sacs, the endoplasmic reticulum (ER), often makes up more than 10 percent of a cell’s total volume.', where: 'p. 8', source: ITC },
  { id: 'nucleus', label: 'Nucleus', share: { value: 0.1, kind: 'up to' }, quote: 'The nucleus is the most prominent organelle and can occupy up to 10 percent of the space inside a cell.', where: 'p. 7', source: ITC },
  { id: 'mito-heart', label: 'Mitochondria (heart cell)', share: { value: 0.25, kind: 'around' }, quote: 'A human heart cell contains several thousand mitochondria — around 25 percent of the cell’s volume. Cells that don’t need much energy, like skin cells, contain only a few hundred mitochondria.', where: 'p. 33', source: ITC },
];
const membrane = { quote: 'The membrane that surrounds a cell is made up of proteins and lipids. Depending on the membrane’s location and role in the body, lipids can make up anywhere from 20 to 80 percent of the membrane, with the remainder being proteins.', where: 'p. 8, caption', source: ITC };

const data = { version: '1.0.0', nigms, nhgri, comparison, fractions, membrane };
writeDataset('datasets/biology/cells.json', data, {
  dataset: 'cells',
  version: '1.0.0',
  records: nigms.length + nhgri.length + comparison.rows.length + fractions.length + 1,
  sources: [
    { institution: 'National Institute of General Medical Sciences, Glossary', url: 'https://nigms.nih.gov/education/glossary', license: 'NIGMS: “Most of the information on this website is not copyrighted so you are free to use it with proper attribution.”', notes: '13 definitions' },
    { institution: 'National Human Genome Research Institute, Talking Glossary', url: 'https://www.genome.gov/genetics-glossary', license: 'Public domain (NHGRI)', notes: '7 definitions' },
    { institution: 'NIGMS, Inside the Cell (2005)', url: 'https://archive.org/details/ost-biology-inside_the_cell', notes: 'eukaryote/prokaryote table (p. 7), volume shares (pp. 7, 8, 33), membrane composition (p. 8)' },
  ],
  adapter: 'scripts/ingestion/cells.ts',
  warnings: ['NIGMS definitions omit pronunciation guides, plural forms and blog pointers; link spacing closed.', 'Volume shares are the booklet’s approximate statements (“about”, “up to”, “more than”, “around”), not measurements of one cell.'],
});
