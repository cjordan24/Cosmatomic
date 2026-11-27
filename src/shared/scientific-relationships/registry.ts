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
import { elementBySymbol } from '@/modes/atomic/atoms/elements';
import { MATERIALS } from '@/modes/atomic/materials/materials';
import { MEDIA } from '@/core/physics/waves/media';
import { SOURCES } from '@/shared/sources/sources';
import curated from '@datasets/curated/curated-reference.json';
import compactData from '@datasets/astronomical/compact-objects.json';
import nebulaData from '@datasets/astronomical/nebulae.json';

export type EntityKind = 'element' | 'molecule' | 'reaction' | 'material' | 'body' | 'wave' | 'process' | 'context' | 'structure' | 'instrument' | 'spectrum' | 'field' | 'star' | 'stellar-class' | 'compact-object' | 'galaxy' | 'nebula';

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
  E('context:gravitational-lensing', 'Gravitational lensing', '#/cosmic/lensing', 'Point-mass lens plane, microlensing and astrometric deflection (Gate 6.3)'),
  E('context:cosmic-expansion', 'Cosmic expansion and distances', '#/cosmic/universe', 'ΛCDM distances, lookback time and expansion history with Planck 2018 parameters (Gate 7.1)'),
  E('wave:em-visible', 'Visible light', '#/spectral?lambda=5.5e-7', 'Spectral atlas: visible range (no precise limits, CIE)'),
  // Gate E.1: the remaining broad radiation types, each with an encyclopedia entry (NASA Tour of the EM Spectrum)
  E('wave:em-spectrum', 'Electromagnetic spectrum', '#/spectral', 'Spectral atlas: one wavelength in every band convention'),
  E('wave:em-radio', 'Radio waves', '#/spectral?lambda=1', 'Spectral atlas: ITU-R V.431 bands and the ISO 21348 radio category'),
  E('wave:em-microwave', 'Microwaves', '#/spectral?lambda=0.005', 'Spectral atlas: ISO 21348 microwave category (1–15 mm), inside its radio range'),
  E('wave:em-infrared', 'Infrared radiation', '#/spectral?lambda=1e-5', 'Spectral atlas: ISO 21348, CIE and detector infrared divisions'),
  E('wave:em-xray', 'X-rays', '#/spectral?lambda=1e-9', 'Spectral atlas: ISO 21348 hard and soft X-rays'),
  E('wave:em-gamma', 'Gamma rays', '#/spectral?lambda=1e-13', 'Spectral atlas: ISO 21348 gamma-ray category'),
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

// ---------------------------------------------------------------- Gate 4.7 cross-mode links

/** Spectra bundled in datasets/atomic/spectra-nist.json (kept in sync by tests/science/fields.test.ts). */
export const NIST_SPECTRA = ['H I', 'D I', 'He I', 'He II', 'Li I', 'C I', 'C II', 'N I', 'N II', 'O I', 'O III', 'Ne I', 'Na I', 'Mg I', 'Mg II', 'Al I', 'Si I', 'S I', 'Ar I', 'K I', 'Ca I', 'Ca II', 'Ti I', 'Fe I', 'Fe II', 'Ni I', 'Cu I', 'Zn I', 'Sr I', 'Ba I', 'Kr I', 'Xe I', 'Hg I'];
export const spectrumId = (spec: string) => `spectrum:${spec.replace(' ', '-')}`;
/** Element of a spectrum label ("D I" is deuterium, i.e. hydrogen). */
export const spectrumElement = (spec: string) => elementBySymbol(spec.split(' ')[0] === 'D' ? 'H' : spec.split(' ')[0]);

// 1. Element → atomic spectrum → Spectral atlas (NIST ASD lines)
for (const spec of NIST_SPECTRA) {
  const el = spectrumElement(spec);
  if (!el) continue;
  registerEntity(E(`element:${el.Z}`, el.name, `#/atomic/element/${el.Z}`));
  registerEntity(E(spectrumId(spec), `${spec} atomic line spectrum`, `#/spectral?tab=lines&spec=${encodeURIComponent(spec)}`, 'NIST ASD lines in the Spectral atlas'));
  registerRelationship({ from: `element:${el.Z}`, to: spectrumId(spec), type: 'has-spectrum', context: spec === 'D I' ? 'deuterium' : undefined, source: 'nist-asd' });
}

