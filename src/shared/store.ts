/**
 * Global UI state (Zustand). Scientific state (clock, selections) lives here so
 * every panel reads from one source; rendering never writes physical values.
 */
import { create } from 'zustand';
import { jdFromDate, type ClockState } from '@/core/simulation/clock';
import { PLANET_VALID } from '@/modes/cosmic/solar-system/ephemeris';

export interface Bookmark { label: string; jd: number }

interface Settings { reducedMotion: boolean; highContrast: boolean; showLabels: boolean; showOrbits: boolean; sizeExaggeration: number }

interface VoyagerState {
  settings: Settings;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  clock: ClockState;
  setClock: (patch: Partial<ClockState>) => void;
  bookmarks: Bookmark[];
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (i: number) => void;
  panelsCollapsed: Record<string, boolean>;
  togglePanel: (id: string) => void;
}

const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const loadJSON = <T,>(k: string, fallback: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };

const nowJd = Math.min(PLANET_VALID.maxJd, Math.max(PLANET_VALID.minJd, jdFromDate(new Date())));

export const useVoyager = create<VoyagerState>((set) => ({
  settings: { reducedMotion: !!prefersReducedMotion, highContrast: false, showLabels: true, showOrbits: true, sizeExaggeration: 1, ...loadJSON('vv.settings', {}) },
  setSetting: (k, v) => set((s) => { const settings = { ...s.settings, [k]: v }; localStorage.setItem('vv.settings', JSON.stringify(settings)); return { settings }; }),
  clock: { jd: nowJd, rate: 86_400, playing: false },
  setClock: (patch) => set((s) => ({ clock: { ...s.clock, ...patch } })),
  bookmarks: loadJSON<Bookmark[]>('vv.bookmarks', [
    { label: 'J2000.0 epoch', jd: 2_451_545.0 },
    { label: 'Voyager 1 launch (1977-09-05)', jd: 2_443_391.5 },
  ]),
  addBookmark: (b) => set((s) => { const bookmarks = [...s.bookmarks, b]; localStorage.setItem('vv.bookmarks', JSON.stringify(bookmarks)); return { bookmarks }; }),
  removeBookmark: (i) => set((s) => { const bookmarks = s.bookmarks.filter((_, k) => k !== i); localStorage.setItem('vv.bookmarks', JSON.stringify(bookmarks)); return { bookmarks }; }),
  panelsCollapsed: {},
  togglePanel: (id) => set((s) => ({ panelsCollapsed: { ...s.panelsCollapsed, [id]: !s.panelsCollapsed[id] } })),
}));
