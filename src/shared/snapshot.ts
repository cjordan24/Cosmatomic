/**
 * Unified notebook (Phase 8, Gate 8.5) — pure functions, no DOM.
 *
 * A *view snapshot* records any view as it stands: its route and parameters (enough to reopen it), the view
 * title, every readout shown (label + displayed value with its unit), the provenance classes and cited source
 * ids on screen, the samples of any live recorder (time series), notes, a screenshot and the app version and
 * commit. Older experiment records (gravitational sandbox, wave lab) are read through `unify`, so every
 * notebook entry exports the same way: JSON (the stored record), CSV (readings and series) and Markdown with
 * full citations from the Source index. Stored records are never rewritten.
 */
import type { ProvenanceClass } from '@/core/provenance/provenance';
import { seriesCSV } from '@/shared/instruments/instruments';
import type { AnyExperiment, GravitationalExperiment, WaveExperiment } from './notebook';
import type { Source } from './sources/sources';

export const SNAPSHOT_SCHEMA = 1;
export const APP = { version: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'unknown', commit: typeof __APP_COMMIT__ === 'string' ? __APP_COMMIT__ : 'unknown' };

export interface Reading { label: string; value: string }
export interface SeriesCapture { title: string; x: { name: string; unit: string }; y: { name: string; unit: string }; provenance: string; method: string; sources?: string[]; points: [number, number][] }

export interface ViewSnapshot {
  kind: 'snapshot';
  id: string;
  name: string;
  mode: 'view-snapshot';
  createdAt: string;
  schema: number;
  app: { version: string; commit: string };
  /** hash route, e.g. "#/spectral/compare?L=a.H-I&x=6.5e-7" */
  route: string;
  path: string[];
  params: Record<string, string>;
  title: string;
  provenance: ProvenanceClass[];
  /** Source-index ids cited on screen */
  sources: string[];
  readings: Reading[];
  series: SeriesCapture[];
  notes: string;
  screenshot: string | null;
}

const PROV: ProvenanceClass[] = ['observed', 'derived', 'simulated', 'illustrative', 'hypothetical'];

/** Path segments and query parameters of a hash route. */
export function parseRoute(hash: string): { path: string[]; params: Record<string, string> } {
  const h = hash.replace(/^#\/?/, '');
  const [p, q = ''] = h.split('?');
  return { path: p.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(q)) };
}

/** Build a snapshot record from what was captured on screen. Readings and sources are de-duplicated, order kept. */
export function makeSnapshot(c: { route: string; title: string; provenance: string[]; sources: string[]; readings: Reading[]; series: SeriesCapture[]; screenshot: string | null }, name: string, notes: string, now = new Date()): ViewSnapshot {
  const { path, params } = parseRoute(c.route);
  const seen = new Set<string>();
  const readings = c.readings.filter((r) => { const k = `${r.label}\u0000${r.value}`; if (!r.label || seen.has(k)) return false; seen.add(k); return true; });
  return {
    kind: 'snapshot', id: `snap-${now.getTime().toString(36)}`, name: name.trim() || `${c.title || path.join(' / ') || 'View'} · ${now.toISOString().slice(0, 16).replace('T', ' ')}`,
    mode: 'view-snapshot', createdAt: now.toISOString(), schema: SNAPSHOT_SCHEMA, app: { ...APP },
    route: c.route.startsWith('#') ? c.route : `#${c.route}`, path, params, title: c.title,
    provenance: PROV.filter((p) => c.provenance.map((x) => x.toLowerCase()).includes(p)),
    sources: [...new Set(c.sources)], readings, series: c.series, notes, screenshot: c.screenshot,
  };
}

// ---------------------------------------------------------------- one shape for every notebook entry
export interface Unified {
  id: string; name: string; kind: 'snapshot' | 'gravitational' | 'wave'; createdAt: string;
  route: string; provenance: string[]; sourceIds: string[]; sourceNotes: string[];
  readings: Reading[]; series: SeriesCapture[]; notes: string; app: { version: string; commit: string } | null; model: string | null;
}

