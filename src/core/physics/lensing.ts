/**
 * Gravitational lensing by a point mass (Phase 6, Gate 6.3). Part of the relativistic module.
 *
 * Sources (Source index):
 *  - narayan-bartelmann-1996 §2.1–2.2: deflection 4GM/(c²ξ) (7), lens equation β = θ − α(θ) (14), Einstein
 *    radius θ_E = √(4GM/c² · D_ds/(D_d D_s)) (21), point-lens images θ± = ½(β ± √(β² + 4θ_E²)) (24),
 *    magnifications µ± = (u² + 2)/(2u√(u² + 4)) ± ½ and µ = (u² + 2)/(u√(u² + 4)) (27–28), 1.34 at u = 1
 *    (29), Einstein time t₀ = D_d θ_E / v (30).
 *  - sahu-2017: θ_E = √(4GM/(c² D_r)) with 1/D_r = 1/D_l − 1/D_s (their eq. 1), and the displacement of the
 *    major image δθ = ½(√(u² + 4) − u) θ_E (eq. 2).
 *
 * Validity: thin lens, weak field (|Φ| ≪ c², impact parameter ≫ r_s), point mass, geometric optics.
 * einsteinRadius uses Euclidean distances (fine inside the Galaxy). For cosmological lenses use
 * einsteinRadiusD with angular-diameter distances from cosmology.ts (lensDistancesMpc; Hogg 1999 eq. 19),
 * since D_ds ≠ D_s − D_d there (Gate 7.1).
 */
import { CONSTANTS, PARSEC_M } from '../constants/constants';

const C2 = CONSTANTS.c.value ** 2;
export const MAS = (Math.PI / 180 / 3600) * 1e-3;

/** Einstein radius (rad) of a point mass with parameter GM for lens and source distances in metres (D_ds = D_s − D_d). */
export function einsteinRadius(gm: number, Dd: number, Ds: number): number | null {
  if (!(Ds > Dd && Dd > 0)) return null;
  return Math.sqrt(((4 * gm) / C2) * ((Ds - Dd) / (Dd * Ds)));
}

/** Einstein radius (rad) from explicit distances D_d, D_s, D_ds in metres (N&B eq. 21); for cosmological lenses. */
export function einsteinRadiusD(gm: number, Dd: number, Ds: number, Dds: number): number | null {
  if (!(Dd > 0 && Ds > 0 && Dds > 0)) return null;
  return Math.sqrt(((4 * gm) / C2) * (Dds / (Dd * Ds)));
}

/**
 * Einstein radius in mas from the lens mass (M☉) and the lens–source relative parallax π_rel (mas):
 * θ_E² = κ M π_rel with κ = 4GM☉/(c² au) — the same as Sahu's eq. 1, since 1/D_r = (π_l − π_s)/au.
 */
export const KAPPA_MAS = (4 * CONSTANTS.GMsun.value) / (C2 * CONSTANTS.au.value) / MAS;
export const einsteinRadiusMas = (mSun: number, piRelMas: number) => (piRelMas > 0 && mSun > 0 ? Math.sqrt(KAPPA_MAS * mSun * piRelMas) : null);
/** Mass (M☉) implied by a measured Einstein radius and relative parallax. */
export const massFromEinstein = (thetaEMas: number, piRelMas: number) => (thetaEMas * thetaEMas) / (KAPPA_MAS * piRelMas);

/** Image positions (units of θ_E, signed along the source direction) for source offset u = β/θ_E. */
export function imagePositions(u: number): [number, number] {
  const s = Math.sqrt(u * u + 4);
  return [(u + s) / 2, (u - s) / 2];
}

/** Signed magnifications µ± of the two images (N&B 27); µ− < 0 means the inner image is mirror-reversed. */
export function imageMagnifications(u: number): [number, number] {
  const a = (u * u + 2) / (2 * u * Math.sqrt(u * u + 4));
  return [a + 0.5, 0.5 - a];
}

/** Total magnification of a point source, |µ+| + |µ−| = (u² + 2)/(u√(u² + 4)) (N&B 28). Infinite at u = 0. */
export const totalMagnification = (u: number) => (u * u + 2) / (u * Math.sqrt(u * u + 4));

/** Magnitude change −2.5 log₁₀ µ (negative = brighter). */
export const deltaMag = (mu: number) => -2.5 * Math.log10(mu);

/** Rectilinear lens–source motion: u(t) = √(u_min² + ((t − t_peak)/t_E)²). */
export const uOfT = (t: number, uMin: number, tPeak: number, tE: number) => Math.hypot(uMin, (t - tPeak) / tE);

/** Microlensing light curve of a point source: µ(t) = µ(u(t)). */
export const lightCurve = (t: number, uMin: number, tPeak: number, tE: number) => totalMagnification(uOfT(t, uMin, tPeak, tE));

/** Einstein time t_E = D_d θ_E / v (s) for transverse relative velocity v (m/s) (N&B 30). */
export const einsteinTime = (thetaE: number, Dd: number, v: number) => (Dd * thetaE) / v;

/** Displacement of the major image from the true source position, ½(√(u² + 4) − u) θ_E (Sahu et al. eq. 2). */
export const majorImageShift = (u: number, thetaE: number) => 0.5 * (Math.sqrt(u * u + 4) - u) * thetaE;

/** Shift of the light centroid of both (unresolved) images: θ_E u/(u² + 2). Derived from θ± and µ± above. */
export const centroidShift = (u: number, thetaE: number) => (thetaE * u) / (u * u + 2);

/**
 * Inverse ray shooting for an extended circular source: for each image-plane position θ (units of θ_E,
 * relative to the lens) the lens equation gives the source-plane position β = θ − θ/|θ|². Returns the
 * source-plane coordinates for a grid, so a renderer can light pixels whose β falls inside the source.
 */
export function sourcePlanePoint(x: number, y: number): [number, number] {
  const r2 = x * x + y * y;
  if (r2 === 0) return [Infinity, Infinity];
  return [x - x / r2, y - y / r2];
}

/** Metres from parsecs, for convenience. */
export const pc = (d: number) => d * PARSEC_M;
