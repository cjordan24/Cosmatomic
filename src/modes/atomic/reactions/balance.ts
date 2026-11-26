/**
 * Exact stoichiometric balancing.
 *
 * Build the composition matrix A (rows: elements + net charge; columns: species, reactants
 * positive, products negative). A balanced equation is a vector ν > 0 with A·ν = 0.
 * The null space is computed with exact rational arithmetic (BigInt), so no floating-point
 * rounding can produce a wrong coefficient.
 *
 *   nullity 0  → no balance exists with these species ("unbalanceable")
 *   nullity 1  → unique up to scale; reduced to the smallest positive integers, or "infeasible"
 *                if any coefficient has the wrong sign (a species is on the wrong side)
 *   nullity >1 → several independent reactions are mixed together ("ambiguous"): the
 *                coefficients are not determined by conservation alone
 */
export type BalanceOutcome =
  | { kind: 'balanced'; coefficients: number[] }
  | { kind: 'unbalanceable' }
  | { kind: 'infeasible'; vector: number[] }
  | { kind: 'ambiguous'; nullity: number };

type Q = { n: bigint; d: bigint };
const babs = (a: bigint) => (a < 0n ? -a : a);
const gcd = (a: bigint, b: bigint): bigint => { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; };
const q = (n: bigint, d: bigint = 1n): Q => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
const isZero = (a: Q) => a.n === 0n;

/** Null-space basis of an integer matrix (rows × cols), exact. */
export function nullSpace(A: number[][], cols: number): Q[][] {
  const M: Q[][] = A.map((r) => r.map((x) => q(BigInt(x))));
  const pivots: number[] = [];
  let row = 0;
  for (let c = 0; c < cols && row < M.length; c++) {
    let p = -1;
    for (let r = row; r < M.length; r++) if (!isZero(M[r][c])) { p = r; break; }
    if (p < 0) continue;
    [M[row], M[p]] = [M[p], M[row]];
    const pv = M[row][c];
    M[row] = M[row].map((x) => div(x, pv));
    for (let r = 0; r < M.length; r++) {
      if (r === row || isZero(M[r][c])) continue;
      const f = M[r][c];
      M[r] = M[r].map((x, k) => sub(x, mul(f, M[row][k])));
    }
    pivots.push(c);
    row++;
  }
  const free = [...Array(cols).keys()].filter((c) => !pivots.includes(c));
  return free.map((fc) => {
    const v: Q[] = Array.from({ length: cols }, () => q(0n));
    v[fc] = q(1n);
    pivots.forEach((pc, r) => { v[pc] = q(-M[r][fc].n, M[r][fc].d); });
    return v;
  });
}

/** Balance given composition columns. `cols[j]` maps element (and the key '⊕' for charge) → count; side +1 reactant, −1 product. */
export function balance(cols: Map<string, number>[], side: (1 | -1)[]): BalanceOutcome {
  const keys = [...new Set(cols.flatMap((c) => [...c.keys()]))];
  const A = keys.map((k) => cols.map((c, j) => (c.get(k) ?? 0) * side[j]));
  const ns = nullSpace(A, cols.length);
  if (ns.length === 0) return { kind: 'unbalanceable' };
  if (ns.length > 1) return { kind: 'ambiguous', nullity: ns.length };
  const v = ns[0];
  const lcm = v.reduce((l, x) => (l * x.d) / gcd(l, x.d), 1n);
  let ints = v.map((x) => (x.n * lcm) / x.d);
  const g = ints.reduce((a, b) => gcd(a, b), 0n) || 1n;
  ints = ints.map((x) => x / g);
  if (ints.every((x) => x <= 0n)) ints = ints.map((x) => -x);
  if (ints.some((x) => x <= 0n)) return { kind: 'infeasible', vector: ints.map(Number) };
  return { kind: 'balanced', coefficients: ints.map(Number) };
}
