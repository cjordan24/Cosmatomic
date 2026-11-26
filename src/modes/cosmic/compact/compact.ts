/**
 * Compact objects (Phase 6, Gate 6.2): white dwarfs, neutron stars and black holes with published
 * masses (and radii where measured), plus quantities derived from them with the Gate 6.1
 * Schwarzschild module. Values come from datasets/astronomical/compact-objects.json, which is written
 * by scripts/ingestion/curated-compact-objects.ts from the cited papers (transcribed by hand).
 */
import data from '@datasets/astronomical/compact-objects.json';
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import { compactness, criticalImpactParameter, iscoRadius, photonSphereRadius, redshiftToInfinity, schwarzschildRadius } from '@/core/physics/relativity';

export type CompactKind = 'white-dwarf' | 'neutron-star' | 'black-hole';
/** A published value with its asymmetric uncertainty: [value, minus, plus] (minus, plus ≥ 0). */
export type Val = [number, number, number];
/** The paper's interval type: 1σ, or a 68 % / 90 % credible interval. */
export type Interval = '1σ' | '68%' | '90%';

export interface Measurement { quantity: string; value: Val | null; unit: string; interval: Interval | null; method: string; source: string; note?: string }

export interface CompactObject {
  id: string;
  name: string;
  kind: CompactKind;
  /** mass in M☉ */
  mass: Val; massInterval: Interval; massMethod: string; massSource: string;
  /** radius as published (unit in radiusUnit) */
  radius: Val | null; radiusUnit: 'R☉' | 'km' | null; radiusInterval: Interval | null; radiusMethod: string | null; radiusSource: string | null;
  /** distance in pc, when used for an angular comparison */
  distance: Val | null; distanceUnit: 'pc' | null; distanceSource: string | null;
  /** mass to predict the shadow with, chosen to be independent of the ring measurement */
  shadowMass: Val | null; shadowMassMethod: string | null;
  measurements: Measurement[];
  /** 10 pc catalogue sequence number (white dwarfs in the nearby-star sample) */
  starSeq: number | null;
  /** physics beyond Schwarzschild that matters for this object (spin, rotation, …) */
  caveats: string[];
  sources: string[];
}

export const COMPACT_OBJECTS = (data as unknown as { objects: CompactObject[] }).objects;
export const compactById = (id: string) => COMPACT_OBJECTS.find((o) => o.id === id);

const GM = (mSun: number) => mSun * CONSTANTS.GMsun.value;
const UAS = (Math.PI / 180 / 3600) * 1e-6;

/** f evaluated at the value and at both ends of the interval (f monotone). */
function spread(f: (x: number) => number, v: Val): Val {
  const a = f(v[0]), lo = f(v[0] - v[1]), hi = f(v[0] + v[2]);
  return [a, Math.abs(a - Math.min(lo, hi)), Math.abs(Math.max(lo, hi) - a)];
}

/** Radius in km: published solar radii are converted with the IAU 2015 nominal R☉. */
export function radiusKm(o: CompactObject): Val | null {
  if (!o.radius) return null;
  const f = o.radiusUnit === 'R☉' ? CONSTANTS.Rsun.value / 1e3 : 1;
  return [o.radius[0] * f, o.radius[1] * f, o.radius[2] * f];
}

/** Angular diameter (µas) of the shadow of a non-rotating hole of mass mSun at distance dPc: 2√27 GM/(c²D) (EHT 2019 Paper I: R_c = √27 GM/c²). */
export const shadowDiameterUas = (mSun: number, dPc: number) => (2 * criticalImpactParameter(GM(mSun))) / (dPc * PARSEC_M) / UAS;

export interface Derived {
  rs: Val; // km
  photonSphere: number; // km
  isco: number; // km
  /** r_s / R at the surface (null for black holes or unknown R) */
  compactness: number | null;
  /** gravitational redshift of surface light seen far away, as cz in km/s (null without R or for black holes) */
  surfaceRedshiftKms: number | null;
  /** predicted angular diameter of the shadow of a non-rotating hole, 2·3√3 GM/(c²D), in µas */
  shadowUas: Val | null;
}

/** Quantities derived from the published mass (and radius, distance) with the Schwarzschild module. */
export function derive(o: CompactObject): Derived {
  const m = o.mass[0];
  const rs = spread((x) => schwarzschildRadius(GM(x)) / 1e3, o.mass);
  const R = radiusKm(o)?.[0] ?? null;
  const Rm = R === null ? null : R * 1e3;
  const z = Rm !== null && o.kind !== 'black-hole' ? redshiftToInfinity(GM(m), Rm) : null;
  let shadowUas: Val | null = null;
  if (o.kind === 'black-hole' && o.distance && o.shadowMass) {
    const sm = o.shadowMass;
    const a = shadowDiameterUas(sm[0], o.distance[0]);
    // first-order propagation of independent mass and distance errors (θ ∝ M/D)
    const relLo = Math.hypot(sm[1] / sm[0], o.distance[2] / o.distance[0]);
    const relHi = Math.hypot(sm[2] / sm[0], o.distance[1] / o.distance[0]);
    shadowUas = [a, a * relLo, a * relHi];
  }
  return {
    rs,
    photonSphere: photonSphereRadius(GM(m)) / 1e3,
    isco: iscoRadius(GM(m)) / 1e3,
    compactness: Rm !== null && o.kind !== 'black-hole' ? compactness(GM(m), Rm) : null,
    surfaceRedshiftKms: z === null ? null : (z * CONSTANTS.c.value) / 1e3,
    shadowUas,
  };
}

export const KIND_LABEL: Record<CompactKind, string> = { 'white-dwarf': 'White dwarf', 'neutron-star': 'Neutron star', 'black-hole': 'Black hole' };
