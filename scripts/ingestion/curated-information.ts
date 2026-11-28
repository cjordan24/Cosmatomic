/**
 * Information and encoding (Phase 15, Gate 15.5) → datasets/engineering/information.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-information.ts
 *
 * Read 2026-11-28: Shannon (1948) BSTJ 27 p. 393 (page image); Unicode Standard: /versions/ pages for 16.0–18.0 and
 * Core Specification ch. 3 D9, D10, D92 (facts and short definitions only — the Core Spec is not openly licensed;
 * the UTF-8 bit patterns are drawn by this app, not copied).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  shannon: { source: 'shannon-1948', where: 'p. 393', theorem: 'H = −K Σ pᵢ log pᵢ', quote: 'Quantities of the form H = −Σ pᵢ log pᵢ (the constant K merely amounts to a choice of a unit of measure) play a central role in information theory as measures of information, choice and uncertainty.', digit: { where: 'p. 380', quote: 'a decimal digit is about 3⅓ bits.' } },
  unicode: { source: 'unicode-standard', codespace: 'D9 Unicode codespace: A range of integers from 0 to 10FFFF₁₆.', d92: 'UTF-8 encoding form: The Unicode encoding form that assigns each Unicode scalar value to an unsigned byte sequence of one to four bytes in length', example: 'In UTF-8, the code point sequence <004D, 0430, 4E8C, 10302> is represented as <4D D0 B0 E4 BA 8C F0 90 8C 82>',
    versions: [{ v: '16.0', date: '2024-09-10', total: 154998 }, { v: '17.0', date: '2025-09-09', total: 159801 }, { v: '18.0', date: '2026-09-16', total: 172808 }],
    note: 'Counts of assigned characters, as each version page states them.' },
};
writeDataset('datasets/engineering/information.json', data, { dataset: 'information', version: '1.0.0', records: 7,
  sources: [{ institution: 'Shannon (1948), Bell System Technical Journal 27', url: 'https://archive.org/details/bstj27-3-379', notes: 'entropy, Theorem 2 (page image)' },
    { institution: 'The Unicode Consortium, The Unicode Standard (versions 16.0–18.0)', url: 'https://www.unicode.org/versions/latest/', license: 'Core Specification not openly licensed: facts and short definitions only', notes: 'codespace, UTF-8 definition and example, character counts' }],
  adapter: 'scripts/ingestion/curated-information.ts', warnings: ['Unicode 18.0’s version page still carried a “preliminary draft” banner when read (2026-11-28).'] });
