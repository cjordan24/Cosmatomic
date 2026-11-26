/**
 * Celestial body catalogue — merges physical datasets under one identifier per
 * body. Missing values stay `null` and are shown as "unknown".
 */
import planetPhys from '@datasets/astronomical/planet-physical.json';
import moonPhys from '@datasets/astronomical/moon-physical.json';
import dwarfPhys from '@datasets/astronomical/dwarf-physical.json';
import smallEl from '@datasets/astronomical/small-body-elements.json';
import curated from '@datasets/curated/curated-reference.json';
import { CONSTANTS } from '@/core/constants/constants';
import type { Provenance } from '@/core/provenance/provenance';
import { moonParent } from './ephemeris';

export type BodyKind = 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'spacecraft';

export interface CelestialBody {
  id: string;
  name: string;
  kind: BodyKind;
  classification: string;
  parent: string | null;
  radiusKm: number | null;
  radiusSigmaKm: number | null;
  massKg: number | null;
  densityKgM3: number | null;
  gravityMs2: number | null;
  escapeVelocityKms: number | null;
  rotationPeriodH: number | null;
  orbitalPeriodDays: number | null;
  eccentricity: number | null;
  inclinationDeg: number | null;
  obliquityDeg: number | null;
  meanTemperatureK: number | null;
  surfacePressureBar: number | null;
  atmosphere: { species: string; fraction: number }[] | null;
  knownMoons: number | null;
  rings: boolean | null;
  /** Display colour — ILLUSTRATIVE (no imagery yet in Phase 1). */
  color: string;
  provenance: Provenance[];
  notes: string[];
}

