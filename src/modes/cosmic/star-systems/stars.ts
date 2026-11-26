/**
 * Nearby stars — pure science module (no React, no three.js). Phase 5, Gate 5.1.
 *
 * Data: the 10 pc sample (Reylé et al. 2021, update 2023) and CNS5 within 20 pc (Golovin et al.
 * 2023), both lazy-loaded; the Mamajek / Pecaut & Mamajek (2013) dwarf sequence for spectral-type
 * calibrations. Everything below that is not a catalogue value is *derived* with a documented
 * relation, and returns null (→ "unknown") when its inputs are missing or out of its validity range.
 */
import { CONSTANTS, LIGHT_YEAR_M, PARSEC_M } from '@/core/constants/constants';
import dwarfSeq from '@datasets/astronomical/mamajek-dwarf-sequence.json';

// ------------------------------------------------------------------ types
export type ObjectType = 'star' | 'low-mass star' | 'white dwarf' | 'brown dwarf' | 'exoplanet' | 'unknown';

/** One row of the 10 pc catalogue (field names follow scripts/ingestion/nearby-stars.ts). */
export interface NearbyObject {
  seq: number; sys: number; system: string; name: string; type: ObjectType; typeUncertain: boolean;
  ra: number | null; dec: number | null; epoch: number | null;
  plx: number | null; ePlx: number | null; rPlx: string | null;
  pmra: number | null; ePmra: number | null; pmdec: number | null; ePmdec: number | null; rPm: string | null;
  rv: number | null; eRv: number | null; rRv: string | null;
  spt: string | null; rSpt: string | null; sptMethod: string | null;
  gCode: number | null; G: number | null; Gest: number | null; BP: number | null; RP: number | null;
  V: number | null; J: number | null; H: number | null; Ks: number | null;
  rSys: string | null; nPlanets: number | null;
  gaia: string | null; simbad: string | null; common: string | null; gj: string | null; hd: string | null; hip: string | null;
  comment: string | null;
}

export interface CnsStar {
  cns5: number; gj: string | null; comp: string | null; gaia: string | null; hip: string | null;
  ra: number | null; dec: number | null; epoch: number | null;
  plx: number; ePlx: number | null; rPlx: string | null; pmra: number | null; pmdec: number | null; rv: number | null;
  /** resulting G and G−RP (deblended EDR3 / uncorrected EDR3 / Hipparcos-converted, see fGRP) */
  G: number | null; eG: number | null; GRP: number | null; eGRP: number | null; fGRP: 0 | 1 | 2 | null;
}

// ------------------------------------------------------------------ loading
let tenPromise: Promise<NearbyObject[]> | null = null;
let cnsPromise: Promise<CnsStar[]> | null = null;
export function loadTenParsec(): Promise<NearbyObject[]> {
  tenPromise ??= import('@datasets/astronomical/nearby-stars-10pc.json').then((m) => ((m.default ?? m) as unknown as { objects: NearbyObject[] }).objects);
  return tenPromise;
}
export function loadCns5(): Promise<CnsStar[]> {
  cnsPromise ??= import('@datasets/astronomical/cns5-20pc.json').then((m) => {
    const d = (m.default ?? m) as unknown as { fields: string[]; rows: unknown[][] };
    return d.rows.map((r) => Object.fromEntries(d.fields.map((f, i) => [f, r[i]])) as unknown as CnsStar);
  });
  return cnsPromise;
}

// ------------------------------------------------------------------ astrometry
/** 1 au per Julian year in km/s: converts (mas/yr)/(mas) to km/s (exact from IAU au and the Julian year). */
export const KAPPA_KMS = CONSTANTS.au.value / 1000 / CONSTANTS.julianYear.value;
export const PC_IN_LY = PARSEC_M / LIGHT_YEAR_M;

/** Distance from parallax, d = 1/ϖ. Reliable only while σϖ/ϖ is small (all < 0.1 here; see validity). */
export const distancePc = (plxMas: number | null) => (plxMas && plxMas > 0 ? 1000 / plxMas : null);
/** 1σ distance interval from the parallax interval [ϖ+σ, ϖ−σ] (asymmetric). */
export function distanceRangePc(plx: number | null, ePlx: number | null): [number, number] | null {
  if (!plx || ePlx === null || ePlx >= plx) return null;
  return [1000 / (plx + ePlx), 1000 / (plx - ePlx)];
}
/** Absolute magnitude M = m + 5 log10(ϖ / 100 mas), i.e. the magnitude at 10 pc (no extinction). */
export const absoluteMag = (m: number | null, plxMas: number | null) => (m === null || !plxMas || plxMas <= 0 ? null : m + 5 * Math.log10(plxMas / 100));
/** Total proper motion (mas/yr); pmra is μ_α* = μ_α cos δ as in both catalogues. */
export const totalPm = (pmra: number | null, pmdec: number | null) => (pmra === null || pmdec === null ? null : Math.hypot(pmra, pmdec));
/** Tangential velocity v_t = κ μ / ϖ (km/s). */
export const tangentialVelocity = (pmTotal: number | null, plxMas: number | null) => (pmTotal === null || !plxMas || plxMas <= 0 ? null : (KAPPA_KMS * pmTotal) / plxMas);
/** Heliocentric space speed √(v_t² + v_r²), only when the radial velocity is known. */
export const spaceVelocity = (vt: number | null, rv: number | null) => (vt === null || rv === null ? null : Math.hypot(vt, rv));

