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
import { ELEMENTS, elementBySymbol } from '@/modes/atomic/atoms/elements';
import { MATERIALS } from '@/modes/atomic/materials/materials';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
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
  E('process:photosynthesis', 'Photosynthesis', '#/biologic/plants', 'Plants & microbes (Gate 11.7)'),
  E('process:cellular-respiration', 'Cellular respiration', null, 'Biologic Mode (Phase 11)'),
  E('process:glycolysis', 'Glycolysis', null, 'Biologic Mode (Phase 11)'),
  E('process:muscle-contraction', 'Muscle contraction', '#/biologic/movement?tab=muscle', 'Movement (Gate 12.2): Hill’s force–velocity relation'),
  E('process:blood-co2-transport', 'CO₂ transport in blood', null, 'Biologic Mode (Phase 12)'),
  E('process:nitrogen-cycle', 'Nitrogen cycle', null),
  E('structure:mitochondrion', 'Mitochondrion', '#/biologic/cells?part=mitochondrion', 'Cells (Gate 11.4): typically 1–2 µm long'),
  E('context:ozone-layer', 'Stratospheric ozone layer', null),
  E('context:urban-smog', 'Photochemical smog', null),
  E('context:greenhouse-effect', 'Greenhouse effect', null, 'Thermal-radiation laboratory (Phase 10)'),
  E('context:acid-rain', 'Acid rain', null),
  E('context:ocean-acidification', 'Ocean acidification', null),
  E('context:energy-production', 'Energy production', null),
  E('context:sunlight', 'Sunlight', '#/spectral?tab=blackbody&T=5772', 'Spectral atlas: 5772 K blackbody model of the Sun (IAU nominal T_eff)'),
  E('wave:em-ultraviolet', 'Ultraviolet radiation', '#/spectral?lambda=3e-7', 'Spectral atlas: UV-A/B/C (CIE) and ISO 21348 categories'),
  E('context:gravitational-lensing', 'Gravitational lensing', '#/cosmic/lensing', 'Point-mass lens plane, microlensing and astrometric deflection (Gate 6.3)'),
  E('context:distance-ladder', 'Distance ladder', '#/cosmic/ladder', 'Parallax, eclipsing binaries and masers → Cepheids and TRGB → type Ia supernovae → H₀ (Gate 7.2)'),
  E('context:cmb', 'Cosmic microwave background', '#/cosmic/cmb', 'FIRAS blackbody spectrum, T(z) = T₀(1+z) and the Planck 2018 power spectrum (Gate 7.3)'),
  E('context:cosmic-expansion', 'Cosmic expansion and distances', '#/cosmic/universe', 'ΛCDM distances, lookback time and expansion history with Planck 2018 parameters (Gate 7.1)'),
  E('wave:em-visible', 'Visible light', '#/spectral?lambda=5.5e-7', 'Spectral atlas: visible range (no precise limits, CIE)'),
  // Gate E.1: the remaining broad radiation types, each with an encyclopedia entry (NASA Tour of the EM Spectrum)
  E('wave:em-spectrum', 'Electromagnetic spectrum', '#/spectral', 'Spectral atlas: one wavelength in every band convention'),
  E('wave:em-radio', 'Radio waves', '#/spectral?lambda=1', 'Spectral atlas: ITU-R V.431 bands and the ISO 21348 radio category'),
  E('wave:em-microwave', 'Microwaves', '#/spectral?lambda=0.005', 'Spectral atlas: ISO 21348 microwave category (1–15 mm), inside its radio range'),
  E('wave:em-infrared', 'Infrared radiation', '#/spectral?lambda=1e-5', 'Spectral atlas: ISO 21348, CIE and detector infrared divisions'),
  E('wave:em-xray', 'X-rays', '#/spectral?lambda=1e-9', 'Spectral atlas: ISO 21348 hard and soft X-rays'),
  E('wave:em-gamma', 'Gamma rays', '#/spectral?lambda=1e-13', 'Spectral atlas: ISO 21348 gamma-ray category'),
  // Phase 8, Gate 8.3: the comparison view itself, so the relationship explorer lists and opens it
  E('instrument:spectral-compare', 'Spectrum comparison (one axis)', '#/spectral/compare', 'NIST lines, nebula lines, blackbodies, FIRAS and n(λ) overlaid on one wavelength, frequency or energy axis (Gate 8.3)'),
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
// Gate E.2a: solar-system bodies with an encyclopedia entry (NASA Facts pages) are registered so the entry has an entity
for (const [id, label] of [['mercury', 'Mercury'], ['venus', 'Venus'], ['earth', 'Earth'], ['moon', 'Moon'], ['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'], ['neptune', 'Neptune'], ['pluto', 'Pluto'], ['ceres', 'Ceres']] as const)
  registerEntity(E(`body:${id}`, label, `#/cosmic/${id}`));
// Gate E.2b: every element has an encyclopedia entry (LANL periodic table), so every element is an entity
for (const el of ELEMENTS) registerEntity(E(`element:${el.Z}`, el.name, `#/atomic/element/${el.Z}`));
// Gate E.2c: molecules of the library (encyclopedia definitions from ChEBI / NCIt where openly licensed)
for (const m of MOLECULES) registerEntity(E(`molecule:${m.id}`, m.name, `#/atomic/molecules/${m.id}`));
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

