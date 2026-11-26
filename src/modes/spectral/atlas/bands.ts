/**
 * EM band conventions (datasets/spectral/em-bands.json). Band edges are stored in the convention's own
 * quantity (Hz for ITU-R, vacuum nm for CIE/ISO/detector schemes); mapping converts any photon to that
 * quantity with exact c, then applies the convention's own edge rule.
 */
import data from '@datasets/spectral/em-bands.json';
import { CONSTANTS } from '@/core/constants/constants';

export interface Band { id: string; symbol: string | null; name: string; lo: number; hi: number; level: number; number?: number; note?: string }
export interface Convention {
  id: string; name: string; short: string; quantity: 'frequency' | 'wavelength'; unit: 'Hz' | 'nm'; edges: '(]' | '[)' | 'unstated';
  scope: string; sources: string[]; url: string; transcription: string; status: 'verified' | 'not-available'; bands: Band[] | null; notes: string[];
}
export interface Example { id: string; label: string; kind: 'line' | 'band' | 'blackbody-peak' | 'derived'; region: string; value: number | null; compute?: 'lyman-alpha' | 'annihilation'; unit: 'nm' | 'Hz' | 'eV' | 'K'; hi?: number; detail: string; sources: string[]; provenance: 'observed' | 'derived' }

export const CONVENTIONS = (data as unknown as { conventions: Convention[] }).conventions;
export const EXAMPLES = (data as unknown as { examples: Example[] }).examples;
export const getConvention = (id: string) => CONVENTIONS.find((c) => c.id === id);

const C = CONSTANTS.c.value;
/** Vacuum wavelength (m) → the convention's coordinate (Hz or nm). */
export const coordinate = (conv: Convention, lambdaM: number) => (conv.quantity === 'frequency' ? C / lambdaM : lambdaM * 1e9);
/** Band edges of a convention expressed as vacuum wavelengths in metres [short, long]. */
export function bandWavelengthsM(conv: Convention, b: Band): [number, number] {
  return conv.quantity === 'frequency' ? [C / b.hi, C / b.lo] : [b.lo * 1e-9, b.hi * 1e-9];
}

export interface BandHit { band: Band; onEdge: boolean }
/**
 * All bands of a convention containing a vacuum wavelength. Sub-bands may overlap (ISO 21348), so
 * several hits are normal. Edge rule: ITU '(]' lower exclusive/upper inclusive in frequency; ISO '[)'
 * lower inclusive/upper exclusive in wavelength; 'unstated' → a value exactly on an edge matches both
 * neighbouring bands and is flagged `onEdge`.
 */
export function bandsAt(conv: Convention, lambdaM: number): BandHit[] {
  if (!conv.bands) return [];
  const x = coordinate(conv, lambdaM);
  const rel = 1e-12;
  const hits: BandHit[] = [];
  for (const b of conv.bands) {
    const atLo = Math.abs(x - b.lo) <= rel * b.lo, atHi = Math.abs(x - b.hi) <= rel * b.hi;
    let inside: boolean;
    if (conv.edges === '(]') inside = (x > b.lo && !atLo) && (x < b.hi || atHi);
    else if (conv.edges === '[)') inside = (x > b.lo || atLo) && (x < b.hi && !atHi);
    else inside = (x > b.lo || atLo) && (x < b.hi || atHi);
    if (inside) hits.push({ band: b, onEdge: conv.edges === 'unstated' && (atLo || atHi) });
  }
  return hits.sort((a, b) => a.band.level - b.band.level);
}

import { peakFrequency, peakWavelength } from '@/core/physics/em/em';
import { transitionLine } from '@/modes/atomic/atoms/spectrum';
/** Hydrogen Lyman-α (n = 2 → 1) from the reduced-mass Rydberg constant; nucleus = proton (CODATA m_p/u). */
export const lymanAlphaNm = () => transitionLine(2, 1, 1, CONSTANTS.mp.value / CONSTANTS.u.value).wavelengthNm;
/** Photon energy of e⁺e⁻ annihilation at rest, E = m_e c² (eV). */
export const annihilationEV = () => (CONSTANTS.me.value * C * C) / CONSTANTS.e.value;

/** Vacuum wavelength span [λ, λ_hi] in metres of an example; derived examples are computed here, never stored. */
export function exampleWavelengthsM(ex: Example): [number, number] {
  const toM = (v: number) => (ex.unit === 'nm' ? v * 1e-9 : ex.unit === 'Hz' ? C / v : ex.unit === 'eV' ? (CONSTANTS.h.value * C) / (v * CONSTANTS.e.value) : NaN);
  if (ex.compute === 'lyman-alpha') { const l = lymanAlphaNm() * 1e-9; return [l, l]; }
  if (ex.compute === 'annihilation') { const l = toM(annihilationEV()); return [l, l]; }
  if (ex.kind === 'blackbody-peak' && ex.value !== null) {
    // per-wavelength peak for the Sun (visible), per-frequency peak for the CMB (microwave) — as labelled
    const l = ex.id === 'cmb-peak' ? C / peakFrequency(ex.value) : peakWavelength(ex.value);
    return [l, l];
  }
  const a = toM(ex.value!), b = ex.hi !== undefined ? toM(ex.hi) : a;
  return [Math.min(a, b), Math.max(a, b)];
}
