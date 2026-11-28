/**
 * Spaceflight (Phase 18): the rocket equation, circular and escape speeds, Hohmann transfers, radioisotope power
 * decay, sunlight falling with distance, antenna gain and the received power of a radio link.
 * SI units throughout unless the name says otherwise. Sources are cited in the view and SCIENTIFIC_MODELS.md §75.
 */
export const G0 = 9.80665;                    // standard gravity, m/s² (definition)

/** Ideal rocket equation: Δv = v_e ln(m0/mf). */
export const deltaV = (ve: number, m0: number, mf: number) => ve * Math.log(m0 / mf);
/** Effective exhaust speed from specific impulse in seconds. */
export const exhaustFromIsp = (isp: number) => isp * G0;
/** Propellant fraction needed for a Δv: 1 − e^(−Δv/v_e). */
export const propellantFraction = (dv: number, ve: number) => 1 - Math.exp(-dv / ve);

/** Circular orbital speed √(μ/r). */
export const circularSpeed = (mu: number, r: number) => Math.sqrt(mu / r);
/** Escape speed √(2μ/r). */
export const escapeSpeed = (mu: number, r: number) => Math.sqrt((2 * mu) / r);
/** Orbital period 2π√(a³/μ) (Kepler's third law). */
export const period = (mu: number, a: number) => 2 * Math.PI * Math.sqrt(a ** 3 / mu);
/** Vis-viva: speed at r on an orbit of semi-major axis a. */
export const visViva = (mu: number, r: number, a: number) => Math.sqrt(mu * (2 / r - 1 / a));

/** Hohmann transfer between circular orbits r1 → r2: the two burns, the total and the transfer time (half an ellipse). */
export function hohmann(mu: number, r1: number, r2: number) {
  const a = (r1 + r2) / 2;
  const dv1 = Math.abs(visViva(mu, r1, a) - circularSpeed(mu, r1));
  const dv2 = Math.abs(circularSpeed(mu, r2) - visViva(mu, r2, a));
  return { dv1, dv2, total: dv1 + dv2, time: period(mu, a) / 2, a };
}

/** Radioactive decay of the heat source: P(t) = P0 · 2^(−t/T½). */
export const decay = (p0: number, t: number, halfLife: number) => p0 * 2 ** (-t / halfLife);

/** Sunlight at a distance in au: S = S1 / d². */
export const sunlightAt = (s1: number, dAu: number) => s1 / (dAu * dAu);

/** Gain of a circular dish: η (πD/λ)². */
export const dishGain = (D: number, lambda: number, eff = 0.55) => eff * ((Math.PI * D) / lambda) ** 2;
export const toDb = (x: number) => 10 * Math.log10(x);
/** Friis free-space link: Pr = Pt Gt Gr (λ / 4πR)². */
export const friis = (pt: number, gt: number, gr: number, lambda: number, R: number) => pt * gt * gr * (lambda / (4 * Math.PI * R)) ** 2;
/** One-way light time. */
export const lightTime = (R: number) => R / 299_792_458;
