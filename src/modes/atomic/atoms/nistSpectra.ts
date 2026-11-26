/**
 * NIST Atomic Spectra Database lines (lazy-loaded, ~950 KiB). Spectrum notation: element symbol +
 * Roman numeral of the ionisation stage (I = neutral, II = singly ionised …); deuterium is "D I".
 */
export interface NistLine { wl: number; ritz: boolean; intensity: number | null; intensityRaw: string; A: number | null; acc: string; Ei: number | null; Ek: number | null; lower: string; upper: string; type: string }
export interface NistSpectra { range_nm: { low: number; high: number }; wavelengths: string; spectra: Record<string, { lines: NistLine[]; totalInRange: number }> }

let cache: NistSpectra | null = null;
let pending: Promise<NistSpectra> | null = null;
export function loadNistSpectra(): Promise<NistSpectra> {
  if (cache) return Promise.resolve(cache);
  pending ??= import('@datasets/atomic/spectra-nist.json').then((m) => (cache = (m.default ?? m) as unknown as NistSpectra));
  return pending;
}
export const nistSpectraSync = () => cache;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
/** Spectrum label for an element/charge/isotope, e.g. (26, 1) → "Fe II"; hydrogen-2 neutral → "D I". */
export function spectrumLabel(symbol: string, charge: number, A: number | null): string | null {
  if (charge < 0 || charge >= ROMAN.length) return null;
  const sym = symbol === 'H' && A === 2 ? 'D' : symbol;
  return `${sym} ${ROMAN[charge]}`;
}

/** Forbidden-transition flag from the NIST "Type" column (M1, E2, M2 …). */
export const isForbidden = (l: NistLine) => /M1|E2|M2|E3/.test(l.type);

/** A-weighted centroid of all components within ±window nm of a wavelength (fine-structure blend). */
export function blendCentroid(lines: NistLine[], near: number, window = 0.05): number | null {
  const comps = lines.filter((l) => Math.abs(l.wl - near) <= window && l.A);
  const W = comps.reduce((t, l) => t + (l.A ?? 0), 0);
  return W ? comps.reduce((t, l) => t + l.wl * (l.A ?? 0), 0) / W : null;
}
