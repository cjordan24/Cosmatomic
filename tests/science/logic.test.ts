/**
 * Gate 15.1 — gates, adders and number bases.
 */
import { describe, expect, it } from 'vitest';
import { GATES, NAND_ONLY, booleIdempotent, fromTwosComplement, fullAdder, halfAdder, rippleAdd, toBinary, toHex, truthTable, twosComplement, type Bit } from '@/core/computing/logic';

const B: Bit[] = [0, 1];

describe('gates', () => {
  it('truth tables in counting order (AND 0001, OR 0111, XOR 0110, NAND 1110, NOT 10)', () => {
    expect(truthTable('AND').map((r) => r[2]).join('')).toBe('0001');
    expect(truthTable('OR').map((r) => r[2]).join('')).toBe('0111');
    expect(truthTable('XOR').map((r) => r[2]).join('')).toBe('0110');
    expect(truthTable('NAND').map((r) => r[2]).join('')).toBe('1110');
    expect(truthTable('NOT').map((r) => r[1]).join('')).toBe('10');
  });
  it('NAND alone builds NOT, AND, OR and XOR', () => {
    for (const a of B) for (const b of B) {
      expect(NAND_ONLY.NOT(a, b)).toBe(GATES.NOT(a, b));
      expect(NAND_ONLY.AND(a, b)).toBe(GATES.AND(a, b));
      expect(NAND_ONLY.OR(a, b)).toBe(GATES.OR(a, b));
      expect(NAND_ONLY.XOR(a, b)).toBe(GATES.XOR(a, b));
    }
  });
  it('De Morgan: NOT(a AND b) = (NOT a) OR (NOT b)', () => {
    for (const a of B) for (const b of B) expect(GATES.NAND(a, b)).toBe(GATES.OR(GATES.NOT(a, a), GATES.NOT(b, b)));
  });
  it('Boole’s x² = x holds for 0 and 1 only', () => {
    expect(booleIdempotent(0)).toBe(true); expect(booleIdempotent(1)).toBe(true);
    expect(2 * 2 === 2).toBe(false);
  });
});

describe('adders', () => {
  it('half adder: 1 + 1 = 10₂', () => { expect(halfAdder(1, 1)).toEqual({ sum: 0, carry: 1 }); });
  it('full adder equals arithmetic for all 8 inputs', () => {
    for (const a of B) for (const b of B) for (const c of B) { const f = fullAdder(a, b, c); expect(f.sum + 2 * f.carry).toBe(a + b + c); }
  });
  it('4-bit ripple adder equals arithmetic for all 256 input pairs; 9 + 12 = 21 overflows to 0101 with carry', () => {
    for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) expect(rippleAdd(x, y, 4).total).toBe(x + y);
    const r = rippleAdd(9, 12, 4);
    expect(toBinary(r.sum, 4)).toBe('0101'); expect(r.carry).toBe(1);
  });
});

describe('number bases', () => {
  it('255 = 11111111₂ = FF₁₆; 2024 = 7E8₁₆', () => {
    expect(toBinary(255, 8)).toBe('11111111'); expect(toHex(255, 8)).toBe('FF'); expect(toHex(2024, 12)).toBe('7E8');
  });
  it('two’s complement: −1 = 11111111, −128 = 10000000 in 8 bits, and back', () => {
    expect(twosComplement(-1, 8)).toBe('11111111'); expect(twosComplement(-128, 8)).toBe('10000000');
    for (const v of [-128, -5, 0, 7, 127]) expect(fromTwosComplement(twosComplement(v, 8))).toBe(v);
  });
});
