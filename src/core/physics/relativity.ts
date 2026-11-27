/**
 * Relativistic module (Phase 6, Gate 6.1): exterior Schwarzschild geometry and special-relativistic
 * time dilation. Pure functions, SI units, float64.
 *
 * Sources (Source index):
 *  - carroll-1997: S. M. Carroll, Lecture Notes on General Relativity (arXiv:gr-qc/9712019), ch. 7:
 *    metric singular surface r = 2GM/c², conserved E and L (7.43–7.44), radial equation and effective
 *    potential (7.46–7.48), unstable photon orbit r = 3GM/c² (7.51), smallest stable circular orbit
 *    r = 6GM/c² (7.55), static-observer proper time (7.58), exact frequency shift (7.61) and its
 *    weak-field limit (7.62), apsidal precession (7.56) with Mercury's 42.9″/century.
 *  - narayan-bartelmann-1996: deflection angle of a point mass α̂ = 4GM/(c²b) (eq. 7), valid for |Φ| ≪ c².
 *  - einstein-1905 (§4): a clock moving with speed v marks τ = t√(1 − v²/c²), i.e. Δt = γΔτ with γ = 1/√(1 − v²/c²).
 *
 * Validity: non-rotating, uncharged mass; vacuum exterior (outside the body's surface); static or
 * circular-orbit observers. Kerr (spin) and charge are not modelled. Results inside the horizon
 * (r ≤ r_s) are refused (null), never extrapolated. The Newtonian N-body solver is not used here.
 */
import { CONSTANTS } from '../constants/constants';

const C = CONSTANTS.c.value;
const C2 = C * C;

export const RELATIVITY_SOLVER = { module: 'relativistic', solver: 'schwarzschild-analytic', version: '1.0.0' } as const;

/** Gravitational radius GM/c² (m). `gm` is the mass parameter GM in m³ s⁻². */
export const gravitationalRadius = (gm: number) => gm / C2;
/** Schwarzschild radius r_s = 2GM/c² (m): the event horizon of a non-rotating black hole. */
export const schwarzschildRadius = (gm: number) => (2 * gm) / C2;
/** Unstable circular photon orbit (photon sphere) r = 3GM/c² = 1.5 r_s (Carroll 7.51). */
export const photonSphereRadius = (gm: number) => (3 * gm) / C2;
/** Innermost stable circular orbit r = 6GM/c² = 3 r_s (Carroll 7.55). */
export const iscoRadius = (gm: number) => (6 * gm) / C2;
/**
 * Critical impact parameter b_c = 3√3 GM/c² (m). Photons with b < b_c are captured. Derived from the
 * photon effective potential (Carroll 7.48 with ε = 0): its maximum at r = 3GM equals L²/(54 G²M²),
 * and capture occurs when E²/2 exceeds it, i.e. b = L/E < 3√3 GM.
 */
export const criticalImpactParameter = (gm: number) => (3 * Math.sqrt(3) * gm) / C2;

/** Compactness r_s/r (dimensionless); 0 in flat space, 1 at the horizon. */
export const compactness = (gm: number, r: number) => schwarzschildRadius(gm) / r;

/** Proper-time rate of a static observer at r relative to one at infinity: dτ/dt = √(1 − r_s/r) (Carroll 7.58). */
export function staticTimeRate(gm: number, r: number): number | null {
  const x = 1 - compactness(gm, r);
  return x > 0 ? Math.sqrt(x) : null;
}

/** Gravitational redshift z for light emitted at r and received at infinity: 1 + z = (1 − r_s/r)^(−1/2) (Carroll 7.61). */
export function redshiftToInfinity(gm: number, r: number): number | null {
  const k = staticTimeRate(gm, r);
  return k === null ? null : 1 / k - 1;
}

/** Exact frequency ratio ω₂/ω₁ between static observers at r₁ (emitter) and r₂ (receiver) (Carroll 7.61). */
export function frequencyRatio(gm: number, r1: number, r2: number): number | null {
  const a = 1 - compactness(gm, r1), b = 1 - compactness(gm, r2);
  return a > 0 && b > 0 ? Math.sqrt(a / b) : null;
}

/** Weak-field frequency ratio 1 + (Φ₁ − Φ₂)/c² with Φ = −GM/r (Carroll 7.62). */
export const frequencyRatioWeak = (gm: number, r1: number, r2: number) => 1 - gm / (r1 * C2) + gm / (r2 * C2);

/** Equivalent recession velocity cz of a gravitational redshift (m/s), the quantity white-dwarf papers quote. */
export const redshiftVelocity = (z: number) => z * C;

/**
 * Circular geodesic orbit at r: conserved specific energy Ẽ and angular momentum L̃ (geometric form,
 * per unit mass, with Ẽ dimensionless and L̃ in m), from V′(r) = 0 and V(r) = Ẽ²/2 in Carroll (7.47–7.48).
 * Exists only for r > 3GM/c²; stable only for r ≥ 6GM/c².
 */
export function circularOrbit(gm: number, r: number): { E: number; L: number; stable: boolean; dTauDt: number; omega: number } | null {
  const m = gm / C2; // GM/c² in metres
  const d = 1 - (3 * m) / r;
  if (d <= 0) return null;
  const E = (1 - (2 * m) / r) / Math.sqrt(d);
  const L = Math.sqrt(m * r) / Math.sqrt(d);
  // dτ/dt = (1 − 2m/r)/Ẽ = √(1 − 3m/r); coordinate angular velocity Ω = dφ/dt = √(GM/r³)
  return { E, L, stable: r >= 6 * m * (1 - 1e-12), dTauDt: Math.sqrt(d), omega: Math.sqrt(gm / (r * r * r)) };
}

