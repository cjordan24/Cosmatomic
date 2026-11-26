/**
 * Hydrogen-like (one-electron) energy levels and spectral lines.
 * Bohr/Schrödinger levels with reduced-mass correction; fine structure,
 * Lamb shift and hyperfine splitting are neglected (≲ 0.005 nm for Balmer lines).
 * Wavelengths are VACUUM wavelengths.
 */
import { CONSTANTS } from '@/core/constants/constants';

export const SERIES: Record<number, string> = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund', 6: 'Humphreys' };

/** Reduced-mass Rydberg constant (m⁻¹) for a nucleus of mass `nucleusMassU` (u). */
export function rydbergFor(nucleusMassU: number): number {
  const M = nucleusMassU * CONSTANTS.u.value;
  return CONSTANTS.Rinf.value / (1 + CONSTANTS.me.value / M);
}

/** Energy of level n in eV (negative = bound). */
export function levelEnergyEV(n: number, Z: number, nucleusMassU: number): number {
  const ratio = rydbergFor(nucleusMassU) / CONSTANTS.Rinf.value;
  return (-CONSTANTS.RyEV.value * ratio * Z * Z) / (n * n);
}

export interface SpectralLine { nUpper: number; nLower: number; series: string; wavelengthNm: number; energyEV: number }

export function transitionLine(nUpper: number, nLower: number, Z: number, nucleusMassU: number): SpectralLine {
  if (nUpper <= nLower) throw new RangeError('nUpper must exceed nLower');
  const invLambda = rydbergFor(nucleusMassU) * Z * Z * (1 / nLower ** 2 - 1 / nUpper ** 2);
  const wavelengthNm = 1e9 / invLambda;
  return { nUpper, nLower, series: SERIES[nLower] ?? `n=${nLower}`, wavelengthNm, energyEV: levelEnergyEV(nUpper, Z, nucleusMassU) - levelEnergyEV(nLower, Z, nucleusMassU) };
}

export function hydrogenLikeLines(Z: number, nucleusMassU: number, maxLower = 4, maxUpper = 9): SpectralLine[] {
  const lines: SpectralLine[] = [];
  for (let lo = 1; lo <= maxLower; lo++) for (let up = lo + 1; up <= maxUpper; up++) lines.push(transitionLine(up, lo, Z, nucleusMassU));
  return lines;
}

/** Approximate visible colour (sRGB hex) for a vacuum wavelength — display aid only. */
export function wavelengthToColor(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490 && nm >= 440) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510 && nm >= 490) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580 && nm >= 510) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645 && nm >= 580) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 750 && nm >= 645) { r = 1; }
  const f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (750 - nm)) / 50 : 1;
  const c = (x: number) => Math.round(255 * Math.max(0, Math.min(1, x * f)) ** 0.8).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
