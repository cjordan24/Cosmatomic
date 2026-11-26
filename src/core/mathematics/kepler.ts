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
