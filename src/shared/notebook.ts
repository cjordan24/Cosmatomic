/**
 * Scientific notebook: experiments persisted in IndexedDB ('experiments' store).
 * Each record keeps the INITIAL CONDITIONS and solver settings (so it can be re-run
 * reproducibly — the integrators are deterministic), the state at save time, the edit/event log,
 * diagnostics, graphs, notes, a screenshot and data sources.
 */
import { idbAll, idbDelete, idbSet } from './idb';
import type { SimState } from '@/modes/cosmic/sandbox/nbody';
import type { ViewSnapshot } from './snapshot';

/**
 * Experiment records form a discriminated union on `kind`. Records saved before Phase 4 have no
 * `kind`; migrateExperiment() assigns 'gravitational' so they keep working unchanged.
 * Only implemented experiment types are persisted (gravitational sandbox, wave laboratory) and, from Gate 8.5,
 * view snapshots of any view (src/shared/snapshot.ts).
 */
export interface Experiment {
  kind?: 'gravitational';
  id: string;
  name: string;
  mode: 'gravitational-sandbox';
  createdAt: string;
  solver: { module: string; integrator: string; dt: number; version: string };
  presetId: string;
  epochJd: number;
  provenance: 'derived' | 'hypothetical';
  initial: SimState;
  saved: SimState;
  events: string[];
  notes: string;
  observations: { simYears: number; relEnergyError: number; relAngMomError: number; bodies: number };
  graphs: { energyDrift: number[] };
  screenshot: string | null;
  dataSources: string[];
}

export type GravitationalExperiment = Experiment & { kind: 'gravitational' };

export interface WaveExperiment {
  kind: 'wave';
  id: string;
  name: string;
  mode: 'wave-lab';
  createdAt: string;
  /** model identifier, e.g. "travelling-sinusoid", "fd-string" */
  model: string;
  solver: { version: string; dt: number | null; courant: number | null };
  /** complete initial conditions / parameters (the lab URL query) — restores the run exactly */
  params: Record<string, string>;
  units: Record<string, string>;
  medium: { id: string; name: string; speed: number | null; model: string; sources: string[] };
  provenance: 'derived' | 'hypothetical';
  simulatedTime: number;
  observations: Record<string, number | null>;
  notes: string;
  screenshot: string | null;
  dataSources: string[];
  randomSeed: null;
}

export type AnyExperiment = GravitationalExperiment | WaveExperiment | ViewSnapshot;

/** Backward-compatible migration of a stored record. Unknown shapes are dropped (returned null), never guessed. */
export function migrateExperiment(raw: unknown): AnyExperiment | null {
  const r = raw as Record<string, unknown> | null;
  if (!r || typeof r.id !== 'string') return null;
  if (r.kind === 'wave' && r.mode === 'wave-lab') return r as unknown as WaveExperiment;
  if (r.kind === 'snapshot' && r.mode === 'view-snapshot' && typeof r.route === 'string') return r as unknown as ViewSnapshot;
  if ((r.kind === undefined || r.kind === 'gravitational') && r.mode === 'gravitational-sandbox') return { ...(r as unknown as Experiment), kind: 'gravitational' };
  return null;
}

export const WAVE_SOLVER_VERSION = 'VPE-waves 1.0 (analytic + explicit FD, Courant ≤ 1)';

export const SANDBOX_SOLVER_VERSION = 'VPE-gravity 1.1 (leapfrog KDK / Yoshida-4)';

export async function saveExperiment(e: Experiment | AnyExperiment) { await idbSet('experiments', e.id, e); }
export async function listAllExperiments(): Promise<AnyExperiment[]> {
  return ((await idbAll<unknown>('experiments')) ?? []).map(migrateExperiment).filter((x): x is AnyExperiment => x !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
/** Gravitational-sandbox experiments (legacy API used by the sandbox). */
export async function listExperiments(): Promise<GravitationalExperiment[]> {
  return (await listAllExperiments()).filter((x): x is GravitationalExperiment => x.kind === 'gravitational');
}
export const deleteExperiment = (id: string) => idbDelete('experiments', id);

export function experimentToCSV(e: Experiment): string {
  const head = 'section,id,name,mass_kg,radius_km,x_km,y_km,z_km,vx_km_s,vy_km_s,vz_km_s';
  const rows = (label: string, s: SimState) => s.bodies.map((b) => [label, b.id, `"${b.name}"`, b.mass, b.radius, ...b.x, ...b.v].join(','));
  const drift = e.graphs.energyDrift.map((d, i) => `energy_drift,${i},,${d}`);
  return [head, ...rows('initial', e.initial), ...rows(`saved_t=${(e.saved.t / 86400).toFixed(3)}d`, e.saved), '', 'section,sample,,relative_energy_error', ...drift].join('\n') + '\n';
}

export function download(name: string, text: string, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
