/**
 * Encyclopedia, radiation (Gate E.1) → datasets/encyclopedia/em-radiation.json
 *
 *   node --experimental-strip-types scripts/ingestion/encyclopedia-nasa-ems.ts
 *
 * Verbatim excerpts from NASA Science, "Tour of the Electromagnetic Spectrum" (Science Mission Directorate,
 * 2010), science.nasa.gov/ems/. robots.txt allows all agents (checked 2026-11-26). Under the NASA Media
 * Usage Guidelines NASA content is generally not subject to U.S. copyright and may be used for
 * educational purposes with NASA acknowledged as the source, without implying endorsement.
 *
 * Extraction is mechanical: the article body between the page title (h1) and the "Next:" link, split
 * at its h2/h3 headings. Paragraph text is kept exactly as published (whitespace collapsed, HTML entities
 * decoded). Sentences that point at a picture on the NASA page ("below", "above", "Can you …") are
 * omitted because the pictures are not reproduced; each gap is marked […], and the count of omitted
 * sentences is recorded per entry. A paragraph left shorter than 80 characters is dropped whole.
 * Wavelength matching uses ISO 21348 top-level categories already in datasets/spectral/em-bands.json,
 * plus ITU-R V.431 bands up to EHF for radio waves longer than ISO's 100 m limit.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

interface PageSpec { slug: string; id: string; entity: string; title: string; match: string[]; seeAlso: string[]; example: number }
const PAGES: PageSpec[] = [
  { slug: '01_intro', id: 'em-spectrum', entity: 'wave:em-spectrum', title: 'The electromagnetic spectrum', match: [], seeAlso: ['em-radio', 'em-microwave', 'em-infrared', 'em-visible', 'em-ultraviolet', 'em-xray', 'em-gamma'], example: 5.5e-7 },
  { slug: '05_radiowaves', id: 'em-radio', entity: 'wave:em-radio', title: 'Radio waves', match: ['iso-radio', 'itu--1', 'itu-0', 'itu-1', 'itu-2', 'itu-3', 'itu-4', 'itu-5', 'itu-6', 'itu-7', 'itu-8', 'itu-9', 'itu-10', 'itu-11'], seeAlso: ['em-microwave'], example: 1 },
  { slug: '06_microwaves', id: 'em-microwave', entity: 'wave:em-microwave', title: 'Microwaves', match: ['iso-microwave'], seeAlso: ['em-radio', 'em-infrared'], example: 5e-3 },
  { slug: '07_infraredwaves', id: 'em-infrared', entity: 'wave:em-infrared', title: 'Infrared waves', match: ['iso-ir'], seeAlso: ['em-visible', 'em-microwave'], example: 1e-5 },
  { slug: '09_visiblelight', id: 'em-visible', entity: 'wave:em-visible', title: 'Visible light', match: ['iso-vis'], seeAlso: ['em-infrared', 'em-ultraviolet'], example: 5.5e-7 },
  { slug: '10_ultravioletwaves', id: 'em-ultraviolet', entity: 'wave:em-ultraviolet', title: 'Ultraviolet waves', match: ['iso-uv', 'iso-vuv', 'iso-euv'], seeAlso: ['em-visible', 'em-xray'], example: 3e-7 },
  { slug: '11_xrays', id: 'em-xray', entity: 'wave:em-xray', title: 'X-rays', match: ['iso-xray', 'iso-xuv'], seeAlso: ['em-ultraviolet', 'em-gamma'], example: 1e-9 },
  { slug: '12_gammarays', id: 'em-gamma', entity: 'wave:em-gamma', title: 'Gamma rays', match: ['iso-gamma'], seeAlso: ['em-xray'], example: 1e-13 },
];

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', deg: '°', micro: 'µ', sim: '∼' };
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const text = (html: string) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
// A sentence points at a picture when it names one (image, photo, map, graph …) together with a position
// word, says "this image", describes false colours, uses a bare "(below)", or is a caption question.
const OMIT = /\b(image|images|photo|photograph|map|graph|composite|pictured|shown)\b[^.]*\b(below|above|to the right)\b|\b(below|above)\b[^.]*\b(image|photo|map)\b|\((below|above)\)|^Below is|Can you (see|find)|\bth(is|ese) (image|images|photo|map)\b|\b(is|are) (shown|colored) (in )?(red|blue|green|yellow|white)\b|\bfalse-colou?r\b/i;

/**
 * Reviewed omissions (2026-11-26) the pattern above misses: sentences or whole paragraphs that only make
 * sense next to a picture, or that are left dangling once a picture sentence is removed. Matched by prefix;
 * an OMIT_PARAGRAPHS prefix drops that sentence and the rest of its paragraph.
 */
const OMIT_SENTENCES: Record<string, string[]> = {
  '05_radiowaves': ['The far right of this graph', 'The quasar-bearing galaxy stands out in yellow'],
  '10_ultravioletwaves': ['Reds are relatively cool', 'The difference in how the galaxies appear'],
  '11_xrays': ["Japan's Hinode spacecraft produced these"],
};
const OMIT_PARAGRAPHS: Record<string, string[]> = {
  '06_microwaves': ['This light, emitted 13.7'],
  '07_infraredwaves': ['These aurorae are unique', 'Intense radiation and fast streams', 'The global image on the right', 'Why use the infrared to image the Earth?', 'We know, from looking at an infrared image of a cat'],
  '10_ultravioletwaves': ['The part of the Earth facing the Sun'],
  '12_gammarays': ['Gamma rays from Fermi are shown in magenta'],
};