/** Read any stored record (snapshot or older experiment) in the common shape. Nothing is stored back. */
export function unify(e: AnyExperiment): Unified {
  if (e.kind === 'snapshot') return { id: e.id, name: e.name, kind: 'snapshot', createdAt: e.createdAt, route: e.route, provenance: e.provenance, sourceIds: e.sources, sourceNotes: [], readings: e.readings, series: e.series, notes: e.notes, app: e.app, model: null };
  if (e.kind === 'wave') return unifyWave(e);
  return unifyGrav(e);
}
function unifyGrav(e: GravitationalExperiment): Unified {
  return {
    id: e.id, name: e.name, kind: 'gravitational', createdAt: e.createdAt, route: `#/cosmic/sandbox?exp=${e.id}`, provenance: [e.provenance],
    sourceIds: [], sourceNotes: e.dataSources,
    readings: [
      { label: 'preset', value: e.presetId }, { label: 'epoch (JD)', value: String(e.epochJd) }, { label: 'integrator', value: `${e.solver.integrator}, dt = ${e.solver.dt} s` },
      { label: 'simulated time', value: `${e.observations.simYears} yr` }, { label: 'bodies', value: String(e.observations.bodies) },
      { label: 'relative energy error ΔE/E₀', value: String(e.observations.relEnergyError) }, { label: 'relative angular-momentum error', value: String(e.observations.relAngMomError) },
    ],
    series: [{ title: 'Relative energy error ΔE/E₀ (per recorded step)', x: { name: 'sample', unit: '' }, y: { name: 'ΔE/E₀', unit: '' }, provenance: e.provenance, method: `${e.solver.integrator}, dt = ${e.solver.dt} s`, points: e.graphs.energyDrift.map((d, i) => [i, d]) }],
    notes: e.notes, app: null, model: e.solver.version,
  };
}
function unifyWave(e: WaveExperiment): Unified {
  return {
    id: e.id, name: e.name, kind: 'wave', createdAt: e.createdAt, route: `#/spectral/lab?${new URLSearchParams(e.params).toString()}`, provenance: [e.provenance],
    sourceIds: [], sourceNotes: [...e.dataSources, ...e.medium.sources],
    readings: [
      { label: 'model', value: e.model }, { label: 'medium', value: `${e.medium.name} (${e.medium.model})` }, { label: 'wave speed', value: e.medium.speed === null ? 'unknown' : `${e.medium.speed} m/s` },
      { label: 'simulated time', value: `${e.simulatedTime} s` },
      ...Object.entries(e.observations).map(([k, v]) => ({ label: k, value: v === null ? 'unknown' : `${v}${e.units[k] ? ` ${e.units[k]}` : ''}` })),
    ],
    series: [], notes: e.notes, app: null, model: e.solver.version,
  };
}

// ---------------------------------------------------------------- exports
const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
/** CSV: commented header (name, route, time, version, provenance, sources), the readings, then each series. */
export function entryCSV(u: Unified): string {
  const out = [`# ${u.name}`, `# route: ${u.route}`, `# saved: ${u.createdAt}`, `# app: ${u.app ? `${u.app.version} (${u.app.commit})` : 'not recorded (saved before Gate 8.5)'}`, `# provenance: ${u.provenance.join(', ') || 'none shown'}`,
    ...(u.sourceIds.length ? [`# sources: ${u.sourceIds.join('; ')}`] : []), ...(u.sourceNotes.length ? [`# data sources: ${u.sourceNotes.join('; ')}`] : []),
    'reading,value', ...u.readings.map((r) => `${csvCell(r.label)},${csvCell(r.value)}`)];
  for (const s of u.series) out.push('', seriesCSV(s, s.points).trimEnd());
  return out.join('\n') + '\n';
}

/** Full citation line for a Source-index entry. */
export const citeSource = (s: Source) => `${s.citation}${s.doi ? ` https://doi.org/${s.doi}` : ` ${s.url}`}${s.license ? ` (licence: ${s.license})` : ''}`;
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Markdown report with readings, series summary, notes and numbered citations. `lookup` resolves source ids. */
export function entryMarkdown(u: Unified, lookup: (id: string) => Source | undefined, base = 'https://voyager-ventures.vercel.app/'): string {
  const lines = [`# ${u.name}`, '',
    `- **View:** [${u.route}](${base}${u.route})`, `- **Saved:** ${u.createdAt}`,
    `- **Voyager version:** ${u.app ? `${u.app.version} (commit ${u.app.commit})` : 'not recorded (saved before Gate 8.5)'}${u.model ? ` · solver ${u.model}` : ''}`,
    `- **Provenance shown:** ${u.provenance.join(', ') || 'none shown'}`, ''];
  if (u.readings.length) lines.push('## Readings', '', '| Quantity | Value |', '|---|---|', ...u.readings.map((r) => `| ${md(r.label)} | ${md(r.value)} |`), '');
  if (u.series.length) {
    lines.push('## Recorded series', '');
    for (const s of u.series) lines.push(`- **${s.title}**: ${s.points.length} samples of ${s.y.name}${s.y.unit ? ` (${s.y.unit})` : ''} against ${s.x.name}${s.x.unit ? ` (${s.x.unit})` : ''}; provenance ${s.provenance}; ${s.method}. Samples are in the CSV export.`);
    lines.push('');
  }
  if (u.notes.trim()) lines.push('## Notes', '', u.notes.trim(), '');
  const cites = u.sourceIds.map((id) => lookup(id)).filter((s): s is Source => !!s);
  if (cites.length || u.sourceNotes.length) {
    lines.push('## Sources', '');
    cites.forEach((s, i) => lines.push(`${i + 1}. ${citeSource(s)}`));
    u.sourceNotes.forEach((n, i) => lines.push(`${cites.length + i + 1}. ${n}`));
    lines.push('');
  }
  return lines.join('\n');
}
