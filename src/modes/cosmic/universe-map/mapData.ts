/**
 * Universe map data (Phase 10, Gate 10.8). Every object gets a heliocentric position in metres in the Galactic frame
 * (x towards the Galactic Centre l = 0, b = 0; y towards l = 90°; z towards the North Galactic Pole), built only from
 * bundled, sourced quantities:
 *  - Sun, planets, Pluto and Voyager 1/2: JPL ephemerides (heliocentric ecliptic J2000, km) rotated to equatorial with the
 *    IAU 2006 obliquity and to Galactic with the Hipparcos matrix (stars.ts).
 *  - Stars within 20 pc: CNS5 positions and parallaxes (Golovin et al. 2023, Gaia).
 *  - Nebulae and compact objects: SIMBAD positions (via Sesame) with the bundled distances of each record.
 *  - The Galactic Centre: Sgr A* (SIMBAD position, GRAVITY distance from the compact-object record).
 *  - Local Group: McConnachie (2012) positions and heliocentric distances.
 *  - SPARC galaxies: SPARC distances (Lelli et al. 2016) with SIMBAD positions; NGC 4258 and the LMC: distance-ladder anchors.
 *  - Milky Way disc: points drawn from an exponential disc with Bland-Hawthorn & Gerhard (2016) R₀, z₀, scale length and
 *    scale height (a model, not a map of real stars; truncated at 5 scale lengths for display).
 *  - The last-scattering surface: comoving distance to z∗ = 1089.8 (Planck 2018) with the Planck 2018 cosmology.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { OBLIQUITY_J2000_RAD } from '@/core/mathematics/vec3';
import { icrsCartesian, icrsToGalactic, type Vec3 } from '@/modes/cosmic/star-systems/stars';
import { heliocentric, isSpacecraft } from '@/modes/cosmic/solar-system/ephemeris';
import { PLANCK18, comovingDistanceMpc } from '@/core/physics/cosmology';
import um from '@datasets/astronomical/universe-map.json';
import neb from '@datasets/astronomical/nebulae.json';
import comp from '@datasets/astronomical/compact-objects.json';
import sparcData from '@datasets/astronomical/sparc-galaxies.json';
import ladder from '@datasets/astronomical/distance-ladder.json';
import mw from '@datasets/astronomical/milky-way.json';
import planck from '@datasets/astronomical/planck-2018-params.json';

export const AU = CONSTANTS.au.value;
export const PC = 3.0856775814913673e16;
export const LY = 9.4607304725808e15;
export type Kind = 'sun' | 'planet' | 'spacecraft' | 'star' | 'nebula' | 'compact' | 'galactic-centre' | 'local-group' | 'galaxy' | 'cmb';
export interface MapObject {
  id: string; name: string; kind: Kind; pos: Vec3;   // metres, Galactic, Sun at the origin
  distance: number;                                   // metres from the Sun
  note: string; sources: string[]; route: string | null;
}

const cosE = Math.cos(OBLIQUITY_J2000_RAD), sinE = Math.sin(OBLIQUITY_J2000_RAD);
/** Ecliptic J2000 → equatorial (ICRS axes) → Galactic. */
export const eclipticToGalactic = (v: Vec3): Vec3 => icrsToGalactic([v[0], v[1] * cosE - v[2] * sinE, v[1] * sinE + v[2] * cosE]);
const scale = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];
const norm = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
/** Galactic position (m) from ICRS RA/Dec (degrees) and distance (m). */
export const fromRaDec = (ra: number, dec: number, dM: number): Vec3 => icrsToGalactic(icrsCartesian(ra, dec, dM));

// ---------------------------------------------------------------- solar system (positions at a given Julian date)
const PLANETS: [string, string][] = [['mercury', 'Mercury'], ['venus', 'Venus'], ['earth', 'Earth'], ['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'], ['neptune', 'Neptune'], ['pluto', 'Pluto']];
export function solarSystem(jd: number): MapObject[] {
  const out: MapObject[] = [{ id: 'sun', name: 'Sun', kind: 'sun', pos: [0, 0, 0], distance: 0, note: 'origin of the map', sources: ['iau-2015-b3'], route: '#/cosmic/sun' }];
  for (const [id, name] of PLANETS) {
    try {
      const p = eclipticToGalactic(scale(heliocentric(id, jd), 1000));
      if (p.every(Number.isFinite)) out.push({ id, name, kind: 'planet', pos: p, distance: norm(p), note: 'JPL ephemeris position at the map date', sources: id === 'pluto' ? ['jpl-sbdb'] : ['jpl-approx-planets'], route: `#/cosmic/${id}` });
    } catch { /* body not available */ }
  }
  for (const [id, name] of [['voyager-1', 'Voyager 1'], ['voyager-2', 'Voyager 2']]) {
    if (!isSpacecraft(id)) continue;
    const p = eclipticToGalactic(scale(heliocentric(id, jd), 1000));
    if (p.every(Number.isFinite)) out.push({ id, name, kind: 'spacecraft', pos: p, distance: norm(p), note: 'JPL Horizons trajectory at the map date', sources: ['jpl-horizons'], route: `#/cosmic/${id}` });
  }
  return out;
}

