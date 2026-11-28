/**
 * Environmental sandbox (Phase 25): a planet built from a few variables, with physical dependencies enforced.
 *
 * Every relation here is one the app already uses and cites elsewhere:
 *   g = GM/R² and v_esc = √(2GM/R)            Newton's gravitation (CODATA G); Moulton (1914) V² = 2gR
 *   S(d) = S₁ (1 au / d)²                     inverse-square spreading of sunlight from the 1 au value (NASA GSFC 1361 W/m²)
 *   r_peri,aph = a(1 ∓ e)                     Kepler ellipse (Moulton 1914)
 *   σT_e⁴ = S(1 − A)/4 + F_int                radiative balance (Planck/Stefan–Boltzmann; NASA energy budget), plus internal heat
 *   H = R*T/(M g), p(z) = p₀ e^(−z/H)         isothermal scale height (USSA 1976 constants; NSSDCA)
 *   column mass = p₀/g                         hydrostatic balance
 *   f = 2Ω sin φ                               Coriolis parameter (motion.ts)
 *   ΔF = 5.35 ln(C/C₀); ΔT = S·ΔF/F₂ₓ          CO₂ forcing (Myhre via NOAA AGGI) scaled by a sensitivity per doubling (NCA5)
 *
 * It is NOT a climate model: one global number per quantity, no circulation, no clouds that respond, no chemistry.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { SIGMA_SB } from '@/core/physics/thermal/radiation';
import { co2ForcingSimple } from './atmosphere';
import { scaleHeightKm } from './planets';

export { scaleHeightKm };

const G = CONSTANTS.G.value;

export interface Planet {
  name: string;
  massKg: number; radiusKm: number;
  /** theoretical override of surface gravity (m/s²); null = derived from mass and radius */
  gOverride: number | null;
  distanceAu: number; eccentricity: number; tiltDeg: number; rotationH: number;
  bondAlbedo: number;
  /** internal heat flux at the surface or 1-bar level, W/m² */
  internalWm2: number;
  pBar: number; mmw: number;
  /** a measured mean surface (or 1-bar) temperature for comparison, if any */
  tObsK: number | null;
}

export const surfaceGravity = (massKg: number, radiusKm: number) => (G * massKg) / (radiusKm * 1e3) ** 2;
export const escapeVelocity = (massKg: number, radiusKm: number) => Math.sqrt((2 * G * massKg) / (radiusKm * 1e3));
/**
 * Equatorial gravity including rotation, g = GM/R² − ω²R — the quantity NSSDCA tabulates (“The gravitational acceleration
 * on the surface at the equator … including the effects of rotation”). Ignores oblateness (J2), so giants differ by a few %.
 */
export const equatorialGravity = (massKg: number, radiusKm: number, rotationH: number) => {
  const w = (2 * Math.PI) / (Math.abs(rotationH) * 3600);
  return surfaceGravity(massKg, radiusKm) - w * w * radiusKm * 1e3;
};
export const gravityOf = (p: Pick<Planet, 'massKg' | 'radiusKm' | 'gOverride'>) => p.gOverride ?? surfaceGravity(p.massKg, p.radiusKm);

/** Irradiance at d au from a star whose irradiance at 1 au is s1 (W/m²). */
export const irradiance = (distanceAu: number, s1 = 1361) => s1 / distanceAu ** 2;
/** Perihelion and aphelion irradiance for an orbit of semi-major axis a and eccentricity e. */
export const irradianceRange = (aAu: number, e: number, s1 = 1361) => ({ peri: irradiance(aAu * (1 - e), s1), aph: irradiance(aAu * (1 + e), s1) });

/** Effective (emission) temperature with internal heat: σT⁴ = S(1 − A)/4 + F_int. */
export const effectiveTempInt = (S: number, albedo: number, internal = 0) => ((S * (1 - albedo)) / 4 / SIGMA_SB + internal / SIGMA_SB) ** 0.25;

/** Mass of air above each square metre (kg/m²) — hydrostatic: p = (m/A) g. */
export const columnMass = (pBar: number, g: number) => (pBar * 1e5) / g;
/** Whole-atmosphere mass (kg) for a thin shell over a sphere of radius R. */
export const atmosphereMass = (pBar: number, g: number, radiusKm: number) => columnMass(pBar, g) * 4 * Math.PI * (radiusKm * 1e3) ** 2;

/** Coriolis parameter (1/s) for a rotation period in hours (sidereal; negative = retrograde, sign ignored). */
export const coriolisAt = (rotationH: number, latDeg: number) => (2 * ((2 * Math.PI) / (Math.abs(rotationH) * 3600))) * Math.sin((latDeg * Math.PI) / 180);

/** Equilibrium warming (range) for a CO₂ change, scaling a sensitivity range per doubling by the simple forcing. */
export function co2Warming(c: number, c0: number, ecs: [number, number]) {
  const f = co2ForcingSimple(c, c0), f2x = co2ForcingSimple(2, 1);
  return { forcing: f, lo: (ecs[0] * f) / f2x, hi: (ecs[1] * f) / f2x };
}

/** Area-weighted surface albedo from fractional covers (normalised). */
export function mixAlbedo(parts: { frac: number; albedo: number }[]) {
  const t = parts.reduce((a, p) => a + Math.max(0, p.frac), 0);
  return t > 0 ? parts.reduce((a, p) => a + Math.max(0, p.frac) * p.albedo, 0) / t : 0;
}

/** Everything derived from a planet, in one place, so views never re-derive inconsistently. */
export function derive(p: Planet) {
  const g = gravityOf(p), S = irradiance(p.distanceAu), Te = effectiveTempInt(S, p.bondAlbedo, p.internalWm2);
  const T = p.tObsK ?? Te;
  return {
    g, gDerived: surfaceGravity(p.massKg, p.radiusKm), gEquator: equatorialGravity(p.massKg, p.radiusKm, p.rotationH), overridden: p.gOverride !== null,
    vEsc: escapeVelocity(p.massKg, p.radiusKm),
    S, range: irradianceRange(p.distanceAu, p.eccentricity), Te,
    greenhouseK: p.tObsK !== null ? p.tObsK - Te : null,
    H: p.pBar > 0 && p.mmw > 0 ? scaleHeightKm(T, p.mmw, g) : null,
    column: columnMass(p.pBar, g), atmMass: atmosphereMass(p.pBar, g, p.radiusKm),
    f45: coriolisAt(p.rotationH, 45),
  };
}
