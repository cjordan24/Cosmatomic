/**
 * Gate 15.5 — UTF-8 from its bit patterns, and Shannon entropy.
 */
import { describe, expect, it } from 'vitest';
import { CODESPACE, entropyBits, hex2, textEntropy, utf8 } from '@/core/computing/information';

describe('UTF-8', () => {
  it('Unicode D92’s example: <004D, 0430, 4E8C, 10302> → <4D D0 B0 E4 BA 8C F0 90 8C 82>', () => {
    const s = String.fromCodePoint(0x004d, 0x0430, 0x4e8c, 0x10302);
    expect(utf8(s).map(hex2).join(' ')).toBe('4D D0 B0 E4 BA 8C F0 90 8C 82');
  });
  it('agrees with the platform TextEncoder on mixed text', () => {
    const s = 'Voyager · Ψ → 銀河 🚀 é';
    expect(utf8(s)).toEqual([...new TextEncoder().encode(s)]);
  });
  it('the codespace 0…10FFFF₁₆ holds 1,114,112 code points', () => { expect(CODESPACE).toBe(1114112); });
});

describe('entropy (Shannon 1948)', () => {
  it('Fig. 6 decomposition: H(½, ⅓, ⅙) = H(½, ½) + ½ H(⅔, ⅓)', () => {
    expect(entropyBits([1 / 2, 1 / 3, 1 / 6])).toBeCloseTo(entropyBits([0.5, 0.5]) + 0.5 * entropyBits([2 / 3, 1 / 3]), 12);
  });
  it('a fair coin is 1 bit; a decimal digit is log₂ 10 = 3.32 bits (“about 3⅓ bits”)', () => {
    expect(entropyBits([0.5, 0.5])).toBe(1);
    expect(entropyBits(Array(10).fill(0.1))).toBeCloseTo(3.3219, 4);
  });
  it('“abracadabra”: 11 symbols, 5 distinct, 2.04 bits per symbol', () => {
    const t = textEntropy('abracadabra');
    expect(t.symbols).toBe(11); expect(t.distinct).toBe(5); expect(t.H).toBeCloseTo(2.0404, 4);
  });
});
