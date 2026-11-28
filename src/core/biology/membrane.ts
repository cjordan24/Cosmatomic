/**
 * Membrane potential (Phase 11, Gate 11.5).
 *
 * Hodgkin & Katz (1949), J. Physiol. 108, p. 66, equation (4):
 *   E = (RT/F) logₑ [ (P_K (K)ᵢ + P_Na (Na)ᵢ + P_Cl (Cl)ₒ) / (P_K (K)ₒ + P_Na (Na)ₒ + P_Cl (Cl)ᵢ) ]
 * where “E is the potential difference across the membrane (outside − inside) in the absence of any net ionic
 * current”. The modern membrane potential V_m (inside − outside) is −E. Brackets are activities; the paper's own
 * calculation (Table 7) uses concentrations, and so does this module. Chloride is negative, so its inside and
 * outside concentrations change places.
 * Limit: “it reduces to the thermodynamically correct forms when any one permeability constant is made large
 * compared to the others” — the single-ion (Nernst) potential E_ion = (RT/zF) ln(c_i/c_o) in the paper's sign
 * (outside − inside), i.e. V_ion = (RT/zF) ln(c_o/c_i) inside − outside.
 * Validity (the paper): “equation 4 cannot be regarded as more than a rough approximation”; constant-field
 * assumptions; no pumps, no other ions, no currents.
 * R = N_A k_B and F = N_A e (exact SI values).
 */
import { CONSTANTS } from '@/core/constants/constants';

export const R_GAS = CONSTANTS.NA.value * CONSTANTS.kB.value;
export const FARADAY = CONSTANTS.NA.value * CONSTANTS.e.value;
export const celsiusToKelvin = (c: number) => c + 273.15;
/** RT/F in volts. */
export const thermalVoltage = (T: number) => (R_GAS * T) / FARADAY;

export interface Ions { K: number; Na: number; Cl: number }

/** Hodgkin–Katz eq. (4): E (outside − inside), volts. */
export function hodgkinKatzE(P: Ions, inside: Ions, outside: Ions, T: number): number {
  const num = P.K * inside.K + P.Na * inside.Na + P.Cl * outside.Cl;
  const den = P.K * outside.K + P.Na * outside.Na + P.Cl * inside.Cl;
  return thermalVoltage(T) * Math.log(num / den);
}
/** Modern membrane potential, inside − outside (volts). */
export const membranePotential = (P: Ions, inside: Ions, outside: Ions, T: number) => -hodgkinKatzE(P, inside, outside, T);

/** Single-ion equilibrium potential, inside − outside (volts): V = (RT/zF) ln(c_o/c_i). */
export const nernst = (z: number, cIn: number, cOut: number, T: number) => (thermalVoltage(T) / z) * Math.log(cOut / cIn);
