/**
 * Laboratory state: the structure being built, undo/redo history, the active tool and element,
 * and the sandbox flag. Strict mode refuses edits that create valence ERRORS; the experimental
 * sandbox allows them but everything built there is labelled Hypothetical.
 */
import { create } from 'zustand';
import { EMPTY, validateValence, type Structure } from './builder';

export interface OptInfo { version: string; initialEnergy: number; energy: number; iterations: number; gradRms: number; converged: boolean; history: number[] }
export type Tool = 'grow' | 'bond' | 'charge' | 'replace' | 'delete' | 'move' | 'move-fragment' | 'rotate' | 'duplicate';

interface LabState {
  s: Structure;
  past: Structure[];
  future: Structure[];
  tool: Tool;
  Z: number;
  sandbox: boolean;
  pendingAtom: number | null;
  selectedBond: number | null;
  notice: string | null;
  /** set when the current geometry is the output of the optimiser; cleared by any edit */
  opt: OptInfo | null;
  running: boolean;
  /** apply an edit; in strict mode refuse it if it introduces a valence error */
  apply: (next: Structure, label?: string) => boolean;
  /** replace without validation/history (live drag/rotate previews) */
  preview: (next: Structure) => void;
  /** push a history entry for a completed drag/rotation, starting from `from` */
  commit: (from: Structure) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  load: (s: Structure) => void;
  set: (patch: Partial<Pick<LabState, 'tool' | 'Z' | 'sandbox' | 'pendingAtom' | 'selectedBond' | 'notice' | 'opt' | 'running'>>) => void;
  applyOptimised: (s: Structure, info: OptInfo) => void;
}

const KEY = 'vv.lab.structure';
const initial = (): Structure => { try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as Structure) : EMPTY; } catch { return EMPTY; } };
const persist = (s: Structure) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota / private mode */ } };
const errorsIn = (s: Structure) => validateValence(s).filter((i) => i.severity === 'error').length;

export const useLab = create<LabState>((set, get) => ({
  s: typeof localStorage === 'undefined' ? EMPTY : initial(),
  past: [],
  future: [],
  tool: 'grow',
  Z: 6,
  sandbox: false,
  pendingAtom: null,
  selectedBond: null,
  notice: null,
  opt: null,
  running: false,
  apply: (next, label) => {
    const { s, sandbox, past } = get();
    if (!sandbox && errorsIn(next) > errorsIn(s)) {
      const first = validateValence(next).find((i) => i.severity === 'error');
      set({ notice: `Refused${label ? ` (${label})` : ''}: ${first?.message}. Enable the experimental sandbox to build hypothetical structures.` });
      return false;
    }
    persist(next);
    set({ s: next, past: [...past, s].slice(-100), future: [], notice: null, opt: null });
    return true;
  },
  preview: (next) => set({ s: next }),
  commit: (from) => { const { s, past } = get(); persist(s); set({ past: [...past, from].slice(-100), future: [], opt: null }); },
  applyOptimised: (next, info) => { const { s, past } = get(); persist(next); set({ s: next, past: [...past, s].slice(-100), future: [], opt: info, running: false }); },
  undo: () => { const { past, s, future } = get(); if (!past.length) return; const prev = past[past.length - 1]; persist(prev); set({ s: prev, past: past.slice(0, -1), future: [s, ...future], pendingAtom: null, selectedBond: null, opt: null }); },
  redo: () => { const { past, s, future } = get(); if (!future.length) return; const next = future[0]; persist(next); set({ s: next, past: [...past, s], future: future.slice(1), pendingAtom: null, selectedBond: null, opt: null }); },
  clear: () => get().apply(EMPTY, 'clear'),
  load: (s) => { const { past, s: cur } = get(); persist(s); set({ s, past: [...past, cur].slice(-100), future: [], pendingAtom: null, selectedBond: null, notice: null, opt: null }); },
  set: (patch) => set(patch),
}));
