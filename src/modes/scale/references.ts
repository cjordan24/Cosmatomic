/**
 * Reference objects for the universal scale navigator (Gate 8.1, #/scale).
 *
 * Every length is read from a bundled dataset or constant — nothing is retyped here except the
 * CODATA 2022 proton radius and the Proxima Centauri parallax, both of which are checked against
 * their sources by tests/science/scale.test.ts. Each object states what the length is
 * (diameter, radius, distance, unit-cell edge …), its interval, provenance class and sources.
 */
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import { schwarzschildRadius } from '@/core/physics/relativity';
import { PLANCK18, hubbleDistanceMpc, particleHorizonMpc } from '@/core/physics/cosmology';
import { ELEMENTS } from '@/modes/atomic/atoms/elements';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { COMPACT_OBJECTS, radiusKm } from '@/modes/cosmic/compact/compact';
import planetPhysical from '@datasets/astronomical/planet-physical.json';
import moonPhysical from '@datasets/astronomical/moon-physical.json';
import planetElements from '@datasets/astronomical/planet-elements.json';
import milkyWay from '@datasets/astronomical/milky-way.json';
import darkMatter from '@datasets/astronomical/dark-matter.json';
import crystals from '@datasets/materials/crystals.json';

/** How the length is drawn: a circle of that diameter, a square of that edge, or a bar of that length. */
export type ScaleShape = 'circle' | 'square' | 'bar';

export interface ScaleRef {
  id: string;
  label: string;
  /** what the drawn length is, e.g. "diameter (2 × rms charge radius)" */
  quantity: string;
  /** drawn length in metres */
  m: number;
  /** lower / upper uncertainty in metres (null = exact, or none published) */
  lo: number | null; hi: number | null;
  interval: string | null;
  shape: ScaleShape;
  provenance: ProvenanceClass;
  /** how the value was obtained, in one line */
  note: string;
  sources: string[];
  route: string | null;
}

const KM = 1e3, KPC = 1e3 * PARSEC_M, MPC = 1e6 * PARSEC_M, ANGSTROM = 1e-10;

/** CODATA 2022 proton rms charge radius (NIST CUU "rp", retrieved 2026-11-27): 0.84075(64) fm. */
export const PROTON_RMS_RADIUS = { value: 8.4075e-16, sigma: 0.0064e-16 };
/** Proxima Centauri parallax (mas) from the 10 pc sample (Gaia EDR3); checked against the catalogue in tests. */
export const PROXIMA_PLX = { value: 768.0665, sigma: 0.0499 };

type PP = Record<string, { diameterKm: number; meanDistanceKm?: number }>;
const pp = planetPhysical as unknown as PP;
const moon = (moonPhysical as unknown as Record<string, { meanRadiusKm: { value: number; sigma: number } }>).moon;
const neptune = (planetElements as unknown as { elements: { id: string; a: number }[] }).elements.find((e) => e.id === 'neptune')!;
const mwParam = (k: string) => (milkyWay as unknown as { parameters: { key: string; value: [number, number, number] }[] }).parameters.find((p) => p.key === k)!;
const coma = (darkMatter as unknown as { coma: { distanceMpc: number; published: { rvDarkMpc: number } } }).coma;
const nacl = (crystals as unknown as { crystals: { id: string; a: number }[] }).crystals.find((c) => c.id === 'nacl')!;
const compact = (id: string) => COMPACT_OBJECTS.find((o) => o.id === id)!;

/** Largest nucleus-to-nucleus distance in a molecule's bundled 3D structure (m). */
export function molecularExtent(id: string): number | null {
  const m = MOLECULES.find((x) => x.id === id);
  if (!m || m.atoms.length < 2) return null;
  let best = 0;
  for (let i = 0; i < m.atoms.length; i++) for (let j = i + 1; j < m.atoms.length; j++) {
    const a = m.atoms[i], b = m.atoms[j];
    best = Math.max(best, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z));
  }
  return best * ANGSTROM;
}

