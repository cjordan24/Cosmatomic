/**
 * Cosmological module — foundation only (Phase 7 builds on this).
 * FLRW distances for a ΛCDM model with curvature, numerical integration by
 * composite Simpson's rule on E(z) = H(z)/H0. Radiation is neglected (documented).
 */
import { CONSTANTS } from '../constants/constants';

export interface Cosmology { name: string; H0: number; Om: number; Ode: number }
/** Planck 2018 (TT,TE,EE+lowE+lensing+BAO) parameters, Planck Collaboration VI (2020), Table 2. */
export const PLANCK18: Cosmology = { name: 'Planck 2018', H0: 67.66, Om: 0.3111, Ode: 0.6889 };

const C_KMS = CONSTANTS.c.value / 1000;
export const Ok = (c: Cosmology) => 1 - c.Om - c.Ode;
export const E = (z: number, c: Cosmology) => Math.sqrt(c.Om * (1 + z) ** 3 + Ok(c) * (1 + z) ** 2 + c.Ode);
export const hubbleDistanceMpc = (c: Cosmology) => C_KMS / c.H0;

function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Line-of-sight comoving distance (Mpc). */
export const comovingDistanceMpc = (z: number, c: Cosmology) => hubbleDistanceMpc(c) * simpson((x) => 1 / E(x, c), 0, z);

/** Transverse comoving distance (Mpc), accounting for curvature. */
export function transverseComovingMpc(z: number, c: Cosmology): number {
  const dc = comovingDistanceMpc(z, c), dh = hubbleDistanceMpc(c), ok = Ok(c);
  if (Math.abs(ok) < 1e-10) return dc;
  const s = Math.sqrt(Math.abs(ok));
  return ok > 0 ? (dh / s) * Math.sinh((s * dc) / dh) : (dh / s) * Math.sin((s * dc) / dh);
}

export const luminosityDistanceMpc = (z: number, c: Cosmology) => (1 + z) * transverseComovingMpc(z, c);
export const angularDiameterDistanceMpc = (z: number, c: Cosmology) => transverseComovingMpc(z, c) / (1 + z);

/** Lookback time in Gyr (= light-travel distance in Gly). */
export function lookbackTimeGyr(z: number, c: Cosmology): number {
  const hubbleTimeGyr = (977.792221 / c.H0); // 1/H0 in Gyr for H0 in km/s/Mpc
  return hubbleTimeGyr * simpson((x) => 1 / ((1 + x) * E(x, c)), 0, z);
}