// 2. Sun → Planck spectrum (IAU 2015 nominal T_eff = 5772 K) → Spectral atlas
registerEntity(E('body:sun', 'Sun', '#/cosmic/sun'));
registerEntity(E('spectrum:blackbody-5772', 'Planck spectrum at 5772 K (model of the Sun)', '#/spectral?tab=blackbody&T=5772', 'Ideal blackbody at the IAU 2015 nominal solar effective temperature; the real solar spectrum deviates'));
registerRelationship({ from: 'body:sun', to: 'spectrum:blackbody-5772', type: 'has-spectrum', context: 'blackbody model at T_eff', source: 'iau-2015-b3' });
registerRelationship({ from: 'body:sun', to: 'context:sunlight', type: 'emits', source: 'iau-2015-b3' });

// 3. Material → optical (n(λ)) and acoustic (speed of sound) properties → Spectral atlas / Wave lab
for (const m of MATERIALS) {
  const ri = m.refractiveIndex;
  const medium = MEDIA.find((x) => x.id === m.id && x.kind !== 'vacuum');
  if (!ri && !medium) continue;
  registerEntity(E(`material:${m.id}`, m.name, `#/atomic/materials/${m.id}`));
  if (ri) {
    registerEntity(E(`spectrum:n-${m.id}`, `Refractive index n(λ) of ${m.name}`, `#/spectral?mat=${m.id}&lambda=5.893e-7`, `Dispersion formula valid ${ri.rangeUm?.join('–')} µm`));
    registerRelationship({ from: `material:${m.id}`, to: `spectrum:n-${m.id}`, type: 'has-property', context: 'optical', source: SOURCES.find((x) => ri.doi && x.doi === ri.doi)?.id ?? ri.sources[0] });
  }
  if (medium) {
    registerEntity(E(`wave:sound-${m.id}`, `Sound waves in ${medium.name}`, `#/spectral/lab?demo=traveling&medium=${m.id}&wave=longitudinal&f=440&A=1e-6`, 'Wave lab: speed of sound from the NIST reference equation of state'));
    registerRelationship({ from: `material:${m.id}`, to: `wave:sound-${m.id}`, type: 'has-property', context: 'acoustic', source: medium.sources[0] });
  }
}

// 4. Field layers (FIELDS foundation)
for (const [id, label, route] of [
  ['field:gravity-potential', 'Gravitational potential field', '#/spectral/fields?frame=system'],
  ['field:coulomb-potential', 'Electrostatic (Coulomb) field', '#/spectral/fields'],
  ['field:plane-wave-ex', 'EM plane-wave field', '#/spectral/fields?layers=wave'],
  ['field:heat-diffusion', 'Temperature field (heat diffusion)', '#/spectral/fields?layers=heat'],
] as const) registerEntity(E(id, label, route));
registerRelationship({ from: 'field:plane-wave-ex', to: 'wave:em-visible', type: 'explains', context: 'same analytic plane wave as the atlas', source: 'codata-2018' });

// 5. Stellar classes (Gate 5.4) → the atomic line spectra that dominate them (OpenStax Astronomy 2e §17.3:
// ionised helium peaks at O, neutral helium at B, hydrogen at about A, ionised metals between F and G,
// neutral metals at K, molecules beyond M). Calcium and iron stand in for "metals" because both
// ionisation stages are in the bundled NIST set. Star entities are registered when the 10 pc
// catalogue loads (src/modes/cosmic/star-systems/starRegistry.ts).
export const CLASS_LINES: Record<string, { spectra: string[]; note: string }> = {
  O: { spectra: ['He II'], note: 'ionised helium' },
  B: { spectra: ['He I'], note: 'neutral helium' },
  A: { spectra: ['H I'], note: 'hydrogen (Balmer lines)' },
  F: { spectra: ['Ca II', 'Fe II'], note: 'ionised metals' },
  G: { spectra: ['Ca II', 'Fe II'], note: 'ionised metals' },
  K: { spectra: ['Ca I', 'Fe I'], note: 'neutral metals' },
  M: { spectra: [], note: 'molecular bands such as TiO (no molecular band data bundled)' },
};
for (const [cls, { spectra, note }] of Object.entries(CLASS_LINES)) {
  registerEntity(E(`stellar-class:${cls}`, `Class ${cls} stars`, `#/cosmic/stars/hr?d=classes&cls=${cls}`));
  for (const spec of spectra) registerRelationship({ from: `stellar-class:${cls}`, to: spectrumId(spec), type: 'absorbs', context: `strongest lines: ${note}`, source: 'openstax-astronomy-2e' });
}

