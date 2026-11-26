/**
 * Scientific relationship registry.
 *
 * One record per scientific entity, referenced by a typed id "kind:id" (e.g. "element:1",
 * "molecule:pubchem-962", "reaction:photosynthesis-net"), so an entity that appears in several
 * modes is never duplicated. Relationships are typed, sourced edges between ids.
 *
 * Entities whose environment is not built yet (e.g. Biologic processes) are registered with
 * `status: 'planned'` and no route: links to them render as plain text, never as working features.
 * See SCIENTIFIC_RELATIONSHIPS.md.
 */
import { REACTIONS } from '@/modes/atomic/reactions/library';

export type EntityKind = 'element' | 'molecule' | 'reaction' | 'material' | 'body' | 'wave' | 'process' | 'context' | 'structure' | 'instrument' | 'spectrum' | 'field';

export interface Entity {
  id: string; // "kind:local-id"
  kind: EntityKind;
  label: string;
  /** hash route when the entity can be opened in an implemented view */
  route: string | null;
  status: 'available' | 'planned';
  note?: string;
}

export type RelationshipType =
  | 'participates-in'   // reaction → process/context
  | 'produces' | 'consumes'
  | 'emits' | 'absorbs'  // matter ↔ radiation
  | 'has-spectrum' | 'has-property'
  | 'observed-with' | 'located-in' | 'part-of' | 'drives' | 'explains';

export interface Relationship { from: string; to: string; type: RelationshipType; context?: string; source: string }

const E = (id: string, label: string, route: string | null, note?: string): Entity =>
  ({ id, kind: id.split(':')[0] as EntityKind, label, route, status: route ? 'available' : 'planned', ...(note ? { note } : {}) });

/** Processes, contexts and structures referenced by Phase 4 records. Planned ones have no route yet. */
const BASE_ENTITIES: Entity[] = [
  E('process:photosynthesis', 'Photosynthesis', null, 'Biologic Mode (Phase 11)'),
  E('process:cellular-respiration', 'Cellular respiration', null, 'Biologic Mode (Phase 11)'),
  E('process:glycolysis', 'Glycolysis', null, 'Biologic Mode (Phase 11)'),
  E('process:muscle-contraction', 'Muscle contraction', null, 'Biologic Mode (Phase 12)'),
  E('process:blood-co2-transport', 'CO₂ transport in blood', null, 'Biologic Mode (Phase 12)'),
  E('process:nitrogen-cycle', 'Nitrogen cycle', null),
  E('structure:mitochondrion', 'Mitochondrion', null, 'Biologic Mode (Phase 11)'),
  E('context:ozone-layer', 'Stratospheric ozone layer', null),
  E('context:urban-smog', 'Photochemical smog', null),
  E('context:greenhouse-effect', 'Greenhouse effect', null, 'Thermal-radiation laboratory (Phase 10)'),
  E('context:acid-rain', 'Acid rain', null),
  E('context:ocean-acidification', 'Ocean acidification', null),
  E('context:energy-production', 'Energy production', null),
  E('context:sunlight', 'Sunlight', '#/spectral?tab=blackbody&T=5772', 'Spectral atlas: 5772 K blackbody model of the Sun (IAU nominal T_eff)'),
  E('wave:em-ultraviolet', 'Ultraviolet radiation', '#/spectral?lambda=3e-7', 'Spectral atlas: UV-A/B/C (CIE) and ISO 21348 categories'),
  E('wave:em-visible', 'Visible light', '#/spectral?lambda=5.5e-7', 'Spectral atlas: visible range (no precise limits, CIE)'),
];

const REGISTRY = new Map<string, Entity>();
const RELATIONSHIPS: Relationship[] = [];

export function registerEntity(e: Entity) { REGISTRY.set(e.id, { ...REGISTRY.get(e.id), ...e }); }
export function registerRelationship(r: Relationship) {
  if (!RELATIONSHIPS.some((x) => x.from === r.from && x.to === r.to && x.type === r.type)) RELATIONSHIPS.push(r);
}

BASE_ENTITIES.forEach(registerEntity);
for (const r of REACTIONS) {
  registerEntity(E(`reaction:${r.id}`, r.name, `#/atomic/reactions/${r.id}`));
  for (const to of r.relationships ?? []) registerRelationship({ from: `reaction:${r.id}`, to, type: 'participates-in', source: r.citation });
}

export const getEntity = (id: string) => REGISTRY.get(id);
export const allEntities = () => [...REGISTRY.values()];
export const relationshipsFrom = (id: string) => RELATIONSHIPS.filter((r) => r.from === id);
export const relationshipsTo = (id: string) => RELATIONSHIPS.filter((r) => r.to === id);
export const allRelationships = () => [...RELATIONSHIPS];
