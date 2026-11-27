/**
 * Integrated spectroscopy (Phase 8, Gate 8.3): the layer catalogue and pure functions behind
 * #/spectral/compare. No React here, so tests/science/compare.test.ts can check every number.
 *
 * Every layer is placed on one vacuum-wavelength axis λ (m) and shown in wavelength, frequency (c/λ) or
 * photon energy (hc/λ). A layer is either
 *   - OBSERVED: NIST ASD atomic lines, the COBE/FIRAS CMB spectrum, nebula emission lines identified in a
 *     cited source (placed at the NIST laboratory wavelength of the named ion), or
 *   - MODEL: Planck blackbodies at sourced temperatures, refractive index n(λ) from a cited dispersion formula.
 *
 * Continuum layers share one quantity, the radiance per logarithmic interval
 *     λB_λ = νB_ν   [W m⁻² sr⁻¹]
 * which is the same number whichever axis variable is chosen (λB_λ dλ/λ = νB_ν dν/ν), so blackbodies and
 * the FIRAS points can share one log y-axis on any of the three axes. Its peak is at
 * λ = hc/(x₄kT), x₄ = 3.920690… (x = 4(1 − e^{−x})), between the per-λ and per-ν Wien peaks.
 *
 * Redshift is a TRANSFORMATION, not data: λ_obs = λ_rest(1 + z) is applied to line layers and stellar
 * blackbodies only (never to the FIRAS sky spectrum, the CMB model or laboratory n(λ)); intensities are not
 * transformed.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { planckLambda, planckNu, wienRoot } from '@/core/physics/em/em';
import { firasIntensity, hzFromWavenumber, MJY_SR, type FirasPoint } from '@/core/physics/cmb';
import { MATERIALS, refractiveIndex, type Material } from '@/modes/atomic/materials/materials';
import { DWARF_SEQUENCE } from '@/modes/cosmic/star-systems/stars';
import { NIST_SPECTRA, spectrumId } from '@/shared/scientific-relationships/registry';
import { isForbidden, type NistLine, type NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import nebulaData from '@datasets/astronomical/nebulae.json';

const c = CONSTANTS.c.value, h = CONSTANTS.h.value, e = CONSTANTS.e.value, kB = CONSTANTS.kB.value;

// ---------------------------------------------------------------- axis
export type AxisKind = 'wavelength' | 'frequency' | 'energy';
/** Bounds of the comparison axis, log₁₀ of the vacuum wavelength in metres (10 nm … 10 cm). */
export const LOG_LAMBDA_MIN = -8, LOG_LAMBDA_MAX = -1;
export const DEFAULT_RANGE: [number, number] = [-7.3, -1.5];
export const RANGE_PRESETS: { id: string; label: string; lo: number; hi: number }[] = [
  { id: 'full', label: 'Full: 10 nm – 10 cm', lo: -8, hi: -1 },
  { id: 'sun-cmb', label: 'Sun to CMB: 50 nm – 3 cm', lo: -7.3, hi: -1.5 },
  { id: 'uv-ir', label: 'UV – near IR: 100 nm – 5 µm', lo: -7, hi: Math.log10(5e-6) },
  { id: 'nist', label: 'NIST line range: 200 – 1000 nm', lo: Math.log10(200e-9), hi: -6 },
  { id: 'optical', label: 'Visible: 380 – 750 nm', lo: Math.log10(380e-9), hi: Math.log10(750e-9) },
  { id: 'microwave', label: 'FIRAS band: 0.4 – 5 mm', lo: Math.log10(4e-4), hi: Math.log10(5e-3) },
];

/** Value of the axis quantity at a vacuum wavelength: λ in m, f in Hz, E in eV. */
export function axisValue(kind: AxisKind, lambda: number): number {
  return kind === 'wavelength' ? lambda : kind === 'frequency' ? c / lambda : (h * c) / (lambda * e);
}
/** Vacuum wavelength (m) of an axis value. The map is its own inverse up to the constant. */
export function lambdaOfAxis(kind: AxisKind, v: number): number {
  return kind === 'wavelength' ? v : kind === 'frequency' ? c / v : (h * c) / (v * e);
}
/** Position 0…1 along the drawn axis. Frequency and energy grow to the right, so λ decreases to the right. */
export function axisPosition(kind: AxisKind, lambda: number, lo: number, hi: number): number {
  const p = (Math.log10(lambda) - lo) / (hi - lo);
  return kind === 'wavelength' ? p : 1 - p;
}
export function lambdaAtPosition(kind: AxisKind, p: number, lo: number, hi: number): number {
  return 10 ** (lo + (kind === 'wavelength' ? p : 1 - p) * (hi - lo));
}
/** Decade ticks of the displayed quantity inside the range, returned as wavelengths. */
export function decadeTicks(kind: AxisKind, lo: number, hi: number): { lambda: number; value: number }[] {
  const a = axisValue(kind, 10 ** lo), b = axisValue(kind, 10 ** hi);
  const [vmin, vmax] = a < b ? [a, b] : [b, a];
  const out: { lambda: number; value: number }[] = [];
  for (let k = Math.ceil(Math.log10(vmin) - 1e-9); k <= Math.floor(Math.log10(vmax) + 1e-9); k++) out.push({ value: 10 ** k, lambda: lambdaOfAxis(kind, 10 ** k) });
  return out;
}

