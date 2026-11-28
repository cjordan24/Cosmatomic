/**
 * Vision, hearing and the ECG (Phase 13, Gates 13.1–13.3). All formulas read on page images.
 *
 * Reduced eye — Helmholtz, Treatise on Physiological Optics vol. 1 (tr. Southall, OSA 1924), p. 355 (Gullstrand's
 * appendix): “A reduced eye corresponding to the exact schematic eye and having an index of refraction of 4/3 would
 * have a radius of curvature of 5.7 mm.” One refracting surface (air → n): anterior focal length f₁ = r/(n − 1),
 * posterior focal length f₂ = n·r/(n − 1), power (n − 1)/r; the nodal point is the centre of curvature, so a
 * distant object of angular size θ makes a retinal image of size (f₂ − r)·θ (lines of visual direction, p. 96).
 *
 * Diffraction blur — Helmholtz p. 196: “Let d denote the diameter of the aperture, r its distance from the image, and
 * l the wave-length of the light; then … the diameter of the central bright circle is δ = 2.440 lr/d”; with
 * l = 0.0005 mm and r = 20 mm, δ = 0.0244/d (mm) and 0.0122 mm for a 2 mm pupil. (2.440 = 2 × 1.22: Airy's disc,
 * as in the telescope module of Gate 10.6.)
 *
 * Intensity level — Fletcher & Munson (1933), BSTJ 12, p. 381, eq. (4): β = 10 log J + 100, “where J is its sound
 * intensity” in microwatts per square centimetre (eq. 3: J_r in microwatts per square centimetre); the reference
 * 10⁻¹⁶ W/cm² is 0 dB.
 *
 * Electrocardiogram — Einthoven (1912), Lancet, p. 854: lead I from the two hands, lead II from the right hand and
 * left foot, lead III from the left hand and left foot; “lead II − lead I = lead III”; p. 859, Fig. 26: an
 * equilateral triangle R, L, F with the heart at the centre and the direction of the potential difference at angle
 * α. Here a dipole of size M at angle α (measured, as in his figures, from the horizontal R→L line, positive towards
 * the feet) projects onto lead axes at 0°, 60° and 120°: lead = M·cos(α − θ). The relation II − I = III then holds
 * for every α (cos(α − 60°) − cos α = cos(α − 120°)). An educational dipole projection, not a heart model.
 */

export const GULLSTRAND_REDUCED = { n: 4 / 3, rMm: 5.7 };
export const reducedFocal = (n: number, rMm: number) => ({ f1: rMm / (n - 1), f2: (n * rMm) / (n - 1), powerD: ((n - 1) / rMm) * 1000 });
/** Retinal image size (mm) of an object of size h at distance D (same units), through the nodal point. */
export function retinalImageMm(h: number, D: number, eye = GULLSTRAND_REDUCED): number {
  const { f2 } = reducedFocal(eye.n, eye.rMm);
  return (f2 - eye.rMm) * (2 * Math.tan(Math.atan(h / (2 * D))));
}
/** Helmholtz p. 196: δ = 2.440 l r / d (all in mm). */
export const helmholtzBlurMm = (lMm: number, rMm: number, dMm: number) => (2.44 * lMm * rMm) / dMm;

/** Fletcher & Munson eq. (4): β (dB) from J in microwatts per square centimetre. */
export const intensityLevel = (JmicroWperCm2: number) => 10 * Math.log10(JmicroWperCm2) + 100;
/** Inverse: J (µW/cm²) for a level β. */
export const intensityFromLevel = (beta: number) => 10 ** ((beta - 100) / 10);
/** µW/cm² → W/m² (1 µW/cm² = 10⁻⁶ W / 10⁻⁴ m² = 10⁻² W/m²). */
export const microWcm2ToWm2 = (J: number) => J * 1e-2;

export const EINTHOVEN_AXES = { I: 0, II: 60, III: 120 } as const;
/** Lead voltages of a dipole M at angle α (degrees), Einthoven's equilateral triangle. */
export function einthovenLeads(M: number, alphaDeg: number) {
  const c = (th: number) => M * Math.cos(((alphaDeg - th) * Math.PI) / 180);
  return { I: c(EINTHOVEN_AXES.I), II: c(EINTHOVEN_AXES.II), III: c(EINTHOVEN_AXES.III) };
}
/** Angle α from leads I and III (inverse of the projection). */
export function einthovenAngle(I: number, III: number): number {
  // I = M cos α, III = M cos(α − 120°) ⇒ tan α = (2·III + I)/(√3·I)
  return (Math.atan2(2 * III + I, Math.sqrt(3) * I) * 180) / Math.PI;
}