interface Section { heading: string | null; paragraphs: string[] }

function extract(html: string, slug: string): { pageTitle: string; sections: Section[]; omitted: string[]; citation: string } {
  const h1 = html.search(/<h1[\s>]/i);
  if (h1 < 0) throw new Error(`${slug}: no <h1>`);
  const body = html.slice(h1);
  const blocks = [...body.matchAll(/<(h1|h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({ tag: m[1].toLowerCase(), t: text(m[2]) })).filter((b) => b.t);
  const pageTitle = blocks[0].t;
  const sections: Section[] = [{ heading: null, paragraphs: [] }];
  const omitted: string[] = [];
  let citation = '';
  for (const b of blocks.slice(1)) {
    if (/^Next:/.test(b.t)) break;
    if (b.tag === 'p') {
      if ((OMIT_PARAGRAPHS[slug] ?? []).some((x) => b.t.startsWith(x))) { omitted.push(b.t); continue; }
      const pictorial = (sn: string) => OMIT.test(sn) || (OMIT_SENTENCES[slug] ?? []).some((x) => sn.startsWith(x));
      if (!b.t.split(/(?<=[.!?])\s+(?=[A-Z"“])/).some((sn) => pictorial(sn) || (OMIT_PARAGRAPHS[slug] ?? []).some((x) => sn.startsWith(x)))) { sections[sections.length - 1].paragraphs.push(b.t); continue; }
      // Drop only the sentences that point at a picture; mark each gap with […] (standard quotation practice).
      const sentences = b.t.split(/(?<=[.!?])\s+(?=[A-Z"“])/);
      const kept: string[] = [];
      let gap = false;
      let dropRest = false;
      for (const sn of sentences) {
        if ((OMIT_PARAGRAPHS[slug] ?? []).some((x) => sn.startsWith(x))) dropRest = true;
        if (dropRest || pictorial(sn)) { omitted.push(sn); gap = true; continue; }
        kept.push((gap && kept.length ? '[…] ' : '') + sn); gap = false;
      }
      if (kept.length && kept.join(' ').length > 80) sections[sections.length - 1].paragraphs.push(kept.join(' ') + (gap ? ' […]' : ''));
      else if (kept.length) omitted.push(...kept);
    } else sections.push({ heading: b.t, paragraphs: [] });
  }
  const cit = blocks.find((b) => b.tag === 'p' && b.t.startsWith('National Aeronautics and Space Administration, Science Mission Directorate.'));
  if (cit) citation = cit.t;
  if (!citation) throw new Error(`${slug}: NASA citation line not found`);
  return { pageTitle, sections: sections.filter((s) => s.paragraphs.length), omitted, citation };
}

const retrieved = new Date().toISOString().slice(0, 10);
const entries = [];
for (const p of PAGES) {
  const url = `https://science.nasa.gov/ems/${p.slug}/`;
  const html = await fetchText(url, { minIntervalMs: 2000, cacheKey: `nasa-ems/${p.slug}.html`, maxBytes: 2_000_000 });
  const { pageTitle, sections, omitted, citation } = extract(html, p.slug);
  if (!sections.length) throw new Error(`${p.slug}: no paragraphs`);
  // Verbatim check: every kept paragraph must occur in the decoded page text.
  const pageText = text(html);
  for (const s of sections) for (const para of s.paragraphs) for (const piece of para.split(/\s*\[…\]\s*/).filter(Boolean))
    if (!pageText.includes(piece)) throw new Error(`${p.slug}: text not verbatim: ${piece.slice(0, 60)}`);
  entries.push({
    id: p.id, entity: p.entity, category: 'radiation', title: p.title, pageTitle, url,
    source: 'nasa-tour-ems', license: 'NASA content; generally not subject to U.S. copyright (NASA Media Usage Guidelines). NASA acknowledged as the source.',
    citation: citation.replace(/\[insert date[^\]]*\]/, retrieved), match: p.match, seeAlso: p.seeAlso, exampleWavelengthM: p.example,
    sections, omittedSentences: omitted.length,
  });
  console.log(`  ${p.slug}: ${sections.reduce((n, s) => n + s.paragraphs.length, 0)} paragraphs kept, ${omitted.length} sentences omitted`);
  for (const o of omitted) console.log(`     omitted: ${o.slice(0, 90)}`);
}

writeDataset('datasets/encyclopedia/em-radiation.json', {
  version: '1.0.0',
  note: 'Verbatim excerpts. Sentences describing pictures on the source page are omitted and marked […] (count per entry).',
  entries,
}, {
  dataset: 'encyclopedia-em-radiation',
  version: '1.0.0',
  records: entries.length,
  sources: [{ institution: 'NASA Science Mission Directorate (2010), Tour of the Electromagnetic Spectrum', url: 'https://science.nasa.gov/ems/', license: 'NASA content, generally not subject to U.S. copyright; acknowledge NASA', notes: '8 pages; verbatim paragraphs' }],
  adapter: 'scripts/ingestion/encyclopedia-nasa-ems.ts',
  warnings: ['Text is quoted as published in 2010 and not edited; some figures are rounded or dated (e.g. the 380–700 nm visible range, the solar surface temperature).'],
});