const G = CONSTANTS.G.value;
const NSSDC: Provenance = { class: 'observed', institution: 'NASA Goddard NSSDC Planetary Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', license: 'Public domain (US Gov.)', uncertainty: 'rounded to published precision (~3 s.f.)' };
const SATS: Provenance = { class: 'observed', institution: 'NASA JPL SSD — Planetary Satellite Physical Parameters', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/', uncertainty: '1σ as published' };
const SBDB: Provenance = { class: 'observed', institution: 'NASA JPL Small-Body Database', url: 'https://ssd-api.jpl.nasa.gov/doc/sbdb.html' };
const HORIZONS: Provenance = { class: 'derived', institution: 'NASA JPL Horizons osculating elements', url: 'https://ssd.jpl.nasa.gov/horizons/', referenceFrame: 'ecliptic J2000', assumptions: ['two-body propagation from 2025-01-01 TDB'] };
const TRANSCRIBED = (citation: string): Provenance => ({ class: 'observed', institution: citation, transcribed: true });

type PP = Record<string, number | boolean | null | string>;
const pp = planetPhys as unknown as Record<string, PP>;
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const atm = curated.atmospheres.bodies as Record<string, { species: string; fraction: number }[]>;

const COLORS: Record<string, string> = {
  sun: '#ffd27a', mercury: '#9c948c', venus: '#e8cf9a', earth: '#4f8fe6', moon: '#b9b6b0', mars: '#c8643c',
  jupiter: '#d8b48a', saturn: '#e6d49c', uranus: '#9fe0e8', neptune: '#4f6fe0', pluto: '#d9c2a4',
  ceres: '#8f8a84', eris: '#e6e6e6', haumea: '#d6d6d6', makemake: '#c99a7a',
};

function fromNssdc(id: string, name: string, kind: BodyKind, classification: string, parent: string | null): CelestialBody {
  const p = pp[id];
  const T = num(p.meanTemperatureC);
  return {
    id, name, kind, classification, parent,
    radiusKm: num(p.diameterKm) !== null ? (p.diameterKm as number) / 2 : null, radiusSigmaKm: null,
    massKg: num(p.massKg), densityKgM3: num(p.densityKgM3), gravityMs2: num(p.gravityMs2), escapeVelocityKms: num(p.escapeVelocityKms),
    rotationPeriodH: num(p.rotationPeriodH), orbitalPeriodDays: num(p.orbitalPeriodDays), eccentricity: num(p.eccentricity),
    inclinationDeg: num(p.inclinationDeg), obliquityDeg: num(p.obliquityDeg), meanTemperatureK: T === null ? null : T + 273.15,
    surfacePressureBar: num(p.surfacePressureBar), atmosphere: atm[id] ?? null, knownMoons: num(p.knownMoons),
    rings: typeof p.rings === 'boolean' ? p.rings : null, color: COLORS[id] ?? '#aaa',
    provenance: [NSSDC, ...(atm[id] ? [TRANSCRIBED(curated.atmospheres.citation)] : [])],
    notes: id === 'moon' ? ['Orbital values in the NSSDC table for the Moon are relative to Earth.'] : ['jupiter', 'saturn', 'uranus', 'neptune'].includes(id) ? ['Giant planet: "surface" quantities refer to the 1-bar pressure level.'] : [],
  };
}

const sun: CelestialBody = {
  id: 'sun', name: 'Sun', kind: 'star', classification: `Star (${curated.sun.spectralType} main sequence)`, parent: null,
  radiusKm: curated.sun.nominalRadiusM / 1000, radiusSigmaKm: null, massKg: curated.sun.massKg,
  densityKgM3: curated.sun.massKg / ((4 / 3) * Math.PI * curated.sun.nominalRadiusM ** 3),
  gravityMs2: curated.sun.nominalGMm3s2 / curated.sun.nominalRadiusM ** 2,
  escapeVelocityKms: Math.sqrt((2 * curated.sun.nominalGMm3s2) / curated.sun.nominalRadiusM) / 1000,
  rotationPeriodH: curated.sun.rotationPeriodDaysEquatorial * 24, orbitalPeriodDays: null, eccentricity: null, inclinationDeg: null,
  obliquityDeg: 7.25, meanTemperatureK: curated.sun.nominalEffectiveTemperatureK, surfacePressureBar: null,
  atmosphere: [
    { species: 'H', fraction: curated.sun.massFractions.X_hydrogen },
    { species: 'He', fraction: curated.sun.massFractions.Y_helium },
    { species: 'metals (Z)', fraction: curated.sun.massFractions.Z_metals },
  ],
  knownMoons: null, rings: null, color: COLORS.sun,
  provenance: [TRANSCRIBED(curated.sun.citation)],
  notes: ['Composition shown as photospheric MASS fractions (X, Y, Z), not volume fractions.', 'Temperature is the effective (photospheric) temperature.', 'Obliquity: solar equator inclination to the ecliptic (Carrington).'],
};

const PLANETS: [string, string][] = [['mercury', 'Mercury'], ['venus', 'Venus'], ['earth', 'Earth'], ['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'], ['neptune', 'Neptune']];
const PLANET_CLASS: Record<string, string> = { mercury: 'Terrestrial planet', venus: 'Terrestrial planet', earth: 'Terrestrial planet', mars: 'Terrestrial planet', jupiter: 'Gas giant', saturn: 'Gas giant', uranus: 'Ice giant', neptune: 'Ice giant' };

type MP = { name: string; gmKm3s2: { value: number; sigma: number | null } | null; meanRadiusKm: { value: number; sigma: number | null } | null; densityGcm3: { value: number; sigma: number | null } | null };
const moons: CelestialBody[] = smallEl.moons.map((m) => {
  if (m.id === 'moon') return { ...fromNssdc('moon', 'Moon', 'moon', 'Natural satellite of Earth', 'earth'), orbitalPeriodDays: 27.3217, eccentricity: 0.0549, inclinationDeg: 5.145 };
  const p = (moonPhys as unknown as Record<string, MP>)[m.id];
  const R = p?.meanRadiusKm?.value ?? null;
  const GM = p?.gmKm3s2?.value ?? null;
  const parent = moonParent(m.id)!;
  return {
    id: m.id, name: p?.name ?? m.horizonsName.replace(/\s*\(.*\)/, ''), kind: 'moon' as const, classification: `Natural satellite of ${parent[0].toUpperCase()}${parent.slice(1)}`, parent,
    radiusKm: R, radiusSigmaKm: p?.meanRadiusKm?.sigma ?? null,
    massKg: GM !== null ? (GM * 1e9) / G : null,
    densityKgM3: p?.densityGcm3 ? p.densityGcm3.value * 1000 : null,
    gravityMs2: GM !== null && R !== null ? (GM * 1e9) / (R * 1000) ** 2 : null,
    escapeVelocityKms: GM !== null && R !== null ? Math.sqrt((2 * GM) / R) : null,
    rotationPeriodH: null, orbitalPeriodDays: m.period / 86_400, eccentricity: m.e, inclinationDeg: m.i, obliquityDeg: null,
    meanTemperatureK: null, surfacePressureBar: m.id === 'titan' ? 1.5 : null, atmosphere: atm[m.id] ?? null, knownMoons: null, rings: null,
    color: m.id === 'titan' ? '#d9a55b' : m.id === 'io' ? '#e8d26a' : m.id === 'europa' ? '#d8cbb3' : '#a7a29a',
    provenance: [SATS, HORIZONS, ...(atm[m.id] ? [TRANSCRIBED(curated.atmospheres.citation)] : [])],
    notes: ['Mass derived as GM / G (CODATA 2018).', 'Orbital period, eccentricity and inclination are osculating values at 2025-01-01 (inclination relative to the ecliptic, not the parent equator).', ...(m.id === 'titan' ? ['Surface pressure ≈ 1.5 bar (Huygens probe, 2005).'] : [])],
  };
});

type DP = { fullname: string; orbitClass: string; params: Record<string, { value: number; sigma: number | null; units: string | null }> };
const dwarfs: CelestialBody[] = smallEl.dwarfs.map((d) => {
  if (d.id === 'pluto') return { ...fromNssdc('pluto', 'Pluto', 'dwarf-planet', 'Dwarf planet (Kuiper Belt object)', null), provenance: [NSSDC, HORIZONS] };
  const p = (dwarfPhys as unknown as Record<string, DP>)[d.id];
  const diam = p?.params.diameter?.value, gm = p?.params.GM?.value, dens = p?.params.density?.value, rot = p?.params.rot_per?.value;
  const R = Number.isFinite(diam) ? diam! / 2 : null;
  return {
    id: d.id, name: d.id[0].toUpperCase() + d.id.slice(1), kind: 'dwarf-planet' as const,
    classification: `Dwarf planet (${p?.orbitClass ?? 'unknown class'})`, parent: null,
    radiusKm: R, radiusSigmaKm: null, massKg: Number.isFinite(gm) ? (gm! * 1e9) / G : null,
    densityKgM3: Number.isFinite(dens) ? dens! * 1000 : null,
    gravityMs2: Number.isFinite(gm) && R ? (gm! * 1e9) / (R * 1000) ** 2 : null,
    escapeVelocityKms: Number.isFinite(gm) && R ? Math.sqrt((2 * gm!) / R) : null,
    rotationPeriodH: Number.isFinite(rot) ? rot! : null, orbitalPeriodDays: d.period, eccentricity: d.e, inclinationDeg: d.i, obliquityDeg: null,
    meanTemperatureK: null, surfacePressureBar: null, atmosphere: null, knownMoons: null, rings: null,
    color: COLORS[d.id] ?? '#bbb', provenance: [SBDB, HORIZONS],
    notes: R === null ? ['Radius and mass are not provided by SBDB for this object; shown as unknown (not estimated).'] : [],
  };
});

/**
 * Spacecraft. Trajectories: JPL Horizons. Physical facts: NASA/JPL Voyager mission pages
 * (launch mass 825.5 kg incl. science; HGA 3.66 m). Heliopause crossings: NASA (2012-08-25 at
 * ~121.6 au for Voyager 1; 2018-11-05 at ~119 au for Voyager 2).
 */
const VOYAGER_PROV: Provenance[] = [
  { class: 'derived', institution: 'NASA JPL Horizons — Voyager_1/2_ST+refit2022_m (patched-conic mission design → 2022 tracking-data fit → JPL prediction after 1992)', url: 'https://ssd.jpl.nasa.gov/horizons/', referenceFrame: 'ecliptic J2000, heliocentric', assumptions: ['cubic Hermite interpolation between position+velocity samples'] },
  { class: 'illustrative', institution: '3D model built in Blender from published NASA/JPL dimensions (scripts/blender/build_voyager.py)' },
  { class: 'observed', institution: 'NASA/JPL Voyager mission facts', url: 'https://science.nasa.gov/mission/voyager/', transcribed: true },
];
const spacecraft: CelestialBody[] = [
  ['voyager-1', 'Voyager 1', '1977-09-05', 'Jupiter 1979-03-05 · Saturn/Titan 1980-11-12 · crossed the heliopause 2012-08-25 (~121.6 au)'],
  ['voyager-2', 'Voyager 2', '1977-08-20', 'Jupiter 1979-07-09 · Saturn 1981-08-26 · Uranus 1986-01-24 · Neptune 1989-08-25 · crossed the heliopause 2018-11-05 (~119 au)'],
].map(([id, name, launch, history]) => ({
  id, name, kind: 'spacecraft' as const, classification: `Spacecraft — NASA/JPL, launched ${launch}`, parent: null,
  radiusKm: 0.00183, radiusSigmaKm: null, massKg: 825.5, densityKgM3: null, gravityMs2: null, escapeVelocityKms: null,
  rotationPeriodH: null, orbitalPeriodDays: null, eccentricity: null, inclinationDeg: null, obliquityDeg: null,
  meanTemperatureK: null, surfacePressureBar: null, atmosphere: null, knownMoons: null, rings: null,
  color: '#f5c76b', provenance: VOYAGER_PROV,
  notes: [history, '"Mean radius" = high-gain-antenna radius (1.83 m); mass is launch mass incl. science instruments.', 'Model is illustrative (correct proportions, simplified parts); the high-gain antenna is pointed at Earth as in flight.'],
}));

export const BODIES: CelestialBody[] = [sun, ...PLANETS.map(([id, name]) => fromNssdc(id, name, 'planet', PLANET_CLASS[id], null)), ...dwarfs, ...moons, ...spacecraft];
export const getBody = (id: string) => BODIES.find((b) => b.id === id);
export const childrenOf = (id: string) => BODIES.filter((b) => b.parent === id);

export const SATURN_RINGS = curated.saturnRings;