// 5. Stellar classes (Gate 5.4) → the atomic line spectra that identify them (IAU OAE Glossary, one entry per
// class: ionized helium for O, neutral helium for B, strong hydrogen for A, ionized calcium and other metals for F and
// G, lines of iron and manganese atoms for K, titanium-oxide bands for M; these replaced OpenStax Astronomy 2e).
// ionisation stages are in the bundled NIST set. Star entities are registered when the 10 pc
// catalogue loads (src/modes/cosmic/star-systems/starRegistry.ts).
export const CLASS_LINES: Record<string, { spectra: string[]; note: string }> = {
  O: { spectra: ['He II'], note: 'ionised helium' },
  B: { spectra: ['He I'], note: 'neutral helium' },
  A: { spectra: ['H I'], note: 'strong hydrogen lines' },
  F: { spectra: ['Ca II', 'Fe II'], note: 'ionised calcium and other metal lines' },
  G: { spectra: ['Ca II', 'Fe II'], note: 'strong ionised calcium; metal lines stronger than in F stars' },
  K: { spectra: ['Ca I', 'Fe I'], note: 'lines of iron and manganese atoms' },
  M: { spectra: [], note: 'molecular bands, mainly titanium oxide (no molecular band data bundled)' },
};
for (const [cls, { spectra, note }] of Object.entries(CLASS_LINES)) {
  registerEntity(E(`stellar-class:${cls}`, `Class ${cls} stars`, `#/cosmic/stars/hr?d=classes&cls=${cls}`));
  for (const spec of spectra) registerRelationship({ from: `stellar-class:${cls}`, to: spectrumId(spec), type: 'absorbs', context: `identified by: ${note}`, source: 'iau-oae-glossary' });
}

// 6. The Sun among the stars (Gate 5.5): its class (IAU OAE Glossary, Spectral Type: "The Sun is spectral type G2"; NASA's
// Sun fact sheet: G2 V) and its photospheric composition (Asplund et al. 2009, the abundances already shown
// in the element views). Planned link texts are not needed: every target here has a route.
registerRelationship({ from: 'body:sun', to: 'stellar-class:G', type: 'part-of', context: 'G2', source: 'iau-oae-glossary' });
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
registerRelationship({ from: 'context:distance-ladder', to: 'context:cosmic-expansion', type: 'explains', context: 'measures today’s expansion rate H₀ directly (SH0ES: 73.04 ± 1.04 km/s/Mpc), to compare with Planck’s ΛCDM inference', source: 'riess-2022' });
registerRelationship({ from: 'galaxy:milky-way', to: 'context:distance-ladder', type: 'part-of', context: 'Gaia EDR3 parallaxes of Milky Way Cepheids are one of the three geometric anchors', source: 'riess-2022' });
// Phase 7, Gate 7.3: the CMB
registerRelationship({ from: 'context:cosmic-expansion', to: 'context:cmb', type: 'explains', context: 'adiabatic expansion cools the CMB as T₀(1 + z); measured at z = 0.89–2.69 (β = −0.007 ± 0.027)', source: 'noterdaeme-2011' });
registerRelationship({ from: 'context:cmb', to: 'context:cosmic-expansion', type: 'explains', context: 'the Planck power spectrum fixes the base-ΛCDM parameters used for every distance (θ∗ = r∗/D_M(z∗))', source: 'planck-2018-vi' });
registerRelationship({ from: 'context:cmb', to: 'wave:em-microwave', type: 'emits', context: 'today a 2.72548 K blackbody whose B_ν peak (160 GHz, 1.87 mm by Wien’s law) falls in the ISO 21348 microwave category; FIRAS measured 68–640 GHz', source: 'fixsen-1996' });
registerRelationship({ from: 'context:cosmic-expansion', to: 'context:gravitational-lensing', type: 'explains', context: 'angular-diameter distances D_d, D_s, D_ds set the Einstein radius of distant lenses', source: 'hogg-1999' });
// Phase 7, Gate 7.4: dark-matter evidence
registerEntity(E('context:dark-matter', 'Dark-matter evidence', '#/cosmic/darkmatter', 'Galaxy rotation, the Bullet Cluster, Coma and the cosmic census: observations beside visible-matter and dark-matter models (Gate 7.4)'));
registerRelationship({ from: 'context:dark-matter', to: 'context:gravitational-lensing', type: 'observed-with', context: 'Bullet Cluster: the lensing mass peaks sit on the galaxies, offset at ∼8σ from the X-ray gas that holds most of the visible mass', source: 'clowe-2006' });
registerRelationship({ from: 'context:dark-matter', to: 'context:cmb', type: 'observed-with', context: 'base ΛCDM fitted to the Planck spectra gives Ω_c h² = 0.11933 ± 0.00091 against Ω_b h² = 0.02242 ± 0.00014', source: 'planck-2018-vi' });
registerRelationship({ from: 'context:dark-matter', to: 'galaxy:milky-way', type: 'explains', context: 'M₂₀₀ = (1.1 ± 0.3) × 10¹² M☉ against a stellar mass of (5 ± 1) × 10¹⁰ M☉', source: 'bland-hawthorn-gerhard-2016' });
registerRelationship({ from: 'context:dark-matter', to: 'context:cosmic-expansion', type: 'part-of', context: 'cold dark matter is about 84 % of Ω_m in the Planck 2018 background used for every distance', source: 'planck-2018-vi' });
// Phase 7, Gate 7.5: gravitational waves
registerEntity(E('context:gravitational-waves', 'Gravitational waves', '#/cosmic/gw', 'The GWOSC catalog of compact-binary mergers, a leading-order chirp model and GW170817 with light (Gate 7.5)'));
registerRelationship({ from: 'compact-object:gw150914-final', to: 'context:gravitational-waves', type: 'observed-with', context: 'the 62 ± 4 M☉ remnant (90 %) is measured only through the waveform of GW150914', source: 'abbott-2016-gw150914' });
registerRelationship({ from: 'context:gravitational-waves', to: 'compact-object:psr-b1913', type: 'explains', context: 'the Hulse–Taylor orbit shrinks as gravitational-wave emission predicts: observed / predicted decay 0.9983 ± 0.0016', source: 'weisberg-huang-2016' });
registerRelationship({ from: 'context:cosmic-expansion', to: 'context:gravitational-waves', type: 'explains', context: 'expansion stretches the waves: source-frame masses are the detector-frame masses ÷ (1 + z), with z from d_L in flat ΛCDM (H₀ = 67.9, Ωm = 0.3065)', source: 'gwtc-5-intro' });
registerRelationship({ from: 'context:cosmic-expansion', to: 'context:gravitational-waves', type: 'observed-with', context: 'GW170817 as a standard siren: H₀ = 70.0 +12.0/−8.0 km/s/Mpc (68.3 %) without a distance ladder', source: 'abbott-2017-h0' });
registerRelationship({ from: 'context:gravitational-waves', to: 'wave:em-gamma', type: 'observed-with', context: 'GRB 170817A arrived 1.74 ± 0.05 s after GW170817: the speeds of gravity and light differ by less than a few parts in 10¹⁵', source: 'abbott-2017-grb' });

