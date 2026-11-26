/**
 * Propagation media for mechanical waves (Gate 4.5). The propagation speed is a property of the
 * medium and its state — never an independent slider — so v = fλ is always enforced.
 *
 *  string     v = √(T/μ)                         (tension T, linear density μ: user-chosen)
 *  air (dry)  c = √(γ R T / M), γ = 1.4; M derived from the NSSDC dry-air composition and IUPAC atomic weights — ideal gas
 *  fluids     c(T) at 101.325 kPa from the NIST reference equations of state (datasets/materials)
 *  vacuum     no medium → no mechanical wave (null)
 */
import { CONSTANTS } from '@/core/constants/constants';
import { MATERIALS, soundSpeed } from '@/modes/atomic/materials/materials';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import curated from '@datasets/curated/curated-reference.json';
import { parseFormulaCounts } from '@/modes/atomic/reactions/formula';
import { elementBySymbol } from '@/modes/atomic/atoms/elements';

export const R_GAS = CONSTANTS.NA.value * CONSTANTS.kB.value;
/** Mean molar mass of dry air (kg/mol) from the NSSDC Earth composition (mole fractions) × IUPAC standard atomic weights. */
export const AIR_MOLAR_MASS = (() => {
  const comp = (curated as unknown as { atmospheres: { bodies: Record<string, { species: string; fraction: number }[]> } }).atmospheres.bodies.earth;
  let m = 0, x = 0;
  for (const c of comp) { let mi = 0; for (const [el, n] of parseFormulaCounts(c.species)) mi += n * (elementBySymbol(el)!.atomicWeight ?? NaN); m += c.fraction * mi; x += c.fraction; }
  return m / x / 1000;
})();
export const AIR_GAMMA = 1.4;            // ideal diatomic gas

export interface MediumState { temperatureK: number; tensionN: number; linearDensity: number }
export interface Medium {
  id: string; name: string; kind: 'string' | 'gas' | 'liquid' | 'vacuum';
  waveType: 'transverse' | 'longitudinal' | 'none';
  speed: (s: MediumState) => number | null;
  provenance: ProvenanceClass; model: string; validity: string[]; sources: string[];
  TrangeK?: [number, number];
}

const fluid = (id: string, name: string, kind: 'gas' | 'liquid'): Medium => {
  const m = MATERIALS.find((x) => x.id === id)!;
  const rows = m.fluid!.rows;
  return {
    id, name, kind, waveType: 'longitudinal',
    speed: (s) => soundSpeed(m, s.temperatureK),
    provenance: 'derived', model: 'NIST reference equation of state at 101.325 kPa (tabulated, interpolated)',
    validity: ['1 atm only', `tabulated ${rows[0].T}–${rows[rows.length - 1].T} K`, 'Longitudinal (pressure) waves only: fluids cannot support shear waves', 'Small-amplitude (linear) acoustics; no absorption'],
    sources: ['nist-webbook-fluids'], TrangeK: [rows[0].T, rows[rows.length - 1].T],
  };
};

export const MEDIA: Medium[] = [
  { id: 'string', name: 'Stretched string', kind: 'string', waveType: 'transverse',
    speed: (s) => (s.tensionN > 0 && s.linearDensity > 0 ? Math.sqrt(s.tensionN / s.linearDensity) : null),
    provenance: 'derived', model: 'v = √(T/μ), ideal flexible string', validity: ['Small displacements (slope ≪ 1)', 'Perfectly flexible, uniform string; no stiffness or damping'], sources: ['openstax-university-physics-1'] },
  { id: 'air', name: 'Dry air (ideal gas)', kind: 'gas', waveType: 'longitudinal',
    speed: (s) => (s.temperatureK > 0 ? Math.sqrt((AIR_GAMMA * R_GAS * s.temperatureK) / AIR_MOLAR_MASS) : null),
    provenance: 'derived', model: `c = √(γRT/M), γ = 1.4, M = ${(AIR_MOLAR_MASS * 1000).toFixed(3)} g/mol (derived from NSSDC composition)`, validity: ['Ideal-gas approximation', 'Dry air; humidity raises c slightly', 'γ taken as constant (diatomic, no vibrational excitation)'], sources: ['nssdc-factsheet', 'iupac-ciaaw', 'openstax-university-physics-1'], TrangeK: [200, 400] },
  fluid('water', 'Water (liquid, 1 atm)', 'liquid'),
  fluid('nitrogen', 'Nitrogen (1 atm)', 'gas'),
  fluid('helium', 'Helium (1 atm)', 'gas'),
  fluid('carbon-dioxide', 'Carbon dioxide (1 atm)', 'gas'),
  fluid('argon', 'Argon (1 atm)', 'gas'),
  { id: 'vacuum', name: 'Vacuum', kind: 'vacuum', waveType: 'none', speed: () => null, provenance: 'derived', model: 'No particles → no restoring pressure', validity: ['Mechanical (sound) waves cannot propagate; light can (Spectral → EM)'], sources: ['openstax-university-physics-1'] },
];
export const getMedium = (id: string) => MEDIA.find((m) => m.id === id) ?? MEDIA[0];
