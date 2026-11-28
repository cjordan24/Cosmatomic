/**
 * Phase 8, Gate 8.2 — relationship explorer. Graph queries over the registry: neighbourhoods, shortest
 * chains of sourced edges, connected groups. Nothing is inferred: every step must be an existing edge.
 */
import { describe, expect, it } from 'vitest';
import { allEntities, allRelationships, getEntity } from '@/shared/scientific-relationships/registry';
import { ALL_TYPES, VERBS, components, degree, edgeSource, edgesWithin, entityMode, neighbourhood, shortestPath, stepVerb } from '@/shared/scientific-relationships/graph';
import { getSource } from '@/shared/sources/sources';

const isEdge = (s: { edge: { from: string; to: string; type: string } }) => allRelationships().some((r) => r === s.edge);

describe('entity environments', () => {
  it('the environment comes from the route; entities without one are planned', () => {
    expect(entityMode(getEntity('element:1')!)).toBe('atomic');
    expect(entityMode(getEntity('context:cmb')!)).toBe('cosmic');
    expect(entityMode(getEntity('spectrum:H-I')!)).toBe('spectral');
    expect(entityMode(getEntity('process:photosynthesis')!)).toBe('biologic'); // Gate 11.7
    expect(entityMode(getEntity('process:glycolysis')!)).toBe('planned');
    for (const e of allEntities()) expect(entityMode(e) === 'planned', e.id).toBe(e.status === 'planned');
  });
});

describe('neighbourhoods', () => {
  it('hydrogen: its two NIST spectra and the Sun (photospheric abundance) are one step away', () => {
    const { rings } = neighbourhood('element:1', 1);
    expect(rings[0]).toEqual(['element:1']);
    expect(rings[1]).toEqual(expect.arrayContaining(['spectrum:H-I', 'spectrum:D-I', 'body:sun']));
    expect(rings[1].length).toBe(degree('element:1'));
  });

  it('two steps reach the Orion Nebula (Hα) and class A stars through H I; rings do not repeat entities', () => {
    const { rings, via } = neighbourhood('element:1', 2);
    expect(rings[2]).toEqual(expect.arrayContaining(['nebula:orion', 'stellar-class:A']));
    const all = rings.flat();
    expect(new Set(all).size).toBe(all.length);
    for (const id of rings[2]) expect(rings[1]).toContain(via.get(id)!.from);
  });

  it('edges within a set are exactly the registry edges with both ends in it', () => {
    const ids = neighbourhood('context:cmb', 1).rings.flat();
    const inside = edgesWithin(ids);
    for (const r of inside) expect(ids.includes(r.from) && ids.includes(r.to)).toBe(true);
    expect(inside.length).toBe(allRelationships().filter((r) => ids.includes(r.from) && ids.includes(r.to)).length);
  });
});

describe('shortest paths', () => {
  it('hydrogen → cosmic expansion: a connected chain of existing, sourced edges', () => {
    const p = shortestPath('element:1', 'context:cosmic-expansion')!;
    expect(p).not.toBeNull();
    expect(p[0].from).toBe('element:1');
    expect(p.at(-1)!.to).toBe('context:cosmic-expansion');
    for (let i = 0; i < p.length; i++) {
      expect(isEdge(p[i])).toBe(true);
      if (i) expect(p[i].from).toBe(p[i - 1].to);
      expect(p[i].forward ? [p[i].edge.from, p[i].edge.to] : [p[i].edge.to, p[i].edge.from]).toEqual([p[i].from, p[i].to]);
      expect(edgeSource(p[i].edge).text.length).toBeGreaterThan(0);
      expect(stepVerb(p[i]).length).toBeGreaterThan(0);
    }
  });

  it('is shortest: its length equals the breadth-first ring of the target, and is the same both ways', () => {
    for (const [a, b] of [['element:1', 'context:cosmic-expansion'], ['material:water', 'body:sun'], ['nebula:ring', 'context:gravitational-waves']] as const) {
      const p = shortestPath(a, b);
      if (!p) continue;
      const { rings } = neighbourhood(a, p.length);
      expect(rings[p.length]).toContain(b);
      for (let d = 0; d < p.length; d++) expect(rings[d] ?? []).not.toContain(b);
      expect(shortestPath(b, a)!.length).toBe(p.length);
    }
  });

  it('respects the type filter, and a path to itself is empty', () => {
    expect(shortestPath('element:1', 'element:1')).toEqual([]);
    expect(shortestPath('element:1', 'context:cosmic-expansion', new Set(['has-spectrum']))).toBeNull();
    const only = new Set(['has-spectrum'] as const);
    expect(shortestPath('element:1', 'spectrum:H-I', only)!.length).toBe(1);
  });
});

describe('the registry as a whole', () => {
  it('Phase 7’s cosmology contexts, the Sun and hydrogen are in the largest connected group', () => {
    const [big] = components();
    for (const id of ['element:1', 'body:sun', 'context:cmb', 'context:dark-matter', 'context:gravitational-waves', 'galaxy:milky-way']) expect(big).toContain(id);
    expect(components().reduce((n, c) => n + c.length, 0)).toBe(allEntities().length);
  });

  it('every relationship type has forward and reverse wording; every edge source resolves', () => {
    for (const t of ALL_TYPES) expect(VERBS[t][0] && VERBS[t][1]).toBeTruthy();
    for (const r of allRelationships()) {
      expect(ALL_TYPES).toContain(r.type);
      const s = edgeSource(r);
      if (s.id) expect(getSource(s.id)).toBeDefined();
      else expect(r.from.startsWith('reaction:'), `${r.from} → ${r.to}`).toBe(true); // only reaction edges cite their own record
    }
  });

  it('planned entities have no route and are linked from at least one sourced record', () => {
    const planned = allEntities().filter((e) => e.status === 'planned');
    expect(planned.length).toBeGreaterThan(5);
    for (const e of planned) expect(e.route).toBeNull();
    expect(planned.filter((e) => degree(e.id) > 0).length).toBeGreaterThan(5);
  });
});

describe('entity ids', () => {
  it('no id is registered twice for two different routes', async () => {
    const { ROUTE_CONFLICTS } = await import('@/shared/scientific-relationships/registry');
    expect(ROUTE_CONFLICTS).toEqual([]);
  });
});
