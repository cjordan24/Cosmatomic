/**
 * Information and encoding (Phase 15, Gate 15.5).
 *
 *  - UTF-8 (Unicode Core Specification, D92): each Unicode scalar value becomes one to four bytes — 0xxxxxxx;
 *    110yyyyy 10xxxxxx; 1110zzzz 10yyyyyy 10xxxxxx; 11110uuu 10uuzzzz 10yyyyyy 10xxxxxx — implemented here from the
 *    bit patterns and checked against the specification's own example and the browser's TextEncoder.
 *  - Shannon's entropy (1948, Theorem 2, p. 393): H = −K Σ pᵢ log pᵢ; with logarithms to base 2 (K = 1) H is in bits.
 *    Applied to the symbol frequencies of a text it gives the average information per symbol of a source that
 *    emits symbols independently with those frequencies — a lower bound for codes that treat symbols one at a time.
 */
/** UTF-8 bytes of one code point. */
export function utf8OfCodePoint(cp: number): number[] {
  if (cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) throw new Error('not a Unicode scalar value');
  if (cp < 0x80) return [cp];
  if (cp < 0x800) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
  if (cp < 0x10000) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
  return [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
}
export const codePoints = (s: string) => [...s].map((ch) => ch.codePointAt(0)!);
export const utf8 = (s: string) => codePoints(s).flatMap(utf8OfCodePoint);
export const hex2 = (b: number) => b.toString(16).toUpperCase().padStart(2, '0');
export const uPlus = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

/** Shannon entropy in bits per symbol of a probability list. */
export const entropyBits = (p: number[]) => -p.filter((x) => x > 0).reduce((s, x) => s + x * Math.log2(x), 0);
/** Symbol frequencies of a text (by code point) and their entropy. */
export function textEntropy(s: string) {
  const cps = codePoints(s), counts = new Map<number, number>();
  for (const c of cps) counts.set(c, (counts.get(c) ?? 0) + 1);
  const n = cps.length, p = [...counts.values()].map((k) => k / n);
  return { symbols: n, distinct: counts.size, H: n ? entropyBits(p) : 0, counts };
}
/** Number of code points in the Unicode codespace 0…10FFFF₁₆. */
export const CODESPACE = 0x10ffff + 1;
