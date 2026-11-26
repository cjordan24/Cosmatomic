/**
 * Solar-system ephemeris models (all output: km, heliocentric or parent-centred,
 * ecliptic & equinox of J2000, time argument = JD TDB).
 *
 *  Planets  — JPL Keplerian elements + linear rates, Table 1 (valid 1800–2050).
 *  Moon     — truncated ELP-2000/82 (principal periodic terms, Meeus "Astronomical
 *             Algorithms" 2nd ed., ch. 47), converted from ecliptic-of-date to J2000
 *             by removing general precession in longitude.
 *  Earth    — EMB − μ·r_Moon, μ = GM_Moon / (GM_Earth + GM_Moon) (DE440 ratio).
 *  Others   — two-body propagation of JPL Horizons osculating elements (epoch 2025-01-01 TDB).
 */
import planetEl from '@datasets/astronomical/planet-elements.json';
import smallEl from '@datasets/astronomical/small-body-elements.json';
import curated from '@datasets/curated/curated-reference.json';
import craftData from '@datasets/astronomical/spacecraft-voyager.json';
import { CONSTANTS } from '@/core/constants/constants';
import { centuriesSinceJ2000, daysSinceJ2000 } from '@/core/simulation/clock';
import { elementsToPosition, sampleOrbit, type ClassicalElements } from '@/core/mathematics/kepler';
import { DEG, type Vec3, add, cross, normalize, raDecToEcliptic, scale, sub, wrap360, rotX, OBLIQUITY_J2000_RAD } from '@/core/mathematics/vec3';

export const AU_KM = CONSTANTS.au.value / 1000;
export const PLANET_VALID = { minJd: 2_378_496.5, maxJd: 2_470_171.5 }; // 1800-01-01 … 2050-12-31

type PlanetRow = (typeof planetEl.elements)[number];
const PLANETS = new Map<string, PlanetRow>(planetEl.elements.map((e) => [e.id, e]));

/** JPL Table 1 element set at time T (Julian centuries from J2000). */
export function planetElementsAt(id: string, jd: number): ClassicalElements {
  const p = PLANETS.get(id);
  if (!p) throw new Error(`No Table-1 elements for ${id}`);
  const T = centuriesSinceJ2000(jd);
  const a = p.a + p.aDot * T, e = p.e + p.eDot * T, I = p.I + p.IDot * T;
  const L = p.L + p.LDot * T, varpi = p.varpi + p.varpiDot * T, Omega = p.Omega + p.OmegaDot * T;
  return { a: a * AU_KM, e, i: I, Omega, omega: varpi - Omega, M: wrap360(L - varpi) };
}

export const planetHeliocentric = (id: string, jd: number): Vec3 => elementsToPosition(planetElementsAt(id, jd));

// ------------------------------------------------------------------ Moon (ELP-2000/82 truncated)
// Periodic terms: [D, M, M', F, coefficient]. Longitude in 1e-6 deg, distance in 1e-3 km.
const LR: [number, number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925], [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138], [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661], [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208], [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003], [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884],
];
const B: [number, number, number, number, number][] = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
];

/** Geocentric Moon position (km), ecliptic J2000. Accuracy ≈ 0.1–0.3° in longitude over 1800–2050 (see tests). */
export function moonGeocentric(jd: number): Vec3 {
  const T = centuriesSinceJ2000(jd);
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * DEG;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * DEG;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG;
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T * T) * DEG;
  const Ecc = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sl = 0, sr = 0, sb = 0;
  for (const [d, m, mp, f, l, r] of LR) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const e = Math.abs(m) === 1 ? Ecc : Math.abs(m) === 2 ? Ecc * Ecc : 1;
    sl += l * e * Math.sin(arg);
    sr += r * e * Math.cos(arg);
  }
  for (const [d, m, mp, f, b] of B) {
    const e = Math.abs(m) === 1 ? Ecc : Math.abs(m) === 2 ? Ecc * Ecc : 1;
    sb += b * e * Math.sin(d * D + m * M + mp * Mp + f * F);
  }
  // remove general precession in longitude (5029.0966″/cy) to refer to the J2000 equinox
  const lon = (Lp + sl / 1e6 - 1.3969713 * T) * DEG;
  const lat = (sb / 1e6) * DEG;
  const dist = 385000.56 + sr / 1000;
  return [dist * Math.cos(lat) * Math.cos(lon), dist * Math.cos(lat) * Math.sin(lon), dist * Math.sin(lat)];
}

