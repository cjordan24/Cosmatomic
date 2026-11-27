/**
 * Registry of the time series currently shown by shared recorders (Gate 8.5), so a notebook snapshot can
 * store their samples together with their title, units, provenance and method.
 */
import type { SeriesMeta, Sample } from './instruments';

const live = new Map<string, { meta: SeriesMeta; points: () => readonly Sample[] }>();
export function registerSeries(key: string, meta: SeriesMeta, points: () => readonly Sample[]) {
  live.set(key, { meta, points });
  return () => { if (live.get(key)?.points === points) live.delete(key); };
}
export const liveSeries = () => [...live.values()].map((s) => ({ ...s.meta, points: s.points().map(([t, y]) => [t, y] as [number, number]) }));
