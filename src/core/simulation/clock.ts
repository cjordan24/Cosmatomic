/**
 * Universal simulation clock. Time is represented as a Julian Date in TDB
 * (Barycentric Dynamical Time), the time scale used by JPL ephemerides.
 *
 * UTC display: TDB − UTC ≈ 69.18 s for 2017–2026 (32.184 s + 37 leap seconds).
 * The display converts with that fixed offset; this is documented in SCIENTIFIC_MODELS.md.
 */
import { JD_J2000 } from '../constants/constants';

const UNIX_EPOCH_JD = 2_440_587.5;
const TT_MINUS_TAI = 32.184;

/**
 * IERS leap seconds: [UTC date (ms since Unix epoch), TAI − UTC after that date].
 * 10 s on 1972-01-01, +1 s at each listed date, 37 s since 2017-01-01 (none announced since).
 */
const LEAP: [number, number][] = [
  '1972-01-01', '1972-07-01', '1973-01-01', '1974-01-01', '1975-01-01', '1976-01-01', '1977-01-01', '1978-01-01', '1979-01-01',
  '1980-01-01', '1981-07-01', '1982-07-01', '1983-07-01', '1985-07-01', '1988-01-01', '1990-01-01', '1991-01-01', '1992-07-01',
  '1993-07-01', '1994-07-01', '1996-01-01', '1997-07-01', '1999-01-01', '2006-01-01', '2009-01-01', '2012-07-01', '2015-07-01', '2017-01-01',
].map((d, i) => [Date.parse(`${d}T00:00:00Z`), 10 + i]);

/**
 * TDB − UTC in seconds at a UTC instant (TDB ≈ TT to < 2 ms).
 * Before 1972 UTC had no leap-second definition; we hold 42.184 s (approximate — ΔT
 * ranged roughly −3 … +40 s over 1800–1972). Documented in SCIENTIFIC_MODELS.md.
 */
export function tdbMinusUtc(utcMs: number): number {
  let taiUtc = 10;
  for (const [t, v] of LEAP) if (utcMs >= t) taiUtc = v; else break;
  return taiUtc + TT_MINUS_TAI;
}

export const jdFromDate = (d: Date): number => (d.getTime() + tdbMinusUtc(d.getTime()) * 1000) / 86_400_000 + UNIX_EPOCH_JD;
export function dateFromJd(jd: number): Date {
  const approxMs = (jd - UNIX_EPOCH_JD) * 86_400_000;
  return new Date(approxMs - tdbMinusUtc(approxMs - 69_184) * 1000);
}
export const centuriesSinceJ2000 = (jd: number) => (jd - JD_J2000) / 36_525;
export const daysSinceJ2000 = (jd: number) => jd - JD_J2000;

export interface ClockRange { minJd: number; maxJd: number; label: string }

export interface ClockState {
  jd: number;
  /** simulated seconds per real second; negative = reverse playback */
  rate: number;
  playing: boolean;
}

/** Pure step function (deterministic): advance by real elapsed seconds, clamped to the valid range. */
export function advance(state: ClockState, realSeconds: number, range: ClockRange): ClockState & { clamped: boolean } {
  if (!state.playing) return { ...state, clamped: false };
  const next = state.jd + (state.rate * realSeconds) / 86_400;
  const jd = Math.min(range.maxJd, Math.max(range.minJd, next));
  const clamped = jd !== next;
  return { jd, rate: state.rate, playing: clamped ? false : state.playing, clamped };
}

export const RATE_PRESETS: { label: string; rate: number }[] = [
  { label: '−1 yr/s', rate: -31_557_600 },
  { label: '−1 mo/s', rate: -2_629_800 },
  { label: '−1 d/s', rate: -86_400 },
  { label: '−1 h/s', rate: -3_600 },
  { label: 'Real time', rate: 1 },
  { label: '1 min/s', rate: 60 },
  { label: '1 h/s', rate: 3_600 },
  { label: '1 d/s', rate: 86_400 },
  { label: '1 wk/s', rate: 604_800 },
  { label: '1 mo/s', rate: 2_629_800 },
  { label: '1 yr/s', rate: 31_557_600 },
];

export function formatJdUtc(jd: number): string {
  const d = dateFromJd(jd);
  return Number.isFinite(d.getTime()) ? d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : 'invalid date';
}