export type Vec3 = [number, number, number];
const D2R = Math.PI / 180;
/** ICRS unit vector × distance (x → α=0,δ=0; z → north celestial pole). */
export function icrsCartesian(raDeg: number, decDeg: number, d: number): Vec3 {
  const a = raDeg * D2R, b = decDeg * D2R;
  return [d * Math.cos(b) * Math.cos(a), d * Math.cos(b) * Math.sin(a), d * Math.sin(b)];
}
/**
 * Hipparcos equatorial → galactic rotation matrix N_Hip (ESA 1997 Vol. 1 §1.5.3, as quoted by
 * Liu, Zhu & Zhang 2011, A&A 526, A16): r_gal = N · r_icrs. x_gal points to the Galactic centre
 * (l = 0, b = 0), z_gal to the north Galactic pole.
 */
export const N_HIP: [Vec3, Vec3, Vec3] = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [+0.4941094279, -0.4448296300, +0.7469822445],
  [-0.8676661490, -0.1980763734, +0.4559837762],
];
export const icrsToGalactic = (v: Vec3): Vec3 => N_HIP.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]) as Vec3;
export function galacticLB(v: Vec3): { l: number; b: number } {
  const g = icrsToGalactic(v);
  const r = Math.hypot(...g) || 1;
  return { l: ((Math.atan2(g[1], g[0]) / D2R) + 360) % 360, b: Math.asin(g[2] / r) / D2R };
}

// ------------------------------------------------------------------ spectral types
const CLASSES = 'OBAFGKMLTY';
export interface ParsedSpt {
  raw: string;
  kind: 'mk' | 'white-dwarf' | 'unparsed';
  cls: string | null;          // O … Y, or the white-dwarf class letters (DA, DQ …)
  sub: number | null;          // numeric subtype
  subdwarf: boolean;           // "sd" prefix (metal-poor, below the main sequence)
  limit: boolean;              // ">" / ">=" (only a bound is known)
  uncertain: boolean;          // "?" in the type
  peculiar: boolean;           // "pec"
  emission: boolean;           // trailing "e" (emission lines)
}
export function parseSpectralType(raw: string | null): ParsedSpt | null {
  if (!raw) return null;
  const s = raw.trim();
  const base = { raw: s, subdwarf: false, limit: /^>/.test(s), uncertain: s.includes('?'), peculiar: /pec/i.test(s), emission: false };
  const wd = s.match(/^(D[ABCOQZXAH]*)(\d+(?:\.\d+)?)?/);
  if (wd) return { ...base, kind: 'white-dwarf', cls: wd[1], sub: wd[2] ? Number(wd[2]) : null };
  const m = s.replace(/^>=?\s*/, '').match(/^(sd)?([OBAFGKMLTY])\s*(\d+(?:\.\d+)?)?(e)?/);
  if (!m) return { ...base, kind: 'unparsed', cls: null, sub: null };
  return { ...base, kind: 'mk', cls: m[2], sub: m[3] !== undefined ? Number(m[3]) : null, subdwarf: !!m[1], emission: !!m[4] };
}
/** Continuous subtype coordinate: O0 = 0, B0 = 10 … Y0 = 90. */
export const sptIndex = (cls: string, sub: number) => CLASSES.indexOf(cls) * 10 + sub;

export interface DwarfRow { spt: string; Teff: number | null; logL: number | null; R: number | null; Mv: number | null; BpRp: number | null; GRp: number | null; MG: number | null; Msun: number | null; preliminary: string[] }
export const DWARF_SEQUENCE: (DwarfRow & { index: number })[] = (dwarfSeq as unknown as { rows: DwarfRow[] }).rows
  .map((r) => { const p = parseSpectralType(r.spt.replace(/V$/, '')); return { ...r, index: p?.cls && p.sub !== null ? sptIndex(p.cls, p.sub) : NaN }; })
  .filter((r) => Number.isFinite(r.index))
  .sort((a, b) => a.index - b.index);
export const DWARF_SEQUENCE_VERSION = (dwarfSeq as unknown as { version: string }).version;

export type CalibKey = 'Teff' | 'logL' | 'R' | 'MG' | 'BpRp' | 'GRp' | 'Msun';
export interface Calibration { values: Record<CalibKey, number | null>; exact: boolean; between: [string, string] | null; caveats: string[] }
/**
 * Mean dwarf (class V) parameters for a spectral type, linearly interpolated in subtype between the
 * two neighbouring rows of the sequence. Returns null when the type cannot be calibrated this way:
 * white dwarfs, subdwarfs, bounds (">Y0"), types without a subtype, or outside the table. The
 * catalogue gives no luminosity class, so every result is labelled as assuming class V.
 */
