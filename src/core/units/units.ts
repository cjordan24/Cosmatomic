/**
 * Unit registry and dimension-checked conversion. SI is the internal standard:
 * every unit is defined by a factor to its SI coherent unit (and an offset for
 * affine temperature scales).
 */
import { CONSTANTS, LIGHT_YEAR_M, PARSEC_M, SOLAR_MASS_KG } from '../constants/constants';
import { DIM, type DimensionVector, dimEquals, dimToString } from './dimensions';

export interface UnitDef {
  symbol: string;
  name: string;
  dimension: DimensionVector;
  /** multiply a value in this unit by `toSI` (after adding `offset`) to obtain SI */
  toSI: number;
  offset?: number;
}

const u = (symbol: string, name: string, dimension: DimensionVector, toSI: number, offset = 0): UnitDef => ({ symbol, name, dimension, toSI, offset });

export const UNITS = {
  // length
  fm: u('fm', 'femtometre', DIM.length, 1e-15),
  pm: u('pm', 'picometre', DIM.length, 1e-12),
  'Å': u('Å', 'ångström', DIM.length, 1e-10),
  nm: u('nm', 'nanometre', DIM.length, 1e-9),
  'µm': u('µm', 'micrometre', DIM.length, 1e-6),
  mm: u('mm', 'millimetre', DIM.length, 1e-3),
  cm: u('cm', 'centimetre', DIM.length, 1e-2),
  m: u('m', 'metre', DIM.length, 1),
  km: u('km', 'kilometre', DIM.length, 1e3),
  R_earth: u('R⊕', 'nominal Earth equatorial radius', DIM.length, 6.3781e6),
  R_sun: u('R☉', 'nominal solar radius', DIM.length, CONSTANTS.Rsun.value),
  au: u('au', 'astronomical unit', DIM.length, CONSTANTS.au.value),
  ly: u('ly', 'light-year', DIM.length, LIGHT_YEAR_M),
  pc: u('pc', 'parsec', DIM.length, PARSEC_M),
  kpc: u('kpc', 'kiloparsec', DIM.length, PARSEC_M * 1e3),
  Mpc: u('Mpc', 'megaparsec', DIM.length, PARSEC_M * 1e6),
  a0: u('a₀', 'Bohr radius', DIM.length, CONSTANTS.a0.value),
  // mass
  kg: u('kg', 'kilogram', DIM.mass, 1),
  g: u('g', 'gram', DIM.mass, 1e-3),
  u: u('u', 'unified atomic mass unit', DIM.mass, CONSTANTS.u.value),
  Da: u('Da', 'dalton', DIM.mass, CONSTANTS.u.value),
  M_earth: u('M⊕', 'Earth mass (from nominal GM⊕)', DIM.mass, CONSTANTS.GMearth.value / CONSTANTS.G.value),
  M_sun: u('M☉', 'solar mass (from nominal GM☉)', DIM.mass, SOLAR_MASS_KG),
  // time
  'µs': u('µs', 'microsecond', DIM.time, 1e-6),
  ms: u('ms', 'millisecond', DIM.time, 1e-3),
  s: u('s', 'second', DIM.time, 1),
  min: u('min', 'minute', DIM.time, 60),
  h: u('h', 'hour', DIM.time, 3600),
  d: u('d', 'day', DIM.time, 86_400),
  yr: u('yr', 'Julian year', DIM.time, CONSTANTS.julianYear.value),
  Myr: u('Myr', 'megayear', DIM.time, CONSTANTS.julianYear.value * 1e6),
  Gyr: u('Gyr', 'gigayear', DIM.time, CONSTANTS.julianYear.value * 1e9),
  // energy
  J: u('J', 'joule', DIM.energy, 1),
  eV: u('eV', 'electronvolt', DIM.energy, CONSTANTS.e.value),
  keV: u('keV', 'kiloelectronvolt', DIM.energy, CONSTANTS.e.value * 1e3),
  MeV: u('MeV', 'megaelectronvolt', DIM.energy, CONSTANTS.e.value * 1e6),
  'kJ/mol': u('kJ/mol', 'kilojoule per mole (per particle)', DIM.energy, 1e3 / CONSTANTS.NA.value),
  // temperature (affine)
  K: u('K', 'kelvin', DIM.temperature, 1),
  '°C': u('°C', 'degree Celsius', DIM.temperature, 1, 273.15),
  // velocity
  'm/s': u('m/s', 'metre per second', DIM.velocity, 1),
  'km/s': u('km/s', 'kilometre per second', DIM.velocity, 1e3),
  // density
  'kg/m³': u('kg/m³', 'kilogram per cubic metre', DIM.density, 1),
  'g/cm³': u('g/cm³', 'gram per cubic centimetre', DIM.density, 1e3),
  // pressure
  Pa: u('Pa', 'pascal', DIM.pressure, 1),
  bar: u('bar', 'bar', DIM.pressure, 1e5),
  atm: u('atm', 'standard atmosphere', DIM.pressure, 101_325),
  // angle (dimensionless)
  rad: u('rad', 'radian', DIM.angle, 1),
  deg: u('°', 'degree', DIM.angle, Math.PI / 180),
  arcsec: u('″', 'arcsecond', DIM.angle, Math.PI / 648_000),
  // Gate 8.4: units used by the shared instruments (probe, ruler, converter, time series)
  Hz: u('Hz', 'hertz', DIM.frequency, 1),
  kHz: u('kHz', 'kilohertz', DIM.frequency, 1e3),
  MHz: u('MHz', 'megahertz', DIM.frequency, 1e6),
  GHz: u('GHz', 'gigahertz', DIM.frequency, 1e9),
  THz: u('THz', 'terahertz', DIM.frequency, 1e12),
  'm/s²': u('m/s²', 'metre per second squared', DIM.acceleration, 1),
  g_n: u('gₙ', 'standard acceleration of gravity (exact, CGPM 1901; CODATA adopted value)', DIM.acceleration, 9.80665),
  mV: u('mV', 'millivolt', DIM.potential, 1e-3),
  V: u('V', 'volt', DIM.potential, 1),
  kV: u('kV', 'kilovolt', DIM.potential, 1e3),
  'V/m': u('V/m', 'volt per metre', DIM.electricField, 1),
  'kV/m': u('kV/m', 'kilovolt per metre', DIM.electricField, 1e3),
  'MV/m': u('MV/m', 'megavolt per metre', DIM.electricField, 1e6),
  'J/kg': u('J/kg', 'joule per kilogram', DIM.specificEnergy, 1),
  'MJ/kg': u('MJ/kg', 'megajoule per kilogram', DIM.specificEnergy, 1e6),
  'km²/s²': u('km²/s²', 'square kilometre per square second', DIM.specificEnergy, 1e6),
} as const satisfies Record<string, UnitDef>;