function vdw(Z: number): ScaleRef {
  const e = ELEMENTS[Z - 1];
  return {
    id: `vdw-${e.symbol}`, label: `${e.name} atom`, quantity: 'diameter (2 × van der Waals radius)', m: 2 * e.vanDerWaalsRadiusPm! * 1e-12, lo: null, hi: null, interval: null,
    shape: 'circle', provenance: 'observed', note: `van der Waals radius ${e.vanDerWaalsRadiusPm} pm (PubChem periodic table)`, sources: ['pubchem'], route: `#/atomic/element/${Z}`,
  };
}

function molecule(id: string, label: string, provenance: ProvenanceClass, note: string, sources: string[]): ScaleRef {
  return { id: `mol-${id}`, label, quantity: 'largest nucleus-to-nucleus distance', m: molecularExtent(id)!, lo: null, hi: null, interval: null, shape: 'circle', provenance, note, sources, route: `#/atomic/molecules/${id}` };
}

function blackHole(id: string): ScaleRef {
  const o = compact(id);
  const d = (mSun: number) => 2 * schwarzschildRadius(mSun * CONSTANTS.GMsun.value);
  const [m, lo, hi] = o.mass;
  return {
    id: `bh-${id}`, label: `${o.name} event horizon`, quantity: 'diameter 2r_s = 4GM/c² (non-rotating hole)', m: d(m), lo: d(m) - d(m - lo), hi: d(m + hi) - d(m), interval: o.massInterval,
    shape: 'circle', provenance: 'derived', note: `from the mass ${m.toExponential(3)} M☉ (${o.massMethod}); a spinning hole has a smaller horizon`, sources: [o.massSource, 'carroll-1997'], route: `#/cosmic/compact?sel=${id}`,
  };
}

function compactRadius(id: string): ScaleRef {
  const o = compact(id);
  const [r, lo, hi] = radiusKm(o)!;
  return {
    id: `co-${id}`, label: o.name, quantity: 'diameter (2 × published radius)', m: 2 * r * KM, lo: 2 * lo * KM, hi: 2 * hi * KM, interval: o.radiusInterval,
    shape: 'circle', provenance: 'observed', note: o.radiusMethod ?? '', sources: [o.radiusSource!], route: `#/cosmic/compact?sel=${id}`,
  };
}

function mw(key: string, label: string, quantity: string): ScaleRef {
  const p = mwParam(key);
  return {
    id: `mw-${key}`, label, quantity, m: p.value[0] * (key === 'zt' ? PARSEC_M : KPC), lo: p.value[1] * (key === 'zt' ? PARSEC_M : KPC), hi: p.value[2] * (key === 'zt' ? PARSEC_M : KPC), interval: 'as quoted',
    shape: 'bar', provenance: 'observed', note: `${p.value[0]} ± ${p.value[1]} ${key === 'zt' ? 'pc' : 'kpc'} (Bland-Hawthorn & Gerhard 2016)`, sources: ['bland-hawthorn-gerhard-2016'], route: '#/cosmic/galaxies?tab=mw',
  };
}

