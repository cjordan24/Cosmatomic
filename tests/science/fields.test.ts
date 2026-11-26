/**
 * Gate 4.7 — FIELDS foundation and cross-mode relationships.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import {
  COULOMB_K, COULOMB_LAYER, GRAVITY_LAYER, HEAT_LAYER, PLANE_WAVE_LAYER, DEFAULT_POL, THERMAL_MATERIALS,
  coulombField, coulombPotential, gravityPotential, heatKernelT, normalise, planeWaveEx, sampleGrid, thermalProps,
  type FieldLayer, type HeatCtx,
} from '@/core/fields/fields';
import { getSource } from '@/shared/sources/sources';
import { NIST_SPECTRA, allEntities, allRelationships, getEntity, relationshipsFrom, relationshipsTo, spectrumElement, spectrumId } from '@/shared/scientific-relationships/registry';
import { MATERIALS } from '@/modes/atomic/materials/materials';
import nist from '@datasets/atomic/spectra-nist.json';
import curated from '@datasets/curated/curated-reference.json';

const c = CONSTANTS.c.value, eps0 = CONSTANTS.eps0.value, G = CONSTANTS.G.value;

describe('field-layer interface', () => {
  const layers: FieldLayer<unknown>[] = [GRAVITY_LAYER, COULOMB_LAYER, PLANE_WAVE_LAYER, HEAT_LAYER] as FieldLayer<unknown>[];
  it('every layer declares quantity, units, frame, resolution, sources, transform, fidelity, validity and provenance', () => {
    expect(new Set(layers.map((l) => l.id)).size).toBe(layers.length);
    for (const l of layers) {
      expect(l.quantity.length, l.id).toBeGreaterThan(5);
      expect(l.units.length, l.id).toBeGreaterThan(0);
      expect(l.frame.scale, l.id).toBeGreaterThan(0);
      expect(l.resolution, l.id).toBeGreaterThanOrEqual(32);
      expect(['linear', 'log10-magnitude', 'symlog']).toContain(l.transform);
      expect(l.validity.length, l.id).toBeGreaterThan(0);
      expect(['observed', 'derived', 'simulated', 'illustrative', 'hypothetical']).toContain(l.provenance);
      expect(l.sources.length, l.id).toBeGreaterThan(0);
      for (const s of l.sources) expect(getSource(s), `${l.id} → ${s}`).toBeDefined();
      if (l.kind === 'vector') expect(l.vector, l.id).toBeTypeOf('function');
    }
  });
  it('sampleGrid covers cell centres, top row = ymax, and reports finite min/max', () => {
    const g = sampleGrid(COULOMB_LAYER, { charges: [{ x: 0, y: 0, q: 1e-9 }] }, { xmin: -1, xmax: 1, ymin: -1, ymax: 1 }, 4);
    expect(g.values.length).toBe(16);
    // cell (i=0, j=0) is at (−0.75, +0.75)
    expect(g.values[0]).toBeCloseTo(COULOMB_K * 1e-9 / Math.hypot(0.75, 0.75), 9);
    expect(Number.isFinite(g.min) && Number.isFinite(g.max)).toBe(true);
  });
  it('display transforms map into [0, 1]', () => {
    for (const t of ['linear', 'log10-magnitude', 'symlog'] as const) for (const v of [-5, -1e-3, 0.2, 3, 100]) {
      const u = normalise(t, v, -5, 100);
      expect(u).toBeGreaterThanOrEqual(0); expect(u).toBeLessThanOrEqual(1);
    }
    expect(normalise('symlog', 0, -1, 1)).toBeCloseTo(0.5, 12);
  });
});

describe('Coulomb point-charge field (CODATA ε₀)', () => {
  it('k = 1/(4πε₀) = 8.9875517… × 10⁹ N m² C⁻²', () => {
    expect(COULOMB_K).toBeCloseTo(1 / (4 * Math.PI * eps0), 0);
    expect(COULOMB_K / 8.9875517e9).toBeCloseTo(1, 7);
  });
  it('V = kq/r and |E| = kq/r² for one charge; E points away from a positive charge', () => {
    const ctx = { charges: [{ x: 0, y: 0, q: 1e-9 }] };
    expect(coulombPotential(ctx, 0.1, 0)).toBeCloseTo(COULOMB_K * 1e-9 / 0.1, 9);
    const [ex, ey] = coulombField(ctx, 0, 0.2);
    expect(ex).toBeCloseTo(0, 12);
    expect(ey).toBeCloseTo(COULOMB_K * 1e-9 / 0.04, 9);
  });
  it('E = −∇V (central differences) for a dipole', () => {
    const ctx = { charges: [{ x: -0.01, y: 0, q: 1e-9 }, { x: 0.01, y: 0, q: -1e-9 }] };
    const h = 1e-6;
    for (const [x, y] of [[0.03, 0.02], [-0.02, -0.05], [0.005, 0.01]]) {
      const gx = -(coulombPotential(ctx, x + h, y) - coulombPotential(ctx, x - h, y)) / (2 * h);
      const gy = -(coulombPotential(ctx, x, y + h) - coulombPotential(ctx, x, y - h)) / (2 * h);
      const [ex, ey] = coulombField(ctx, x, y);
      expect(gx / ex).toBeCloseTo(1, 5); expect(gy / ey).toBeCloseTo(1, 5);
    }
    // dipole potential vanishes on the bisector
    expect(coulombPotential(ctx, 0, 0.37)).toBeCloseTo(0, 12);
  });
  it('Gauss’s law: flux of E through a circle-swept sphere around +q equals q/ε₀', () => {
    const q = 2e-9, R = 0.05, ctx = { charges: [{ x: 0, y: 0, q }] };
    // field is radial: flux = 4πR² · |E(R)|
    const [ex, ey] = coulombField(ctx, R, 0);
    expect((4 * Math.PI * R * R * Math.hypot(ex, ey)) / (q / eps0)).toBeCloseTo(1, 12);
  });
});

describe('gravity potential layer (shared with the sandbox)', () => {
  it('Φ = −GM/r for one unsoftened mass; |∇Φ| = GM/r²', () => {
    const M = 1.98847e30, r = 1.495978707e11;
    const ctx = { masses: [{ x: 0, y: 0, massKg: M }], soft: 0 };
    expect(gravityPotential(ctx, r, 0)).toBeCloseTo(-(G * M) / r, 3);
    const [ax] = GRAVITY_LAYER.vector!(ctx, r, 0);
    expect(ax / (-(G * M) / (r * r))).toBeCloseTo(1, 12);
  });
  it('the sandbox’s former km-unit formula and the SI layer agree to 1e-12 (log contours unchanged)', () => {
    const G_KM = G * 1e-9;
    const bodies = [{ x: [1e8, 2e7, 0], mass: 6e24 }, { x: [-3e8, 0, 5e6], mass: 2e30 }];
    const softKm = 1e6;
    const oldPhi = -bodies.reduce((s, b) => s + (G_KM * b.mass) / Math.sqrt((4e7 - b.x[0]) ** 2 + (-1e7 - b.x[1]) ** 2 + b.x[2] ** 2 + softKm ** 2), 0);
    const ctx = { masses: bodies.map((b) => ({ x: b.x[0] * 1e3, y: b.x[1] * 1e3, z: b.x[2] * 1e3, massKg: b.mass })), soft: softKm * 1e3 };
    expect(GRAVITY_LAYER.sample(ctx, 4e10, -1e10) / 1e6 / oldPhi).toBeCloseTo(1, 12);
  });
});

describe('plane-wave layer', () => {
  it('Eₓ(x, t) is the em.ts plane wave: period λ in space, 1/f in time, amplitude E₀', () => {
    const ctx = { lambda: 0.05, E0: 100, t: 0, pol: DEFAULT_POL };
    expect(planeWaveEx(ctx, 0)).toBeCloseTo(100, 10);
    expect(planeWaveEx(ctx, 0.05)).toBeCloseTo(100, 8);
    expect(planeWaveEx(ctx, 0.025)).toBeCloseTo(-100, 8);
    const T = ctx.lambda / c;
    expect(planeWaveEx({ ...ctx, t: T / 2 }, 0)).toBeCloseTo(-100, 8);
    expect(PLANE_WAVE_LAYER.sample(ctx, 0.0125, 123)).toBeCloseTo(0, 8); // uniform across y
  });
});

describe('heat-diffusion temperature layer (NIST fluid data)', () => {
  const props = thermalProps('water', 298.15)!;
  it('water at 298.15 K, 1 atm: k, ρ, cₚ from the WebBook isobar give α ≈ 1.46 × 10⁻⁷ m²/s', () => {
    expect(props).not.toBeNull();
    expect(props.rho).toBeGreaterThan(996); expect(props.rho).toBeLessThan(998);
    expect(props.cp).toBeGreaterThan(4170); expect(props.cp).toBeLessThan(4190);
    expect(props.k).toBeGreaterThan(0.6); expect(props.k).toBeLessThan(0.615);
    expect(props.alpha).toBeGreaterThan(1.43e-7); expect(props.alpha).toBeLessThan(1.48e-7);
    for (const s of props.sources) expect(getSource(s)).toBeDefined();
  });
  it('every listed thermal medium has properties at 298.15 K; unknown materials return null', () => {
    for (const id of THERMAL_MATERIALS) expect(thermalProps(id, 298.15), id).not.toBeNull();
    expect(thermalProps('diamond', 298.15)).toBeNull();
    expect(thermalProps('water', 1000)).toBeNull(); // outside the tabulated liquid isobar: unknown, not extrapolated
  });
  it('energy is conserved: ∫ ρ cₚ (T − T₀) dV = Q at every time', () => {
    for (const t of [1, 60, 3600]) {
      const ctx: HeatCtx = { props, Q: 100, t };
      const L = Math.sqrt(4 * props.alpha * t), N = 4000, rmax = 8 * L;
      let E = 0;
      for (let i = 0; i < N; i++) { const r = (i + 0.5) * (rmax / N); E += props.rho * props.cp * (heatKernelT(ctx, r) - props.T0) * 4 * Math.PI * r * r * (rmax / N); }
      expect(E / 100, `t=${t}`).toBeCloseTo(1, 6);
    }
  });
  it('satisfies ∂T/∂t = α∇²T (finite differences)', () => {
    const ctx: HeatCtx = { props, Q: 100, t: 600 };
    const r = 0.004, dr = 1e-5, dt = 1e-2;
    const T = (rr: number, tt: number) => heatKernelT({ ...ctx, t: tt }, rr);
    const dTdt = (T(r, 600 + dt) - T(r, 600 - dt)) / (2 * dt);
    const lap = (T(r + dr, 600) - 2 * T(r, 600) + T(r - dr, 600)) / (dr * dr) + (2 / r) * (T(r + dr, 600) - T(r - dr, 600)) / (2 * dr);
    expect(dTdt / (props.alpha * lap)).toBeCloseTo(1, 4);
  });
});

describe('scientific relationships (Gate 4.7)', () => {
  it('the NIST spectrum list matches datasets/atomic/spectra-nist.json', () => {
    expect([...NIST_SPECTRA].sort()).toEqual(Object.keys((nist as { spectra: Record<string, unknown> }).spectra).sort());
  });
  it('Element → atomic spectrum → Spectral: every spectrum links from its element and opens the atlas lines tab', () => {
    for (const spec of NIST_SPECTRA) {
      const el = spectrumElement(spec)!;
      expect(el, spec).toBeDefined();
      const rel = relationshipsFrom(`element:${el.Z}`).find((r) => r.to === spectrumId(spec));
      expect(rel?.type, spec).toBe('has-spectrum');
      expect(getEntity(spectrumId(spec))?.route).toBe(`#/spectral?tab=lines&spec=${encodeURIComponent(spec)}`);
      expect(relationshipsTo(spectrumId(spec)).length).toBeGreaterThan(0); // reverse link exists
    }
    expect(relationshipsFrom('element:1').map((r) => r.to)).toEqual(expect.arrayContaining(['spectrum:H-I', 'spectrum:D-I']));
  });
  it('Sun → Planck spectrum at the IAU 2015 nominal T_eff (5772 K) → Spectral', () => {
    expect(curated.sun.nominalEffectiveTemperatureK).toBe(5772);
    const r = relationshipsFrom('body:sun').find((x) => x.to === 'spectrum:blackbody-5772')!;
    expect(r.source).toBe('iau-2015-b3');
    expect(getEntity('spectrum:blackbody-5772')?.route).toBe('#/spectral?tab=blackbody&T=5772');
    expect(getEntity('body:sun')?.route).toBe('#/cosmic/sun');
  });
  it('Material → optical (n(λ)) and acoustic (sound speed) properties → Spectral atlas / Wave lab', () => {
    for (const m of MATERIALS.filter((x) => x.refractiveIndex)) {
      const r = relationshipsFrom(`material:${m.id}`).find((x) => x.to === `spectrum:n-${m.id}`);
      expect(r?.context, m.id).toBe('optical');
      expect(getEntity(`spectrum:n-${m.id}`)?.route).toContain(`mat=${m.id}`);
    }
    for (const id of ['water', 'nitrogen', 'helium', 'argon', 'carbon-dioxide']) {
      const r = relationshipsFrom(`material:${id}`).find((x) => x.context === 'acoustic');
      expect(getEntity(r!.to)?.route, id).toContain(`medium=${id}`);
    }
  });
  it('every relationship cites an indexed source or a reaction citation, and both ends are registered', () => {
    for (const r of allRelationships()) {
      expect(getEntity(r.from), r.from).toBeDefined();
      expect(getEntity(r.to), `${r.from} → ${r.to}`).toBeDefined();
      if (!r.from.startsWith('reaction:')) expect(getSource(r.source), `${r.from} → ${r.to}: ${r.source}`).toBeDefined();
    }
    for (const e of allEntities()) expect(e.status === 'available' ? !!e.route : e.route === null, e.id).toBe(true);
  });
});

describe('optical relationships cite the primary dispersion paper', () => {
  it('material → n(λ) edge source is the paper with the record’s DOI', () => {
    for (const m of MATERIALS.filter((x) => x.refractiveIndex?.doi)) {
      const r = relationshipsFrom(`material:${m.id}`).find((x) => x.context === 'optical')!;
      expect(getSource(r.source)?.doi, m.id).toBe(m.refractiveIndex!.doi);
    }
  });
});
