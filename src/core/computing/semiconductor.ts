/**
 * Semiconductors and the p-n junction (Phase 15, Gate 15.2).
 *
 *  - Shockley (1949), BSTJ 28, p. 460, eq. (4.13) (page image): I₀ = (qD)(pₙ/L_p + b nₚ/Lₙ)(e^{q v₀/kT} − 1) per
 *    unit area; written compactly here as I = I_s(e^{qV/kT} − 1) with I_s collecting the prefactor.
 *  - Thermal voltage kT/q from CODATA constants.
 *  - The longest wavelength a band gap E_g can absorb: λ = hc/E_g (TU Delft OCW quotes 1.12 eV ↔ 1107 nm for Si).
 */
import { CONSTANTS } from '@/core/constants/constants';

const { kB, e, h, c } = { kB: CONSTANTS.kB.value, e: CONSTANTS.e.value, h: CONSTANTS.h.value, c: CONSTANTS.c.value };
/** kT/q in volts. */
export const thermalVoltage = (T: number) => (kB * T) / e;
/** Shockley's diode equation: current for bias V (volts), saturation current Is, temperature T (K). */
export const diodeCurrent = (V: number, Is: number, T = 300) => Is * (Math.exp(V / thermalVoltage(T)) - 1);
/** Bias needed for a forward current I. */
export const diodeVoltage = (I: number, Is: number, T = 300) => thermalVoltage(T) * Math.log(I / Is + 1);
/** Absorption edge λ = hc/E (nm) for a band gap in eV. */
export const cutoffWavelengthNm = (EgEV: number) => ((h * c) / (EgEV * e)) * 1e9;
