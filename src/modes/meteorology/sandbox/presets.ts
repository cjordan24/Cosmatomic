/**
 * Sandbox presets — assembled only from datasets the app already ingests and cites:
 *   planet-physical.json   NSSDCA planetary fact sheets (mass, diameter, gravity, rotation, distance, e, obliquity)
 *   planet-radiation.json  NSSDCA (Bond albedo, solar irradiance, black-body temperature)
 *   planets.json           NSSDCA atmosphere sections / NASA (surface pressure, mean temperature, mean molecular weight)
 *   moon-physical.json     JPL SSD (Titan GM and radius)
 * A field our sources do not give is listed in `missing` and filled by the user (marked hypothetical), never guessed.
 */
import physical from '@datasets/astronomical/planet-physical.json';
import radiation from '@datasets/astronomical/planet-radiation.json';
import moons from '@datasets/astronomical/moon-physical.json';
import worlds from '@datasets/meteorology/planets.json';
import { CONSTANTS } from '@/core/constants/constants';
import type { Planet } from '@/core/meteorology/sandbox';

/* eslint-disable @typescript-eslint/no-explicit-any */
const PH = physical as any, RAD = (radiation as any).bodies as any[], W = (worlds as any).worlds as any[], MO = moons as any;
const AU_KM = CONSTANTS.au.value / 1e3;

export interface Preset { id: string; planet: Planet; missing: string[]; notes: string[]; sources: string[] }

function fromFactsheet(id: string, name: string): Preset {
  const p = PH[id], r = RAD.find((b) => b.id === id), w = W.find((x) => x.id === id);
  const internal = id === 'jupiter' ? internalFrom(r.solarIrradianceWm2, r.bondAlbedo, 1.13) : 0;
  return {
    id,
    planet: {
      name, massKg: p.massKg, radiusKm: p.diameterKm / 2, gOverride: null,
      distanceAu: p.meanDistanceKm / AU_KM, eccentricity: p.eccentricity, tiltDeg: p.obliquityDeg, rotationH: p.rotationPeriodH,
      bondAlbedo: r.bondAlbedo, internalWm2: internal, pBar: w.pBar, mmw: w.mmw, tObsK: w.tK,
    },
    missing: [],
    notes: id === 'jupiter'
      ? ['Internal heat = 113 % of absorbed sunlight (Wang et al. 2025, as quoted in Other worlds) × the absorbed flux — our arithmetic.', 'Jupiter has no surface: pressure and temperature are at the 1-bar level.']
      : ['Internal heat set to 0: small next to sunlight for this world, and not quantified in our sources.'],
    sources: id === 'jupiter' ? ['nssdc-factsheet', 'wang-2025-uranus'] : ['nssdc-factsheet'],
  };
}

/** Internal flux (W/m²) from a ratio of internal heat to absorbed sunlight. */
export const internalFrom = (S: number, albedo: number, ratio: number) => (ratio * S * (1 - albedo)) / 4;

function titan(): Preset {
  const t = MO.titan, w = W.find((x) => x.id === 'titan'), sat = PH.saturn;
  const mmw = (0.95 * 28.0134 + 0.05 * 16.043);   // from the printed 95 % N₂ / 5 % CH₄ (by volume) — our arithmetic
  return {
    id: 'titan',
    planet: {
      name: 'Titan', massKg: (t.gmKm3s2.value * 1e9) / CONSTANTS.G.value, radiusKm: t.meanRadiusKm.value, gOverride: null,
      distanceAu: sat.meanDistanceKm / AU_KM, eccentricity: sat.eccentricity, tiltDeg: sat.obliquityDeg, rotationH: 382.7,
      bondAlbedo: 0.3, internalWm2: 0, pBar: w.pBar, mmw, tObsK: w.tK,
    },
    missing: ['Bond albedo (0.3 here is a placeholder — set it yourself)', 'rotation period (placeholder)'],
    notes: ['Mass from JPL’s GM ÷ G; distance, eccentricity and tilt taken from Saturn, which Titan orbits (an assumption).', 'Mean molecular weight from 95 % N₂ / 5 % CH₄ — our arithmetic.'],
    sources: ['jpl-satellites', 'nasa-voyager-factsheet', 'nasa-huygens-2007', 'nssdc-factsheet'],
  };
}

export const PRESETS: Preset[] = [
  fromFactsheet('earth', 'Earth'), fromFactsheet('venus', 'Venus'), fromFactsheet('mars', 'Mars'), titan(), fromFactsheet('jupiter', 'Jupiter'), fromFactsheet('pluto', 'Pluto'),
];
export const presetById = (id: string) => PRESETS.find((p) => p.id === id) ?? PRESETS[0];