const PREFIXES: Record<AxisKind, { u: string; s: number }[]> = {
  wavelength: [{ u: 'pm', s: 1e-12 }, { u: 'nm', s: 1e-9 }, { u: 'µm', s: 1e-6 }, { u: 'mm', s: 1e-3 }, { u: 'cm', s: 1e-2 }, { u: 'm', s: 1 }],
  frequency: [{ u: 'Hz', s: 1 }, { u: 'kHz', s: 1e3 }, { u: 'MHz', s: 1e6 }, { u: 'GHz', s: 1e9 }, { u: 'THz', s: 1e12 }, { u: 'PHz', s: 1e15 }, { u: 'EHz', s: 1e18 }],
  energy: [{ u: 'µeV', s: 1e-6 }, { u: 'meV', s: 1e-3 }, { u: 'eV', s: 1 }, { u: 'keV', s: 1e3 }],
};
/** "656.47 nm", "456.68 THz", "1.8887 eV": the unit that puts the number in [1, 1000). */
export function formatAxis(kind: AxisKind, v: number, sig = 5): string {
  const us = PREFIXES[kind];
  let best = us[0];
  for (const u of us) if (v / u.s >= 1 - 1e-9) best = u;
  return `${Number((v / best.s).toPrecision(sig))} ${best.u}`;
}
export const AXIS_LABEL: Record<AxisKind, string> = { wavelength: 'vacuum wavelength λ', frequency: 'frequency ν = c/λ', energy: 'photon energy E = hc/λ' };

// ---------------------------------------------------------------- physics
/** λ_obs = λ_rest(1 + z). */
export const redshifted = (lambdaRest: number, z: number) => lambdaRest * (1 + z);
/** Radiance per logarithmic interval of an ideal blackbody, λB_λ (W m⁻² sr⁻¹). */
export const blackbodyPerLog = (lambda: number, T: number) => lambda * planckLambda(lambda, T);
/** The same quantity from the frequency form, νB_ν; equal to λB_λ at ν = c/λ. */
export const blackbodyPerLogNu = (nu: number, T: number) => nu * planckNu(nu, T);
/** Wavelength of the λB_λ peak: hc/(x₄kT), x₄ the root of x = 4(1 − e^{−x}). */
export const perLogPeakWavelength = (T: number) => (h * c) / (wienRoot(4) * kB * T);

/** FIRAS point → wavelength (m), νI_ν and its 1σ (W m⁻² sr⁻¹). Intensity = published residual + reference blackbody. */
export function firasPerLog(p: FirasPoint, Tref: number): { lambda: number; nu: number; y: number; sigma: number } {
  const nu = hzFromWavenumber(p.nu);
  return { lambda: 1 / (100 * p.nu), nu, y: nu * firasIntensity(p, Tref) * MJY_SR, sigma: nu * (p.sigma / 1000) * MJY_SR };
}

/** Log-spaced samples of λB_λ between two wavelengths (rest frame), dropping zeros from exp-underflow. */
export function sampleBlackbody(T: number, lambdaLo: number, lambdaHi: number, n = 320): [number, number][] {
  const out: [number, number][] = [];
  const a = Math.log10(lambdaLo), b = Math.log10(lambdaHi);
  for (let i = 0; i < n; i++) {
    const l = 10 ** (a + ((b - a) * i) / (n - 1));
    const y = blackbodyPerLog(l, T);
    if (y > 0 && Number.isFinite(y)) out.push([l, y]);
  }
  return out;
}

/** Wavelength (nm) quoted in a nebula line label such as "Hα 656 nm" or "[O III] 501 nm". */
export function labelNm(label: string): number | null {
  const m = /(\d+(?:\.\d+)?)\s*nm/.exec(label);
  return m ? Number(m[1]) : null;
}
/**
 * The NIST line a nebula label refers to: lines of the named ion within ±1 nm of the quoted wavelength,
 * forbidden ones only when the label is bracketed ([N II]); the highest NIST relative intensity wins, and
 * when no candidate has one, the largest transition probability A.
 */
