/** Rendering colour helpers (presentation only — never used in physics). */
import { getElement } from '@/modes/atomic/atoms/elements';

/** CPK/Jmol colour from the PubChem dataset, with a neutral fallback for elements lacking one. */
export function cpkColor(Z: number): string {
  const hex = getElement(Z)?.cpkHex;
  if (!hex) return '#c9a8ff';
  if (hex.toUpperCase() === 'FFFFFF') return '#f2f4f8';
  return `#${hex}`;
}

/** Orbital phase colours: positive lobe / negative lobe of the real wavefunction. */
export const PHASE_POS = [0.35, 0.95, 1.0] as const;
export const PHASE_NEG = [1.0, 0.45, 0.62] as const;

/** Simple perceptual sequential ramp (dark blue → cyan → white) for scalar maps. */
export function ramp(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const stops = [[0.09, 0.12, 0.35], [0.12, 0.45, 0.85], [0.3, 0.85, 0.95], [0.85, 0.95, 0.6], [1, 0.75, 0.35]];
  const f = x * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)), u = f - i;
  const c = stops[i].map((v, k) => v + (stops[i + 1][k] - v) * u);
  return `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;
}