// ---------------------------------------------------------------- Phase 9, Gate 9.1: antennas
registerEntity(E('instrument:antennas', 'Antennas and radiation patterns', '#/spectral/antennas?tab=pattern', 'Dipole patterns, directivity, radiation resistance, arrays and the Friis link equation (Gate 9.1)'));
registerEntity(E('field:hertzian-dipole', 'Field of a radiating dipole', '#/spectral/antennas', 'Exact near- and far-zone E and H of a Hertzian dipole (FIELDS layer, Gate 9.1)'));
registerRelationship({ from: 'field:hertzian-dipole', to: 'wave:em-radio', type: 'emits', context: 'an oscillating current radiates; the far field falls as 1/r and peaks broadside to the current (sin θ)', source: 'ellingson-2020-vol2' });
registerRelationship({ from: 'field:hertzian-dipole', to: 'field:plane-wave-ex', type: 'explains', context: 'far from the source (r ≫ λ) the spherical wave is locally plane: E ⊥ H, |E|/|H| = η₀', source: 'ellingson-2020-vol2' });
registerRelationship({ from: 'instrument:antennas', to: 'field:hertzian-dipole', type: 'part-of', context: 'wire antennas are modelled as sums of Hertzian dipoles (Ellingson §9.6)', source: 'ellingson-2020-vol2' });
registerRelationship({ from: 'instrument:antennas', to: 'wave:em-radio', type: 'emits', context: 'Friis example: a 6 GHz (5 cm) point-to-point link between 27 dBi dishes over 30 km (Ellingson Example 10.11)', source: 'ellingson-2020-vol2' });

// ---------------------------------------------------------------- Phase 9, Gate 9.2: RF atlas
registerEntity(E('context:radio-allocations', 'Radio-frequency allocations (U.S.)', '#/spectral/rf', 'AM/FM broadcast, ISM and unlicensed bands from 47 CFR, GPS carriers and Voyager links on the ITU band axis (Gate 9.2)'));
registerEntity(E('context:gps', 'GPS navigation signals', '#/spectral/rf?sel=gps-l1', 'L1, L2 and L5 carriers and the minimum received power (IS-GPS-200N, IS-GPS-705J)'));
registerEntity(E('body:voyager-1', 'Voyager 1', '#/cosmic/voyager-1'));
registerEntity(E('body:voyager-2', 'Voyager 2', '#/cosmic/voyager-2'));
registerRelationship({ from: 'context:radio-allocations', to: 'wave:em-radio', type: 'part-of', context: 'FM broadcasting occupies 88–108 MHz in 100 channels of 200 kHz (47 CFR §73.201)', source: 'ecfr-47-cfr' });
registerRelationship({ from: 'context:radio-allocations', to: 'instrument:antennas', type: 'observed-with', context: 'unlicensed digital transmitters at 902–928 MHz, 2.4 GHz and 5.8 GHz may deliver up to 1 W to the antenna (47 CFR §15.247)', source: 'ecfr-47-cfr' });
registerRelationship({ from: 'context:gps', to: 'wave:em-radio', type: 'emits', context: 'L1 1575.42 MHz, L2 1227.6 MHz; at least −158.5 dBW of L1 C/A reaches a 3 dBi antenna on the ground', source: 'is-gps-200n' });
registerRelationship({ from: 'context:gps', to: 'body:earth', type: 'located-in', context: 'medium Earth orbit at about 20,200 km altitude', source: 'gps-gov-space-segment' });
registerRelationship({ from: 'body:voyager-2', to: 'wave:em-radio', type: 'emits', context: 'X-band downlink 8415 MHz (λ 3.6 cm); −145.5 dBm predicted at the 70 m DSS-43 from 48.62 au (design control table, 1996)', source: 'ludwig-taylor-2002' });
registerRelationship({ from: 'body:voyager-1', to: 'wave:em-radio', type: 'emits', context: 'X-band downlink 8420.432097 MHz (DSN channel 18, coherent)', source: 'ludwig-taylor-2002' });
registerRelationship({ from: 'body:voyager-2', to: 'context:radio-allocations', type: 'part-of', context: 'S-band uplink 2113.3125 MHz and X-band downlink 8415 MHz (DSN channel 14)', source: 'ludwig-taylor-2002' });