export function matchNebulaLine(lines: NistLine[], label: string): NistLine | null {
  const nm = labelNm(label);
  if (nm === null) return null;
  const forbidden = label.trim().startsWith('[');
  const cands = lines.filter((l) => Math.abs(l.wl - nm) <= 1 && isForbidden(l) === forbidden);
  if (!cands.length) return null;
  const withI = cands.filter((l) => l.intensity !== null && l.intensity > 0);
  const pool = withI.length ? withI : cands;
  return pool.reduce((best, l) => (withI.length ? (l.intensity ?? 0) > (best.intensity ?? 0) : (l.A ?? 0) > (best.A ?? 0)) ? l : best);
}

/** n(λ) samples inside the formula's stated range only (null outside, never extrapolated). */
export function sampleIndex(m: Material, lambdaLo: number, lambdaHi: number, n = 200): [number, number][] {
  const ri = m.refractiveIndex;
  if (!ri?.rangeUm) return [];
  const lo = Math.max(lambdaLo, ri.rangeUm[0] * 1e-6), hi = Math.min(lambdaHi, ri.rangeUm[1] * 1e-6);
  if (!(hi > lo)) return [];
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const l = 10 ** (Math.log10(lo) + ((Math.log10(hi) - Math.log10(lo)) * i) / (n - 1));
    const v = refractiveIndex(ri, l * 1e6);
    if (v !== null && Number.isFinite(v)) out.push([l, v]);
  }
  return out;
}

// ---------------------------------------------------------------- catalogue
export type LayerGroup = 'atomic' | 'nebula' | 'blackbody' | 'cmb' | 'index';
export type Nature = 'observed' | 'model';
export interface LayerDef {
  /** URL token, e.g. "a.H-I", "neb.ring", "bb.sun", "bb.G2V", "bb.cmb", "firas", "n.water" */
  id: string;
  group: LayerGroup;
  label: string;
  nature: Nature;
  provenance: ProvenanceClass;
  /** source-index ids */
  sources: string[];
  /** registry entity this layer stands for, when there is one */
  entity: string | null;
  /** the (1 + z) transformation applies to it */
  shiftable: boolean;
  /** temperature of a blackbody layer (K) */
  T?: number;
  note: string;
}

export interface NebulaRecord { id: string; name: string; lines: { spectrum: string; label: string; context: string; source: string }[] }
export const NEBULAE = (nebulaData as unknown as { nebulae: NebulaRecord[] }).nebulae;

/** IAU 2015 Resolution B3 nominal solar effective temperature (K). */
export const T_SUN_NOMINAL = 5772;

function dwarfLayers(): LayerDef[] {
  return DWARF_SEQUENCE.filter((r) => r.Teff !== null).map((r) => ({
    id: `bb.${r.spt}`, group: 'blackbody' as const, label: `${r.spt} star, ${r.Teff} K blackbody`, nature: 'model' as const, provenance: 'derived' as const,
    sources: ['pecaut-mamajek-2013', 'codata-2018'], entity: null, shiftable: true, T: r.Teff!,
    note: `Planck’s law at the mean T_eff of a ${r.spt} dwarf (Pecaut & Mamajek dwarf sequence). It models the continuum only: real ${r.spt[0]}-type spectra carry absorption lines${r.spt[0] === 'M' ? ' and molecular bands' : ''}.`,
  }));
}

