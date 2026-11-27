/**
 * Voyager Physics Engine — wave optics (Phase 10, Gate 10.2). SI units; angles in radians.
 *
 * Drude, The Theory of Optics (tr. Mann & Millikan, 1902), Pt II Sec. I (page images checked by the research pass):
 *   ch. II §3 (Fresnel's mirrors), eqs. 11–13, pp. 131–132: two coherent sources of amplitudes A₁, A₂ give
 *     J = A₁² + A₂² + 2A₁A₂ cos 2π(r₁ − r₂)/λ; on a screen at distance a from sources d apart the fringe spacing is aλ : d.
 *   ch. II §5 (Newton's rings and the colours of thin plates), eqs. 14–17, pp. 138–139: a plate of thickness d gives the
 *     two reflected beams the phase difference Δ = 2π(2d/λ′) cos χ + Δ′ with λ : λ′ = n and Δ′ = ±π; the reflected light
 *     is weakest when (2d/λ′) cos χ = 0, 1, 2, ….
 *   ch. III §1, p. 159: Huygens' principle — “every point P which is reached by a light-wave may be conceived as the source
 *     of elementary light-waves”.
 *   ch. IV §11, eq. 78, p. 217: slit of width a, J = J′[sin(μa/2)/(μa/2)]², μ = (2π/λ) sin φ.
 *   ch. IV §15, eqs. 85–86, pp. 222–223: grating of m slits of width a and spacing d,
 *     J = J₁′[sin²(μa/2)/(μa/2)²][sin²(mμd/2)/sin²(μd/2)]; principal maxima at sin φ = hλ/d (normal incidence).
 *   ch. IV §18, eq. 88, p. 228: two lines are resolved when dλ/λ > 1/(hm) (order h, m lines).
 * Validity: scalar Fraunhofer diffraction (far field) at normal incidence; the thin film uses two beams of equal amplitude,
 *   so it places the bright and dark wavelengths correctly but not the absolute reflectance (Fresnel amplitudes: Gate 10.3).
 */
const TAU = 2 * Math.PI;

/** Two coherent sources (Drude eq. 11). */
export const twoSourceIntensity = (A1: number, A2: number, pathDiff: number, lambda: number) =>
  A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos((TAU * pathDiff) / lambda);
/** Exact path difference r₁ − r₂ at screen position p for two sources ±d/2 from the axis at distance a. */
export const pathDifference = (p: number, d: number, a: number) => Math.hypot(a, p - d / 2) - Math.hypot(a, p + d / 2);
/** Fringe spacing aλ/d (Drude eq. 13). */
export const fringeSpacing = (a: number, lambda: number, d: number) => (a * lambda) / d;

/** sin x / x with its limit 1 at x = 0. */
export const sinc = (x: number) => (Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x);
/** Single slit (Drude eq. 78), normalised to 1 straight ahead. */
export function slitIntensity(a: number, lambda: number, phi: number): number {
  const mu = (TAU / lambda) * Math.sin(phi);
  return sinc((mu * a) / 2) ** 2;
}
/** First dark direction of a slit, μa/2 = π ⇒ sin φ = λ/a (null when λ ≥ a: no zero). */
export const slitFirstZero = (a: number, lambda: number): number | null => (lambda < a ? Math.asin(lambda / a) : null);

/** Grating of m slits (Drude eq. 85), normalised to 1 at φ = 0. */
export function gratingIntensity(m: number, d: number, a: number, lambda: number, phi: number): number {
  const mu = (TAU / lambda) * Math.sin(phi);
  const den = Math.sin((mu * d) / 2);
  const array = Math.abs(den) < 1e-12 ? m * m : (Math.sin((m * mu * d) / 2) / den) ** 2;
  return (sinc((mu * a) / 2) ** 2 * array) / (m * m);
}
/** Direction of the order-h principal maximum, sin φ = hλ/d (Drude eq. 86); null if |hλ/d| > 1. */
export const orderAngle = (h: number, lambda: number, d: number): number | null => (Math.abs((h * lambda) / d) <= 1 ? Math.asin((h * lambda) / d) : null);
/** Resolving power hm (Drude eq. 88): two lines λ and λ + Δλ are resolved when Δλ/λ > 1/(hm). */
export const resolvingPower = (h: number, m: number) => h * m;
export const resolves = (lambda: number, dLambda: number, h: number, m: number) => Math.abs(dLambda) / lambda > 1 / (h * m);
/** Smallest number of lines that resolves a doublet in order h. */
export const linesToResolve = (lambda: number, dLambda: number, h: number) => Math.floor(lambda / (h * Math.abs(dLambda))) + 1;

/** Angle inside a film of index n for incidence φ from air (law of refraction). */
export const filmAngle = (n: number, phi: number) => Math.asin(Math.sin(phi) / n);
/** Phase difference of the two reflected beams of a film of thickness t (Drude eqs. 14–16 with Δ′ = π). */
export const filmPhase = (t: number, n: number, lambda: number, phi: number) => TAU * ((2 * t * n) / lambda) * Math.cos(filmAngle(n, phi)) + Math.PI;
/** Reflected intensity of two equal beams relative to its maximum, (1 + cos Δ)/2. */
export const filmReflectance = (t: number, n: number, lambda: number, phi: number) => (1 + Math.cos(filmPhase(t, n, lambda, phi))) / 2;
/** Wavelengths of the reflection minima in [lo, hi]: 2tn cos χ/λ = k (Drude eq. 17), k = 1, 2, …. */
export function filmMinima(t: number, n: number, phi: number, lo: number, hi: number): { k: number; lambda: number }[] {
  const opt = 2 * t * n * Math.cos(filmAngle(n, phi));
  const out: { k: number; lambda: number }[] = [];
  for (let k = Math.max(1, Math.ceil(opt / hi)); k <= Math.floor(opt / lo); k++) out.push({ k, lambda: opt / k });
  return out;
}
/** Reflection minima with a wavelength-dependent index n(λ): roots of 2t n(λ) cos χ(λ)/λ = k found by bisection. */
export function filmMinimaDispersive(t: number, nOf: (lambda: number) => number | null, phi: number, lo: number, hi: number): { k: number; lambda: number }[] {
  const g = (l: number) => { const n = nOf(l); return n === null ? null : (2 * t * n * Math.cos(filmAngle(n, phi))) / l; };
  const gLo = g(lo), gHi = g(hi);
  if (gLo === null || gHi === null) return [];
  const out: { k: number; lambda: number }[] = [];
  for (let k = Math.max(1, Math.ceil(Math.min(gLo, gHi))); k <= Math.floor(Math.max(gLo, gHi)); k++) {
    let a = lo, b = hi;
    for (let i = 0; i < 80; i++) { const m = (a + b) / 2, v = g(m); if (v === null) break; if ((v - k) * ((gLo as number) - k) > 0) a = m; else b = m; }
    out.push({ k, lambda: (a + b) / 2 });
  }
  return out.sort((x, y) => x.lambda - y.lambda);
}