/**
 * Effective potential per unit mass in Carroll's form (7.48), in units of c²:
 * V(r) = ε/2 − εm/r + L̃²/(2r²) − mL̃²/r³ with m = GM/c². ε = 1 for massive particles, 0 for light.
 */
export function effectivePotential(gm: number, r: number, L: number, massive: boolean): number {
  const m = gm / C2, eps = massive ? 1 : 0;
  return eps / 2 - (eps * m) / r + (L * L) / (2 * r * r) - (m * L * L) / (r * r * r);
}

/** Newtonian effective potential (same units) for comparison: ½ − m/r + L̃²/(2r²). */
export const newtonianEffectivePotential = (gm: number, r: number, L: number) => 0.5 - gm / C2 / r + (L * L) / (2 * r * r);

/** Apsidal (perihelion) advance per orbit Δφ = 6πGM/(c² a (1 − e²)) (rad), the lowest-order result whose rate is Carroll (7.56). */
export const perihelionAdvancePerOrbit = (gm: number, a: number, e: number) => (6 * Math.PI * gm) / (C2 * a * (1 - e * e));

/** Weak-field light deflection α̂ = 4GM/(c²b) (rad), valid for b ≫ r_s (Narayan & Bartelmann eq. 7). */
export const weakDeflection = (gm: number, b: number) => (4 * gm) / (C2 * b);

/** Lorentz factor γ = 1/√(1 − v²/c²); null at or above c (Einstein 1905 §4). */
export function lorentzFactor(v: number): number | null {
  const beta2 = (v * v) / C2;
  return beta2 < 1 ? 1 / Math.sqrt(1 - beta2) : null;
}

/** How strongly relativistic a point is, and whether the Newtonian description is acceptable there. */
export type FieldRegime = 'inside-horizon' | 'strong' | 'moderate' | 'weak';
export function fieldRegime(gm: number, r: number): FieldRegime {
  const k = compactness(gm, r);
  return k >= 1 ? 'inside-horizon' : k > 0.1 ? 'strong' : k > 1e-4 ? 'moderate' : 'weak';
}

/**
 * Null geodesic in the equatorial plane, integrated in φ with u = 1/r:
 *   d²u/dφ² = −u + 3(GM/c²)u²
 * (from Carroll 7.44 and 7.46 with ε = 0). Start far away (r₀ = 10⁴ r_s or 10⁴ b, whichever is larger)
 * with impact parameter b on a straight line; stop at capture (r ≤ r_s) or escape (back beyond r₀).
 * RK4 with fixed Δφ. Returns points in units of r_s and the total deflection for escaping rays.
 */
export function photonPath(b_over_rs: number, opts: { dphi?: number; maxSteps?: number } = {}) {
  const m = 0.5; // GM/c² in units of r_s
  const b = b_over_rs;
  const r0 = Math.max(1e4, 1e4 * b);
  const dphi = opts.dphi ?? 1e-3;
  const maxSteps = opts.maxSteps ?? 400_000;
  // incoming along −x direction at y = b: φ₀ = asin(b/r₀) measured from +x; du/dφ from (du/dφ)² = 1/b² − u² + 2m u³
  let phi = Math.asin(Math.min(1, b / r0));
  let u = 1 / r0;
  let w = Math.sqrt(Math.max(0, 1 / (b * b) - u * u + 2 * m * u * u * u)); // u increasing as the ray approaches
  const f = (uu: number) => -uu + 3 * m * uu * uu;
  const pts: [number, number][] = [[Math.cos(phi) / u, Math.sin(phi) / u]];
  let outcome: 'captured' | 'escaped' | 'unfinished' = 'unfinished';
  let rMin = r0;
  for (let i = 0; i < maxSteps; i++) {
    const k1u = w, k1w = f(u);
    const k2u = w + 0.5 * dphi * k1w, k2w = f(u + 0.5 * dphi * k1u);
    const k3u = w + 0.5 * dphi * k2w, k3w = f(u + 0.5 * dphi * k2u);
    const k4u = w + dphi * k3w, k4w = f(u + dphi * k3u);
    u += (dphi / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
    w += (dphi / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    phi += dphi;
    const r = 1 / u;
    if (u > 0) rMin = Math.min(rMin, r);
    if (u >= 1) { outcome = 'captured'; pts.push([Math.cos(phi), Math.sin(phi)]); break; }
    if (u <= 1 / r0 && w < 0) {
      // interpolate back to the exact crossing u = 1/r₀
      phi += (1 / r0 - u) / w;
      outcome = 'escaped'; pts.push([Math.cos(phi) * r0, Math.sin(phi) * r0]); break;
    }
    if (i % 20 === 0) pts.push([Math.cos(phi) * r, Math.sin(phi) * r]);
  }
  // The path is symmetric about periapsis. A straight line sweeps π − 2 asin(b/r₀) between the two r₀
  // crossings, so the deflection is the extra sweep: (φ_end − φ_start) − (π − 2 asin(b/r₀)), with
  // φ_start = asin(b/r₀). The part of the bending beyond r₀ (≈ 2GM/(c²r₀) per side) is neglected.
  const s0 = Math.asin(Math.min(1, b / r0));
  const deflection = outcome === "escaped" ? phi - s0 - (Math.PI - 2 * s0) : null;
  return { points: pts, outcome, rMin, deflection, r0 };
}