// ---------------------------------------------------------------- Phase 9, Gate 9.3: communications room
registerEntity(E('instrument:comms-room', '3D communications room', '#/spectral/room', 'Dipole link in a room: image-method rays with ITU-R P.2040 building materials, multipath fading and delay spread (Gate 9.3)'));
registerRelationship({ from: 'instrument:comms-room', to: 'instrument:antennas', type: 'part-of', context: 'half-wave dipoles transmit and receive; received voltage V = E · l_e (Ellingson eq. 10.114)', source: 'ellingson-2020-vol2' });
registerRelationship({ from: 'instrument:comms-room', to: 'context:radio-allocations', type: 'observed-with', context: 'the 2.45, 5.8, 24.125 and 61.25 GHz presets are ISM frequencies of 47 CFR §18.301', source: 'ecfr-47-cfr' });
registerRelationship({ from: 'instrument:comms-room', to: 'wave:em-radio', type: 'explains', context: 'walls reflect radio waves with TE and TM coefficients set by their complex permittivity (concrete, glass, plasterboard … at 1–100 GHz)', source: 'itu-r-p2040-4' });

// ---------------------------------------------------------------- Phase 9, Gate 9.4: modulation lab
registerEntity(E('instrument:modulation-lab', 'Modulation lab', '#/spectral/modulation', 'AM and FM spectra, BPSK/FSK in white noise with measured bit-error rates, channel capacity (Gate 9.4)'));
registerRelationship({ from: 'instrument:modulation-lab', to: 'context:radio-allocations', type: 'explains', context: 'FM broadcasting: “the instantaneous radio frequency varies in proportion to the instantaneous amplitude of the modulating signal”; ±75 kHz is 100 % modulation', source: 'ecfr-47-cfr' });
registerRelationship({ from: 'instrument:modulation-lab', to: 'context:gps', type: 'explains', context: 'each L1 carrier component “is bi-phase shift key (BPSK) modulated by a separate bit train” (IS-GPS-200N §3.2.3)', source: 'is-gps-200n' });
registerRelationship({ from: 'instrument:modulation-lab', to: 'wave:em-radio', type: 'explains', context: 'a modulated carrier occupies f_c ± W; the coherent AM receiver multiplies by the carrier and low-pass filters', source: 'johnson-fundamentals-ee' });

// ---------------------------------------------------------------- Phase 9, Gate 9.5: acoustic lab
registerEntity(E('instrument:acoustic-lab', 'Acoustic lab', '#/spectral/acoustics', 'Sound level and inverse-square spreading, acoustic impedance and reflection, moving sources and the Mach cone (Gate 9.5)'));
registerRelationship({ from: 'instrument:acoustic-lab', to: 'wave:sound-water', type: 'explains', context: 'sound arriving from air is almost entirely reflected: “Even at perpendicular incidence the reflection is sensibly perfect” (Rayleigh §270)', source: 'rayleigh-1896' });
registerRelationship({ from: 'instrument:acoustic-lab', to: 'material:water', type: 'has-property', context: 'acoustic impedance ρv at 1 atm', source: 'nist-webbook-fluids' });

// ---------------------------------------------------------------- Phase 9, Gate 9.6: audio synthesis & FFT
registerEntity(E('instrument:audio-lab', 'Audio synthesis and FFT', '#/spectral/audio', 'Fourier synthesis with playback, sampling and aliasing, spectrograms (Gate 9.6)'));
registerEntity(E('wave:sound-air', 'Sound waves in dry air', '#/spectral/lab?demo=traveling&medium=air&wave=longitudinal&f=440&A=1e-6', 'Wave lab: ideal-gas air, c = √(γRT/M)'));
registerRelationship({ from: 'instrument:audio-lab', to: 'wave:sound-air', type: 'explains', context: 'a periodic sound is a sum of harmonics at multiples of its fundamental (classic Fourier series, Johnson §4.3)', source: 'johnson-fundamentals-ee' });

// ---------------------------------------------------------------- Phase 9, Gate 9.7: room acoustics
registerEntity(E('instrument:room-acoustics', 'Room acoustics and resonance', '#/spectral/roomacoustics', 'Room modes (Rayleigh), Sabine reverberation and a 2-D wave simulation (Gate 9.7)'));
registerRelationship({ from: 'instrument:room-acoustics', to: 'wave:sound-air', type: 'explains', context: 'a rigid room rings only at f = (c/2)√((p/L)² + (q/W)² + (r/H)²); the gravest mode runs along the longest edge', source: 'rayleigh-1896' });
registerRelationship({ from: 'instrument:room-acoustics', to: 'instrument:acoustic-lab', type: 'part-of', context: 'reverberation: t = 0.164 V/a with absorbing power in square metres of open window (Sabine)', source: 'sabine-1922' });

// ---------------------------------------------------------------- Phase 10, Gate 10.1: geometric optics
registerEntity(E('instrument:geometric-optics', 'Geometric optics', '#/spectral/optics', 'Reflection and refraction, total reflection, lenses, mirrors and prism dispersion with exact ray traces (Gate 10.1)'));
registerRelationship({ from: 'instrument:geometric-optics', to: 'wave:em-visible', type: 'explains', context: 'rays obey n_a sin φ_a = n_b sin φ_b; “The refractive index depends on the color” (dispersion)', source: 'drude-1902' });
for (const m of MATERIALS.filter((x) => x.refractiveIndex)) registerRelationship({ from: 'instrument:geometric-optics', to: `material:${m.id}`, type: 'has-property', context: 'refractive index n(λ) used for refraction, lenses and prisms', source: m.refractiveIndex!.sources[0] });

