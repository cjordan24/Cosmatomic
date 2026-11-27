/**
 * Encyclopedia, elements (Gate E.2b) → datasets/encyclopedia/elements.json
 *
 *   node --experimental-strip-types scripts/ingestion/encyclopedia-lanl-elements.ts
 *
 * Verbatim excerpts from the Los Alamos National Laboratory periodic table
 * (www.lanl.gov/science-engineering/periodic-table/element/<name>), one page per element, Z = 1–118, page
 * list from www.lanl.gov/sitemap.xml. robots.txt allows all agents (checked 2026-11-27); 2 s between requests.
 *
 * Licence (www.lanl.gov/lanl-resources/web-policies, read 2026-11-27): “The public may copy and use this
 * information without charge, provided that this Notice and any statement of authorship are reproduced on all
 * copies.” The full notice is stored with every entry and shown with it.
 *
 * Not used: Jefferson Lab’s “It’s Elemental” (education.jlab.org robots.txt disallows ClaudeBot/anthropic-ai and
 * signals use=reference, ai-train=no), and the older LANL text mirrored in PubChem (no longer on LANL’s site, so
 * it cannot be checked against the original).
 *
 * Extraction is mechanical: after the page title (h1), the h3 sections of the article (History, Properties,
 * Uses, Compounds, Forms, Sources …) and their paragraphs, skipping the “Element Stats” block (numbers, which
 * Voyager takes from its own sourced datasets) and stopping at the “Fun Facts” heading. Text is kept exactly as
 * published (whitespace collapsed, entities decoded) and every paragraph is checked to occur in the page text.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const NOTICE = 'Unless otherwise indicated, this information has been authored by an employee or employees of the Triad National Security, LLC, operator of the Los Alamos National Laboratory with the U.S. Department of Energy. The U.S. Government has rights to use, reproduce, and distribute this information. The public may copy and use this information without charge, provided that this Notice and any statement of authorship are reproduced on all copies. Neither the Government nor Triad makes any warranty, express or implied, or assumes any liability or responsibility for the use of this information.';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', deg: '°', micro: 'µ', times: '×' };
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const text = (html: string) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

interface Section { heading: string | null; paragraphs: string[] }

function extract(html: string, slug: string): { pageTitle: string; sections: Section[] } {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const h1 = clean.search(/<h1[\s>]/i);
  if (h1 < 0) throw new Error(`${slug}: no <h1>`);
  const body = clean.slice(h1);
  const pageTitle = text(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(body)![1]);
  const blocks = [...body.matchAll(/<(h2|h3|p)\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map((m) => ({ tag: m[1].toLowerCase(), attr: m[2], t: text(m[3]) })).filter((b) => b.t);
  const sections: Section[] = [];
  let inStats = false;
  for (const b of blocks) {
    if (b.tag === 'h2') { if (/^Fun Facts/i.test(b.t)) break; inStats = /^Element Stats/i.test(b.t); continue; }
    if (b.tag === 'h3') {
      if (inStats && /^(Physical|Atomic|Electronic & Chemical)$/.test(b.t)) continue;
      inStats = false;
      sections.push({ heading: b.t, paragraphs: [] });
      continue;
    }
    if (inStats || !sections.length || /\bid="element-stats/.test(b.attr)) continue;
    sections[sections.length - 1].paragraphs.push(b.t);
  }
  return { pageTitle, sections: sections.filter((s) => s.paragraphs.length) };
}

const sitemap = await fetchText('https://www.lanl.gov/sitemap.xml', { minIntervalMs: 2000, cacheKey: 'lanl-elements/sitemap.xml', maxBytes: 5_000_000 });
const urls = [...sitemap.matchAll(/<loc>([^<]*\/periodic-table\/element\/[a-z]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length !== 118) throw new Error(`expected 118 element pages, sitemap lists ${urls.length}`);

const retrieved = new Date().toISOString().slice(0, 10);
const entries = [];
for (let i = 0; i < urls.length; i++) {
  const Z = i + 1, url = urls[i], slug = url.split('/').pop()!;
  const html = await fetchText(url, { minIntervalMs: 2000, cacheKey: `lanl-elements/${slug}.html`, maxBytes: 3_000_000 });
  const { pageTitle, sections } = extract(html, slug);
  if (pageTitle.toLowerCase() !== slug) console.log(`  note: Z=${Z} page title “${pageTitle}” vs slug ${slug}`);
  const pageText = text(html.replace(/<script[\s\S]*?<\/script>/gi, ' '));
  for (const s of sections) for (const p of s.paragraphs) if (!pageText.includes(p)) throw new Error(`${slug}: not verbatim: ${p.slice(0, 60)}`);
  entries.push({
    id: `element-${Z}`, entity: `element:${Z}`, category: 'element', title: pageTitle, pageTitle, url,
    source: 'lanl-periodic-table', license: NOTICE,
    citation: `Los Alamos National Laboratory. ${pageTitle}. Periodic Table of Elements. Retrieved ${retrieved}, from ${url}`,
    match: [], seeAlso: [], exampleWavelengthM: null, sections, omittedSentences: 0,
  });
  console.log(`  ${Z} ${slug}: ${sections.map((s) => `${s.heading}(${s.paragraphs.length})`).join(' ') || 'NO TEXT'}`);
}

writeDataset('datasets/encyclopedia/elements.json', {
  version: '1.0.0',
  note: 'Verbatim excerpts from the Los Alamos National Laboratory periodic table, reproduced with LANL’s notice. The Element Stats tables and Fun Facts are not included; element data shown in Voyager come from its own sourced datasets.',
  entries: entries.filter((e) => e.sections.length),
}, {
  dataset: 'encyclopedia-elements',
  version: '1.0.0',
  records: entries.filter((e) => e.sections.length).length,
  sources: [{ institution: 'Los Alamos National Laboratory (Triad National Security, LLC, for the U.S. DOE), Periodic Table of Elements', url: 'https://www.lanl.gov/science-engineering/periodic-table', license: 'Public may copy and use without charge provided the LANL notice and any statement of authorship are reproduced (lanl.gov web policies)', notes: '118 pages; verbatim paragraphs of the article sections' }],
  adapter: 'scripts/ingestion/encyclopedia-lanl-elements.ts',
  warnings: ['Text is quoted as published and not edited, including LANL’s informal asides. Figures in the excerpts are LANL’s and may differ from Voyager’s sourced data values.'],
});
