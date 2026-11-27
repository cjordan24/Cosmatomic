/**
 * Voyager Physics Engine — acoustics (Phase 9, Gate 9.5). SI units.
 *
 * Sources (they replaced OpenStax University Physics Vol. 1 and College Physics 2e on 2026-11-27):
 *   Spreading: a point disturbance “spreads itself symmetrically in all directions … with amplitude varying inversely as the
 *     distance” (Rayleigh, Theory of Sound Vol. II §276) and intensity goes as the square of the amplitude (§245), so
 *     I = P/(4πr²); Homick (NASA RP-1045, 1979, p. 114) calls this the inverse square law of intensity.
 *   Level: β = 10 log₁₀(I/I₀) dB with I₀ = 1 pW/m² = 10⁻¹² W/m² (NIOSH 98-126, glossary).
 *   Pressure amplitude: Rayleigh §245 eq. (10) gives the energy flux ½ρ₀a³s² for a condensation amplitude s, and the
 *     excess pressure is δp = a²ρ₀s (§244), so I = Δp²/(2ρv) (derived from his equations).
 *   Boundary: at normal incidence the reflected amplitude ratio is (ρ₁/ρ − V/V₁) : (ρ₁/ρ + V/V₁) (Rayleigh §270 eq. 23); with
 *     Z = ρV this is (Z₂ − Z₁)/(Z₂ + Z₁), and intensity goes as the square, so a = (Z₂ − Z₁)²/(Z₁ + Z₂)²; no reflection when
 *     ρ₁V₁ = ρV. (Rayleigh does not use the word impedance.)
 *   Doppler: moving source f = f_s a/(a ∓ u) (NASA Glenn, Doppler Effect); moving observer, ratio (a ± v) : a (Rayleigh §298);
 *     combined here as f_o = f_s (v + v_o)/(v − v_s). Mach number M = v/a and Mach angle sin μ = 1/M (NASA Glenn, Mach Angle).
 * Media: NIST WebBook fluids at 1 atm (ρ and v at T) and the ideal-gas air model of the wave engine (ρ = pM/RT with
 *   p = 101.325 kPa). Tissue and transducer values were removed with the OpenStax table: no open source for them was found.
 * Validity: linear acoustics; plane waves at normal incidence on a flat boundary; point sources radiating equally in all
 *   directions without absorption; incoherent sources add intensities (no interference).
 */
import { MATERIALS, interpT } from '@/modes/atomic/materials/materials';
import { AIR_MOLAR_MASS, R_GAS, getMedium } from './media';

export const I0 = 1e-12;                         // W/m², reference intensity (NIOSH 98-126: 1 pW/m²)
export const ATM = 101_325;                      // Pa, standard atmosphere (definition)

export const intensityAt = (P: number, r: number) => P / (4 * Math.PI * r * r);
export const levelDb = (I: number) => 10 * Math.log10(I / I0);
export const intensityFromLevel = (beta: number) => I0 * 10 ** (beta / 10);
/** Pressure amplitude from intensity, I = Δp²/(2ρv) (from Rayleigh §§244–245). */
export const pressureAmplitude = (I: number, rho: number, v: number) => Math.sqrt(2 * rho * v * I);
/** Incoherent sources: intensities add, so levels add as 10 log₁₀ Σ 10^{β/10}. */
export const sumLevels = (levels: number[]) => levelDb(levels.reduce((s, b) => s + intensityFromLevel(b), 0));

export const impedance = (rho: number, v: number) => rho * v;
export const reflectedFraction = (Z1: number, Z2: number) => ((Z2 - Z1) / (Z1 + Z2)) ** 2;

/** Doppler shift (NASA Glenn for the source, Rayleigh §298 for the observer): speeds positive when source and observer move towards each other. Null at or above v_s = v. */
export function dopplerShift(fs: number, v: number, vs: number, vo: number): number | null {
  if (vs >= v) return null;
  return (fs * (v + vo)) / (v - vs);
}
export const machNumber = (vs: number, v: number) => vs / v;
/** Half-angle of the shock cone (rad), sin μ = 1/M, defined only for M > 1 (NASA Glenn, Mach Angle). */
export const coneAngle = (M: number) => (M > 1 ? Math.asin(1 / M) : null);

// ---------------------------------------------------------------- media for the acoustic lab
export interface AcousticMedium { id: string; name: string; rho: number | null; v: number | null; Z: number | null; source: string; note: string; provenance: 'observed' | 'derived' }
const FLUIDS = ['water', 'nitrogen', 'oxygen', 'argon', 'carbon-dioxide', 'helium'];

export function acousticMedia(T: number): AcousticMedium[] {
  const out: AcousticMedium[] = [];
  const air = getMedium('air').speed({ temperatureK: T, tensionN: 0, linearDensity: 0 });
  const rhoAir = (ATM * AIR_MOLAR_MASS) / (R_GAS * T);
  out.push({ id: 'air-ideal', name: `Dry air, ideal gas (${T} K)`, rho: rhoAir, v: air, Z: air ? rhoAir * air : null, source: 'nasa-glenn-bga', note: 'ρ = pM/RT and c = √(γRT/M), M from the NSSDC composition (wave engine)', provenance: 'derived' });
  for (const id of FLUIDS) {
    const m = MATERIALS.find((x) => x.id === id);
    if (!m?.fluid) continue;
    const rho = interpT(m.fluid.rows, T, 'density'), v = interpT(m.fluid.rows, T, 'soundSpeed');
    out.push({ id, name: `${m.name} (${T} K, 1 atm)`, rho, v, Z: rho !== null && v !== null ? rho * v : null, source: 'nist-webbook-fluids', note: rho === null ? `outside the tabulated ${m.fluid.rows[0].T}–${m.fluid.rows[m.fluid.rows.length - 1].T} K` : 'NIST reference equation of state, interpolated', provenance: 'derived' });
  }
  return out;
}
