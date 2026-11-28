/**
 * Pathways (Phase 8, Gate 8.6): curated walks through the records. A pathway is an ordered list of registry
 * entities; every consecutive pair must be joined by an existing, sourced relationship (followed in either
 * direction). Each step is shown with that relationship's own context and source and, where the entity has
 * one, the opening of its encyclopedia entry (verbatim, credited). A pathway adds no claims: its title and
 * blurb only say which records it visits; everything else is read from the registry and the encyclopedia.
 */
import { allRelationships, getEntity } from '@/shared/scientific-relationships/registry';
import type { Step } from '@/shared/scientific-relationships/graph';

export interface Pathway { id: string; title: string; blurb: string; entities: string[] }

export const PATHWAYS: Pathway[] = [
  { id: 'hydrogen-to-expansion', title: 'Hydrogen, from its spectrum to cosmic expansion', blurb: 'Hydrogen → its NIST line spectrum → the Orion Nebula’s Hα glow → the Milky Way → the distance ladder → cosmic expansion.',
    entities: ['element:1', 'spectrum:H-I', 'nebula:orion', 'galaxy:milky-way', 'context:distance-ladder', 'context:cosmic-expansion'] },
  { id: 'sun-among-stars', title: 'The Sun among the stars', blurb: 'The Sun → class G stars → the ionised-calcium lines that dominate them → calcium.',
    entities: ['body:sun', 'stellar-class:G', 'spectrum:Ca-II', 'element:20'] },
  { id: 'oxygen-ring-nebula', title: 'Oxygen light from the Ring Nebula to dark matter', blurb: 'Oxygen → its [O III] spectrum → the Ring Nebula → the Milky Way → dark-matter evidence → gravitational lensing.',
    entities: ['element:8', 'spectrum:O-III', 'nebula:ring', 'galaxy:milky-way', 'context:dark-matter', 'context:gravitational-lensing'] },
  { id: 'oldest-light', title: 'The oldest light', blurb: 'The distance ladder → cosmic expansion → the cosmic microwave background → microwaves.',
    entities: ['context:distance-ladder', 'context:cosmic-expansion', 'context:cmb', 'wave:em-microwave'] },
  { id: 'gravitational-waves', title: 'Gravitational waves and light', blurb: 'The GW150914 remnant → gravitational waves → gamma rays (GW170817 and GRB 170817A).',
    entities: ['compact-object:gw150914-final', 'context:gravitational-waves', 'wave:em-gamma'] },
  // ---------------- Phase 14, Gate 14.7: pathways through the Phase 11–14 records ----------------
  { id: 'quarks-to-leaves', title: 'From quarks to leaves', blurb: 'Nuclei → the particles of the Standard Model → visible light (the photon) → photosynthesis → plants.',
    entities: ['instrument:nuclei', 'instrument:particles', 'wave:em-visible', 'process:photosynthesis', 'instrument:plants'] },
  { id: 'water-to-nerves', title: 'From a water molecule to a heartbeat', blurb: 'Water → the body-to-molecule zoom → the human body → the heart → the ECG (senses and signals) → nerves.',
    entities: ['molecule:pubchem-962', 'instrument:zoom', 'instrument:body', 'structure:organ-heart', 'instrument:senses', 'instrument:nerves'] },
  { id: 'eye-to-xrays', title: 'Seeing: the eye, telescopes, microscopes and X-rays', blurb: 'Visible light → the eye → telescopes → imaging the body → X-rays.',
    entities: ['wave:em-visible', 'instrument:senses', 'instrument:telescopes', 'instrument:imaging', 'wave:em-xray'] },
  { id: 'gravity-beyond-newton', title: 'Gravity beyond Newton', blurb: 'Tests of general relativity → gravitational lensing → dark-matter evidence → dark matter or modified gravity?',
    entities: ['instrument:grtests', 'context:gravitational-lensing', 'context:dark-matter', 'instrument:models'] },
  { id: 'tunnelling-to-solar-wind', title: 'From tunnelling to the solar wind', blurb: 'The quantum lab → nuclei → the Sun → its plasma and the solar wind.',
    entities: ['instrument:quantum', 'instrument:nuclei', 'body:sun', 'instrument:plasma'] },
];

/** The relationship joining a → b (forward edges preferred), or null when the registry has none. */
export function stepBetween(a: string, b: string): Step | null {
  const rels = allRelationships();
  const f = rels.find((r) => r.from === a && r.to === b);
  if (f) return { edge: f, from: a, to: b, forward: true };
  const r = rels.find((x) => x.from === b && x.to === a);
  return r ? { edge: r, from: a, to: b, forward: false } : null;
}

/** All steps of a pathway, or the first missing link (an entity or a relationship) as an error string. */
export function resolvePathway(p: Pathway): { steps: Step[]; error: string | null } {
  const steps: Step[] = [];
  for (const id of p.entities) if (!getEntity(id)) return { steps, error: `unknown entity ${id}` };
  for (let i = 1; i < p.entities.length; i++) {
    const s = stepBetween(p.entities[i - 1], p.entities[i]);
    if (!s) return { steps, error: `no relationship between ${p.entities[i - 1]} and ${p.entities[i]}` };
    steps.push(s);
  }
  return { steps, error: null };
}
export const getPathway = (id: string) => PATHWAYS.find((p) => p.id === id);
