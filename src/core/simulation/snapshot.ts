/**
 * Simulation snapshots and replay. A snapshot captures the full initial
 * conditions + solver identity so a run can be reproduced exactly.
 */
export interface SolverIdentity { module: string; solver: string; version: string }

export interface Snapshot<S> {
  id: string;
  createdAt: string;
  solver: SolverIdentity;
  seed: number;
  simTime: number;
  timeStep: number;
  state: S;
  notes?: string;
}

/** Deep, structured clone so later mutation of the live state cannot corrupt the snapshot. */
export function takeSnapshot<S>(solver: SolverIdentity, state: S, simTime: number, timeStep: number, seed: number): Snapshot<S> {
  return { id: `${solver.module}-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), solver, seed, simTime, timeStep, state: structuredClone(state) };
}

/** Replay: re-run `step` from a snapshot for n steps (deterministic for deterministic step functions). */
export function replay<S>(snap: Snapshot<S>, step: (s: S, dt: number) => S, n: number): S[] {
  const out: S[] = [];
  let s = structuredClone(snap.state);
  for (let k = 0; k < n; k++) { s = step(s, snap.timeStep); out.push(s); }
  return out;
}
