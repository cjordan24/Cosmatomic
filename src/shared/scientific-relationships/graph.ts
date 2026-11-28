/**
 * Graph queries over the relationship registry (Gate 8.2, #/relations). Pure functions: the registry
 * stays the single store of entities and sourced edges; nothing here adds or infers a relationship.
 *
 * Edges are directed and typed, but paths and neighbourhoods follow them in both directions, because
 * every edge is shown in both directions in the UI (SCIENTIFIC_RELATIONSHIPS.md rule 4).
 */
import { allEntities, allRelationships, getEntity, type Entity, type Relationship, type RelationshipType } from './registry';
import { getSource } from '@/shared/sources/sources';

export type EntityMode = 'atomic' | 'cosmic' | 'spectral' | 'biologic' | 'engineering' | 'meteorology' | 'planned';

/** The environment that opens an entity, read from its route; entities without a route are planned. */
export function entityMode(e: Entity): EntityMode {
  if (!e.route) return 'planned';
  if (e.route.startsWith('#/atomic')) return 'atomic';
  if (e.route.startsWith('#/cosmic')) return 'cosmic';
  if (e.route.startsWith('#/biologic')) return 'biologic';
  if (e.route.startsWith('#/engineering')) return 'engineering';
  if (e.route.startsWith('#/meteorology')) return 'meteorology';
  return 'spectral';
}

/** One step along an edge, as seen from the entity we arrived from. */
export interface Step { edge: Relationship; from: string; to: string; forward: boolean }

export type TypeFilter = ReadonlySet<RelationshipType> | null;

function adjacency(types: TypeFilter): Map<string, Step[]> {
  const adj = new Map<string, Step[]>();
  const add = (k: string, s: Step) => { const l = adj.get(k); if (l) l.push(s); else adj.set(k, [s]); };
  for (const r of allRelationships()) {
    if (types && !types.has(r.type)) continue;
    add(r.from, { edge: r, from: r.from, to: r.to, forward: true });
    add(r.to, { edge: r, from: r.to, to: r.from, forward: false });
  }
  return adj;
}

/** Entities within `depth` steps of `id` (both directions), with the step that first reached each. */
export function neighbourhood(id: string, depth: number, types: TypeFilter = null): { rings: string[][]; via: Map<string, Step> } {
  const adj = adjacency(types);
  const seen = new Set([id]);
  const via = new Map<string, Step>();
  const rings: string[][] = [[id]];
  for (let d = 1; d <= depth; d++) {
    const next: string[] = [];
    for (const u of rings[d - 1]) for (const s of adj.get(u) ?? []) {
      if (seen.has(s.to)) continue;
      seen.add(s.to); via.set(s.to, s); next.push(s.to);
    }
    if (!next.length) break;
    rings.push(next);
  }
  return { rings, via };
}

/** Edges among a set of entities (each edge once). */
export function edgesWithin(ids: Iterable<string>, types: TypeFilter = null): Relationship[] {
  const set = new Set(ids);
  return allRelationships().filter((r) => set.has(r.from) && set.has(r.to) && (!types || types.has(r.type)));
}

/**
 * Shortest chain of sourced edges between two entities (breadth-first, edges followed both ways).
 * Ties are broken by registration order, so the result is deterministic. null when unconnected.
 */
export function shortestPath(a: string, b: string, types: TypeFilter = null): Step[] | null {
  if (a === b) return [];
  const adj = adjacency(types);
  const prev = new Map<string, Step>();
  const seen = new Set([a]);
  let frontier = [a];
  while (frontier.length) {
    const next: string[] = [];
    for (const u of frontier) for (const s of adj.get(u) ?? []) {
      if (seen.has(s.to)) continue;
      seen.add(s.to); prev.set(s.to, s); next.push(s.to);
      if (s.to === b) {
        const path: Step[] = [];
        for (let k = b; k !== a; k = prev.get(k)!.from) path.unshift(prev.get(k)!);
        return path;
      }
    }
    frontier = next;
  }
  return null;
}

/** Connected components (edges in both directions); isolated entities form their own component. */
export function components(types: TypeFilter = null): string[][] {
  const adj = adjacency(types);
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const e of allEntities()) {
    if (seen.has(e.id)) continue;
    const comp: string[] = []; const stack = [e.id]; seen.add(e.id);
    while (stack.length) {
      const u = stack.pop()!; comp.push(u);
      for (const s of adj.get(u) ?? []) if (!seen.has(s.to)) { seen.add(s.to); stack.push(s.to); }
    }
    out.push(comp);
  }
  return out.sort((x, y) => y.length - x.length);
}

export const degree = (id: string) => allRelationships().filter((r) => r.from === id || r.to === id).length;

/** A source id from the index, or a reaction's own citation text (Gate 4.1 edges cite the reaction record). */
export function edgeSource(r: Relationship): { id: string | null; text: string } {
  const s = getSource(r.source);
  return s ? { id: s.id, text: `${s.authors.split(',')[0]} (${s.year})` } : { id: null, text: r.source };
}

export const ALL_TYPES: RelationshipType[] = ['participates-in', 'produces', 'consumes', 'emits', 'absorbs', 'has-spectrum', 'has-property', 'observed-with', 'located-in', 'part-of', 'drives', 'explains'];

/** Verb for an edge read forwards and backwards (the same wording as RelatedLinks). */
export const VERBS: Record<RelationshipType, [string, string]> = {
  'participates-in': ['part of', 'involves'],
  produces: ['produces', 'produced by'],
  consumes: ['consumes', 'consumed by'],
  emits: ['emits', 'emitted by'],
  absorbs: ['absorbs', 'absorbed by'],
  'has-spectrum': ['spectrum', 'spectrum of'],
  'has-property': ['property', 'property of'],
  'observed-with': ['observed with', 'observes'],
  'located-in': ['located in', 'contains'],
  'part-of': ['member of', 'includes'],
  drives: ['drives', 'driven by'],
  explains: ['explains', 'explained by'],
};

export const stepVerb = (s: Step) => VERBS[s.edge.type][s.forward ? 0 : 1];
export const label = (id: string) => getEntity(id)?.label ?? id;