/** GM_Moon / GM_Earth (DE440). */
export const MOON_EARTH_MASS_RATIO = 0.0123000371;
const MU_MOON = MOON_EARTH_MASS_RATIO / (1 + MOON_EARTH_MASS_RATIO);

export const earthHeliocentric = (jd: number): Vec3 => sub(planetHeliocentric('earth-moon-barycenter', jd), scale(moonGeocentric(jd), MU_MOON));

// ------------------------------------------------------------------ Horizons two-body
type MoonEl = (typeof smallEl.moons)[number];
type DwarfEl = (typeof smallEl.dwarfs)[number];
const MOON_EL = new Map<string, MoonEl>(smallEl.moons.map((m) => [m.id, m]));
const DWARF_EL = new Map<string, DwarfEl>(smallEl.dwarfs.map((m) => [m.id, m]));
export const ELEMENT_EPOCH_JD = smallEl.moons[0].epochJD;

export function moonElementsAt(id: string, jd: number): ClassicalElements {
  const m = MOON_EL.get(id)!;
  const dtS = (jd - m.epochJD) * 86_400;
  return { a: m.a, e: m.e, i: m.i, Omega: m.Omega, omega: m.omega, M: wrap360(m.M + m.meanMotion * dtS) };
}
export function dwarfElementsAt(id: string, jd: number): ClassicalElements {
  const d = DWARF_EL.get(id)!;
  return { a: d.a * AU_KM, e: d.e, i: d.i, Omega: d.Omega, omega: d.omega, M: wrap360(d.M + d.meanMotion * (jd - d.epochJD)) };
}

// ------------------------------------------------------------------ spacecraft (Horizons samples, cubic Hermite)
type CraftRec = { name: string; launch: string; encounters: [string, string][]; sections: { from: string; to: string; description: string }[]; samples: number[][] };
export const CRAFT = craftData.craft as unknown as Record<string, CraftRec>;
export const isSpacecraft = (id: string) => id in CRAFT;

/**
 * Heliocentric state (km, km/s) by cubic Hermite interpolation between Horizons
 * position+velocity samples. Returns null outside the trajectory's time span.
 */
export function spacecraftState(id: string, jd: number): { r: Vec3; v: Vec3 } | null {
  return hermite(CRAFT[id]?.samples, jd);
}

/** Cubic Hermite interpolation over [jd, x, y, z, vx, vy, vz] rows (km, km/s). Null outside the span. */
export function hermite(s: number[][] | undefined, jd: number): { r: Vec3; v: Vec3 } | null {
  if (!s || !s.length || jd < s[0][0] || jd > s[s.length - 1][0]) return null;
  let lo = 0, hi = s.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (s[mid][0] <= jd) lo = mid; else hi = mid; }
  const a = s[lo], b = s[hi];
  const h = (b[0] - a[0]) * 86_400; // seconds
  if (h === 0) return { r: [a[1], a[2], a[3]], v: [a[4], a[5], a[6]] };
  const t = ((jd - a[0]) * 86_400) / h;
  const t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
  const d00 = (6 * t2 - 6 * t) / h, d10 = (3 * t2 - 4 * t + 1), d01 = (-6 * t2 + 6 * t) / h, d11 = (3 * t2 - 2 * t);
  const r: Vec3 = [0, 0, 0], v: Vec3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    r[k] = h00 * a[1 + k] + h10 * h * a[4 + k] + h01 * b[1 + k] + h11 * h * b[4 + k];
    v[k] = d00 * a[1 + k] + d10 * a[4 + k] + d01 * b[1 + k] + d11 * b[4 + k];
  }
  return { r, v };
}

/** End of two-way coherent tracking (per Horizons section notes): later positions are JPL predictions. */
const END_OF_TRACKING: Record<string, string> = { 'voyager-1': '1992-04-24', 'voyager-2': '1992-10-30' };
const jdOf = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000 + 2_440_587.5;

