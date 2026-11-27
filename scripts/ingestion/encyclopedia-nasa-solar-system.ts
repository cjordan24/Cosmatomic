/**
 * Encyclopedia, celestial objects (Gate E.2a) → datasets/encyclopedia/celestial.json
 *
 *   node --experimental-strip-types scripts/ingestion/encyclopedia-nasa-solar-system.ts
 *
 * Verbatim excerpts from NASA Science “Facts” pages for the Sun, the eight planets, the Moon, Pluto and
 * Ceres (science.nasa.gov/<body>/facts/). robots.txt allows all agents (checked 2026-11-27; crawl-delay 1 s
 * applies to usasearch only; we wait 2 s between requests). Under the NASA Media Usage Guidelines NASA
 * content is generally not subject to U.S. copyright and may be used for educational purposes with NASA
 * acknowledged as the source, without implying endorsement. Eris, Haumea, Makemake, Phobos and Deimos have
 * no Facts page at these URLs (404 on 2026-11-27) and are not included.
 *
 * Extraction is mechanical: after the page title (h1), only the article body blocks the CMS marks as
 * `wp-block-paragraph` and `wp-block-heading` are kept, up to the “Discover More Topics From NASA” heading.
 * That excludes navigation, promotional modules and news cards. Paragraph text is kept exactly as
 * published (whitespace collapsed, HTML entities decoded). Sentences that point at a picture on the page are
 * omitted and the gap is marked […]; every kept piece is then checked to occur verbatim in the page text.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

interface PageSpec { path: string; id: string; body: string; title: string; seeAlso: string[] }
const PAGES: PageSpec[] = [
  { path: 'sun/facts', id: 'sun', body: 'sun', title: 'The Sun', seeAlso: ['mercury', 'earth'] },
  { path: 'mercury/facts', id: 'mercury', body: 'mercury', title: 'Mercury', seeAlso: ['venus', 'sun'] },
  { path: 'venus/venus-facts', id: 'venus', body: 'venus', title: 'Venus', seeAlso: ['earth', 'mercury'] },
  { path: 'earth/facts', id: 'earth', body: 'earth', title: 'Earth', seeAlso: ['moon', 'mars', 'venus'] },
  { path: 'moon/facts', id: 'moon', body: 'moon', title: 'The Moon', seeAlso: ['earth'] },
  { path: 'mars/facts', id: 'mars', body: 'mars', title: 'Mars', seeAlso: ['earth', 'ceres'] },
  { path: 'jupiter/jupiter-facts', id: 'jupiter', body: 'jupiter', title: 'Jupiter', seeAlso: ['saturn'] },
  { path: 'saturn/facts', id: 'saturn', body: 'saturn', title: 'Saturn', seeAlso: ['jupiter', 'uranus'] },
  { path: 'uranus/facts', id: 'uranus', body: 'uranus', title: 'Uranus', seeAlso: ['saturn', 'neptune'] },
  { path: 'neptune/neptune-facts', id: 'neptune', body: 'neptune', title: 'Neptune', seeAlso: ['uranus', 'pluto'] },
  { path: 'dwarf-planets/pluto/facts', id: 'pluto', body: 'pluto', title: 'Pluto', seeAlso: ['neptune', 'ceres'] },
  { path: 'dwarf-planets/ceres/facts', id: 'ceres', body: 'ceres', title: 'Ceres', seeAlso: ['mars', 'pluto'] },
];

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', deg: '°', micro: 'µ', sim: '∼', times: '×' };
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const text = (html: string) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const OMIT = /\b(image|images|photo|photograph|map|graph|composite|pictured|shown|video|animation)\b[^.]*\b(below|above|to the right|left)\b|\b(below|above)\b[^.]*\b(image|photo|map|video)\b|\((below|above)\)|^Below is|Can you (see|find)|\bth(is|ese) (image|images|photo|map|video|animation)\b|\bfalse-colou?r\b/i;
const STOP = /^(Discover More Topics From NASA|Keep Exploring|Related Terms|Explore More)/;
/** Reviewed 2026-11-27: whole sections left out because they are not about the object’s science (counted as omitted). */
const OMIT_SECTIONS: Record<string, string[]> = { ceres: ['Pop Culture'] };

interface Section { heading: string | null; paragraphs: string[] }

