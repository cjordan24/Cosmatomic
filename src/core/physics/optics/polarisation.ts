/**
 * Voyager Physics Engine — polarisation and optical materials (Phase 10, Gate 10.3). Angles in radians.
 *
 * Drude, The Theory of Optics (tr. Mann & Millikan, 1902; page images checked):
 *   Pt II Sec. II ch. II §3, eq. 24, p. 282: reflected amplitudes R_s = −E_s sin(φ − χ)/sin(φ + χ),
 *     R_p = E_p tan(φ − χ)/tan(φ + χ); refracted D_s = E_s 2 sin χ cos φ / sin(φ + χ),
 *     D_p = E_p 2 sin χ cos φ / (sin(φ + χ) cos(φ − χ)); χ is the angle of refraction.
 *   eq. 25, p. 283: R_p vanishes when φ + χ = π/2, i.e. tan φ = n (Brewster).
 *   Pt II Sec. I ch. V §3, p. 246: “polarized light may be obtained by reflection at the surface of any transparent body
 *     if the angle of reflection φ fulfils the condition (Brewster's law) tan φ = n … The reflected light is polarized in the
 *     plane of incidence” (in today's words: its electric field is perpendicular to that plane, s-polarised); after a second
 *     reflection at the same angle “the final intensity … is proportional to cos² α”, α being the angle between the two
 *     planes of incidence (Nörrenberg polariscope).
 *   Pt II Sec. II ch. III §7, eq. 35, p. 323: in a uniaxial crystal V₁² = a² (ordinary wave) and V₂² = a² cos² g + c² sin² g
 *     (extraordinary wave), g being the angle between the wave normal and the optic axis; §11, eq. 74, p. 338: the principal
 *     indices are V : a and V : c.
 *   Pt II Sec. I ch. V §9, p. 255: a plate giving “difference of phase of π/2 (difference of path ¼λ)” is a quarter-wave plate.
 * Reflectance is the square of the amplitude ratio; for a lossless boundary the transmitted fraction of the energy is 1 − R.
 * Validity: non-absorbing isotropic media for the Fresnel formulas (no metals); plane waves on a flat boundary; uniaxial crystals
 *   only, ordinary and extraordinary wave-normal indices (no ray walk-off).
 */
import { refractAngle } from './geometric';

export interface Fresnel { rs: number; rp: number; Rs: number; Rp: number; R: number; chi: number }
/** Amplitude ratios and reflectances (Drude eq. 24) for light from index n1 onto n2 at incidence φ; null under total reflection. */
export function fresnel(n1: number, n2: number, phi: number): Fresnel | null {
  const chi = refractAngle(n1, n2, phi);
  if (chi === null) return null;
  let rs: number, rp: number;
  if (phi < 1e-9) {                     // normal-incidence limit of eq. 24: (φ − χ)/(φ + χ) → (n2 − n1)/(n2 + n1)
    const q = (n2 - n1) / (n2 + n1);
    rs = -q; rp = q;
  } else if (Math.abs(phi + chi - Math.PI / 2) < 1e-12) {
    rs = -Math.sin(phi - chi) / Math.sin(phi + chi); rp = 0;
  } else {
    rs = -Math.sin(phi - chi) / Math.sin(phi + chi);
    rp = Math.tan(phi - chi) / Math.tan(phi + chi);
  }
  return { rs, rp, Rs: rs * rs, Rp: rp * rp, R: (rs * rs + rp * rp) / 2, chi };
}
/** Polarizing (Brewster) angle tan φ = n with n the index of the second medium relative to the first (Drude p. 246, eq. 25). */
export const brewsterAngle = (n1: number, n2: number) => Math.atan(n2 / n1);

/** Nörrenberg arrangement: two reflections at the polarizing angle with planes of incidence at angle α; intensity relative to α = 0. */
export function twoReflections(n: number, alpha: number): number {
  const pb = brewsterAngle(1, n), f = fresnel(1, n, pb)!;
  // after the first reflection only the s component survives (amplitude rs); at the second surface it splits into
  // s′ = cos α (reflected with rs) and p′ = sin α (reflected with rp = 0)
  const a2 = f.rs * Math.cos(alpha) * f.rs, b2 = f.rs * Math.sin(alpha) * f.rp;
  const I = a2 * a2 + b2 * b2, I0 = (f.rs * f.rs) ** 2;
  return I / I0;
}

/** Extraordinary wave-normal index for angle g between wave normal and optic axis (Drude eqs. 35, 74): 1/n² = cos²g/n_o² + sin²g/n_e². */
export const extraordinaryIndex = (no: number, ne: number, g: number) => 1 / Math.sqrt((Math.cos(g) / no) ** 2 + (Math.sin(g) / ne) ** 2);
/** Thickness for a phase difference Δ between the waves along a direction normal to the axis: Δ = 2π t |n_e − n_o| / λ. */
export const plateThickness = (lambda: number, no: number, ne: number, phase: number) => (phase * lambda) / (2 * Math.PI * Math.abs(ne - no));