// ---------------------------------------------------------------- Phase 10, Gate 10.2: wave optics
registerEntity(E('instrument:wave-optics', 'Wave optics', '#/spectral/waveoptics', 'Two-source interference, slit and grating diffraction, resolving power and thin-film colours (Gate 10.2)'));
registerRelationship({ from: 'instrument:wave-optics', to: 'wave:em-visible', type: 'explains', context: 'interference J = A₁² + A₂² + 2A₁A₂ cos 2π(r₁ − r₂)/λ; fringes aλ/d; grating maxima sin φ = hλ/d', source: 'drude-1902' });
registerRelationship({ from: 'instrument:wave-optics', to: 'instrument:geometric-optics', type: 'part-of', context: 'Huygens’ principle: every point reached by a light-wave is a source of elementary waves, which “produce an appreciable effect only upon the surface of their envelope”', source: 'drude-1902' });
registerRelationship({ from: 'instrument:wave-optics', to: spectrumId('Na I'), type: 'explains', context: 'the sodium D doublet (589.16 and 589.76 nm) is resolved when the resolving power hm reaches 987', source: 'nist-asd' });
registerRelationship({ from: 'instrument:wave-optics', to: spectrumId('Hg I'), type: 'explains', context: 'the mercury yellow lines (577.1 and 579.2 nm) resolved by a grating', source: 'nist-asd' });

// ---------------------------------------------------------------- Phase 10, Gate 10.3: polarisation
registerEntity(E('instrument:polarisation', 'Polarisation and optical materials', '#/spectral/polarisation', 'Fresnel reflection of s and p light, the polarizing angle, polarizing by two reflections and uniaxial crystals (Gate 10.3)'));
registerRelationship({ from: 'instrument:polarisation', to: 'wave:em-visible', type: 'explains', context: 'reflection at the polarizing angle tan φ = n leaves only light polarized in the plane of incidence', source: 'drude-1902' });
registerRelationship({ from: 'instrument:polarisation', to: 'instrument:geometric-optics', type: 'part-of', context: 'the Fresnel amplitudes give the fraction reflected at each surface that the ray traces ignore', source: 'drude-1902' });
for (const id of ['alpha-quartz', 'sapphire', 'rutile']) registerRelationship({ from: 'instrument:polarisation', to: `material:${id}`, type: 'has-property', context: 'ordinary and extraordinary refractive indices (birefringence)', source: id === 'alpha-quartz' ? 'ghosh-1999' : id === 'sapphire' ? 'malitson-dodge-1972' : 'devore-1951' });

// ---------------------------------------------------------------- Phase 10, Gate 10.4: spectroscopy
registerEntity(E('instrument:spectroscopy', 'Spectroscopy', '#/spectral/spectroscopy', 'Hydrogen-like series against NIST lines, Doppler and Lorentzian line widths, diatomic vibration and rotation (Gate 10.4)'));
for (const [sp, ctx] of [['H I', 'hydrogenic lines from R_M with the proton mass'], ['D I', 'the isotope shift: the deuteron mass raises R_M'], ['He II', 'Z = 2: the same series four times as energetic']] as const)
  registerRelationship({ from: 'instrument:spectroscopy', to: spectrumId(sp), type: 'explains', context: ctx, source: 'nist-atomic-spectroscopy-compendium' });
registerRelationship({ from: 'instrument:spectroscopy', to: 'wave:em-microwave', type: 'explains', context: 'pure-rotation lines of diatomic molecules ν = 2B_v J′ − 4D_v J′³ (CO J = 1 ← 0 near 115 GHz)', source: 'nist-diatomic-database' });
registerRelationship({ from: 'instrument:spectroscopy', to: 'wave:em-infrared', type: 'explains', context: 'vibrational quanta G(1) − G(0) of diatomic molecules (HCl ≈ 2885 cm⁻¹)', source: 'huber-herzberg-1979' });

// ---------------------------------------------------------------- Phase 10, Gate 10.5: thermal radiation
registerEntity(E('instrument:thermal-radiation', 'Thermal radiation and energy balance', '#/spectral/thermal', 'Planck, Wien and Stefan–Boltzmann; grey bodies by Kirchhoff’s law; radiative balance of the planets (Gate 10.5)'));
registerRelationship({ from: 'instrument:thermal-radiation', to: 'wave:em-infrared', type: 'explains', context: 'bodies near room temperature radiate mostly in the infrared: λ_m T = b puts the peak near 10 µm at 300 K', source: 'planck-1914' });
registerRelationship({ from: 'instrument:thermal-radiation', to: 'context:sunlight', type: 'explains', context: 'planet-averaged sunlight is one-fourth of the total solar irradiance, about 340 W/m² at Earth', source: 'nasa-earth-energy-budget' });
for (const id of ['mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'])
  if (REGISTRY.has(`body:${id}`)) registerRelationship({ from: `body:${id}`, to: 'instrument:thermal-radiation', type: 'has-property', context: 'Bond albedo, solar irradiance and black-body (balance) temperature', source: 'nssdc-factsheet' });