function extract(html: string, id: string): { pageTitle: string; sections: Section[]; omitted: string[] } {
  const h1 = html.search(/<h1[\s>]/i);
  if (h1 < 0) throw new Error(`${id}: no <h1>`);
  const body = html.slice(h1);
  const pageTitle = text(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(body)![1]);
  const blocks = [...body.matchAll(/<(h2|h3|p)\b([^>]*)>([\s\S]*?)<\/\1>/gi)]
    .filter((m) => /wp-block-(paragraph|heading)/.test(m[2]))
    .map((m) => ({ tag: m[1].toLowerCase(), t: text(m[3]) })).filter((b) => b.t);
  const sections: Section[] = [{ heading: null, paragraphs: [] }];
  const omitted: string[] = [];
  let skipping = false;
  for (const b of blocks) {
    if (b.tag !== 'p' && STOP.test(b.t)) break;
    if (b.tag !== 'p') { skipping = (OMIT_SECTIONS[id] ?? []).includes(b.t); if (!skipping) sections.push({ heading: b.t, paragraphs: [] }); continue; }
    if (skipping) { omitted.push(b.t); continue; }
    const sentences = b.t.split(/(?<=[.!?])\s+(?=[A-Z"“])/);
    if (!sentences.some((s) => OMIT.test(s))) { sections[sections.length - 1].paragraphs.push(b.t); continue; }
    const kept: string[] = [];
    let gap = false;
    for (const sn of sentences) {
      if (OMIT.test(sn)) { omitted.push(sn); gap = true; continue; }
      kept.push((gap && kept.length ? '[…] ' : '') + sn); gap = false;
    }
    if (kept.length && kept.join(' ').length > 80) sections[sections.length - 1].paragraphs.push(kept.join(' ') + (gap ? ' […]' : ''));
    else if (kept.length) omitted.push(...kept);
  }
  return { pageTitle, sections: sections.filter((s) => s.paragraphs.length), omitted };
}

const retrieved = new Date().toISOString().slice(0, 10);
const entries = [];
for (const p of PAGES) {
  const url = `https://science.nasa.gov/${p.path}/`;
  const html = await fetchText(url, { minIntervalMs: 2000, cacheKey: `nasa-solar-system/${p.id}.html`, maxBytes: 3_000_000 });
  const { pageTitle, sections, omitted } = extract(html, p.id);
  if (!sections.length) throw new Error(`${p.id}: no paragraphs`);
  const pageText = text(html);
  for (const s of sections) for (const para of s.paragraphs) for (const piece of para.split(/\s*\[…\]\s*/).filter(Boolean))
    if (!pageText.includes(piece)) throw new Error(`${p.id}: text not verbatim: ${piece.slice(0, 60)}`);
  entries.push({
    id: `celestial-${p.id}`, entity: `body:${p.body}`, category: 'celestial', title: p.title, pageTitle, url,
    source: 'nasa-science-solar-system', license: 'NASA content; generally not subject to U.S. copyright (NASA Media Usage Guidelines). NASA acknowledged as the source.',
    citation: `National Aeronautics and Space Administration, Science Mission Directorate. ${pageTitle}. NASA Science website. Retrieved ${retrieved}, from ${url}`,
    match: [], seeAlso: p.seeAlso.map((x) => `celestial-${x}`), exampleWavelengthM: null,
    sections, omittedSentences: omitted.length,
  });
  console.log(`  ${p.id}: ${sections.length} sections, ${sections.reduce((n, s) => n + s.paragraphs.length, 0)} paragraphs, ${omitted.length} sentences omitted`);
  for (const o of omitted) console.log(`     omitted: ${o.slice(0, 100)}`);
}

writeDataset('datasets/encyclopedia/celestial.json', {
  version: '1.0.0',
  note: 'Verbatim excerpts from NASA Science Facts pages. Sentences describing pictures on the source page are omitted and marked […] (count per entry). Figures are as published by NASA (often rounded, in miles and kilometres) and are not Voyager’s data values.',
  entries,
}, {
  dataset: 'encyclopedia-celestial',
  version: '1.0.0',
  records: entries.length,
  sources: [{ institution: 'NASA Science Mission Directorate, Solar System “Facts” pages', url: 'https://science.nasa.gov/solar-system/', license: 'NASA content, generally not subject to U.S. copyright; acknowledge NASA', notes: `${entries.length} pages; verbatim paragraphs` }],
  adapter: 'scripts/ingestion/encyclopedia-nasa-solar-system.ts',
  warnings: ['Text is quoted as published and not edited. Numbers in the excerpts are NASA’s rounded popular figures; Voyager’s data panels use the sourced datasets, and the two can differ in the last digits.'],
});
