/**
 * FIELDS foundation (Gate 4.7): one interface for every physical field Voyager draws.
 *
 * A field layer is a function of position (and time) on a 2-D slice, plus the metadata needed to
 * show it honestly: quantity, units, frame, default resolution, sources, display transform,
 * fidelity, validity limits and provenance class. Views (the Fields explorer and the Cosmic
 * sandbox) sample layers through `sampleGrid` and never compute a field themselves.
 *
 * Layers in this file (all SI):
 *   gravity-potential   Φ(r) = −Σ G mᵢ / √(|r − rᵢ|² + ε²)                     CODATA G; ε = softening
 *   coulomb-potential   V(r) = Σ qᵢ / (4π ε₀ |r − rᵢ|),  E = −∇V                   CODATA ε₀
 *   plane-wave-ex       Eₓ(z, t) of the analytic vacuum plane wave (em.ts planeE)  exact c
 *   heat-diffusion      T(r, t) = T₀ + Q / (ρ cₚ (4π α t)^{3/2}) · exp(−r²/4αt),  α = k/(ρ cₚ)
 *                       instantaneous point source in an infinite, still, uniform medium
 *                       (Carslaw & Jaeger 1959); k, ρ, cₚ from NIST WebBook at T₀, 1 atm.
 *   hertzian-dipole     instantaneous H (out of plane) and E (in plane) of a Hertzian dipole along +y, exact
 *                       near + far field (Ellingson 2020 eqs. 9.61, 9.65; Gate 9.1)
 * See FIELDS_ARCHITECTURE.md.
 */
import { CONSTANTS } from '@/core/constants/constants';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import { planeE, POLARISATIONS, type Polarisation } from '@/core/physics/em/em';
import { getMaterial, interpT } from '@/modes/atomic/materials/materials';
import { hertzianInstant, nearFarCrossover, type Hertzian } from '@/core/physics/em/antennas';

const G = CONSTANTS.G.value, EPS0 = CONSTANTS.eps0.value;
export const COULOMB_K = 1 / (4 * Math.PI * EPS0);

export type Fidelity = 'exact-analytic' | 'analytic-idealised' | 'numerical' | 'illustrative';
export type DisplayTransform = 'linear' | 'log10-magnitude' | 'symlog';
export interface Frame { id: string; label: string; unit: 'm' | 'au'; /** metres per frame unit */ scale: number; description: string }

export const FRAMES: Record<'lab' | 'system', Frame> = {
  lab: { id: 'lab', label: 'Laboratory plane', unit: 'm', scale: 1, description: 'Cartesian x–y plane in metres, origin at the centre; static, non-rotating' },
  system: { id: 'system', label: 'Planetary-system plane', unit: 'au', scale: 149_597_870_700, description: 'Barycentric ecliptic x–y plane (z = 0), axes in au' },
};

export interface FieldLayer<Ctx> {
  id: string;
  label: string;
  quantity: string;
  symbol: string;
  units: string;
  kind: 'scalar' | 'vector';
  frame: Frame;
  /** default grid (samples per side) */
  resolution: number;
  /** Source-index ids */
  sources: string[];
  transform: DisplayTransform;
  fidelity: Fidelity;
  provenance: ProvenanceClass;
  validity: string[];
  /** value at frame point (x, y) in SI units of `units` */
  sample: (ctx: Ctx, xM: number, yM: number) => number;
  /** in-plane vector (for vector fields), SI */
  vector?: (ctx: Ctx, xM: number, yM: number) => [number, number];
}

// ---------------------------------------------------------------- gravity
export interface PointMass { x: number; y: number; z?: number; massKg: number }
export interface GravityCtx { masses: PointMass[]; /** softening length (m) */ soft: number }
/** Newtonian potential (J/kg) at (x, y, 0); positions in metres. */
export function gravityPotential(ctx: GravityCtx, x: number, y: number): number {
  let phi = 0;
  const s2 = ctx.soft * ctx.soft;
  for (const m of ctx.masses) phi -= (G * m.massKg) / Math.sqrt((x - m.x) ** 2 + (y - m.y) ** 2 + (m.z ?? 0) ** 2 + s2);
  return phi;
}
export const GRAVITY_LAYER: FieldLayer<GravityCtx> = {
  id: 'gravity-potential', label: 'Gravitational potential', quantity: 'Newtonian gravitational potential', symbol: 'Φ', units: 'J/kg', kind: 'scalar',
  frame: FRAMES.system, resolution: 160, sources: ['codata-2018'], transform: 'log10-magnitude', fidelity: 'exact-analytic', provenance: 'derived',
  validity: ['Newtonian point masses; no relativity', 'Softened by ε inside ~1% of the view so the map stays finite at each body', 'Masses and positions come from the scene (today’s ephemeris or the live sandbox)'],
  sample: gravityPotential,
  vector: (ctx, x, y) => {
    let ax = 0, ay = 0;
    const s2 = ctx.soft * ctx.soft;
    for (const m of ctx.masses) { const dx = m.x - x, dy = m.y - y, r2 = dx * dx + dy * dy + (m.z ?? 0) ** 2 + s2, f = (G * m.massKg) / (r2 * Math.sqrt(r2)); ax += f * dx; ay += f * dy; }
    return [ax, ay];
  },
};

