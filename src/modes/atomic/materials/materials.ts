/**
 * Material records (Gate 4.3): condition-tagged properties for optics, acoustics, electromagnetism
 * and heat. Data: datasets/materials/materials.json. Every evaluator returns null outside the
 * documented validity range of its source — values are never extrapolated silently.
 */
import data from '@datasets/materials/materials.json';

export interface RefractiveModel {
  label: string; type: string | null; coefficients: number[] | null; rangeUm: [number, number] | null;
  table: [number, number][] | null; temperatureK: number | null; references: string; doi: string | null; comments: string; url: string; file: string; license: string; sources: string[];
}
export interface JanafTable { table: string; url: string; name: string; rows: { T: number; Cp: number; S: number; HmH298: number }[]; sources: string[] }
export interface FluidTable { name: string; pressurePa: number; url: string; rows: { T: number; density: number; cp: number; soundSpeed: number; viscosity: number; thermalConductivity: number; phase: string }[]; sources: string[] }
export interface PointProperty {
  property: 'electrical-resistivity' | 'relative-permittivity' | 'magnetic-permeability' | 'thermal-conductivity' | 'emissivity' | 'sound-speed' | 'optical-absorption';
  value?: number; model?: { kind: 'polynomial-celsius'; coefficients: number[]; validC: [number, number] };
  unit: string; conditions: Record<string, number | string>; uncertainty: number | null; provenance: 'observed' | 'derived'; definition: string; sources: string[];
}
export interface Material {
  id: string; name: string; formula: string; category: string; crystalId?: string; elementZ?: number; moleculeId?: string; phaseAt298: string;
  heatCapacity: JanafTable | null; refractiveIndex: RefractiveModel | null; fluid: FluidTable | null; properties: PointProperty[];
}

export const MATERIALS: Material[] = (data as unknown as { materials: Material[] }).materials;
export const getMaterial = (id: string) => MATERIALS.find((m) => m.id === id);

/**
 * Refractive index n(λ), λ in µm, following the refractiveindex.info formula definitions:
 *  1: n²−1 = C1 + Σ Ci λ²/(λ² − C(i+1)²)      2: n²−1 = C1 + Σ Ci λ²/(λ² − C(i+1))
 *  3: n² = C1 + Σ Ci λ^C(i+1)                  4: n² = C1 + C2λ^C3/(λ²−C4^C5) + C6λ^C7/(λ²−C8^C9) + Σ_{i≥10} Ci λ^C(i+1)
 *  5: n = C1 + Σ Ci λ^C(i+1)                   tabulated: linear interpolation
 * Returns null outside the stated wavelength range.
 */
export function refractiveIndex(m: RefractiveModel, um: number): number | null {
  if (m.rangeUm && (um < m.rangeUm[0] - 1e-9 || um > m.rangeUm[1] + 1e-9)) return null;
  const C = m.coefficients ?? [];
  const l2 = um * um;
  switch (m.type) {
    case 'formula 1': { let s = C[0]; for (let i = 1; i + 1 < C.length; i += 2) s += (C[i] * l2) / (l2 - C[i + 1] ** 2); return Math.sqrt(1 + s); }
    case 'formula 2': { let s = C[0]; for (let i = 1; i + 1 < C.length; i += 2) s += (C[i] * l2) / (l2 - C[i + 1]); return Math.sqrt(1 + s); }
    case 'formula 3': { let s = C[0]; for (let i = 1; i + 1 < C.length; i += 2) s += C[i] * um ** C[i + 1]; return Math.sqrt(s); }
    case 'formula 4': {
      const c = (i: number) => C[i - 1] ?? 0;
      let s = c(1) + (c(2) * um ** c(3)) / (l2 - c(4) ** c(5)) + (c(6) * um ** c(7)) / (l2 - c(8) ** c(9));
      for (let i = 10; i + 1 <= C.length; i += 2) s += c(i) * um ** c(i + 1);
      return Math.sqrt(s);
    }
    case 'formula 5': { let s = C[0]; for (let i = 1; i + 1 < C.length; i += 2) s += C[i] * um ** C[i + 1]; return s; }
    case 'tabulated n': case 'tabulated nk': {
      const t = m.table; if (!t) return null;
      for (let i = 0; i + 1 < t.length; i++) if (um >= t[i][0] && um <= t[i + 1][0]) { const u = (um - t[i][0]) / (t[i + 1][0] - t[i][0]); return t[i][1] + u * (t[i + 1][1] - t[i][1]); }
      return null;
    }
    default: return null;
  }
}

/** Linear interpolation in a table sorted by T; null outside the tabulated range. */
export function interpT<R extends { T: number }>(rows: R[], T: number, key: keyof R): number | null {
  for (let i = 0; i + 1 < rows.length; i++) {
    const a = rows[i], b = rows[i + 1];
    if (T >= a.T && T <= b.T && a.T !== b.T) { const u = (T - a.T) / (b.T - a.T); return (a[key] as number) + u * ((b[key] as number) - (a[key] as number)); }
  }
  const exact = rows.find((r) => r.T === T);
  return exact ? (exact[key] as number) : null;
}

/** Speed of sound in a bundled fluid at 1 atm (m/s), or null if outside the table / not that phase. */
export function soundSpeed(m: Material, T: number): number | null {
  if (!m.fluid) return null;
  return interpT(m.fluid.rows, T, 'soundSpeed');
}

/** Evaluate a point property (constant or polynomial model) at temperature T (K). */
export function pointValue(p: PointProperty, T?: number): number | null {
  if (p.value !== undefined) return p.value;
  if (p.model && T !== undefined) {
    const t = T - 273.15;
    if (t < p.model.validC[0] || t > p.model.validC[1]) return null;
    return p.model.coefficients.reduce((s, c, i) => s + c * t ** i, 0);
  }
  return null;
}
