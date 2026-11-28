/**
 * Atmospheric motion and convection (Phase 20, Gate 20.4).
 *  - Coriolis: Humphreys (1920) a = 2ωv sin φ with ω = 2π/86,164 s⁻¹ (one sidereal day).
 *  - A turntable: a puck sliding in a straight line, seen from the rotating frame.
 *  - Rayleigh (1916): instability when the fractional density excess exceeds 27π⁴κν/(4gζ³) (CGS, his air values, κ = 5ν/2).
 */
export const OMEGA = (2 * Math.PI) / 86164;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Coriolis parameter 2ω sin φ (s⁻¹). */
export const coriolisParam = (latDeg: number, w = OMEGA) => 2 * w * Math.sin(rad(latDeg));
/** Coriolis acceleration 2ωv sin φ (m/s²), to the right in the north, left in the south (sign follows latitude). */
export const coriolisAccel = (v: number, latDeg: number, w = OMEGA) => coriolisParam(latDeg, w) * v;
/** Sideways drift (m) after time t if the acceleration stayed perpendicular and constant — a short-time estimate ½at². */
export const driftShort = (v: number, latDeg: number, t: number) => 0.5 * Math.abs(coriolisAccel(v, latDeg)) * t * t;
/** Inertial circle: a parcel moving at v under the Coriolis force alone turns in a circle of radius v/f, period 2π/f. */
export const inertialRadius = (v: number, latDeg: number) => v / Math.abs(coriolisParam(latDeg));

/** Path, in the rotating frame, of a puck launched from the centre of a turntable (angular speed w, rad/s, + = anticlockwise). */
export function turntablePath(speed: number, w: number, tMax: number, n = 120, angle0 = 0): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * tMax, r = speed * t, th = angle0 - w * t; return [r * Math.cos(th), r * Math.sin(th)]; });
}

/** Rayleigh's threshold for a layer of depth ζ (cm): (ρ₂ − ρ₁)/ρ₁ > 27π⁴κν/(4gζ³); his air: ν = ·14, κ = 5ν/2 (Maxwell), g = 980. */
export function rayleighThreshold(zetaCm: number, nu = 0.14, kappa = 2.5 * 0.14, g = 980) {
  return (27 * Math.PI ** 4 * kappa * nu) / (4 * g * zetaCm ** 3);
}
export const RAYLEIGH_FREE = (27 * Math.PI ** 4) / 4;
/** Rayleigh number αgΔT d³/(νκ) (any consistent units). */
export const rayleighNumber = (alpha: number, g: number, dT: number, d: number, nu: number, kappa: number) => (alpha * g * dT * d ** 3) / (nu * kappa);

/** Time to fall a height h (m) at a terminal speed v (m/s). */
export const fallTime = (h: number, v: number) => h / v;
/** How many droplets of diameter d make one drop of diameter D. */
export const dropletsPerDrop = (D: number, d: number) => (D / d) ** 3;