// ---------------------------------------------------------------- Coulomb
export interface PointCharge { x: number; y: number; q: number }
export interface CoulombCtx { charges: PointCharge[] }
export function coulombPotential(ctx: CoulombCtx, x: number, y: number): number {
  let v = 0;
  for (const c of ctx.charges) { const r = Math.hypot(x - c.x, y - c.y); v += r > 0 ? (COULOMB_K * c.q) / r : Math.sign(c.q) * Infinity; }
  return v;
}
export function coulombField(ctx: CoulombCtx, x: number, y: number): [number, number] {
  let ex = 0, ey = 0;
  for (const c of ctx.charges) { const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy; if (r2 === 0) continue; const f = (COULOMB_K * c.q) / (r2 * Math.sqrt(r2)); ex += f * dx; ey += f * dy; }
  return [ex, ey];
}
export const COULOMB_LAYER: FieldLayer<CoulombCtx> = {
  id: 'coulomb-potential', label: 'Electrostatic potential', quantity: 'Coulomb potential of point charges (arrows: E = −∇V)', symbol: 'V', units: 'V', kind: 'vector',
  frame: FRAMES.lab, resolution: 160, sources: ['codata-2018', 'ellingson-2018-vol1'], transform: 'symlog', fidelity: 'exact-analytic', provenance: 'derived',
  validity: ['Electrostatics in vacuum (charges at rest)', 'Ideal point charges: the field diverges at each charge', 'Charge values are user inputs, so the configuration is hypothetical'],
  sample: coulombPotential, vector: coulombField,
};

// ---------------------------------------------------------------- plane wave
export interface PlaneWaveCtx { lambda: number; E0: number; t: number; pol: Polarisation }
/** Eₓ of a plane wave travelling along +x of the frame (physics +z ↦ frame x); uniform across y. */
export const planeWaveEx = (ctx: PlaneWaveCtx, x: number) => planeE(ctx.pol, ctx.E0, CONSTANTS.c.value / ctx.lambda, x, ctx.t)[0];
export const PLANE_WAVE_LAYER: FieldLayer<PlaneWaveCtx> = {
  id: 'plane-wave-ex', label: 'EM plane wave', quantity: 'Electric field Eₓ of a vacuum plane wave travelling along +x', symbol: 'Eₓ', units: 'V/m', kind: 'scalar',
  frame: FRAMES.lab, resolution: 160, sources: ['codata-2018', 'cie-s017-2020'], transform: 'linear', fidelity: 'exact-analytic', provenance: 'derived',
  validity: ['Infinite plane wave in vacuum; no source, boundary or absorption', 'Amplitude E₀ and wavelength are user inputs'],
  sample: (ctx, x) => planeWaveEx(ctx, x),
};
export const DEFAULT_POL = POLARISATIONS['linear-x'];

// ---------------------------------------------------------------- heat diffusion
export interface ThermalProps { materialId: string; name: string; T0: number; k: number; rho: number; cp: number; alpha: number; sources: string[] }
/** k, ρ, cₚ at T₀ (1 atm) from the material's NIST WebBook isobar; null if the material has none or T₀ is outside the table. */
export function thermalProps(materialId: string, T0: number): ThermalProps | null {
  const m = getMaterial(materialId);
  const fl = m?.fluid;
  if (!m || !fl) return null;
  const k = interpT(fl.rows, T0, 'thermalConductivity'), rho = interpT(fl.rows, T0, 'density'), cp = interpT(fl.rows, T0, 'cp');
  if (k === null || rho === null || cp === null || !(k > 0 && rho > 0 && cp > 0)) return null;
  return { materialId, name: m.name, T0, k, rho, cp, alpha: k / (rho * cp), sources: fl.sources };
}
export const THERMAL_MATERIALS = ['water', 'nitrogen', 'oxygen', 'argon', 'helium', 'carbon-dioxide'];