export const SCALE_REFS: ScaleRef[] = (() => {
  const proxPc = 1000 / PROXIMA_PLX.value;
  const proxLo = proxPc - 1000 / (PROXIMA_PLX.value + PROXIMA_PLX.sigma), proxHi = 1000 / (PROXIMA_PLX.value - PROXIMA_PLX.sigma) - proxPc;
  const m87 = compact('m87-star');
  const refs: ScaleRef[] = [
    { id: 'proton', label: 'Proton', quantity: 'diameter (2 × rms charge radius)', m: 2 * PROTON_RMS_RADIUS.value, lo: 2 * PROTON_RMS_RADIUS.sigma, hi: 2 * PROTON_RMS_RADIUS.sigma, interval: '1σ',
      shape: 'circle', provenance: 'observed', note: 'CODATA 2022 rms charge radius 0.84075(64) fm', sources: ['codata-2022'], route: '#/atomic/element/1?view=nucleus' },
    { id: 'bohr', label: 'Bohr radius a₀', quantity: 'radius', m: CONSTANTS.a0.value, lo: CONSTANTS.a0.value * CONSTANTS.a0.relUncertainty, hi: CONSTANTS.a0.value * CONSTANTS.a0.relUncertainty, interval: '1σ',
      shape: 'bar', provenance: 'observed', note: 'CODATA 2018 recommended value', sources: ['codata-2018'], route: '#/atomic/element/1?view=orbital' },
    vdw(1), vdw(6), vdw(55),
    molecule('pubchem-962', 'Water molecule', 'simulated', 'PubChem3D computed conformer (not an experimental structure)', ['pubchem']),
    molecule('pubchem-5793', 'Glucose molecule', 'simulated', 'PubChem3D computed conformer (not an experimental structure)', ['pubchem']),
    molecule('exp-c60', 'Buckminsterfullerene C₆₀', 'derived', 'cage built from the gas-phase electron-diffraction bond lengths 1.401 and 1.458 Å', ['hedberg-1991']),
    { id: 'nacl-cell', label: 'NaCl unit cell', quantity: 'cubic cell edge a', m: nacl.a * ANGSTROM, lo: null, hi: null, interval: null,
      shape: 'square', provenance: 'observed', note: `a = ${nacl.a} Å (X-ray powder diffraction)`, sources: ['nbs-circular-539'], route: '#/atomic/materials/nacl' },
    compactRadius('psr-j0030'),
    compactRadius('sirius-b'),
    { id: 'moon', label: 'Moon', quantity: 'diameter (2 × mean radius)', m: 2 * moon.meanRadiusKm.value * KM, lo: 2 * moon.meanRadiusKm.sigma * KM, hi: 2 * moon.meanRadiusKm.sigma * KM, interval: 'as tabulated',
      shape: 'circle', provenance: 'observed', note: `mean radius ${moon.meanRadiusKm.value} km`, sources: ['jpl-satellites'], route: '#/cosmic/moon' },
    { id: 'earth', label: 'Earth', quantity: 'equatorial diameter', m: pp.earth.diameterKm * KM, lo: null, hi: null, interval: null,
      shape: 'circle', provenance: 'observed', note: `${pp.earth.diameterKm} km, rounded as published`, sources: ['nssdc-factsheet'], route: '#/cosmic/earth' },
    { id: 'jupiter', label: 'Jupiter', quantity: 'equatorial diameter', m: pp.jupiter.diameterKm * KM, lo: null, hi: null, interval: null,
      shape: 'circle', provenance: 'observed', note: `${pp.jupiter.diameterKm} km, rounded as published`, sources: ['nssdc-factsheet'], route: '#/cosmic/jupiter' },
    { id: 'sun', label: 'Sun', quantity: 'diameter (2 × nominal radius)', m: 2 * CONSTANTS.Rsun.value, lo: null, hi: null, interval: 'nominal value, exact by convention',
      shape: 'circle', provenance: 'observed', note: 'IAU 2015 nominal solar radius 695 700 km', sources: ['iau-2015-b3'], route: '#/cosmic/sun' },
    blackHole('sgr-a-star'),
    blackHole('m87-star'),
    { id: 'earth-moon', label: 'Earth–Moon distance', quantity: 'mean distance', m: pp.moon.meanDistanceKm! * KM, lo: null, hi: null, interval: null,
      shape: 'bar', provenance: 'observed', note: `${pp.moon.meanDistanceKm!.toLocaleString('en')} km, rounded as published`, sources: ['nssdc-factsheet'], route: '#/cosmic/moon' },
    { id: 'au', label: 'Astronomical unit', quantity: 'length (defined)', m: CONSTANTS.au.value, lo: null, hi: null, interval: 'exact by definition',
      shape: 'bar', provenance: 'observed', note: '149 597 870 700 m exactly (IAU 2012 Resolution B2)', sources: ['iau-2012-b2'], route: '#/cosmic' },
    { id: 'neptune-a', label: 'Neptune’s orbit', quantity: 'semi-major axis', m: neptune.a * CONSTANTS.au.value, lo: null, hi: null, interval: null,
      shape: 'bar', provenance: 'observed', note: `${neptune.a} au (J2000 mean elements, valid 1800–2050)`, sources: ['jpl-approx-planets'], route: '#/cosmic/neptune' },
    { id: 'proxima', label: 'Distance to Proxima Centauri', quantity: 'distance 1/parallax', m: proxPc * PARSEC_M, lo: proxLo * PARSEC_M, hi: proxHi * PARSEC_M, interval: '1σ',
      shape: 'bar', provenance: 'derived', note: `parallax ${PROXIMA_PLX.value} ± ${PROXIMA_PLX.sigma} mas → ${proxPc.toFixed(4)} pc`, sources: ['reyle-2021', 'gaia-edr3'], route: '#/cosmic/stars?sel=1' },
    mw('zt', 'Milky Way thin disc', 'scale height'),
    mw('Rt', 'Milky Way thin disc', 'scale length'),
    mw('R0', 'Sun to the Galactic Centre', 'distance R₀'),
    { id: 'coma-rv', label: 'Coma cluster', quantity: 'diameter 2r_v (dark-matter virial radius, h₇₀)', m: 2 * coma.published.rvDarkMpc * MPC, lo: null, hi: null, interval: null,
      shape: 'circle', provenance: 'derived', note: `r_v = ${coma.published.rvDarkMpc} Mpc from the galaxy-kinematics mass model (H₀ = 70)`, sources: ['lokas-mamon-2003'], route: '#/cosmic/darkmatter?tab=clusters' },
    { id: 'm87-distance', label: 'Distance to M87', quantity: 'distance', m: m87.distance![0] * PARSEC_M, lo: m87.distance![1] * PARSEC_M, hi: m87.distance![2] * PARSEC_M, interval: '68%',
      shape: 'bar', provenance: 'observed', note: `${(m87.distance![0] / 1e6).toFixed(1)} ± ${(m87.distance![1] / 1e6).toFixed(1)} Mpc as adopted by the EHT`, sources: [m87.distanceSource!], route: '#/cosmic/compact?sel=m87-star' },
    { id: 'coma-distance', label: 'Distance to the Coma cluster', quantity: 'distance (Hubble flow, H₀ = 70)', m: coma.distanceMpc * MPC, lo: null, hi: null, interval: null,
      shape: 'bar', provenance: 'derived', note: `${coma.distanceMpc} Mpc from its recession velocity 7093 km/s`, sources: ['lokas-mamon-2003'], route: '#/cosmic/darkmatter?tab=clusters' },
    { id: 'hubble-distance', label: 'Hubble distance c/H₀', quantity: 'length c/H₀ (Planck 2018 H₀ = 67.66)', m: hubbleDistanceMpc(PLANCK18) * MPC, lo: null, hi: null, interval: null,
      shape: 'bar', provenance: 'derived', note: 'D_H = c/H₀ (Hogg 1999 eq. 4) with the Planck 2018 H₀', sources: ['planck-2018-vi', 'hogg-1999'], route: '#/cosmic/universe' },
    { id: 'observable', label: 'Observable universe', quantity: 'comoving radius (distance to z → ∞)', m: particleHorizonMpc(PLANCK18) * MPC, lo: null, hi: null, interval: null,
      shape: 'bar', provenance: 'simulated', note: 'model quantity in Planck 2018 base ΛCDM with radiation, not a measurement', sources: ['planck-2018-vi', 'hogg-1999'], route: '#/cosmic/universe?tab=history' },
  ];
  return refs.sort((a, b) => a.m - b.m);
})();

export const LOG_MIN = -16, LOG_MAX = 27.5;

/** Human-readable length: SI prefixes up to km, then au, ly and parsec multiples. */
export function formatLength(m: number, sig = 3): string {
  const f = (x: number) => Number(x.toPrecision(sig)).toLocaleString('en', { maximumFractionDigits: 20 });
  const a = Math.abs(m);
  if (a >= 1e9 * PARSEC_M) return `${f(m / (1e9 * PARSEC_M))} Gpc`;
  if (a >= 0.1 * MPC) return `${f(m / MPC)} Mpc`;
  if (a >= 0.1 * KPC) return `${f(m / KPC)} kpc`;
  if (a >= 0.1 * PARSEC_M) return `${f(m / PARSEC_M)} pc`;
  if (a >= 1e-2 * CONSTANTS.au.value) return `${f(m / CONSTANTS.au.value)} au`;
  const units: [number, string][] = [[1e3, 'km'], [1, 'm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm'], [1e-15, 'fm'], [1e-18, 'am']];
  for (const [u, s] of units) if (a >= u) return `${f(m / u)} ${s}`;
  return `${m.toExponential(sig - 1)} m`;
}
