/**
 * Phase 6, Gate 6.2 — compact objects. Published values are checked for integrity, and the
 * Schwarzschild predictions are compared with independent published measurements.
 */
import { describe, expect, it } from 'vitest';
import ten from '@datasets/astronomical/nearby-stars-10pc.json';
import { CONSTANTS } from '@/core/constants/constants';
import { COMPACT_OBJECTS, compactById, derive, radiusKm, shadowDiameterUas } from '@/modes/cosmic/compact/compact';
import { getSource } from '@/shared/sources/sources';
import { MASS_PRESETS } from '@/modes/cosmic/relativity/presets';
import { getEntity } from '@/shared/scientific-relationships/registry';

const OBJ = (ten as unknown as { objects: { seq: number; name: string; type: string }[] }).objects;
const o = (id: string) => compactById(id)!;

describe('compact-object records', () => {
  it('every value has non-negative uncertainties, a valid interval and indexed sources', () => {
    expect(COMPACT_OBJECTS.length).toBe(11);
    for (const c of COMPACT_OBJECTS) {
      for (const v of [c.mass, c.radius, c.distance, c.shadowMass, ...c.measurements.map((m) => m.value)]) if (v) { expect(v[1]).toBeGreaterThanOrEqual(0); expect(v[2]).toBeGreaterThanOrEqual(0); }
      expect(['1σ', '68%', '90%']).toContain(c.massInterval);
      for (const id of [c.massSource, c.radiusSource, c.distanceSource, ...c.sources, ...c.measurements.map((m) => m.source)]) if (id) expect(getSource(id), `${c.id} → ${id}`).toBeDefined();
      expect(c.mass[0]).toBeGreaterThan(0);
    }
  });
  it('white dwarfs point at the right objects in the 10 pc sample', () => {
    const names: Record<string, string> = { 'sirius-b': 'alf CMa B', 'procyon-b': 'alf CMi B', '40-eri-b': 'GJ 166 B', 'stein-2051-b': 'GJ 169.1 B' };
    for (const [id, name] of Object.entries(names)) {
      const star = OBJ.find((s) => s.seq === o(id).starSeq)!;
      expect(star.name).toBe(name);
      expect(star.type).toBe('white dwarf');
    }
  });
  it('GW150914 is stored with 90 % intervals and conserves mass–energy (36 + 29 − 62 ≈ 3 M☉c² radiated)', () => {
    const g = o('gw150914-final');
    expect(g.massInterval).toBe('90%');
    const m1 = g.measurements.find((m) => m.quantity.startsWith('primary'))!.value![0];
    const m2 = g.measurements.find((m) => m.quantity.startsWith('secondary'))!.value![0];
    const E = g.measurements.find((m) => m.quantity.startsWith('energy'))!.value!;
    expect(Math.abs(m1 + m2 - g.mass[0] - E[0])).toBeLessThanOrEqual(E[1]);
  });
});

describe('Schwarzschild predictions vs independent measurements', () => {
  it('Joyce et al.’s coefficient: GM☉/(R☉c) = 0.636 km/s', () => {
    expect(CONSTANTS.GMsun.value / (CONSTANTS.Rsun.value * CONSTANTS.c.value) / 1e3).toBeCloseTo(0.636, 3);
  });
  it('Sirius B: dynamical mass and radius predict the measured gravitational redshift (80.65 ± 0.77 km/s) within 1σ of the combined error', () => {
    const s = o('sirius-b'), d = derive(s);
    const meas = s.measurements[0].value!;
    const predErr = d.surfaceRedshiftKms! * Math.hypot(s.mass[1] / s.mass[0], s.radius![1] / s.radius![0]);
    expect(Math.abs(d.surfaceRedshiftKms! - meas[0])).toBeLessThan(Math.hypot(predErr, meas[1]));
    expect(d.surfaceRedshiftKms!).toBeCloseTo(80.02, 1);
    expect(radiusKm(s)![0]).toBeCloseTo(5634, 0);
  });
  it('PSR J0030+0451: GM/(Rc²) from M and R matches the published compactness 0.156', () => {
    const p = o('psr-j0030'), d = derive(p);
    expect(d.compactness! / 2).toBeCloseTo(0.156, 2);
  });
  it('PSR J0740+6620: surface outside the photon sphere but inside the ISCO', () => {
    const p = o('psr-j0740'), d = derive(p), R = radiusKm(p)![0];
    expect(R).toBeGreaterThan(d.photonSphere);
    expect(R).toBeLessThan(d.isco);
  });
  it('Sgr A*: θ_g = GM/(c²D) = 5.125 µas (EHT table) and δ = d_sh/(2√27 θ_g) − 1 ≈ −0.08', () => {
    const s = o('sgr-a-star');
    const thetaG = shadowDiameterUas(s.mass[0], s.distance![0]) / (2 * Math.sqrt(27));
    expect(thetaG).toBeCloseTo(5.125, 2);
    const dsh = s.measurements.find((m) => m.quantity === 'angular shadow diameter')!.value![0];
    const delta = dsh / derive(s).shadowUas![0] - 1;
    expect(delta).toBeCloseTo(-0.08, 1);
    expect(derive(s).shadowUas![0]).toBeCloseTo(53.3, 1);
  });
  it('M87*: shadow from the stellar-dynamics mass ≈ 37.6 µas and from the gas mass ≈ 21.3 µas (EHT Paper I), θ_g of the EHT mass ≈ 3.8 µas', () => {
    const m = o('m87-star');
    expect(derive(m).shadowUas![0]).toBeCloseTo(37.6, 0); // within 0.5 µas
    const gas = m.measurements.find((x) => x.quantity.startsWith('mass from gas'))!.value![0];
    expect(shadowDiameterUas(gas, m.distance![0])).toBeCloseTo(21.3, 0);
    expect(shadowDiameterUas(m.mass[0], m.distance![0]) / (2 * Math.sqrt(27))).toBeCloseTo(3.8, 1);
  });
  it('black holes have no surface; r_s scales linearly with mass', () => {
    for (const c of COMPACT_OBJECTS.filter((x) => x.kind === 'black-hole')) {
      expect(c.radius).toBeNull();
      expect(derive(c).rs[0] / c.mass[0]).toBeCloseTo(2.9533, 3);
    }
  });
});

describe('integration', () => {
  it('measured objects appear as relativity presets with their surfaces; a neutron star without radius is excluded', () => {
    expect(MASS_PRESETS.find((p) => p.id === 'sgr-a-star')!.surfaceRadius).toBeNull();
    expect(MASS_PRESETS.find((p) => p.id === 'sirius-b')!.surfaceRadius! / 1e3).toBeCloseTo(5634, 0);
    expect(MASS_PRESETS.find((p) => p.id === 'psr-b1913')).toBeUndefined();
  });
  it('neutron stars and black holes are registry entities; white dwarfs are not duplicated', () => {
    expect(getEntity('compact-object:sgr-a-star')?.route).toBe('#/cosmic/compact?sel=sgr-a-star');
    expect(getEntity('compact-object:sirius-b')).toBeUndefined();
  });
});