// ---------------------------------------------------------------- Phase 10, Gate 10.6: telescopes
registerEntity(E('instrument:telescopes', 'Telescopes and cameras', '#/spectral/telescopes', 'Airy’s pattern, Rayleigh’s resolution of two stars, focal length, plate scale and the diffraction limits of Hubble and JWST (Gate 10.6)'));
registerRelationship({ from: 'instrument:telescopes', to: 'instrument:wave-optics', type: 'part-of', context: 'the image of a star through a circular aperture is a diffraction pattern (Airy 1835)', source: 'airy-1835' });
registerRelationship({ from: 'instrument:telescopes', to: 'wave:em-visible', type: 'explains', context: 'the smallest resolvable angle is about 1·2197 λ/D', source: 'rayleigh-scientific-papers-1' });
registerRelationship({ from: 'instrument:telescopes', to: 'wave:em-infrared', type: 'explains', context: 'JWST observes from 0.6 to beyond 28 µm with a ~6.5 m mirror', source: 'stsci-jwst-jdox' });

// ---------------------------------------------------------------- Phase 10, Gate 10.7: atmosphere and remote sensing
registerEntity(E('instrument:atmosphere', 'Atmospheric radiation and remote sensing', '#/spectral/atmosphere', 'Rayleigh scattering and the blue sky, molecular extinction and air mass, Landsat 8–9 bands (Gate 10.7)'));
registerRelationship({ from: 'instrument:atmosphere', to: 'context:sunlight', type: 'explains', context: 'scattered intensity ∝ λ⁻⁴: the scattered sunlight is blue', source: 'rayleigh-scientific-papers-1' });
registerRelationship({ from: 'instrument:atmosphere', to: 'body:earth', type: 'explains', context: 'molecular extinction h = 32π³(μ − 1)²/(3nλ⁴) through 8·3 km of air at standard pressure', source: 'rayleigh-scientific-papers-4' });
registerRelationship({ from: 'instrument:atmosphere', to: 'instrument:thermal-radiation', type: 'part-of', context: 'Landsat’s thermal bands near 11 µm sit at the Wien peak of a 288 K surface', source: 'usgs-landsat-bands' });
registerRelationship({ from: 'instrument:atmosphere', to: 'wave:em-infrared', type: 'explains', context: 'Landsat 8–9 TIRS bands 10.6–11.19 and 11.50–12.51 µm', source: 'usgs-landsat-bands' });

// ---------------- Phase 11: Biologic foundations ----------------
registerEntity(E('instrument:life-atlas', 'Scale of life', '#/biologic', 'Sizes from molecules to small animals on one log axis, quoted from NIH/NIGMS, nano.gov, U.S. DOE and PDB-101 (Gate 11.1)'));
registerRelationship({ from: 'instrument:life-atlas', to: 'structure:mitochondrion', type: 'has-property', context: 'mitochondrion length typically 1–2 µm, up to 7 µm', source: 'nigms-inside-the-cell' });
registerRelationship({ from: 'structure:mitochondrion', to: 'molecule:pubchem-5957', type: 'produces', context: '“ATP is made in organelles called mitochondria” (Inside the Cell, p. 11)', source: 'nigms-inside-the-cell' });
for (const [id, what] of [['pubchem-962', 'water'], ['pubchem-5793', 'glucose'], ['pubchem-5957', 'ATP']] as const)
  registerRelationship({ from: 'instrument:life-atlas', to: `molecule:${id}`, type: 'has-property', context: `size of ${what}: largest nucleus-to-nucleus distance in its PubChem3D conformer`, source: 'pubchem' });
registerEntity(E('instrument:biomolecules', 'Biomolecules and the genetic code', '#/biologic/molecules', 'Amino acids, nucleic-acid parts, sugars and lipids; the standard and vertebrate mitochondrial genetic codes (Gate 11.2)'));
for (const [mol, one] of [['pubchem-5950', 'A'], ['pubchem-5862', 'C'], ['pubchem-5960', 'D'], ['pubchem-33032', 'E'], ['pubchem-6140', 'F'], ['pubchem-750', 'G'], ['pubchem-6274', 'H'], ['pubchem-6306', 'I'], ['pubchem-5962', 'K'], ['pubchem-6106', 'L'], ['pubchem-6137', 'M'], ['pubchem-6267', 'N'], ['pubchem-145742', 'P'], ['pubchem-5961', 'Q'], ['pubchem-6322', 'R'], ['pubchem-5951', 'S'], ['pubchem-6288', 'T'], ['pubchem-6287', 'V'], ['pubchem-6305', 'W'], ['pubchem-6057', 'Y']] as const)
  registerRelationship({ from: `molecule:${mol}`, to: 'instrument:biomolecules', type: 'has-property', context: `amino acid ${one}: its codons in the standard genetic code`, source: 'ncbi-genetic-codes' });
for (const mol of ['pubchem-190', 'pubchem-135398634', 'pubchem-597', 'pubchem-1135', 'pubchem-9828112'])
  registerRelationship({ from: `molecule:${mol}`, to: 'instrument:biomolecules', type: 'part-of', context: 'a building block of DNA (base or sugar of a nucleotide)', source: 'nhgri-glossary' });