export interface HeatCtx { props: ThermalProps; /** energy released at the origin (J) */ Q: number; /** time since release (s) */ t: number }
/** Temperature (K) on the plane through the source, distance r from it. */
export function heatKernelT(ctx: HeatCtx, r: number): number {
  const { alpha, rho, cp, T0 } = ctx.props;
  const s = 4 * alpha * ctx.t;
  return T0 + (ctx.Q / (rho * cp * (Math.PI * s) ** 1.5)) * Math.exp(-(r * r) / s);
}
/** Diffusion length √(4αt) (m): the 1/e radius of the temperature rise. */
export const diffusionLength = (ctx: HeatCtx) => Math.sqrt(4 * ctx.props.alpha * ctx.t);
export const HEAT_LAYER: FieldLayer<HeatCtx> = {
  id: 'heat-diffusion', label: 'Temperature (heat diffusion)', quantity: 'Temperature after an instantaneous point release of heat Q', symbol: 'T', units: 'K', kind: 'scalar',
  frame: FRAMES.lab, resolution: 160, sources: ['nist-webbook-fluids', 'carslaw-jaeger-1959'], transform: 'linear', fidelity: 'analytic-idealised', provenance: 'simulated',
  validity: ['Pure conduction in a still, infinite, uniform medium: no convection, which in a real fluid soon dominates', 'k, ρ and cₚ fixed at T₀ (valid while the temperature rise is small)', 'Q and t are user inputs; properties at 1 atm from the NIST WebBook'],
  sample: (ctx, x, y) => heatKernelT(ctx, Math.hypot(x, y)),
};

// ---------------------------------------------------------------- Hertzian dipole (Gate 9.1)
export interface DipoleCtx extends Hertzian { /** time (s) */ t: number }
export const DIPOLE_LAYER: FieldLayer<DipoleCtx> = {
  id: 'hertzian-dipole', label: 'Radiating dipole', quantity: 'Instantaneous magnetic field H (out of the plane) of a Hertzian dipole; arrows: electric field E in the plane', symbol: 'H', units: 'A/m', kind: 'vector',
  frame: FRAMES.lab, resolution: 160, sources: ['ellingson-2020-vol2', 'codata-2018'], transform: 'symlog', fidelity: 'exact-analytic', provenance: 'derived',
  validity: ['Ideal current moment IΔl at the origin (zero length, uniform current) in vacuum', 'Exact in both the near and the far zone; the field diverges at the dipole itself', 'Current moment and frequency are user inputs, so the configuration is hypothetical'],
  sample: (ctx, x, y) => (x === 0 && y === 0 ? NaN : hertzianInstant(ctx, x, y, ctx.t).Hz),
  vector: (ctx, x, y) => { if (x === 0 && y === 0) return [0, 0]; const f = hertzianInstant(ctx, x, y, ctx.t); return [f.Ex, f.Ey]; },
};
export { nearFarCrossover };

// ---------------------------------------------------------------- sampling
export interface Extent { xmin: number; xmax: number; ymin: number; ymax: number }
export interface Grid { n: number; values: Float64Array; min: number; max: number }

/** Sample a layer on an n×n grid of cell centres (row 0 = top, i.e. ymax), extent in metres. */
export function sampleGrid<C>(layer: FieldLayer<C>, ctx: C, ext: Extent, n = layer.resolution): Grid {
  const values = new Float64Array(n * n);
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = ext.xmin + ((i + 0.5) / n) * (ext.xmax - ext.xmin), y = ext.ymax - ((j + 0.5) / n) * (ext.ymax - ext.ymin);
    const v = layer.sample(ctx, x, y);
    values[j * n + i] = v;
    if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v; }
  }
  return { n, values, min, max };
}

/** Display transform; returns a value in [0, 1] for colour mapping. */
export function normalise(t: DisplayTransform, v: number, min: number, max: number, scale?: number): number {
  if (!Number.isFinite(v)) return v > 0 ? 1 : 0;
  if (t === 'log10-magnitude') {
    const a = Math.log10(Math.abs(v) || 1e-300), lo = Math.log10(Math.min(Math.abs(min), Math.abs(max)) || 1e-300), hi = Math.log10(Math.max(Math.abs(min), Math.abs(max)) || 1e-300);
    return hi > lo ? Math.max(0, Math.min(1, (a - lo) / (hi - lo))) : 0.5;
  }
  if (t === 'symlog') {
    const s = scale ?? (Math.max(Math.abs(min), Math.abs(max)) / 1e3 || 1);
    const f = (x: number) => Math.sign(x) * Math.log10(1 + Math.abs(x) / s);
    const m = Math.max(Math.abs(f(min)), Math.abs(f(max))) || 1;
    return 0.5 + 0.5 * Math.max(-1, Math.min(1, f(v) / m));
  }
  return max > min ? Math.max(0, Math.min(1, (v - min) / (max - min))) : 0.5;
}
