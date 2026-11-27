/**
 * Phase 8, Gate 8.6 — pathways. Every stop is a registered entity; every consecutive pair is joined by an
 * existing relationship with a resolvable source; pathways add no edges to the registry.
 */
import { describe, expect, it } from 'vitest';
import { PATHWAYS, getPathway, resolvePathway, stepBetween } from '@/shared/pathways/pathways';
import { allRelationships, getEntity } from '@/shared/scientific-relationships/registry';
import { edgeSource } from '@/shared/scientific-relationships/graph';
import { getSource } from '@/shared/sources/sources';

describe('pathways', () => {
  it('have unique ids, at least three stops and no repeated stop', () => {
    expect(new Set(PATHWAYS.map((p) => p.id)).size).toBe(PATHWAYS.length);
    for (const p of PATHWAYS) {
      expect(p.entities.length, p.id).toBeGreaterThanOrEqual(3);
      expect(new Set(p.entities).size, p.id).toBe(p.entities.length);
    }
  });
  it('resolve completely: every stop is registered and has a view; every step is an existing, sourced relationship', () => {
    for (const p of PATHWAYS) {
      const { steps, error } = resolvePathway(p);
      expect(error, p.id).toBeNull();
      expect(steps).toHaveLength(p.entities.length - 1);
      for (const id of p.entities) expect(getEntity(id)?.route, `${p.id}: ${id}`).toBeTruthy();
      steps.forEach((s, i) => {
        expect(s.from).toBe(p.entities[i]);
        expect(s.to).toBe(p.entities[i + 1]);
        expect(allRelationships()).toContain(s.edge);
        expect(s.forward ? [s.edge.from, s.edge.to] : [s.edge.to, s.edge.from]).toEqual([s.from, s.to]);
        expect(getSource(edgeSource(s.edge).id ?? ''), `${p.id} step ${i + 1}`).toBeTruthy();
      });
    }
  });
  it('the blurb names only stops that are on the pathway (spot checks)', () => {
    expect(getPathway('gravitational-waves')!.blurb).not.toContain('Hulse');
    expect(getPathway('hydrogen-to-expansion')!.entities).toEqual(['element:1', 'spectrum:H-I', 'nebula:orion', 'galaxy:milky-way', 'context:distance-ladder', 'context:cosmic-expansion']);
  });
  it('report a missing link instead of inventing one', () => {
    expect(stepBetween('element:1', 'context:cmb')).toBeNull();
    expect(resolvePathway({ id: 'x', title: 'x', blurb: 'x', entities: ['element:1', 'context:cmb'] }).error).toBe('no relationship between element:1 and context:cmb');
    expect(resolvePathway({ id: 'x', title: 'x', blurb: 'x', entities: ['element:1', 'nope:1'] }).error).toBe('unknown entity nope:1');
  });
  it('follow reverse edges with the right orientation (Milky Way ← dark matter)', () => {
    const s = stepBetween('galaxy:milky-way', 'context:dark-matter')!;
    expect(s.forward).toBe(false);
    expect(s.edge.from).toBe('context:dark-matter');
  });
});
