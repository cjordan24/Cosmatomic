/**
 * Voyager Physics Engine — telescopes and cameras (Phase 10, Gate 10.6). SI units; angles in radians.
 *
 * Airy (1835), “On the Diffraction of an Object-glass with Circular Aperture”, Trans. Camb. Phil. Soc. 5, 283
 *   (page images checked by the research pass): the amplitude in the focal plane is proportional to
 *   ∫√(1 − w²) cos nw dw (w from −1 to 1), with n = (2π/λ)(ba/f) — a the radius of the aperture, b/f the angle from the
 *   axis (p. 286); Airy's table gives the central spot at half light for n = 1·616, the first black ring at n = 3·832,
 *   the first bright ring at n = 5·12 with “about 1/57” of the central intensity, and a black ring at n = 7·14 (p. 287).
 * Rayleigh, Scientific Papers vol. 1 (1899): Art. 62 §1 (p. 416) “The angular radius θ of the central disk is given by
 *   θ = 1·2197 λ/2R … 2R the (diameter of the) aperture”; §2 (p. 420), for a double line imaged through a rectangular
 *   aperture with the central line of one image on the first zero of the other, “the brightness … midway between the two
 *   central points … is ·8106 of the brightness at the central points themselves. We may consider this to be about the
 *   limit of closeness at which there could be any decided appearance of resolution”; Art. 67 (p. 490): for equal
 *   resolving power “the circular aperture must be about a tenth part wider than the slit”.
 * Instrument parameters: STScI, HST Primer (Cycle 34) — aperture 2.4 m, f/24, plate scale 3.58″/mm, PSF FWHM 0.043″ at
 *   5000 Å; JWST JDox — effective focal ratio f/20, effective focal length 131.4 m, ~6.5 m primary, 25.4 m² unobscured
 *   area, gold coating from 0.6 to just beyond 28 µm.
 * Derived here: focal length F = N·D for focal ratio N; plate scale 1/F (rad per unit length) in ″/mm; the first dark ring
 *   of Airy's pattern at sin θ = 3.832 λ/(2πa) = 1.2197 λ/D; its radius in the focal plane 1.2197 λN.
 * Validity: an unobstructed circular aperture of uniform transmission, perfect optics, monochromatic light, far field;
 *   real telescopes have central obstructions, spider vanes and aberrations (the JWST and Hubble PSFs are not Airy patterns).
 */
const ARCSEC = Math.PI / (180 * 3600);

/** Airy's integral (normalised to 1 at n = 0): φ(n) = (4/π)∫₀¹ √(1 − w²) cos nw dw, by Simpson's rule on w = sin t. */
export function airyAmplitude(n: number, steps = 400): number {
  if (Math.abs(n) < 1e-12) return 1;
  // substitute w = sin t: √(1 − w²) dw = cos² t dt, t ∈ [0, π/2]
  const h = Math.PI / 2 / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i * h, f = Math.cos(t) ** 2 * Math.cos(n * Math.sin(t));
    s += f * (i === 0 || i === steps ? 1 : i % 2 ? 4 : 2);
  }
  return (4 / Math.PI) * (s * h) / 3;
}
/** Intensity relative to the centre, the square of the amplitude (Airy p. 287). */
export const airyIntensity = (n: number) => airyAmplitude(n) ** 2;
/** Airy's parameter n = (2π/λ) a sin θ for aperture radius a. */
export const airyN = (lambda: number, radius: number, theta: number) => ((2 * Math.PI) / lambda) * radius * Math.sin(theta);

/** Bisection for a zero or extremum of a function on [a, b]. */
function bisect(f: (x: number) => number, a: number, b: number): number {
  let fa = f(a);
  for (let i = 0; i < 80; i++) { const m = (a + b) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m; }
  return (a + b) / 2;
}
/** The k-th dark ring of the computed pattern (k = 1, 2): zeros of the amplitude. */
export const airyZero = (k: 1 | 2) => (k === 1 ? bisect(airyAmplitude, 3, 4.5) : bisect(airyAmplitude, 6.5, 7.5));
/** n where the intensity falls to one half. */
export const airyHalfLight = () => bisect((n) => airyIntensity(n) - 0.5, 1, 2.2);
/** First bright ring: the maximum of the intensity between the first two zeros (golden-section search). */
export function airyFirstRing(): { n: number; intensity: number } {
  let a = airyZero(1), b = airyZero(2);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 100; i++) { const c = b - g * (b - a), d = a + g * (b - a); if (airyIntensity(c) > airyIntensity(d)) b = d; else a = c; }
  const n = (a + b) / 2;
  return { n, intensity: airyIntensity(n) };
}

/** Angular radius of the first dark ring, θ = 1·2197 λ/D (Rayleigh, from Airy's 3·832). */
export const airyAngle = (lambda: number, D: number) => Math.asin((airyZero(1) * lambda) / (Math.PI * D));
/** Image of two equal incoherent point sources an angle Δθ apart: summed intensities along the line joining them, at angle x from the midpoint. */
export const doubleStar = (lambda: number, D: number, dTheta: number, x: number) =>
  airyIntensity(airyN(lambda, D / 2, x - dTheta / 2)) + airyIntensity(airyN(lambda, D / 2, x + dTheta / 2));
/** Rayleigh's slit case: two (sin u/u)² images with the centre of one on the first zero of the other; midpoint brightness relative to a peak. */
export function slitPairMidpoint(): number {
  const s = (u: number) => (Math.abs(u) < 1e-12 ? 1 : (Math.sin(u) / u) ** 2);
  const peak = s(0) + s(Math.PI);
  return (2 * s(Math.PI / 2)) / peak;
}

/** Focal length F = N D. */
export const focalLength = (fNumber: number, D: number) => fNumber * D;
/** Plate scale in arcseconds per millimetre: 1/F radians per unit length. */
export const plateScaleArcsecPerMm = (F: number) => 1e-3 / F / ARCSEC;
/** Radius of the first dark ring in the focal plane, 1.2197 λ N (small angles). */
export const airyRadiusFocal = (lambda: number, fNumber: number) => (airyZero(1) / Math.PI) * lambda * fNumber;
export const toArcsec = (rad: number) => rad / ARCSEC;

/** Tabulated Airy intensity for drawing (n from 0 to 40 in steps of 0.01, linear interpolation); exact values: airyIntensity. */
let TABLE: Float64Array | null = null;
export function airyIntensityFast(n: number): number {
  if (!TABLE) { TABLE = new Float64Array(4001); for (let i = 0; i <= 4000; i++) TABLE[i] = airyIntensity(i / 100); }
  const x = Math.abs(n) * 100;
  if (x >= 4000) return 0;
  const i = Math.floor(x), f = x - i;
  return TABLE[i] * (1 - f) + TABLE[i + 1] * f;
}
