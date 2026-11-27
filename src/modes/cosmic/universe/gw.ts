/**
 * Gravitational waves (Phase 7, Gate 7.5): typed access to datasets/astronomical/gravitational-waves.json
 * for #/cosmic/gw. Physics lives in src/core/physics/gravitationalWaves.ts.
 */
import data from '@datasets/astronomical/gravitational-waves.json';
import compact from '@datasets/astronomical/compact-objects.json';
import type { Cosmology } from '@/core/physics/cosmology';

/** [median, minus, plus] with 90 % credible bounds; null = not released (unknown). */
export type Triple = [number, number, number] | null;
export interface GwEvent {
  n: string; cn?: string; v: number; r: string; gps: number;
  m1: Triple; m2: Triple; M: Triple; Mc: Triple; Mf: Triple; dL: Triple; z: Triple; chi: Triple;
  MfMax?: number; snr: number | null; far: number | null; pa: number | null;
}
export interface Release { key: string; label: string; runs: string; source: string; note: string; count: number }
interface Quote { where: string; text: string }
interface V { value: number; unit?: string; note: string }
export interface GwData {
  version: string; dataSource: string; endpoint: string; interval: string; format: string;
  releases: Release[];
  cosmology: { H0: number; Om: number; Ode: number; source: string; note: string };
  fields: Record<string, string>;
  events: GwEvent[];
  basicPhysics: {
    source: string;
    band: { lo: number; hi: number; unit: string; note: string }; inspiralBand: { lo: number; hi: number; unit: string; note: string };
    visibleDuration: V; fMax: V; chirpMass: V; chirpMassFit: V; equalMass: V; separation: V; compactness: V; hMax: V; distance: V; energy: V;
    quotes: Quote[];
  };
  gw170817: {
    grb: {
      source: string;
      delay: { value: number; sigma: number; unit: string; interval: string; note: string };
      distanceUsed: { value: number; unit: string; note: string };
      emissionLagAssumed: { value: number; unit: string; note: string };
      bounds: { lower: number; upper: number; note: string };
      relation: string; chance: { value: number; note: string }; quotes: Quote[];
    };
    siren: {
      source: string;
      distance: { value: number; minus: number; plus: number; unit: string; interval: string; note: string };
      tullyFisher: { value: number; sigma: number; unit: string; note: string };
      groupVelocity: { value: number; sigma: number; unit: string; note: string };
      bulkFlow: { value: number; sigma: number; unit: string; note: string };
      hubbleVelocity: { value: number; sigma: number; unit: string; interval: string };
      H0: { value: number; minus: number; plus: number; unit: string; interval: string; note: string };
      compared: { label: string; value: number; sigma: number; note: string }[];
      cosIota: { lo: number; hi: number; interval: string; note: string };
      quotes: Quote[];
    };
  };
  checks: string[];
}
export const GW = data as unknown as GwData;
export const EVENTS = GW.events;
export const WITH_PARAMS = EVENTS.filter((e) => e.m1 && e.m2);

/** The flat ΛCDM every catalog release used to turn d_L into z (Planck 2015 values). */
export const GWTC_COSMOLOGY: Cosmology = { name: 'GWTC (Planck 2015)', H0: GW.cosmology.H0, Om: GW.cosmology.Om, Ode: GW.cosmology.Ode, Or: 0 };

export const release = (key: string) => GW.releases.find((r) => r.key === key)!;
/** One colour per release, oldest to newest. */
export const RELEASE_COLOR: Record<string, string> = {
  'GWTC-1-confident': '#ff7a90', 'GWTC-2.1-confident': '#f5c76b', 'GWTC-3-confident': '#5cf2a6', 'GWTC-4.1': '#7df9ff', 'GWTC-5.0': '#b18cff',
};
export const eventByName = (n: string | null) => (n ? EVENTS.find((e) => e.n === n || e.cn === n) : undefined);
export const displayName = (e: GwEvent) => (e.cn ? `${e.cn} (${e.n})` : e.n);

/** UTC date encoded in the name GWYYMMDD[_hhmmss] (GWTC-3 Table I caption), as a decimal year for plotting. */
export function nameDate(n: string): { iso: string; year: number } {
  const m = n.match(/^GW(\d\d)(\d\d)(\d\d)(?:_(\d\d)(\d\d)(\d\d))?/);
  if (!m) throw new Error(`bad event name ${n}`);
  const [y, mo, d] = [2000 + Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d, Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
  const y0 = Date.UTC(y, 0, 1), y1 = Date.UTC(y + 1, 0, 1);
  return { iso: new Date(ms).toISOString().slice(0, m[4] ? 19 : 10).replace('T', ' '), year: y + (ms - y0) / (y1 - y0) };
}

/** Format a triple as "34.6 +4.4 / −2.6"; unknown when absent. */
export function fmtTriple(t: Triple, unit = ''): string {
  if (!t) return 'unknown';
  const u = unit ? ` ${unit}` : '';
  return `${t[0]} +${t[2]} / −${t[1]}${u}`;
}

/** The original GW150914 announcement values (PRL Table I), already bundled as a compact-object record. */
interface CompactMeasurement { quantity: string; value: [number, number, number]; unit: string; interval: string; source: string }
const gwRemnant = (compact as unknown as { objects: { id: string; mass: [number, number, number]; massSource: string; measurements: CompactMeasurement[] }[] }).objects.find((o) => o.id === 'gw150914-final')!;
const meas = (q: string) => gwRemnant.measurements.find((m) => m.quantity.startsWith(q))!.value;
export const GW150914_2016 = {
  source: gwRemnant.massSource,
  m1: meas('primary') as Triple, m2: meas('secondary') as Triple, Mf: gwRemnant.mass as Triple, dL: meas('luminosity distance') as Triple, Erad: meas('energy radiated') as Triple,
};

/** Median radiated energy estimated as M − M_f (M☉c²), from medians (approximate). */
export const radiatedFromMedians = (e: GwEvent) => (e.M && e.Mf ? e.M[0] - e.Mf[0] : null);
/** Detections per release in name-date order: cumulative count curve. */
export const cumulative = () => EVENTS.map((e, i) => ({ year: nameDate(e.n).year, count: i + 1, r: e.r }));