registerRelationship({ from: 'molecule:pubchem-1174', to: 'instrument:biomolecules', type: 'part-of', context: 'uracil takes the place of thymine in RNA', source: 'nhgri-glossary' });
registerEntity(E('instrument:proteins', 'Protein and DNA structures', '#/biologic/proteins', 'Seven PDB crystal structures from their coordinates (Gate 11.3)'));
for (const [id, label, cite] of [['1bna', 'B-DNA dodecamer (PDB 1BNA)', 'drew-1981'], ['1mbn', 'Myoglobin (PDB 1MBN)', 'watson-1969'], ['1a6m', 'Oxy-myoglobin (PDB 1A6M)', 'vojtechovsky-1999'], ['4hhb', 'Haemoglobin (PDB 4HHB)', 'fermi-1984'], ['4ins', 'Insulin (PDB 4INS)', 'baker-1988'], ['1ema', 'Green fluorescent protein (PDB 1EMA)', 'ormo-1996'], ['1lyz', 'Lysozyme (PDB 1LYZ)', 'diamond-1974']] as const) {
  registerEntity(E(`structure:pdb-${id}`, label, `#/biologic/proteins?id=${id.toUpperCase()}`));
  registerRelationship({ from: `structure:pdb-${id}`, to: 'instrument:proteins', type: 'part-of', context: 'crystal structure drawn from its deposited coordinates', source: cite });
}
registerRelationship({ from: 'structure:pdb-4hhb', to: 'instrument:life-atlas', type: 'has-property', context: 'haemoglobin is “roughly 5.5 nanometers wide” (NIGMS); 4HHB measures 6.6 × 5.7 × 5.4 nm along its principal axes', source: 'nigms-biobeat-nanoparticles-2023' });
registerRelationship({ from: 'molecule:pubchem-9828112', to: 'structure:pdb-1bna', type: 'part-of', context: 'each DNA strand has a backbone of alternating deoxyribose and phosphate groups', source: 'nhgri-glossary' });
registerEntity(E('instrument:cells', 'Cells', '#/biologic/cells', 'Eukaryotic and prokaryotic cells at one scale; size and surface (Gate 11.4)'));
for (const [id, label] of [['nucleus', 'Cell nucleus'], ['ribosome', 'Ribosome'], ['cell-membrane', 'Cell membrane'], ['endoplasmic-reticulum', 'Endoplasmic reticulum'], ['golgi', 'Golgi'], ['lysosome', 'Lysosome']] as const) {
  registerEntity(E(`structure:${id}`, label, `#/biologic/cells?part=${id === 'cell-membrane' ? 'membrane' : id === 'endoplasmic-reticulum' ? 'er' : id}`));
  registerRelationship({ from: `structure:${id}`, to: 'instrument:cells', type: 'part-of', context: 'a part of the eukaryotic cell drawn in the Cells view', source: 'nigms-glossary' });
}
registerRelationship({ from: 'structure:mitochondrion', to: 'instrument:cells', type: 'part-of', context: 'several thousand in a human heart cell, around 25 % of its volume (Inside the Cell p. 33)', source: 'nigms-inside-the-cell' });
registerRelationship({ from: 'structure:ribosome', to: 'instrument:biomolecules', type: 'explains', context: 'the ribosome reads the mRNA sequence and translates the genetic code into a string of amino acids', source: 'nhgri-glossary' });
registerRelationship({ from: 'structure:ribosome', to: 'instrument:life-atlas', type: 'has-property', context: 'ribosome diameter 20–30 nm', source: 'nigms-inside-the-cell' });
registerEntity(E('instrument:membranes', 'Membranes and the membrane potential', '#/biologic/membranes', 'Hodgkin & Katz (1949) equation (4) for the squid axon; the lipid bilayer (Gate 11.5)'));
registerRelationship({ from: 'structure:cell-membrane', to: 'instrument:membranes', type: 'has-property', context: 'a voltage across it set by ion gradients and permeabilities (Hodgkin & Katz equation 4)', source: 'hodgkin-katz-1949' });
registerRelationship({ from: 'molecule:pubchem-5997', to: 'structure:cell-membrane', type: 'part-of', context: 'cholesterol, a membrane lipid that helps regulate stiffness', source: 'nigms-biobeat-membranes-2021' });
registerRelationship({ from: 'instrument:membranes', to: 'element:11', type: 'explains', context: 'raising the sodium permeability (P_Na/P_K = 20 at the peak of the spike) drives the potential towards the sodium potential', source: 'hodgkin-katz-1949' });
registerRelationship({ from: 'instrument:membranes', to: 'element:19', type: 'explains', context: 'at rest the potential lies near the potassium potential (P_K : P_Na : P_Cl = 1 : 0.04 : 0.45)', source: 'hodgkin-katz-1949' });
registerEntity(E('instrument:transport', 'Diffusion, osmosis and enzyme kinetics', '#/biologic/transport', 'Fick, Einstein, van ’t Hoff and Michaelis–Menten with ICT diffusion coefficients (Gate 11.6)'));
for (const [mol, what] of [['pubchem-5793', 'glucose'], ['pubchem-5988', 'sucrose'], ['pubchem-6134', 'lactose'], ['pubchem-439186', 'maltose']] as const)
  registerRelationship({ from: `molecule:${mol}`, to: 'instrument:transport', type: 'has-property', context: `diffusion coefficient of ${what} in water at 15 °C`, source: 'ict-1929' });
