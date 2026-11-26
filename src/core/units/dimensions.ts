/**
 * Dimension vectors over the SI base quantities: [L, M, T, I, Θ, N, J].
 * Used for dimensional-consistency checks on every unit conversion.
 */
export type DimensionVector = readonly [L: number, M: number, T: number, I: number, Theta: number, N: number, J: number];

const d = (L = 0, M = 0, T = 0, I = 0, Th = 0, N = 0, J = 0): DimensionVector => [L, M, T, I, Th, N, J];

export const DIM = {
  dimensionless: d(),
  length: d(1),
  mass: d(0, 1),
  time: d(0, 0, 1),
  current: d(0, 0, 0, 1),
  temperature: d(0, 0, 0, 0, 1),
  amount: d(0, 0, 0, 0, 0, 1),
  perAmount: d(0, 0, 0, 0, 0, -1),
  angle: d(),
  area: d(2),
  volume: d(3),
  velocity: d(1, 0, -1),
  acceleration: d(1, 0, -2),
  force: d(1, 1, -2),
  energy: d(2, 1, -2),
  power: d(2, 1, -3),
  action: d(2, 1, -1),
  charge: d(0, 0, 1, 1),
  entropy: d(2, 1, -2, 0, -1),
  density: d(-3, 1),
  pressure: d(-1, 1, -2),
  wavenumber: d(-1),
  frequency: d(0, 0, -1),
  gravitational: d(3, -1, -2),
  gravParam: d(3, 0, -2),
  permittivity: d(-3, -1, 4, 2),
} as const satisfies Record<string, DimensionVector>;

export const dimEquals = (a: DimensionVector, b: DimensionVector) => a.every((x, i) => Math.abs(x - b[i]) < 1e-12);
export const dimMul = (a: DimensionVector, b: DimensionVector): DimensionVector => a.map((x, i) => x + b[i]) as unknown as DimensionVector;
export const dimDiv = (a: DimensionVector, b: DimensionVector): DimensionVector => a.map((x, i) => x - b[i]) as unknown as DimensionVector;
export const dimPow = (a: DimensionVector, p: number): DimensionVector => a.map((x) => x * p) as unknown as DimensionVector;

const SYMBOLS = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd'];
export function dimToString(v: DimensionVector): string {
  const parts = v.map((p, i) => (p === 0 ? '' : p === 1 ? SYMBOLS[i] : `${SYMBOLS[i]}^${p}`)).filter(Boolean);
  return parts.length ? parts.join('·') : '1';
}