// ---------------------------------------------------------------- stars (CNS5, loaded asynchronously)
export function starObjects(stars: { name?: string | null; ra: number; dec: number; plx: number | null; id?: number | string }[]): MapObject[] {
  return stars.filter((s) => s.plx && s.plx > 0).map((s, i) => {
    const d = (1000 / s.plx!) * PC, p = fromRaDec(s.ra, s.dec, d);
    return { id: `star-${s.id ?? i}`, name: s.name ?? `CNS5 ${s.id ?? i}`, kind: 'star' as const, pos: p, distance: d, note: 'Gaia parallax (CNS5)', sources: ['golovin-2023-cns5', 'gaia-edr3'], route: '#/cosmic/stars' };
  });
}

// ---------------------------------------------------------------- fixed catalogue objects
interface Pos { ra: number; dec: number; refPos: string | null; simbadName: string }
const NAMED = (um as unknown as { named: Record<string, Pos> }).named;
const SPARC_POS = (um as unknown as { sparc: Record<string, Pos> }).sparc;
const LG = (um as unknown as { localGroup: { name: string; otherName: string | null; type: string | null; subgroup: string | null; ra: number | null; dec: number | null; distanceKpc: number | null; errPlus: number | null; errMinus: number | null }[] }).localGroup;
const toM = (v: number, unit: string) => v * (unit === 'pc' ? PC : unit === 'ly' ? LY : unit === 'kpc' ? 1e3 * PC : unit === 'Mpc' ? 1e6 * PC : NaN);
const val = (v: number | number[]) => (Array.isArray(v) ? v[0] : v);

