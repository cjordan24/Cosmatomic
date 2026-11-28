/**
 * Bits and Boolean logic (Phase 15, Gate 15.1): pure functions behind #/engineering/logic.
 *
 *  - Number bases: unsigned binary, hexadecimal and two's-complement encodings of integers.
 *  - Logic gates as functions of 0/1 inputs; truth tables enumerated in binary order.
 *  - Adders built only from gates: a half adder (XOR, AND), a full adder (two half adders and an OR) and an
 *    n-bit ripple-carry adder, evaluated gate by gate so the view can show every intermediate signal.
 *  - Boole's law of duality x² = x (x·x = x) and x(1 − x) = 0 hold exactly for x ∈ {0, 1}.
 */
export type Bit = 0 | 1;
export type GateName = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export const GATES: Record<GateName, (a: Bit, b: Bit) => Bit> = {
  AND: (a, b) => (a & b) as Bit,
  OR: (a, b) => (a | b) as Bit,
  NOT: (a) => (a ? 0 : 1),
  NAND: (a, b) => ((a & b) ? 0 : 1),
  NOR: (a, b) => ((a | b) ? 0 : 1),
  XOR: (a, b) => (a ^ b) as Bit,
  XNOR: (a, b) => ((a ^ b) ? 0 : 1),
};
export const gateArity = (g: GateName) => (g === 'NOT' ? 1 : 2);

/** Truth table rows [inputs…, output] in binary counting order. */
export function truthTable(g: GateName): Bit[][] {
  const n = gateArity(g), rows: Bit[][] = [];
  for (let i = 0; i < 2 ** n; i++) {
    const ins = Array.from({ length: n }, (_, k) => ((i >> (n - 1 - k)) & 1) as Bit);
    rows.push([...ins, GATES[g](ins[0], (ins[1] ?? 0) as Bit)]);
  }
  return rows;
}

/** Every two-input gate built from NAND alone (De Morgan); used to show NAND is universal. */
export const NAND_ONLY: Record<'NOT' | 'AND' | 'OR' | 'XOR', (a: Bit, b: Bit) => Bit> = {
  NOT: (a) => GATES.NAND(a, a),
  AND: (a, b) => GATES.NAND(GATES.NAND(a, b), GATES.NAND(a, b)),
  OR: (a, b) => GATES.NAND(GATES.NAND(a, a), GATES.NAND(b, b)),
  XOR: (a, b) => { const n = GATES.NAND(a, b); return GATES.NAND(GATES.NAND(a, n), GATES.NAND(b, n)); },
};

export const halfAdder = (a: Bit, b: Bit) => ({ sum: GATES.XOR(a, b), carry: GATES.AND(a, b) });
export function fullAdder(a: Bit, b: Bit, cin: Bit) {
  const h1 = halfAdder(a, b), h2 = halfAdder(h1.sum, cin);
  return { sum: h2.sum, carry: GATES.OR(h1.carry, h2.carry), h1, h2 };
}
/** Ripple-carry addition of two n-bit numbers (LSB first internally); returns every stage. */
export function rippleAdd(x: number, y: number, n: number) {
  const stages: { a: Bit; b: Bit; cin: Bit; sum: Bit; cout: Bit }[] = [];
  let c: Bit = 0;
  for (let i = 0; i < n; i++) {
    const a = ((x >> i) & 1) as Bit, b = ((y >> i) & 1) as Bit;
    const f = fullAdder(a, b, c);
    stages.push({ a, b, cin: c, sum: f.sum, cout: f.carry });
    c = f.carry;
  }
  const value = stages.reduce((s, st, i) => s + st.sum * 2 ** i, 0);
  return { stages, sum: value, carry: c, total: value + c * 2 ** n };
}

export const toBinary = (v: number, bits: number) => (v >>> 0).toString(2).padStart(bits, '0').slice(-bits);
export const toHex = (v: number, bits: number) => (v >>> 0).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0').slice(-Math.ceil(bits / 4));
/** Two's-complement bit pattern of a signed integer in n bits. */
export const twosComplement = (v: number, bits: number) => toBinary(v < 0 ? 2 ** bits + v : v, bits);
/** Value of an n-bit two's-complement pattern. */
export const fromTwosComplement = (pattern: string) => { const u = parseInt(pattern, 2), n = pattern.length; return pattern[0] === '1' ? u - 2 ** n : u; };
/** Boole: x² = x for x ∈ {0, 1}. */
export const booleIdempotent = (x: Bit) => x * x === x;
