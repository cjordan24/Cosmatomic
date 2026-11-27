/**
 * Shared instruments (Phase 8, Gate 8.4) — pure functions, no React.
 *
 * One probe / ruler / unit-converter / time-series interface for the Sandbox, Wave lab, Fields and Cosmic
 * views (UI: src/ui/instruments.tsx). Values always travel in a registered unit (src/core/units/units.ts),
 * so every display conversion is dimension-checked; a reader's chosen unit per dimension is shared by all
 * views. Instruments only read and convert what a view already computes: they add no physics.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { UNITS, convert, type UnitDef, type UnitKey } from '@/core/units/units';
import { dimEquals, dimToString, type DimensionVector } from '@/core/units/dimensions';

const C = CONSTANTS.c.value;

// ---------------------------------------------------------------- units
const KEYS = Object.keys(UNITS) as UnitKey[];
const def = (k: UnitKey) => UNITS[k] as UnitDef;

/** Every registered unit with the same dimension as `k`, smallest first (affine units after their base). */
export function compatibleUnits(k: UnitKey): UnitKey[] {
  const dim = def(k).dimension;
  return KEYS.filter((x) => dimEquals(def(x).dimension, dim) && !isAngleMismatch(k, x)).sort((a, b) => def(a).toSI - def(b).toSI || (def(a).offset ?? 0) - (def(b).offset ?? 0));
}
/** Angles are dimensionless, like plain ratios; never offer them for anything but an angle. */
const ANGLES: UnitKey[] = ['rad', 'deg', 'arcsec'];
const isAngleMismatch = (a: UnitKey, b: UnitKey) => ANGLES.includes(a) !== ANGLES.includes(b);

/** A unit key from a key or a printed symbol ("V/m", "R⊕", "°"), or null when none is registered. */
export function unitKeyOf(s: string | null | undefined): UnitKey | null {
  if (!s) return null;
  if ((KEYS as string[]).includes(s)) return s as UnitKey;
  return KEYS.find((k) => def(k).symbol === s) ?? null;
}

/** Dimension id used to remember a reader's unit choice ("m", "kg·m^2·s^-3·A^-1" …). Angles get their own. */
export const dimensionKey = (k: UnitKey) => (ANGLES.includes(k) ? 'angle' : dimToString(def(k).dimension as DimensionVector));

/**
 * Most readable unit for a value: among the compatible units (excluding affine and astronomical-object
 * units such as R⊕ unless asked), the largest whose magnitude is ≥ 1; the smallest when none is.
 */
export function readableUnit(value: number, unit: UnitKey): UnitKey {
  if (!Number.isFinite(value) || value === 0) return unit;
  const cands = compatibleUnits(unit).filter((k) => !def(k).offset && !['R_earth', 'R_sun', 'a0', 'M_earth', 'M_sun', 'u', 'Da', 'kJ/mol', 'ly', 'g_n'].includes(k));
  if (!cands.length || ANGLES.includes(unit)) return unit;
  let best = cands[0];
  for (const k of cands) if (Math.abs(convert(value, unit, k)) >= 1 - 1e-12) best = k;
  return best;
}

// ---------------------------------------------------------------- unit converter
export interface QuantityGroup { id: string; label: string; units: UnitKey[] }
const g = (id: string, label: string, seed: UnitKey): QuantityGroup => ({ id, label, units: compatibleUnits(seed) });
export const CONVERTER_GROUPS: QuantityGroup[] = [
  g('length', 'Length', 'm'), g('mass', 'Mass', 'kg'), g('time', 'Time', 's'), g('frequency', 'Frequency', 'Hz'),
  g('energy', 'Energy', 'J'), g('temperature', 'Temperature', 'K'), g('velocity', 'Speed', 'm/s'), g('acceleration', 'Acceleration', 'm/s²'),
  g('density', 'Density', 'kg/m³'), g('pressure', 'Pressure', 'Pa'), g('angle', 'Angle', 'rad'), g('potential', 'Electric potential', 'V'),
  g('field', 'Electric field', 'V/m'), g('specific-energy', 'Specific energy / gravitational potential', 'J/kg'),
];

// ---------------------------------------------------------------- ruler
/** A position or velocity: any three numbers (tuples and plain arrays alike). */
export type Vec3 = ArrayLike<number>;
export const separation = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export interface RulerReading { distance: number; distanceUnit: UnitKey; relSpeed: number | null; speedUnit: UnitKey | null; lightTimeS: number }
/**
 * Distance between two positions given in one length unit, their relative speed (velocities in one speed
 * unit, optional) and the one-way light time d/c. Positions must share a frame; the ruler does not transform.
 */
export function ruler(a: { x: Vec3; v?: Vec3 }, b: { x: Vec3; v?: Vec3 }, lengthUnit: UnitKey, speedUnit: UnitKey | null = null): RulerReading {
  const d = separation(a.x, b.x);
  const rel = a.v && b.v ? separation(a.v, b.v) : null;
  return { distance: d, distanceUnit: lengthUnit, relSpeed: rel, speedUnit: rel === null ? null : speedUnit, lightTimeS: convert(d, lengthUnit, 'm') / C };
}

// ---------------------------------------------------------------- time series
export type Sample = readonly [t: number, y: number];
/** Fixed-capacity recorder: keeps the latest `cap` samples in time order. */
export class TimeSeries {
  private buf: Sample[] = [];
  constructor(readonly cap = 400) { if (!(cap >= 2)) throw new RangeError('capacity must be at least 2'); }
  push(t: number, y: number) { if (!Number.isFinite(t) || !Number.isFinite(y)) return; this.buf.push([t, y]); if (this.buf.length > this.cap) this.buf.splice(0, this.buf.length - this.cap); }
  clear() { this.buf = []; }
  get length() { return this.buf.length; }
  points(): [number, number][] { return this.buf.map(([t, y]) => [t, y]); }
}

export interface SeriesStats { n: number; tSpan: number; min: number; max: number; mean: number; rms: number; last: number }
export function seriesStats(pts: readonly Sample[]): SeriesStats | null {
  if (!pts.length) return null;
  let min = Infinity, max = -Infinity, s = 0, s2 = 0;
  for (const [, y] of pts) { min = Math.min(min, y); max = Math.max(max, y); s += y; s2 += y * y; }
  return { n: pts.length, tSpan: pts[pts.length - 1][0] - pts[0][0], min, max, mean: s / pts.length, rms: Math.sqrt(s2 / pts.length), last: pts[pts.length - 1][1] };
}

export interface SeriesMeta { title: string; x: { name: string; unit: string }; y: { name: string; unit: string }; provenance: string; method: string; sources?: string[] }
const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
/** CSV with commented metadata lines (title, provenance, method, sources) and full-precision values. */
export function seriesCSV(meta: SeriesMeta, pts: readonly Sample[]): string {
  return [
    `# ${meta.title}`, `# provenance: ${meta.provenance}`, `# method: ${meta.method}`,
    ...(meta.sources?.length ? [`# sources: ${meta.sources.join('; ')}`] : []),
    `${csvCell(meta.x.unit ? `${meta.x.name} (${meta.x.unit})` : meta.x.name)},${csvCell(meta.y.unit ? `${meta.y.name} (${meta.y.unit})` : meta.y.name)}`,
    ...pts.map(([t, y]) => `${t},${y}`), '',
  ].join('\n');
}