export function calibrateDwarf(spt: ParsedSpt | null): Calibration | null {
  if (!spt || spt.kind !== 'mk' || spt.subdwarf || spt.limit || spt.cls === null || spt.sub === null) return null;
  const x = sptIndex(spt.cls, spt.sub);
  const seq = DWARF_SEQUENCE;
  if (x < seq[0].index || x > seq[seq.length - 1].index) return null;
  const i = seq.findIndex((r) => r.index >= x);
  const exact = seq[i].index === x;
  const lo = exact ? seq[i] : seq[i - 1], hi = seq[i];
  const t = exact ? 0 : (x - lo.index) / (hi.index - lo.index);
  const keys: CalibKey[] = ['Teff', 'logL', 'R', 'MG', 'BpRp', 'GRp', 'Msun'];
  const values = Object.fromEntries(keys.map((k) => {
    const a = lo[k], b = hi[k];
    return [k, a === null || b === null ? null : a + (b - a) * t];
  })) as Record<CalibKey, number | null>;
  const caveats = ['Mean value for a class V (dwarf) star of this spectral type; the catalogue gives no luminosity class, so subgiants and giants are mis-calibrated.'];
  if (spt.uncertain) caveats.push('The spectral type itself is marked uncertain (“?”).');
  if (spt.peculiar) caveats.push('Peculiar spectrum (“pec”): mean dwarf values may not apply.');
  const prelim = [...new Set([...lo.preliminary, ...hi.preliminary])];
  if (prelim.length) caveats.push(`Very preliminary per the table’s author: ${prelim.join(', ')}.`);
  return { values, exact, between: exact ? null : [lo.spt, hi.spt], caveats };
}

// ------------------------------------------------------------------ display (illustrative)
/** Display colour from a temperature (K): a hand-chosen ramp, Illustrative — not a computed stellar colour. */
export function displayColor(teff: number | null, type: ObjectType): [number, number, number] {
  if (type === 'white dwarf') return [0.75, 0.85, 1];
  if (type === 'exoplanet') return [0.55, 1, 0.75];
  if (teff === null) return type === 'brown dwarf' ? [0.7, 0.35, 0.45] : [0.6, 0.6, 0.65];
  const stops: [number, [number, number, number]][] = [[500, [0.45, 0.2, 0.35]], [2400, [0.85, 0.3, 0.25]], [3500, [1, 0.55, 0.35]], [5000, [1, 0.8, 0.55]], [5800, [1, 0.95, 0.85]], [7500, [0.95, 0.97, 1]], [10000, [0.7, 0.8, 1]], [30000, [0.55, 0.65, 1]]];
  if (teff <= stops[0][0]) return stops[0][1];
  for (let k = 1; k < stops.length; k++) if (teff <= stops[k][0]) {
    const [t0, c0] = stops[k - 1], [t1, c1] = stops[k];
    const f = (teff - t0) / (t1 - t0);
    return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
  }
  return stops[stops.length - 1][1];
}

/** NASA ADS link for a bibcode (catalogue per-value references). */
export const adsUrl = (bibcode: string) => `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(bibcode)}/abstract`;
/** True when the reference string is a bibcode (19 characters, starts with a year). */
export const isBibcode = (s: string | null): s is string => !!s && /^\d{4}[A-Za-z&.]/.test(s) && s.length === 19;

// ------------------------------------------------------------------ cross-match
const hipNumber = (s: string | null) => (s ? String(Number(s.replace(/^HIP\s*/, '').replace(/[A-Z]+$/, ''))) : null);
/** Component letter(s) at the end of a GJ designation ("GJ 559 A" → "A"). */
const gjComponent = (s: string | null) => s?.match(/\s([A-Z][a-z]?)$/)?.[1] ?? null;
/**
 * Match 10 pc objects to CNS5 rows: Gaia DR3/EDR3 source id first, then Hipparcos number. A
 * Hipparcos match is refused when CNS5 lists a combined entry (e.g. "AB") for a single component,
 * so a component never inherits the photometry of an unresolved pair.
 */
export function crossMatch(ten: NearbyObject[], cns: CnsStar[]): Map<number, CnsStar> {
  const byGaia = new Map(cns.filter((c) => c.gaia).map((c) => [c.gaia!, c]));
  const byHip = new Map(cns.filter((c) => c.hip).map((c) => [hipNumber(c.hip)!, c]));
  const out = new Map<number, CnsStar>();
  for (const o of ten) {
    if (o.type === 'exoplanet') continue;
    let c = o.gaia ? byGaia.get(o.gaia) : undefined;
    if (!c && o.hip) {
      const h = byHip.get(hipNumber(o.hip)!);
      const comp = gjComponent(o.gj);
      if (h && !(h.comp && h.comp.length > 1 && comp && comp.length === 1)) c = h;
    }
    if (c) out.set(o.seq, c);
  }
  return out;
}
