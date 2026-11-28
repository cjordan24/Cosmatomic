/**
 * Classical tests of general relativity (Phase 14, Gate 14.5), from Einstein (1916), Annalen der Physik 49, p. 822,
 * read on the page image:
 *   (74) B = 2α/Δ = κM/(4πΔ)  — the bending of a ray passing at distance Δ; α = κM/8π is the Schwarzschild-type
 *        length, which in modern constants is 2GM/c², so B = 4GM/(c²Δ) radians
 *   (75) ε = 24π³ a² / (T² c² (1 − e²))  — the advance of the perihelion per revolution (radians), a the semi-major
 *        axis, T the period in seconds, e the eccentricity
 * Gravity Probe B (Stanford/NASA, 2011) compared measured gyroscope drifts with predictions; those are data, not
 * computed here.
 */
import { CONSTANTS } from '@/core/constants/constants';

const { c, GMsun, au, julianYear } = { c: CONSTANTS.c.value, GMsun: CONSTANTS.GMsun.value, au: CONSTANTS.au.value, julianYear: CONSTANTS.julianYear.value };
export const RAD_ARCSEC = (180 / Math.PI) * 3600;

/** Eq. (75): perihelion advance per orbit (radians); a in metres, T in seconds. */
export const perihelionPerOrbit = (aM: number, Ts: number, e: number) => (24 * Math.PI ** 3 * aM * aM) / (Ts * Ts * c * c * (1 - e * e));
/** Advance in arcseconds per Julian century, from a (au), e, and the mean motion (degrees per Julian century). */
export function perihelionArcsecPerCentury(aAu: number, e: number, degPerCentury: number) {
  const orbitsPerCentury = degPerCentury / 360;
  const T = (100 * julianYear) / orbitsPerCentury;
  return perihelionPerOrbit(aAu * au, T, e) * orbitsPerCentury * RAD_ARCSEC;
}
/** Eq. (74) in modern constants: deflection (arcsec) of light grazing a mass GM (m³/s²) at distance Δ (m). */
export const lightDeflectionArcsec = (GM: number, deltaM: number) => ((4 * GM) / (c * c * deltaM)) * RAD_ARCSEC;
export const SUN_GM = GMsun;
