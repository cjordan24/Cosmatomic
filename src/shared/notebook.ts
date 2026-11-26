/**
 * Scientific notebook: experiments persisted in IndexedDB ('experiments' store).
 * Each record keeps the INITIAL CONDITIONS and solver settings (so it can be re-run
 * reproducibly — the integrators are deterministic), the state at save time, the edit/event log,
 * diagnostics, graphs, notes, a screenshot and data sources.
 */
import { idbAll, idbDelete, idbSet } from './idb';
import type { SimState } from '@/modes/cosmic/sandbox/nbody';

export interface Experiment {
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

export const SANDBOX_SOLVER_VERSION = 'VPE-gravity 1.1 (leapfrog KDK / Yoshida-4)';

export async function saveExperiment(e: Experiment) { await idbSet('experiments', e.id, e); }
export async function listExperiments(): Promise<Experiment[]> {
  return ((await idbAll<Experiment>('experiments')) ?? []).filter((x) => x && x.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
