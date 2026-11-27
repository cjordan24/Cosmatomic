/**
 * Voyager Physics Engine — acoustics (Phase 9, Gate 9.5). SI units.
 *
 * OpenStax University Physics Vol. 1, ch. 17:
 *   I = P/A (17.8); spherical spreading I = P/(4πr²), I₂ = I₁(r₁/r₂)² (17.9); I = (Δp_max)²/(2ρv) (17.11);
 *   β = 10 log₁₀(I/I₀) dB with I₀ = 10⁻¹² W/m² (17.12); Doppler f_o = f_s (v ± v_o)/(v ∓ v_s) (17.20);
 *   Mach number M = v_s/v (17.21) and shock-cone half-angle sin θ = 1/M (17.22).
 * OpenStax College Physics 2e §17.7: acoustic impedance Z = ρv (17.38); intensity reflection coefficient at a
 *   boundary a = (Z₂ − Z₁)²/(Z₁ + Z₂)² (17.39), so the transmitted fraction is 1 − a; Table 17.5 media.
 * Media: NIST WebBook fluids at 1 atm (ρ and v at T), the ideal-gas air model of the wave engine (ρ = pM/RT with
 *   p = 101.325 kPa), and the rounded Table 17.5 values (air, water, soft tissue, bone, barium titanate).
 * Validity: linear acoustics; plane waves at normal incidence on a flat boundary; point sources radiating equally in all
 *   directions without absorption; incoherent sources add intensities (no interference).
 */
import { MATERIALS, interpT } from '@/modes/atomic/materials/materials';
import { AIR_MOLAR_MASS, R_GAS, getMedium } from './media';

export const I0 = 1e-12;                         // W/m², reference intensity (17.12)
export const ATM = 101_325;                      // Pa, standard atmosphere (definition)

export const intensityAt = (P: number, r: number) => P / (4 * Math.PI * r * r);
export const levelDb = (I: number) => 10 * Math.log10(I / I0);
export const intensityFromLevel = (beta: number) => I0 * 10 ** (beta / 10);
/** Pressure amplitude from intensity, I = Δp²/(2ρv) (17.11). */
export const pressureAmplitude = (I: number, rho: number, v: number) => Math.sqrt(2 * rho * v * I);
/** Incoherent sources: intensities add, so levels add as 10 log₁₀ Σ 10^{β/10}. */
export const sumLevels = (levels: number[]) => levelDb(levels.reduce((s, b) => s + intensityFromLevel(b), 0));

export const impedance = (rho: number, v: number) => rho * v;
export const reflectedFraction = (Z1: number, Z2: number) => ((Z2 - Z1) / (Z1 + Z2)) ** 2;

/** Doppler shift (17.20): speeds positive when source and observer move towards each other. Null at or above v_s = v. */
export function dopplerShift(fs: number, v: number, vs: number, vo: number): number | null {
  if (vs >= v) return null;
  return (fs * (v + vo)) / (v - vs);
}
export const machNumber = (vs: number, v: number) => vs / v;
/** Half-angle of the shock cone (rad), defined only for M > 1 (17.22). */
export const coneAngle = (M: number) => (M > 1 ? Math.asin(1 / M) : null);

// ---------------------------------------------------------------- media for the acoustic lab
export interface AcousticMedium { id: string; name: string; rho: number | null; v: number | null; Z: number | null; source: string; note: string; provenance: 'observed' | 'derived' }
/** Table 17.5 of OpenStax College Physics 2e (density kg/m³, speed m/s, impedance kg/(m²·s)), rounded textbook values. */
export const TABLE_17_5: { id: string; name: string; rho: number | [number, number]; v: number; Z: number | [number, number] }[] = [
  { id: 't175-air', name: 'Air', rho: 1.3, v: 330, Z: 429 },
  { id: 't175-water', name: 'Water', rho: 1000, v: 1500, Z: 1.5e6 },
  { id: 't175-blood', name: 'Blood', rho: 1060, v: 1570, Z: 1.66e6 },
  { id: 't175-fat', name: 'Fat', rho: 925, v: 1450, Z: 1.34e6 },
  { id: 't175-muscle', name: 'Muscle (average)', rho: 1075, v: 1590, Z: 1.70e6 },
  { id: 't175-bone', name: 'Bone (varies)', rho: [1400, 1900], v: 4080, Z: [5.7e6, 7.8e6] },
  { id: 't175-bat', name: 'Barium titanate (transducer material)', rho: 5600, v: 5500, Z: 30.8e6 },
];
const FLUIDS = ['water', 'nitrogen', 'oxygen', 'argon', 'carbon-dioxide', 'helium'];

export function acousticMedia(T: number): AcousticMedium[] {
  const out: AcousticMedium[] = [];
  const air = getMedium('air').speed({ temperatureK: T, tensionN: 0, linearDensity: 0 });
  const rhoAir = (ATM * AIR_MOLAR_MASS) / (R_GAS * T);
  out.push({ id: 'air-ideal', name: `Dry air, ideal gas (${T} K)`, rho: rhoAir, v: air, Z: air ? rhoAir * air : null, source: 'openstax-university-physics-1', note: 'ρ = pM/RT and c = √(γRT/M), M from the NSSDC composition (wave engine)', provenance: 'derived' });
  for (const id of FLUIDS) {
    const m = MATERIALS.find((x) => x.id === id);
    if (!m?.fluid) continue;
    const rho = interpT(m.fluid.rows, T, 'density'), v = interpT(m.fluid.rows, T, 'soundSpeed');
    out.push({ id, name: `${m.name} (${T} K, 1 atm)`, rho, v, Z: rho !== null && v !== null ? rho * v : null, source: 'nist-webbook-fluids', note: rho === null ? `outside the tabulated ${m.fluid.rows[0].T}–${m.fluid.rows[m.fluid.rows.length - 1].T} K` : 'NIST reference equation of state, interpolated', provenance: 'derived' });
  }
  for (const r of TABLE_17_5) {
    const mid = (x: number | [number, number]) => (Array.isArray(x) ? (x[0] + x[1]) / 2 : x);
    out.push({ id: r.id, name: `${r.name} (Table 17.5)`, rho: mid(r.rho), v: r.v, Z: mid(r.Z), source: 'openstax-college-physics-2e', note: Array.isArray(r.Z) ? `the table gives a range ${r.Z[0].toExponential(1)}–${r.Z[1].toExponential(1)} kg/(m²·s); the middle is used` : 'value as printed (rounded)', provenance: 'observed' });
  }
  return out;
}