export type UnitKey = keyof typeof UNITS;

export class DimensionError extends Error {
  constructor(from: UnitDef, to: UnitDef) {
    super(`Dimensional mismatch: cannot convert ${from.symbol} [${dimToString(from.dimension)}] to ${to.symbol} [${dimToString(to.dimension)}]`);
    this.name = 'DimensionError';
  }
}

/** Convert `value` between units, throwing DimensionError on incompatible dimensions. */
export function convert(value: number, from: UnitKey, to: UnitKey): number {
  const a = UNITS[from] as UnitDef, b = UNITS[to] as UnitDef;
  if (!dimEquals(a.dimension, b.dimension)) throw new DimensionError(a, b);
  const si = (value + (a.offset ?? 0)) * a.toSI;
  return si / b.toSI - (b.offset ?? 0);
}

/** A value tagged with its unit; arithmetic should be done after `toSI`. */
export interface Quantity { value: number; unit: UnitKey }
export const toSI = (q: Quantity) => convert(q.value, q.unit, siUnitFor(q.unit));

function siUnitFor(k: UnitKey): UnitKey {
  const dim = UNITS[k].dimension;
  const found = (Object.keys(UNITS) as UnitKey[]).find((key) => UNITS[key].toSI === 1 && !(UNITS[key] as UnitDef).offset && dimEquals(UNITS[key].dimension, dim));
  if (!found) throw new Error(`No SI coherent unit registered for ${k}`);
  return found;
}

/** Pick the most readable length unit for a value in metres (used by HUD/scale navigator). */
export function bestLengthUnit(meters: number): { value: number; unit: UnitKey } {
  const a = Math.abs(meters);
  const ladder: [number, UnitKey][] = [
    [1e-14, 'fm'], [1e-11, 'pm'], [1e-9, 'nm'], [1e-6, 'µm'], [1e-3, 'mm'], [1, 'm'], [1e3, 'km'],
    [0.05 * CONSTANTS.au.value, 'au'], [0.3 * LIGHT_YEAR_M, 'ly'], [1e3 * PARSEC_M, 'kpc'], [1e6 * PARSEC_M, 'Mpc'],
  ];
  let unit: UnitKey = 'fm';
  for (const [threshold, k] of ladder) if (a >= threshold) unit = k;
  return { value: convert(meters, 'm', unit), unit };
}

/** Format a number with significant figures and engineering-friendly exponent. */
export function formatSig(x: number | null | undefined, sig = 4): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return 'unknown';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e6) return Number(x.toPrecision(sig)).toLocaleString('en-US', { maximumSignificantDigits: sig });
  const [m, e] = x.toExponential(sig - 1).split('e');
  return `${m} × 10${toSuperscript(Number(e))}`;
}
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const toSuperscript = (n: number) => String(n).split('').map((ch) => SUP[ch] ?? ch).join('');
export const formatQuantity = (value: number | null | undefined, unit: string, sig = 4) =>
  value === null || value === undefined || !Number.isFinite(value) ? 'unknown' : `${formatSig(value, sig)} ${unit}`;
