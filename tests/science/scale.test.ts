/**
 * Phase 8, Gate 8.1 — universal scale navigator. Every reference length is traced back to its bundled
 * dataset or constant, recomputed independently where it is derived, and carries a registered source.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import { SCALE_LEVELS } from '@/core/scale/scale';
import { getSource } from '@/shared/sources/sources';
import { LOG_MAX, LOG_MIN, PROTON_RMS_RADIUS, PROXIMA_PLX, SCALE_REFS, formatLength, molecularExtent } from '@/modes/scale/references';
import tenPc from '@datasets/astronomical/nearby-stars-10pc.json';

const ref = (id: string) => SCALE_REFS.find((r) => r.id === id)!;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const C = CONSTANTS.c.value, GMSUN = CONSTANTS.GMsun.value, MPC = 1e6 * PARSEC_M;

describe('reference objects', () => {
  it('every reference has a positive length inside the navigable range, sorted by size', () => {
    expect(SCALE_REFS.length).toBeGreaterThanOrEqual(25);
    for (const r of SCALE_REFS) {
      expect(Number.isFinite(r.m) && r.m > 0, r.id).toBe(true);
      expect(Math.log10(r.m)).toBeGreaterThan(LOG_MIN);
      expect(Math.log10(r.m)).toBeLessThan(LOG_MAX);
    }
    for (let i = 1; i < SCALE_REFS.length; i++) expect(SCALE_REFS[i].m).toBeGreaterThanOrEqual(SCALE_REFS[i - 1].m);
    expect(new Set(SCALE_REFS.map((r) => r.id)).size).toBe(SCALE_REFS.length);
  });

  it('every reference cites registered sources and states its quantity; routes are hash routes', () => {
    for (const r of SCALE_REFS) {
      expect(r.sources.length, r.id).toBeGreaterThan(0);
      for (const s of r.sources) expect(getSource(s), `${r.id} → ${s}`).toBeDefined();
      expect(r.quantity.length).toBeGreaterThan(3);
      if (r.route) expect(r.route.startsWith('#/')).toBe(true);
      if (r.lo !== null) expect(r.lo).toBeGreaterThanOrEqual(0);
    }
  });

  it('spans more than 41 orders of magnitude, from the proton to the observable universe', () => {
    expect(SCALE_REFS[0].id).toBe('proton');
    expect(SCALE_REFS[SCALE_REFS.length - 1].id).toBe('observable');
    expect(Math.log10(SCALE_REFS.at(-1)!.m / SCALE_REFS[0].m)).toBeGreaterThan(41);
  });
});

describe('values against their sources', () => {
  it('proton: CODATA 2022 rms charge radius 0.84075(64) fm, drawn as a 1.6815 fm diameter', () => {
    expect(PROTON_RMS_RADIUS.value).toBe(8.4075e-16);
    expect(ref('proton').m).toBeCloseTo(1.6815e-15, 19);
    expect(ref('proton').lo).toBeCloseTo(1.28e-18, 21);
  });

  it('Bohr radius, au and the nominal solar radius come straight from the constants', () => {
    expect(ref('bohr').m).toBe(CONSTANTS.a0.value);
    expect(ref('au').m).toBe(149_597_870_700);
    expect(ref('sun').m).toBe(2 * 6.957e8);
  });

  it('Earth 12 756 km and Jupiter 142 984 km (NSSDC), Moon 2 × 1737.4 km (JPL), Earth–Moon 384 000 km', () => {
    expect(ref('earth').m).toBe(12_756e3);
    expect(ref('jupiter').m).toBe(142_984e3);
    expect(ref('moon').m).toBeCloseTo(3_474.8e3, 3);
    expect(ref('earth-moon').m).toBe(384_000e3);
  });

  it('NaCl cell edge 5.6402 Å; van der Waals diameters 2 × 120 pm (H) and 2 × 170 pm (C)', () => {
    expect(ref('nacl-cell').m).toBeCloseTo(5.6402e-10, 16);
    expect(ref('vdw-H').m).toBeCloseTo(240e-12, 18);
    expect(ref('vdw-C').m).toBeCloseTo(340e-12, 18);
  });

  it('C60 cage: largest C–C distance of the electron-diffraction cage is about 7.1 Å', () => {
    const d = molecularExtent('exp-c60')!;
    expect(d).toBeGreaterThan(6.9e-10);
    expect(d).toBeLessThan(7.2e-10);
    // water: the H···H distance of the conformer, between 1.4 and 1.6 Å
    expect(molecularExtent('pubchem-962')!).toBeGreaterThan(1.4e-10);
    expect(molecularExtent('pubchem-962')!).toBeLessThan(1.6e-10);
  });

  it('Proxima Centauri: the parallax matches the 10 pc catalogue record, d = 1.3020 pc', () => {
    const rec = (tenPc as unknown as { objects: { seq: number; name: string; plx: number; ePlx: number }[] }).objects.find((o) => o.seq === 1)!;
    expect(rec.name).toBe('Proxima Cen');
    expect(PROXIMA_PLX.value).toBe(rec.plx);
    expect(PROXIMA_PLX.sigma).toBe(rec.ePlx);
    expect(ref('proxima').m / PARSEC_M).toBeCloseTo(1.30197, 4);
  });

  it('neutron star and white dwarf: 2 × 12.71 km (PSR J0030+0451) and 2 × 0.008098 R☉ (Sirius B)', () => {
    expect(ref('co-psr-j0030').m).toBeCloseTo(25_420, 6);
    expect(ref('co-sirius-b').m).toBeCloseTo(2 * 0.008098 * 6.957e8, 0);
  });

  it('event horizons: 4GM/c² with the EHT masses (Sgr A* 2.54 × 10¹⁰ m, M87* 3.84 × 10¹³ m)', () => {
    expect(rel(ref('bh-sgr-a-star').m, (4 * GMSUN * 4.297e6) / C ** 2)).toBeLessThan(1e-12);
    expect(ref('bh-sgr-a-star').m).toBeCloseTo(2.538e10, -7);
    expect(rel(ref('bh-m87-star').m, (4 * GMSUN * 6.5e9) / C ** 2)).toBeLessThan(1e-12);
  });

  it('Milky Way and clusters: R₀ = 8.2 kpc, Coma 2 × 2.7 Mpc and 101.3 Mpc, M87 16.8 Mpc', () => {
    expect(ref('mw-R0').m / (1e3 * PARSEC_M)).toBeCloseTo(8.2, 10);
    expect(ref('coma-rv').m / MPC).toBeCloseTo(5.4, 10);
    expect(ref('coma-distance').m / MPC).toBeCloseTo(101.3, 10);
    expect(ref('m87-distance').m / MPC).toBeCloseTo(16.8, 10);
  });

  it('cosmology: Hubble distance c/H₀ = 4431 Mpc and the comoving horizon ≈ 14.2 Gpc in Planck 2018', () => {
    expect(ref('hubble-distance').m / MPC).toBeCloseTo(299_792.458 / 67.66, 6);
    expect(ref('observable').m / (1e3 * MPC)).toBeGreaterThan(14.1);
    expect(ref('observable').m / (1e3 * MPC)).toBeLessThan(14.3);
  });
});

describe('scale levels and formatting', () => {
  it('interactive and educational levels have routes; planned ones do not; Galaxy clusters is now interactive', () => {
    for (const l of SCALE_LEVELS) expect(!!l.route, l.id).toBe(l.support !== 'planned');
    expect(SCALE_LEVELS.find((l) => l.id === 'cluster')!.route).toBe('#/cosmic/darkmatter?tab=clusters');
  });

  it('formatLength picks readable units across the range', () => {
    expect(formatLength(1.6815e-15)).toBe('1.68 fm');
    expect(formatLength(5.6402e-10)).toBe('564 pm');
    expect(formatLength(12_756e3)).toBe('12,800 km');
    expect(formatLength(CONSTANTS.au.value)).toBe('1 au');
    expect(formatLength(1.302 * PARSEC_M)).toBe('1.3 pc');
    expect(formatLength(8.2e3 * PARSEC_M)).toBe('8.2 kpc');
    expect(formatLength(14.2e9 * PARSEC_M)).toBe('14.2 Gpc');
  });
});