export type TrajectoryQuality = 'patched-conic' | 'tracking-fit' | 'prediction';
/** Which kind of trajectory Horizons provides at this date (machine-read from the Horizons object header). */
export function trajectoryQuality(id: string, jd: number): { kind: TrajectoryQuality; text: string } {
  const c = CRAFT[id];
  const first = c.sections[0];
  if (/patched conic/i.test(first.description) && jd < jdOf(first.to)) return { kind: 'patched-conic', text: `Patched-conic mission-design trajectory (${first.from} → ${first.to}): conics fitted to match encounter events — rough accuracy, not a tracking reconstruction.` };
  if (jd <= jdOf(END_OF_TRACKING[id])) return { kind: 'tracking-fit', text: 'Fit to radiometric tracking data (2022 DE440 refit by R. Jacobson, JPL).' };
  return { kind: 'prediction', text: `JPL prediction: no two-way tracking since ${END_OF_TRACKING[id]}; formal 2030 pointing uncertainty of a few arcseconds.` };
}
export const trajectorySplices = (id: string) => CRAFT[id].sections.slice(1).map((s) => jdOf(s.from));

// ------------------------------------------------------------------ unified API
export const PARENT_CODE_TO_ID: Record<string, string> = { '399': 'earth', '499': 'mars', '599': 'jupiter', '699': 'saturn', '799': 'uranus', '899': 'neptune', '999': 'pluto' };
export const moonParent = (id: string) => (id === 'moon' ? 'earth' : PARENT_CODE_TO_ID[MOON_EL.get(id)?.parent ?? ''] ?? null);

// ------------------------------------------------------------------ encounter-window overrides (lazy)
interface EncounterWindow { craft: string; planet: string; date: string; planetSamples: number[][]; moons: Record<string, number[][]> }
let ENCOUNTERS: EncounterWindow[] | null = null;
let encounterPromise: Promise<void> | null = null;
export const encountersLoaded = () => ENCOUNTERS !== null;
/** Load the Horizons encounter ephemerides (≈640 KiB) on demand. */
export function loadEncounters(): Promise<void> {
  encounterPromise ??= import('@datasets/astronomical/encounter-ephemerides.json').then((m) => {
    ENCOUNTERS = ((m.default ?? m) as unknown as { windows: EncounterWindow[] }).windows;
  });
  return encounterPromise;
}
/** For tests / SSR: register already-imported data synchronously. */
export const registerEncounters = (w: EncounterWindow[]) => { ENCOUNTERS = w; };

/** Blend weight: 1 inside the window, ramping to 0 over the outer 1 day (avoids visible jumps). */
function windowWeight(s: number[][], jd: number) {
  const a = s[0][0], b = s[s.length - 1][0];
  if (jd <= a || jd >= b) return 0;
  const edge = Math.min(jd - a, b - jd);
  const u = Math.min(1, edge / 1.0);
  return u * u * (3 - 2 * u);
}

/** Horizons override for a planet (heliocentric) or moon (planet-centred) during a Voyager encounter. */
function encounterOverride(id: string, jd: number): { r: Vec3; w: number } | null {
  if (!ENCOUNTERS) return null;
  for (const win of ENCOUNTERS) {
    const s = win.planet === id ? win.planetSamples : win.moons[id];
    if (!s) continue;
    const w = windowWeight(s, jd);
    if (w === 0) continue;
    const st = hermite(s, jd);
    if (st) return { r: st.r, w };
  }
  return null;
}

/** Which source supplies this body's position at this date (shown in the info panel). */
export function positionSource(id: string, jd: number): 'horizons-encounter' | 'model' {
  return (encounterOverride(id, jd)?.w ?? 0) > 0.5 ? 'horizons-encounter' : 'model';
}

/** Position relative to the parent body (km): heliocentric for planets/dwarfs, parent-centric for moons. */
export function relativePosition(id: string, jd: number): Vec3 {
  const model = modelRelativePosition(id, jd);
  const o = encounterOverride(id, jd);
  return o ? add(model, scale(sub(o.r, model), o.w)) : model;
}

function modelRelativePosition(id: string, jd: number): Vec3 {
  if (id === 'sun') return [0, 0, 0];
  if (isSpacecraft(id)) return spacecraftState(id, jd)?.r ?? [NaN, NaN, NaN];
  if (id === 'earth') return earthHeliocentric(jd);
  if (id === 'moon') return moonGeocentric(jd);
  if (PLANETS.has(id)) return planetHeliocentric(id, jd);
  if (DWARF_EL.has(id)) return elementsToPosition(dwarfElementsAt(id, jd));
  if (MOON_EL.has(id)) return elementsToPosition(moonElementsAt(id, jd));
  throw new Error(`Unknown body ${id}`);
}

