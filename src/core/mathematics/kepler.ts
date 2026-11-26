/**
 * Two-body Keplerian orbit utilities (elliptical orbits, e < 1).
 * Angles in degrees at the API boundary, radians internally.
 */
import { DEG, type Vec3, rotX, rotZ, wrap180 } from './vec3';

/** Solve Kepler's equation M = E − e sin E for E (radians) by Newton–Raphson. */
export function solveKepler(M: number, e: number, tol = 1e-13, maxIter = 50): number {
  if (e < 0 || e >= 1) throw new RangeError(`solveKepler supports 0 <= e < 1 (got ${e})`);
  let E = e < 0.8 ? M : Math.PI * Math.sign(M || 1);
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const dE = f / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) return E;
  }
  return E;
}

export interface ClassicalElements {
  a: number; // semi-major axis (any length unit — output uses the same unit)
  e: number;
  i: number; // inclination, deg
  Omega: number; // longitude of ascending node, deg
  omega: number; // argument of periapsis, deg
  M: number; // mean anomaly, deg
}

/** Position in the reference frame of the elements (same length unit as `a`). */
export function elementsToPosition(el: ClassicalElements): Vec3 {
  const M = wrap180(el.M) * DEG;
  const E = solveKepler(M, el.e);
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  let r: Vec3 = [xp, yp, 0];
  r = rotZ(r, el.omega * DEG);
  r = rotX(r, el.i * DEG);
  r = rotZ(r, el.Omega * DEG);
  return r;
}

/** Sample the full orbit ellipse (for drawing orbit paths). */
export function sampleOrbit(el: ClassicalElements, segments = 256): Vec3[] {
  const pts: Vec3[] = [];
  for (let k = 0; k <= segments; k++) {
    const E = (k / segments) * 2 * Math.PI;
    let r: Vec3 = [el.a * (Math.cos(E) - el.e), el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E), 0];
    r = rotZ(r, el.omega * DEG);
    r = rotX(r, el.i * DEG);
    r = rotZ(r, el.Omega * DEG);
    pts.push(r);
  }
  return pts;
}

/** Kepler's third law: orbital period for semi-major axis a (m) about GM (m³/s²). */
export const keplerPeriod = (aMeters: number, GM: number) => 2 * Math.PI * Math.sqrt(aMeters ** 3 / GM);

/**
 * Osculating classical elements from a state vector (r, v) about a body of gravitational
 * parameter μ (consistent units, e.g. km and km/s with μ in km³/s²). Angles in degrees.
 * Elliptic orbits (e < 1) return a and period; hyperbolic orbits return a < 0 and period = null.
 */
export function stateToElements(r: Vec3, v: Vec3, mu: number): ClassicalElements & { period: number | null; energy: number; rPeri: number; rApo: number | null } {
  const rn = Math.hypot(...r), v2 = v[0] ** 2 + v[1] ** 2 + v[2] ** 2;
  const h: Vec3 = [r[1] * v[2] - r[2] * v[1], r[2] * v[0] - r[0] * v[2], r[0] * v[1] - r[1] * v[0]];
  const hn = Math.hypot(...h);
  const nVec: Vec3 = [-h[1], h[0], 0];
  const nn = Math.hypot(...nVec);
  const rv = r[0] * v[0] + r[1] * v[1] + r[2] * v[2];
  const eVec = [0, 1, 2].map((k) => ((v2 - mu / rn) * r[k] - rv * v[k]) / mu) as Vec3;
  const e = Math.hypot(...eVec);
  const energy = v2 / 2 - mu / rn;
  const a = -mu / (2 * energy);
  const i = Math.acos(Math.max(-1, Math.min(1, h[2] / hn)));
  let Omega = nn > 1e-12 ? Math.acos(Math.max(-1, Math.min(1, nVec[0] / nn))) : 0;
  if (nVec[1] < 0) Omega = 2 * Math.PI - Omega;
  let omega = 0;
  if (nn > 1e-12 && e > 1e-12) { omega = Math.acos(Math.max(-1, Math.min(1, (nVec[0] * eVec[0] + nVec[1] * eVec[1] + nVec[2] * eVec[2]) / (nn * e)))); if (eVec[2] < 0) omega = 2 * Math.PI - omega; }
  else if (e > 1e-12) { omega = Math.atan2(eVec[1], eVec[0]); if (h[2] < 0) omega = 2 * Math.PI - omega; }
  let nu = e > 1e-12 ? Math.acos(Math.max(-1, Math.min(1, (eVec[0] * r[0] + eVec[1] * r[1] + eVec[2] * r[2]) / (e * rn)))) : Math.atan2(r[1], r[0]);
  if (e > 1e-12 && rv < 0) nu = 2 * Math.PI - nu;
  let M = nu;
  if (e < 1) { const E = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(nu / 2)); M = E - e * Math.sin(E); }
  const deg = (x: number) => ((x * 180) / Math.PI + 360) % 360;
  return {
    a, e, i: (i * 180) / Math.PI, Omega: deg(Omega), omega: deg(omega), M: deg(M), energy,
    period: e < 1 ? 2 * Math.PI * Math.sqrt(a ** 3 / mu) : null,
    rPeri: e < 1 ? a * (1 - e) : (hn * hn) / mu / (1 + e), rApo: e < 1 ? a * (1 + e) : null,
  };
}
