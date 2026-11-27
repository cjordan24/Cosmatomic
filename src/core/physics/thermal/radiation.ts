/**
 * Voyager Physics Engine — thermal radiation and radiative energy transfer (Phase 10, Gate 10.5). SI units.
 *
 * Planck, The Theory of Heat Radiation (tr. M. Masius, 1914; page images checked by the research pass):
 *   Pt I ch. II §44, eq. 48, p. 40 (Kirchhoff's law): “the ratio of the emissive power to the absorbing power of any body
 *     is independent of the nature of the body”; §45: a black body absorbs all incident radiation (A = 1).
 *   Pt II ch. II §63, eqs. 75–76, p. 63 (Stefan–Boltzmann): u = aT⁴, K = (ac/4π)T⁴ — “proportional to the fourth power of
 *     the absolute temperature”. The flux leaving a black surface is πK = σT⁴ (σ = ac/4, CODATA value).
 *   Pt II ch. III §89, eqs. 109–110, p. 86 (Wien): λ_m T = b; “With increasing temperature the maximum of radiation is
 *     therefore displaced in the direction of the shorter wave lengths”; Lummer and Pringsheim's b = 0.294 cm·degree.
 *   Pt IV ch. IV §156, eq. 276, p. 168 (Planck's law): E_λ = (c²h/λ⁵)/(e^{ch/kλT} − 1) for one plane-polarised ray; the
 *     unpolarised spectral radiance is twice this, B_λ = 2hc²/λ⁵/(e^{hc/λkT} − 1) (em.ts, CODATA constants).
 * NASA Earth Observatory, “Climate and Earth's Energy Budget”: sunlight averaged over the whole planet is “one-fourth of
 *   the total solar irradiance, or approximately 340 watts per square meter”; about 29 % is reflected and about 240 W/m²
 *   absorbed. With Stefan–Boltzmann this gives the radiative equilibrium temperature T = [S(1 − A)/(4εσ)]^¼ (derived).
 * Validity: grey bodies (emissivity independent of wavelength); radiative balance of a rapidly rotating body with no
 *   internal heat source and no atmosphere (no greenhouse effect).
 */
import { SIGMA_SB, WIEN_B, planckLambda } from '@/core/physics/em/em';

export { SIGMA_SB, WIEN_B, planckLambda };
/** Planck's 1914 value of the Wien constant (Lummer & Pringsheim), in m·K. */
export const WIEN_B_1914 = 0.294e-2;

/** Black-body flux σT⁴ (W/m²). */
export const blackFlux = (T: number) => SIGMA_SB * T ** 4;
/** Grey body: by Kirchhoff's law it emits its absorbing power ε times the black-body flux. */
export const greyFlux = (emissivity: number, T: number) => emissivity * blackFlux(T);
/** Net loss of a grey surface at T facing black surroundings at T₀: it emits εσT⁴ and absorbs ε of σT₀⁴. */
export const netExchange = (emissivity: number, T: number, T0: number) => emissivity * SIGMA_SB * (T ** 4 - T0 ** 4);
/** Peak wavelength λ_m = b/T. */
export const peakWavelength = (T: number) => WIEN_B / T;

/** Numerical check of Stefan–Boltzmann: π∫B_λ dλ (Simpson on a log grid from 0.01 b/T to 1000 b/T). */
export function integratedFlux(T: number, n = 4000): number {
  const a = Math.log(0.01 * WIEN_B / T), b = Math.log(1000 * WIEN_B / T), h = (b - a) / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h, lam = Math.exp(x), f = planckLambda(lam, T) * lam;   // dλ = λ dx
    s += f * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
  }
  return (Math.PI * s * h) / 3;
}

/** Radiative equilibrium temperature of a body with Bond albedo A in irradiance S: absorbed S(1 − A)πR² = emitted 4πR²εσT⁴. */
export const equilibriumTemperature = (S: number, albedo: number, emissivity = 1) => ((S * (1 - albedo)) / (4 * emissivity * SIGMA_SB)) ** 0.25;
/** Planet-averaged incoming sunlight S/4 (“one-fourth of the total solar irradiance”). */
export const meanInsolation = (S: number) => S / 4;