/** Heliocentric position (km). */
export function heliocentric(id: string, jd: number): Vec3 {
  const parent = moonParent(id);
  const rel = relativePosition(id, jd);
  return parent ? add(heliocentric(parent, jd), rel) : rel;
}

/** Orbit path relative to the parent (km) for drawing. */
export function orbitPath(id: string, jd: number, segments = 360): Vec3[] {
  if (isSpacecraft(id)) return CRAFT[id].samples.map((s) => [s[1], s[2], s[3]] as Vec3);
  if (id === 'earth') return sampleOrbit(planetElementsAt('earth-moon-barycenter', jd), segments);
  if (id === 'moon') {
    const pts: Vec3[] = [];
    for (let k = 0; k <= segments; k++) pts.push(moonGeocentric(jd + (27.321661 * k) / segments));
    return pts;
  }
  if (PLANETS.has(id)) return sampleOrbit(planetElementsAt(id, jd), segments);
  if (DWARF_EL.has(id)) return sampleOrbit(dwarfElementsAt(id, jd), segments);
  if (MOON_EL.has(id)) return sampleOrbit(moonElementsAt(id, jd), segments);
  return [];
}

// ------------------------------------------------------------------ orientation (IAU WGCCRE)
type RotKey = keyof typeof curated.iauRotation.bodies;

/**
 * Body-fixed axes in the ecliptic J2000 frame.
 *  pole  — IAU north pole (north side of the invariable plane)
 *  spin  — rotational angular-momentum axis = sign(Ẇ)·pole (differs for retrograde Venus, Uranus, Pluto)
 *  prime — prime-meridian direction
 */
export function bodyOrientation(id: string, jd: number): { pole: Vec3; spin: Vec3; prime: Vec3 } | null {
  const r = curated.iauRotation.bodies[id as RotKey];
  if (!r) return null;
  const poleEq: Vec3 = [Math.cos(r.delta0 * DEG) * Math.cos(r.alpha0 * DEG), Math.cos(r.delta0 * DEG) * Math.sin(r.alpha0 * DEG), Math.sin(r.delta0 * DEG)];
  // node of body equator on ICRF equator: Q = ẑ × pole
  let node = cross([0, 0, 1], poleEq);
  if (Math.hypot(...node) < 1e-9) node = [1, 0, 0];
  node = normalize(node);
  const W = wrap360(r.W0 + r.Wdot * daysSinceJ2000(jd)) * DEG;
  const yAxis = cross(poleEq, node);
  const primeEq: Vec3 = add(scale(node, Math.cos(W)), scale(yAxis, Math.sin(W)));
  const pole = raDecToEcliptic(r.alpha0, r.delta0);
  return { pole, spin: r.Wdot < 0 ? scale(pole, -1) : pole, prime: rotX(primeEq, -OBLIQUITY_J2000_RAD) };
}

/** Solar elevation above a body's equatorial plane (deg) — for Saturn, the Sun's elevation above the ring plane (B′). */
export function solarElevationOnEquator(id: string, jd: number): number | null {
  const o = bodyOrientation(id, jd);
  if (!o) return null;
  const p = heliocentric(id, jd);
  const toSun = scale(p, -1 / Math.hypot(...p));
  return (Math.asin(o.pole[0] * toSun[0] + o.pole[1] * toSun[1] + o.pole[2] * toSun[2]) * 180) / Math.PI;
}

/** Obliquity: angle between spin axis and orbit normal, degrees (0–180) — derived check against NSSDC values. */
export function obliquityFromPole(id: string, jd: number): number | null {
  const o = bodyOrientation(id, jd);
  if (!o) return null;
  const key = id === 'earth' ? 'earth-moon-barycenter' : id;
  const el = PLANETS.has(key) ? planetElementsAt(key, jd) : null;
  if (!el) return null;
  const n: Vec3 = [Math.sin(el.i * DEG) * Math.sin(el.Omega * DEG), -Math.sin(el.i * DEG) * Math.cos(el.Omega * DEG), Math.cos(el.i * DEG)];
  return (Math.acos(Math.max(-1, Math.min(1, o.spin[0] * n[0] + o.spin[1] * n[1] + o.spin[2] * n[2]))) * 180) / Math.PI;
}