export function catalogueObjects(): MapObject[] {
  const out: MapObject[] = [];
  for (const n of (neb as unknown as { nebulae: { id: string; name: string; type: string; distance: { value: number | number[]; unit: string; source: string } | null }[] }).nebulae) {
    const p = NAMED[n.id];
    if (!p || !n.distance) continue;
    const d = toM(val(n.distance.value), n.distance.unit);
    out.push({ id: `nebula-${n.id}`, name: n.name, kind: 'nebula', pos: fromRaDec(p.ra, p.dec, d), distance: d, note: `${n.type}; position SIMBAD (${p.refPos ?? 'no reference'})`, sources: [n.distance.source, 'simbad'], route: `#/cosmic/nebulae?sel=${n.id}` });
  }
  for (const c of (comp as unknown as { objects: { id: string; name: string; kind: string; distance: number[] | null; distanceUnit: string | null; distanceSource: string | null }[] }).objects) {
    const p = NAMED[c.id];
    if (!p || !c.distance || !c.distanceUnit) continue;
    const d = toM(c.distance[0], c.distanceUnit);
    out.push({ id: `compact-${c.id}`, name: c.name, kind: c.id === 'sgr-a-star' ? 'galactic-centre' : 'compact', pos: fromRaDec(p.ra, p.dec, d), distance: d, note: `${c.kind.replace('-', ' ')}; position SIMBAD (${p.refPos ?? 'no reference'})`, sources: [c.distanceSource ?? 'simbad', 'simbad'], route: `#/cosmic/compact?sel=${c.id}` });
  }
  for (const g of LG) {
    if (g.ra === null || g.dec === null || g.distanceKpc === null || g.name === 'The Galaxy') continue;   // the Milky Way itself is drawn as the disc model
    const d = g.distanceKpc * 1e3 * PC;
    out.push({ id: `lg-${g.name}`, name: g.otherName ? `${g.name} (${g.otherName.split(',')[0]})` : g.name, kind: 'local-group', pos: fromRaDec(g.ra, g.dec, d), distance: d, note: `${g.type ?? 'galaxy'}; ${g.subgroup === 'MW' ? 'Milky Way subgroup' : g.subgroup === 'M31' ? 'Andromeda subgroup' : 'Local Group and neighbours'}; D = ${g.distanceKpc} kpc`, sources: ['mcconnachie-2012'], route: null });
  }
  for (const g of (sparcData as unknown as { galaxies: { name: string; D: number; eD: number; T: number }[] }).galaxies) {
    const p = SPARC_POS[g.name];
    if (!p) continue;
    const d = g.D * 1e6 * PC;
    out.push({ id: `sparc-${g.name}`, name: g.name, kind: 'galaxy', pos: fromRaDec(p.ra, p.dec, d), distance: d, note: `SPARC rotation-curve galaxy; D = ${g.D} ± ${g.eD} Mpc; position SIMBAD (${p.refPos ?? 'no reference'})`, sources: ['lelli-2016-sparc', 'simbad'], route: `#/cosmic/galaxies?g=${encodeURIComponent(g.name)}` });
  }
  const anchors = (ladder as unknown as { anchors: { id: string; name: string; distance: { value: number; unit: string } | null }[] }).anchors;
  const n4258 = anchors.find((a) => a.id === 'ngc4258'), lmcA = anchors.find((a) => a.id === 'lmc');
  if (n4258?.distance && NAMED.ngc4258) { const d = toM(n4258.distance.value, n4258.distance.unit); out.push({ id: 'ladder-ngc4258', name: 'NGC 4258 (M106)', kind: 'galaxy', pos: fromRaDec(NAMED.ngc4258.ra, NAMED.ngc4258.dec, d), distance: d, note: `distance-ladder anchor, water-maser geometric distance ${n4258.distance.value} Mpc`, sources: ['reid-2019', 'simbad'], route: '#/cosmic/ladder' }); }
  // the LMC is in McConnachie's list; the ladder's detached-eclipsing-binary distance is noted on it
  const lmc = out.find((o) => o.id === 'lg-LMC');
  if (lmc && lmcA?.distance) lmc.note += `; distance-ladder anchor at ${lmcA.distance.value} kpc (Pietrzyński et al. 2019)`;
  return out;
}

// ---------------------------------------------------------------- Milky Way disc model
const MWP = Object.fromEntries((mw as unknown as { parameters: { key: string; value: number[] | null; unit: string }[] }).parameters.map((p) => [p.key, p.value?.[0] ?? null]));
export const MILKY_WAY = { R0: MWP.R0! * 1e3 * PC, z0: MWP.z0! * PC, Rd: MWP.Rt! * 1e3 * PC, zd: MWP.zt! * PC };
/** Deterministic sample of an exponential disc Σ ∝ exp(−R/R_d), ρ ∝ exp(−|z|/z_d), centred on the Galactic Centre (heliocentric, m). */
export function sampleDisc(n: number, seed = 7): Float32Array {
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s + 0.5) / 4294967296; };
  const out = new Float32Array(n * 3), { R0, z0, Rd, zd } = MILKY_WAY;
  for (let i = 0; i < n; i++) {
    let R: number;
    do R = -Rd * Math.log(rnd() * rnd()); while (R > 5 * Rd);       // Gamma(2, R_d): surface density × 2πR
    const phi = 2 * Math.PI * rnd(), z = (rnd() < 0.5 ? -1 : 1) * -zd * Math.log(rnd());
    out[3 * i] = R0 + R * Math.cos(phi); out[3 * i + 1] = R * Math.sin(phi); out[3 * i + 2] = z - z0;
  }
  return out;
}

// ---------------------------------------------------------------- the observable universe
const ZSTAR = (planck as unknown as { parameters: { key: string; value: number }[] }).parameters.find((p) => p.key === 'zstar')!.value;
export const LAST_SCATTERING = { z: ZSTAR, radius: comovingDistanceMpc(ZSTAR, PLANCK18) * 1e6 * PC };

/** Galactic longitude and latitude (degrees) of a position already in the Galactic frame. */
export function galacticCoords(p: Vec3): { l: number; b: number } {
  const r = Math.hypot(p[0], p[1], p[2]) || 1;
  return { l: ((Math.atan2(p[1], p[0]) * 180) / Math.PI + 360) % 360, b: (Math.asin(p[2] / r) * 180) / Math.PI };
}
