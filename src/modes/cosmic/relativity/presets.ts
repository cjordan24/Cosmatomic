/**
 * Central masses offered by the relativity view. Gate 6.1 offers the Sun and Earth (IAU nominal mass
 * parameters) plus user-chosen hypothetical masses; Gate 6.2 adds the measured compact objects
 * (published mass; measured radius as the surface, or none for black holes).
 */
import { CONSTANTS } from '@/core/constants/constants';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import { COMPACT_OBJECTS, KIND_LABEL, radiusKm } from '@/modes/cosmic/compact/compact';

export interface MassPreset {
  id: string;
  label: string;
  /** mass parameter GM (m³ s⁻²) */
  gm: number;
  /** physical surface radius (m), or null for a black hole */
  surfaceRadius: number | null;
  provenance: ProvenanceClass;
  note: string;
  sources: string[];
}

export const MASS_PRESETS: MassPreset[] = [
  { id: 'sun', label: 'Sun', gm: CONSTANTS.GMsun.value, surfaceRadius: CONSTANTS.Rsun.value, provenance: 'derived',
    note: 'IAU 2015 nominal GM☉ and R☉. The Sun is not a black hole: its radius is about 236 000 r_s.', sources: ['iau-2015-b3'] },
  { id: 'earth', label: 'Earth', gm: CONSTANTS.GMearth.value, surfaceRadius: CONSTANTS.ReEarth.value, provenance: 'derived',
    note: 'IAU 2015 nominal GM⊕ and equatorial radius; Earth treated as non-rotating and spherical.', sources: ['iau-2015-b3'] },
  // a star without a measured radius has an unknown surface, so it cannot be offered as a preset
  ...COMPACT_OBJECTS.filter((o) => o.kind === 'black-hole' || o.radius !== null).map((o): MassPreset => {
    const R = radiusKm(o);
    return { id: o.id, label: o.name, gm: o.mass[0] * CONSTANTS.GMsun.value, surfaceRadius: R ? R[0] * 1e3 : null, provenance: 'observed',
      note: `${KIND_LABEL[o.kind]}. Published mass ${o.mass[0] >= 1e5 ? (o.mass[0] / 1e6).toPrecision(4) + ' × 10⁶' : o.mass[0]} M☉ (${o.massMethod})${R ? `; measured radius ${R[0].toPrecision(4)} km` : ''}. Treated as non-rotating.`,
      sources: [o.massSource, ...(o.radiusSource && o.radiusSource !== o.massSource ? [o.radiusSource] : [])] };
  }),
  { id: 'bh10', label: '10 M☉ black hole', gm: 10 * CONSTANTS.GMsun.value, surfaceRadius: null, provenance: 'hypothetical',
    note: 'A hypothetical non-rotating black hole of 10 solar masses, for illustration of the strong-field region.', sources: [] },
  { id: 'custom', label: 'Your own mass', gm: CONSTANTS.GMsun.value, surfaceRadius: null, provenance: 'hypothetical',
    note: 'A hypothetical non-rotating black hole of any mass from 10⁻⁷ to 3 × 10¹⁰ M☉.', sources: [] },
];
