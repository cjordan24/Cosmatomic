/**
 * Phase 26 — citation audit of every Meteorology dataset: each quote carries a source (its own `s`/`source`, an
 * inherited one, or a [sourceId, text] pair), and every source id named anywhere resolves in the Source index.
 */
import { describe, expect, it } from 'vitest';
import { getSource } from '@/shared/sources/sources';

/* eslint-disable @typescript-eslint/no-explicit-any */
const FILES = import.meta.glob<any>('../../datasets/meteorology/*.json', { eager: true, import: 'default' });
const ID_KEYS = new Set(['s', 's2', 's3', 'source', 'src', 'paperS', 'trendS', 'budgetS', 'scaleS', 'dacS', 'shotS', 'ozS', 'prevS', 'gfdlS', 'pSource', 'tSource']);

function audit(o: any, path: string, inherited: string | null, out: { quotes: number; unsourced: string[]; ids: [string, string][] }) {
  if (Array.isArray(o)) {
    if (o.length === 2 && typeof o[0] === 'string' && typeof o[1] === 'string' && /^[a-z0-9][a-z0-9-]+$/.test(o[0]) && o[1].length > 30 && getSource(o[0])) { out.ids.push([path, o[0]]); return; }
    o.forEach((v, i) => audit(v, `${path}[${i}]`, inherited, out));
    return;
  }
  if (!o || typeof o !== 'object') return;
  const own = ['s', 'source', 'src'].map((k) => o[k]).find((v) => typeof v === 'string') ?? null;
  for (const [k, v] of Object.entries(o)) {
    if (ID_KEYS.has(k) && typeof v === 'string') out.ids.push([`${path}.${k}`, v]);
    if ((k === 'q' || k === 'quote') && (typeof v === 'string' || Array.isArray(v))) {
      out.quotes++;
      const pairs = Array.isArray(v) && v.every((x) => Array.isArray(x) && typeof x[0] === 'string');
      if (!own && !inherited && !pairs) out.unsourced.push(`${path}.${k}`);
    }
    audit(v, `${path}.${k}`, own ?? inherited, out);
  }
}

describe('Meteorology citation audit', () => {
  const entries = Object.entries(FILES);
  it('covers every Meteorology dataset', () => { expect(entries.length).toBeGreaterThanOrEqual(13); });
  it.each(entries.map(([f, d]) => [f.split('/').pop()!, d] as const))('%s: every quote has a source and every source id is indexed', (_name, d) => {
    const out = { quotes: 0, unsourced: [] as string[], ids: [] as [string, string][] };
    audit(d, '', null, out);
    expect(out.unsourced).toEqual([]);
    for (const [p, id] of out.ids) expect(getSource(id), `${p} → ${id}`).toBeDefined();
  });
});

describe('audit is not vacuous', () => {
  it('finds hundreds of quotes and source references across the datasets', () => {
    const out = { quotes: 0, unsourced: [] as string[], ids: [] as [string, string][] };
    for (const d of Object.values(FILES)) audit(d, '', null, out);
    expect(out.quotes).toBeGreaterThan(200); expect(out.ids.length).toBeGreaterThan(200);
  });
});
