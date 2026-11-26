/**
 * Exoplanets within 10 pc — pure science (Gate 5.3).
 *
 * Census: the 10 pc sample (Reylé et al.). Elements: exoplanet.eu (Schneider et al. 2011), stored
 * as published with asymmetric uncertainties [value, −σ, +σ]. This module only converts units,
 * checks consistency and builds orbit geometry; it never fills a missing element.
 */
import { CONSTANTS } from '@/core/constants/constants';

export type WithErr = [number, number | null, number | null];
export interface EuElements {
  name: string; url: string; matchedBy: string | null; status: string; discovered: number | null; updated: string | null;
  detection: string | null; massType: string | null; radiusType: string | null;
  P: WithErr | null; a: WithErr | null; e: WithErr | null; i: WithErr | null; omega: WithErr | null; tperi: WithErr | null; K: WithErr | null;
  mass: WithErr | null; msini: WithErr | null; radius: WithErr | null;
  starName: string; starMass: WithErr | null; starDistance: WithErr | null;
}
export interface Exoplanet { seq: number; sys: number; name: string; systemRef: string | null; eu: EuElements | null }

let promise: Promise<Exoplanet[]> | null = null;
export function loadExoplanets(): Promise<Exoplanet[]> {
  promise ??= import('@datasets/astronomical/exoplanets-10pc.json').then((m) => ((m.default ?? m) as unknown as { planets: Exoplanet[] }).planets);
  return promise;
}

// ------------------------------------------------------------------ units (IAU 2015 B3 nominal)
/** Jupiter-to-Earth mass ratio from the nominal (GM)_J / (GM)_E. */
export const MJUP_IN_MEARTH = CONSTANTS.GMjup.value / CONSTANTS.GMearth.value;
/** Jupiter-to-Earth equatorial radius ratio (nominal). */
export const RJUP_IN_REARTH = CONSTANTS.ReJup.value / CONSTANTS.ReEarth.value;
export const toEarthMass = (mJup: number) => mJup * MJUP_IN_MEARTH;
export const toEarthRadius = (rJup: number) => rJup * RJUP_IN_REARTH;

/** Best available mass: true mass if published, else the minimum mass m sin i (flagged). */
export function bestMass(p: EuElements): { mEarth: number; minimum: boolean; err: [number | null, number | null] } | null {
  const v = p.mass ?? p.msini;
  if (!v) return null;
  return { mEarth: toEarthMass(v[0]), minimum: !p.mass, err: [v[1] !== null ? toEarthMass(v[1]) : null, v[2] !== null ? toEarthMass(v[2]) : null] };
}

// ------------------------------------------------------------------ checks
const DAY = 86_400;
/** Semi-major axis (au) from Kepler's third law, a³ = G(M★ + m)P²/4π², with the planet mass neglected. */
export function keplerA(periodDays: number, starMassSun: number): number {
  const gm = CONSTANTS.GMsun.value * starMassSun;
  const P = periodDays * DAY;
  return Math.cbrt((gm * P * P) / (4 * Math.PI * Math.PI)) / CONSTANTS.au.value;
}
/** Relative difference between the published a and Kepler's a from P and M★ (null if not testable). */
export function keplerCheck(p: EuElements): number | null {
  if (!p.P || !p.a || !p.starMass) return null;
  return p.a[0] / keplerA(p.P[0], p.starMass[0]) - 1;
}
/** A periastron time is usable only if it is a plausible Julian date (1950–2100). */
export const plausibleJd = (jd: number) => jd > 2_433_282 && jd < 2_488_070;

export interface ElementIssue { field: string; message: string }
export function elementIssues(p: EuElements): ElementIssue[] {
  const out: ElementIssue[] = [];
  if (p.tperi && !plausibleJd(p.tperi[0])) out.push({ field: 'tperi', message: `periastron time ${p.tperi[0]} is not a plausible Julian date (probably a transcription error in the compilation); not used` });
  if (p.e && (p.e[0] < 0 || p.e[0] >= 1)) out.push({ field: 'e', message: `eccentricity ${p.e[0]} outside [0, 1)` });
  if (p.i && (p.i[0] < 0 || p.i[0] > 180)) out.push({ field: 'i', message: `inclination ${p.i[0]}° outside [0°, 180°]` });
  const k = keplerCheck(p);
  if (k !== null && Math.abs(k) > 0.15) out.push({ field: 'a', message: `a differs by ${(k * 100).toFixed(0)} % from Kepler's law with the listed P and M★` });
  return out;
}

// ------------------------------------------------------------------ geometry (face-on, orbital plane)
/**
 * Orbit in its own plane, star at the focus (origin), periastron at angle ω from +x. Returns
 * points [x, y] in au. With e unknown the orbit is drawn circular; with ω unknown the periastron is
 * put on +x and the caller must say the orientation is arbitrary.
 */
export function orbitPath(a: number, e: number, omegaDeg: number, n = 180): [number, number][] {
  const w = (omegaDeg * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, k) => {
    const nu = (2 * Math.PI * k) / n;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    return [r * Math.cos(nu + w), r * Math.sin(nu + w)] as [number, number];
  });
}
export const periastron = (a: number, e: number) => a * (1 - e);
export const apastron = (a: number, e: number) => a * (1 + e);