// 6. The Sun among the stars (Gate 5.5): its class (OpenStax §17.3: "the spectral class assigned to
// the Sun is G2") and its photospheric composition (Asplund et al. 2009, the abundances already shown
// in the element views). Planned link texts are not needed: every target here has a route.
registerRelationship({ from: 'body:sun', to: 'stellar-class:G', type: 'part-of', context: 'G2', source: 'openstax-astronomy-2e' });
export const SOLAR_LOG_EPS = curated.solarPhotosphericAbundances.logEpsilon as Record<string, number>;
for (const sym of Object.keys(SOLAR_LOG_EPS)) {
  const el = elementBySymbol(sym);
  if (!el) continue;
  registerEntity(E(`element:${el.Z}`, el.name, `#/atomic/element/${el.Z}`));
  registerRelationship({ from: 'body:sun', to: `element:${el.Z}`, type: 'has-property', context: 'photospheric abundance', source: 'asplund-2009' });
}

// ---------------------------------------------------------------- Gate 6.2 compact objects
// Neutron stars and black holes are registered here. White dwarfs of the 10 pc sample are the same
// physical objects as their star:<seq> entities, so they are not duplicated (starRegistry.ts adds their edges).
for (const o of (compactData as { objects: { id: string; name: string; kind: string; starSeq: number | null }[] }).objects) {
  if (o.starSeq !== null) continue;
  registerEntity(E(`compact-object:${o.id}`, o.name, `#/cosmic/compact?sel=${o.id}`));
}

// ---------------------------------------------------------------- Gate 6.4 galaxies
registerEntity(E('galaxy:milky-way', 'Milky Way', '#/cosmic/galaxies?tab=mw', 'Galactic parameters and rotation curve'));
registerRelationship({ from: 'body:sun', to: 'galaxy:milky-way', type: 'located-in', context: 'R₀ = 8.2 ± 0.1 kpc from the Galactic Centre', source: 'bland-hawthorn-gerhard-2016' });
registerRelationship({ from: 'compact-object:sgr-a-star', to: 'galaxy:milky-way', type: 'located-in', context: 'at the Galactic Centre', source: 'eht-2022-sgra-1' });

// ---------------------------------------------------------------- Gate 6.5 nebulae
for (const n of (nebulaData as { nebulae: { id: string; name: string; typeSource: string; lines: { spectrum: string; label: string; context: string; source: string }[] }[] }).nebulae) {
  const id = `nebula:${n.id}`;
  registerEntity(E(id, n.name, `#/cosmic/nebulae?sel=${n.id}`));
  registerRelationship({ from: id, to: 'galaxy:milky-way', type: 'located-in', context: 'classified as a Milky Way nebula on the image page', source: n.typeSource });
  for (const l of n.lines) if (NIST_SPECTRA.includes(l.spectrum)) registerRelationship({ from: id, to: spectrumId(l.spectrum), type: 'emits', context: `${l.label}: ${l.context}`, source: l.source });
}

// Phase 7, Gate 7.1: cosmological lenses need angular-diameter distances (Hogg 1999 eq. 19), not Euclidean ones.
registerRelationship({ from: 'context:cosmic-expansion', to: 'context:gravitational-lensing', type: 'explains', context: 'angular-diameter distances D_d, D_s, D_ds set the Einstein radius of distant lenses', source: 'hogg-1999' });

export const getEntity = (id: string) => REGISTRY.get(id);
export const allEntities = () => [...REGISTRY.values()];
export const relationshipsFrom = (id: string) => RELATIONSHIPS.filter((r) => r.from === id);
export const relationshipsTo = (id: string) => RELATIONSHIPS.filter((r) => r.to === id);
export const allRelationships = () => [...RELATIONSHIPS];