export function catalogue(cmbT0: number, cmbSource: string): LayerDef[] {
  const out: LayerDef[] = [];
  for (const spec of NIST_SPECTRA) out.push({
    id: `a.${spec.replace(' ', '-')}`, group: 'atomic', label: `${spec} lines (NIST ASD)`, nature: 'observed', provenance: 'observed',
    sources: ['nist-asd'], entity: spectrumId(spec), shiftable: true,
    note: 'Vacuum wavelengths, 200–1000 nm, from the NIST Atomic Spectra Database. Ritz wavelengths are computed by NIST from measured energy levels. Relative intensities are not comparable between spectra.',
  });
  for (const n of NEBULAE.filter((x) => x.lines.length)) out.push({
    id: `neb.${n.id}`, group: 'nebula', label: `${n.name}: emission lines`, nature: 'observed', provenance: 'observed',
    sources: [...new Set([...n.lines.map((l) => l.source), 'nist-asd'])], entity: `nebula:${n.id}`, shiftable: true,
    note: 'Lines named in the cited source, drawn at the NIST laboratory (rest) wavelength of that ion. The nebula’s own radial velocity is not applied, and line strengths are not bundled, so all bars have the same height.',
  });
  out.push({
    id: 'bb.sun', group: 'blackbody', label: `Sun, ${T_SUN_NOMINAL} K blackbody`, nature: 'model', provenance: 'derived', sources: ['iau-2015-b3', 'codata-2018'],
    entity: 'spectrum:blackbody-5772', shiftable: true, T: T_SUN_NOMINAL,
    note: 'Planck’s law at the IAU 2015 nominal solar effective temperature. The observed solar spectrum has absorption lines and departs from a single blackbody; no observed solar spectrum is bundled.',
  });
  out.push(...dwarfLayers());
  out.push({
    id: 'bb.cmb', group: 'blackbody', label: `CMB, ${cmbT0} K blackbody`, nature: 'model', provenance: 'derived', sources: [cmbSource, 'codata-2018'],
    entity: 'context:cmb', shiftable: false, T: cmbT0,
    note: 'Planck’s law at today’s CMB temperature T₀. Not redshifted: T₀ is already measured at z = 0.',
  });
  out.push({
    id: 'firas', group: 'cmb', label: 'CMB spectrum, COBE/FIRAS', nature: 'observed', provenance: 'observed', sources: ['fixsen-1996', 'lambda-firas'],
    entity: 'context:cmb', shiftable: false,
    note: 'The 43 FIRAS monopole points (Fixsen et al. 1996, Table 4): the published residual added to the 2.725 K reference blackbody, as in the NASA LAMBDA file. Error bars are 1σ, far smaller than the dots. Not redshifted: it is today’s sky.',
  });
  for (const m of MATERIALS.filter((x) => x.refractiveIndex)) out.push({
    id: `n.${m.id}`, group: 'index', label: `n(λ) of ${m.name}`, nature: 'model', provenance: 'derived', sources: m.refractiveIndex!.sources,
    entity: `spectrum:n-${m.id}`, shiftable: false,
    note: `${m.refractiveIndex!.label}: dispersion formula fitted to measurements, valid ${m.refractiveIndex!.rangeUm?.join('–')} µm and drawn only there. ${m.refractiveIndex!.references.split('.')[0]}.`,
  });
  return out;
}

/** Spectra the plan names that are not bundled, shown as unavailable rather than invented. */
export const NOT_BUNDLED: { label: string; why: string }[] = [
  { label: 'Molecular infrared spectra', why: 'No vibrational or IR absorption data is bundled for the molecule library (geometry and PubChem descriptors only).' },
  { label: 'Molecular bands of cool stars (TiO, VO)', why: 'No molecular band data is bundled; M-type layers are blackbody continua only.' },
  { label: 'Observed solar spectrum', why: 'No measured solar irradiance spectrum is bundled; the Sun is shown as a blackbody model.' },
];

export const DEFAULT_LAYERS = ['a.H-I', 'bb.sun', 'bb.cmb', 'firas'];

/** Parse the URL list, keeping known ids only, in order, without duplicates. */
export function parseLayers(raw: string | null, known: Set<string>): string[] {
  if (raw === null) return DEFAULT_LAYERS.filter((x) => known.has(x));
  return [...new Set(raw.split(',').map((s) => s.trim()).filter((s) => known.has(s)))];
}
export const serializeLayers = (ids: string[]) => ids.join(',');

/** Lines of an atomic spectrum layer as [λ rest (m), relative strength 0…1]. */
export function atomicBars(nist: NistSpectra, spec: string): { lambda: number; s: number; line: NistLine }[] {
  const lines = nist.spectra[spec]?.lines ?? [];
  return lines.map((l) => ({ lambda: l.wl * 1e-9, s: l.intensity && l.intensity > 0 ? Math.min(1, Math.max(0.12, Math.log10(l.intensity) / 5)) : 0.12, line: l }));
}
/** Lines of a nebula layer at their NIST rest wavelengths; labels without a NIST match are reported, not placed. */
export function nebulaBars(nist: NistSpectra, nebulaId: string): { placed: { lambda: number; label: string; spectrum: string; context: string; source: string; line: NistLine }[]; unmatched: string[] } {
  const n = NEBULAE.find((x) => x.id === nebulaId);
  const placed: { lambda: number; label: string; spectrum: string; context: string; source: string; line: NistLine }[] = [];
  const unmatched: string[] = [];
  for (const l of n?.lines ?? []) {
    const hit = matchNebulaLine(nist.spectra[l.spectrum]?.lines ?? [], l.label);
    if (hit) placed.push({ lambda: hit.wl * 1e-9, label: l.label, spectrum: l.spectrum, context: l.context, source: l.source, line: hit });
    else unmatched.push(l.label);
  }
  return { placed, unmatched };
}
