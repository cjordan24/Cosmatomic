/**
 * Bits and logic (Phase 15, Gate 15.1) → datasets/engineering/logic.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-logic.ts
 *
 * Read 2026-11-28 (notes: research/SOURCE_NOTES_PHASE15.md): Boole (1854) p. 31 (page image); Shannon (1938) Trans.
 * AIEE 57, p. 714 (page image); Shannon (1948) BSTJ 27, p. 380 (page image); NIST “Prefixes for binary multiples”.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  boole: { source: 'boole-1854', where: 'p. 31, eq. (2)', identity: 'x² = x', quote: 'and is, in fact, the expression of a second general law of those symbols by which names, qualities, or descriptions, are symbolically represented.' },
  shannon: {
    switching: { source: 'shannon-1938', where: 'p. 714', quote: 'it is evident that a perfect analogy exists between the calculus for switching circuits and this branch of symbolic logic.',
      convention: 'Shannon wrote each switch as a hindrance: 0 for a closed circuit, 1 for an open one. In that reading the series connection is his “+” and the parallel connection his “·”. His footnote adds the dual view: “Then all the symbols are directly interpreted as propositions and the operations of addition and multiplication will be seen to represent series and parallel connections.”' },
    bit: { source: 'shannon-1948', where: 'p. 380', quote: 'If the base 2 is used the resulting units may be called binary digits, or more briefly bits, a word suggested by J. W. Tukey. A device with two stable positions, such as a relay or a flip-flop circuit, can store one bit of information.' },
  },
  prefixes: { source: 'nist-binary-prefixes', quote: 'It is important to recognize that the new prefixes for binary multiples are not part of the International System of Units (SI), the modern metric system.', rows: [
    { name: 'kibi', symbol: 'Ki', factor: '2¹⁰', value: 1024 }, { name: 'mebi', symbol: 'Mi', factor: '2²⁰', value: 1048576 }, { name: 'gibi', symbol: 'Gi', factor: '2³⁰', value: 1073741824 },
    { name: 'tebi', symbol: 'Ti', factor: '2⁴⁰', value: 1099511627776 }, { name: 'pebi', symbol: 'Pi', factor: '2⁵⁰', value: 1125899906842624 }, { name: 'exbi', symbol: 'Ei', factor: '2⁶⁰', value: 1152921504606846976 }],
    examples: ['one mebibyte 1 MiB = 2²⁰ B = 1 048 576 B', 'one megabyte 1 MB = 10⁶ B = 1 000 000 B'] },
};
writeDataset('datasets/engineering/logic.json', data, { dataset: 'logic', version: '1.0.0', records: 10,
  sources: [{ institution: 'Boole (1854); Shannon (1938, 1948)', url: 'https://archive.org/details/aninvestigation00boolgoog', license: 'Boole public domain; Shannon papers quoted briefly', notes: 'read on page images' },
    { institution: 'NIST Physical Measurement Laboratory', url: 'https://physics.nist.gov/cuu/Units/binary.html', license: 'U.S. government work', notes: 'binary prefixes (the page’s © IEEE history box not used)' }],
  adapter: 'scripts/ingestion/curated-logic.ts', warnings: [] });