registerRelationship({ from: 'molecule:pubchem-5988', to: 'instrument:transport', type: 'participates-in', context: 'invertase splits sucrose into glucose and fructose; Michaelis and Menten measured the rate (1913)', source: 'michaelis-menten-1913' });
registerRelationship({ from: 'instrument:transport', to: 'instrument:cells', type: 'explains', context: 'diffusion time grows as the square of distance: microseconds across a ribosome, seconds across a cell', source: 'einstein-brownian-1926' });
registerEntity(E('instrument:plants', 'Plants and microorganisms', '#/biologic/plants', 'Photosynthesis and chlorophyll; viruses, bacteria and cells (Gate 11.7)'));
registerRelationship({ from: 'instrument:plants', to: 'process:photosynthesis', type: 'explains', context: 'CO2 + H2O + energy = CH2O + O2 (NASA Earth Observatory)', source: 'nasa-carbon-cycle-2011' });
registerRelationship({ from: 'process:photosynthesis', to: 'wave:em-visible', type: 'absorbs', context: 'chlorophyll a absorbs most at 427.8 and 660 nm, chlorophyll b at 453 and 643 nm (in ether)', source: 'omlc-photochemcad' });
registerRelationship({ from: 'process:photosynthesis', to: 'molecule:pubchem-5793', type: 'produces', context: 'plants make fuel — glucose and other sugars — from carbon dioxide and sunlight', source: 'nasa-carbon-cycle-2011' });
registerRelationship({ from: 'instrument:plants', to: 'instrument:life-atlas', type: 'part-of', context: 'viruses, bacteria and plant cells placed on the scale of life', source: 'pdb101-virus-structures' });
// ---------------- Phase 12: human anatomy & physiology ----------------
registerEntity(E('instrument:body', 'The human body (BodyParts3D)', '#/biologic/body', 'Organs and skeleton in 3D with quoted facts (Gate 12.1)'));
for (const [id, label] of [['skeleton', 'Skeleton'], ['heart', 'Heart'], ['right-lung', 'Right lung'], ['left-lung', 'Left lung'], ['brain', 'Brain'], ['liver', 'Liver'], ['stomach', 'Stomach'], ['small-intestine', 'Small intestine'], ['large-intestine', 'Large intestine'], ['right-kidney', 'Right kidney'], ['left-kidney', 'Left kidney']] as const) {
  registerEntity(E(`structure:organ-${id}`, label, `#/biologic/body?sel=${id}`));
  registerRelationship({ from: `structure:organ-${id}`, to: 'instrument:body', type: 'part-of', context: 'BodyParts3D organ model', source: 'bodyparts3d' });
}
registerRelationship({ from: 'structure:organ-heart', to: 'structure:pdb-4hhb', type: 'drives', context: 'the heart pumps about 5 litres of blood a minute; haemoglobin in its red cells carries oxygen', source: 'seer-training' });
registerRelationship({ from: 'structure:organ-right-kidney', to: 'instrument:transport', type: 'explains', context: 'about a million nephrons filter about 150 quarts of blood a day', source: 'niddk' });
registerRelationship({ from: 'structure:organ-left-kidney', to: 'instrument:transport', type: 'explains', context: 'only 1 to 2 quarts of the filtered blood become urine', source: 'niddk' });
registerEntity(E('instrument:movement', 'Bones and muscle', '#/biologic/movement', 'SEER bones and muscle; Hill’s force–velocity relation (Gate 12.2)'));
registerEntity(E('instrument:circulation', 'Circulation and breathing', '#/biologic/circulation', 'Heart, blood pressure, Poiseuille flow, blood and lungs (Gate 12.3)'));
registerRelationship({ from: 'process:muscle-contraction', to: 'instrument:movement', type: 'part-of', context: 'shortening speed falls with load along Hill’s hyperbola (P + a)(v + b) = const', source: 'hill-1938' });
registerRelationship({ from: 'structure:organ-skeleton', to: 'instrument:movement', type: 'part-of', context: '206 named bones: 80 axial, 126 appendicular', source: 'seer-training' });
registerRelationship({ from: 'structure:organ-heart', to: 'instrument:circulation', type: 'part-of', context: 'one cardiac cycle lasts 0.8 s at a normal rate; about 5 litres a minute', source: 'seer-training' });
registerRelationship({ from: 'instrument:circulation', to: 'structure:organ-right-lung', type: 'explains', context: 'oxygen-poor blood goes to the lungs and returns oxygen-rich through the pulmonary veins', source: 'nhlbi' });
registerRelationship({ from: 'instrument:circulation', to: 'instrument:transport', type: 'explains', context: 'flow through narrow tubes grows as the fourth power of the diameter (Poiseuille 1840)', source: 'poiseuille-1840' });
registerEntity(E('instrument:nerves', 'Nerves and the action potential', '#/biologic/nerves', 'Hodgkin–Huxley (1952) simulated; conduction velocity (Gate 12.4)'));
registerRelationship({ from: 'instrument:nerves', to: 'instrument:membranes', type: 'explains', context: 'the resting potential of Hodgkin & Katz (1949) becomes a spike when the sodium conductance rises (Hodgkin & Huxley 1952)', source: 'hodgkin-huxley-1952' });
registerRelationship({ from: 'structure:organ-brain', to: 'instrument:nerves', type: 'part-of', context: '86.1 ± 8.1 billion neurons in the adult male human brain', source: 'azevedo-2009' });
registerRelationship({ from: 'instrument:nerves', to: 'element:11', type: 'explains', context: 'the sodium current I_Na carries the rising phase of the action potential', source: 'hodgkin-huxley-1952' });

export const getEntity = (id: string) => REGISTRY.get(id);
export const allEntities = () => [...REGISTRY.values()];
export const relationshipsFrom = (id: string) => RELATIONSHIPS.filter((r) => r.from === id);
export const relationshipsTo = (id: string) => RELATIONSHIPS.filter((r) => r.to === id);
export const allRelationships = () => [...RELATIONSHIPS];
