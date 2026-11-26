/**
 * Gate 4.3 — crystals and materials. References: NBS Circular 539 (lattice constants, X-ray
 * densities, d-spacings), CODATA 2018 (Si), refractiveindex.info primary papers, NIST-JANAF,
 * NIST WebBook fluids, Malmberg & Maryott 1956.
 */
import { describe, expect, it } from 'vitest';
import { CRYSTALS, CU_KA1, coordination, dSpacing, getCrystal, packingFraction, reflections, structureFactor, xrayDensity, formulaUnits, planePolygon } from '@/modes/atomic/materials/crystal';
import { MATERIALS, getMaterial, interpT, pointValue, refractiveIndex, soundSpeed } from '@/modes/atomic/materials/materials';
import { CONSTANTS } from '@/core/constants/constants';

const C = (id: string) => getCrystal(id)!;

describe('unit cells reproduce the NBS X-ray densities (validates transcription, Z and basis)', () => {
  it.each(CRYSTALS.filter((x) => x.xrayDensityNBS !== null).map((x) => [x.id, x] as const))('%s', (_, x) => {
    // NBS used 1950s atomic weights; agreement to 0.15 % checks lattice constant + basis + composition
    expect(Math.abs(xrayDensity(x) - x.xrayDensityNBS!) / x.xrayDensityNBS!).toBeLessThan(0.0015);
  });
  it('silicon from the CODATA lattice parameter: ρ = 2.3290 g/cm³ (8 atoms per cell)', () => {
    expect(C('silicon').sites.length).toBe(8);
    expect(xrayDensity(C('silicon'))).toBeCloseTo(2.329, 3);
  });
  it('formula units per cell: NaCl 4, CsCl 1, rutile 2', () => {
    expect(formulaUnits(C('nacl'))).toBe(4); expect(formulaUnits(C('cscl'))).toBe(1); expect(formulaUnits(C('rutile'))).toBe(2);
  });
});

describe('packing fractions are exact for the ideal lattices', () => {
  it('fcc π/(3√2) = 0.7405, bcc π√3/8 = 0.6802, diamond π√3/16 = 0.3401', () => {
    expect(packingFraction(C('copper'))).toBeCloseTo(Math.PI / (3 * Math.SQRT2), 10);
    expect(packingFraction(C('tungsten'))).toBeCloseTo((Math.PI * Math.sqrt(3)) / 8, 10);
    expect(packingFraction(C('diamond'))).toBeCloseTo((Math.PI * Math.sqrt(3)) / 16, 10);
    expect(packingFraction(C('nacl'))).toBeNull(); // two-element: not a single-sphere packing
  });
  it('real Mg (c/a = 1.6235) packs slightly differently from ideal hcp (c/a = 1.633)', () => {
    const pf = packingFraction(C('magnesium'))!;
    expect(pf).toBeGreaterThan(0.70); expect(pf).toBeLessThan(0.7405);
  });
});

describe('coordination geometry', () => {
  it('NaCl 6 at a/2; CsCl 8 at a√3/2; diamond 4 at a√3/4 (C–C 1.544 Å); fcc 12; bcc 8', () => {
    const n = coordination(C('nacl'), 0); expect(n.cn).toBe(6); expect(n.d).toBeCloseTo(5.6402 / 2, 6);
    expect(coordination(C('cscl'), 0).cn).toBe(8);
    const d = coordination(C('diamond'), 0); expect(d.cn).toBe(4); expect(d.d).toBeCloseTo(1.5444, 3);
    expect(coordination(C('copper'), 0).cn).toBe(12);
    expect(coordination(C('alpha-iron'), 0).cn).toBe(8);
  });
  it('rutile TiO₆ octahedron: 4 equatorial ≈ 1.948 Å and 2 apical ≈ 1.980 Å (Abrahams & Bernstein: 1.946 / 1.983)', () => {
    const c = coordination(C('rutile'), 0, 0.03);
    expect(c.cn).toBe(6);
    const ds = c.shell.map((s) => s.d).sort((a, b) => a - b);
    for (const d of ds.slice(0, 4)) expect(Math.abs(d - 1.946)).toBeLessThan(0.006);
    for (const d of ds.slice(4)) expect(Math.abs(d - 1.983)).toBeLessThan(0.006);
  });
});

describe('Bragg spacings and systematic absences', () => {
  it('Cu d-spacings match NBS Circular 539 table 5 (111 2.088, 200 1.808, 220 1.278 Å)', () => {
    expect(dSpacing(C('copper'), 1, 1, 1)).toBeCloseTo(2.0871, 3);
    expect(Math.abs(dSpacing(C('copper'), 2, 0, 0) - 1.808)).toBeLessThan(0.001);
    expect(Math.abs(dSpacing(C('copper'), 2, 2, 0) - 1.278)).toBeLessThan(0.001);
  });
  it('hexagonal metric: Mg d(100) = a√3/2, d(002) = c/2', () => {
    expect(dSpacing(C('magnesium'), 1, 0, 0)).toBeCloseTo((3.2094 * Math.sqrt(3)) / 2, 8);
    expect(dSpacing(C('magnesium'), 0, 0, 2)).toBeCloseTo(5.2103 / 2, 8);
  });
  it('absences: fcc 100 & 110; bcc 100 & 111; diamond 200 & 222 (but 111, 220 allowed); NaCl 111 allowed (f_Na ≠ f_Cl)', () => {
    expect(structureFactor(C('copper'), 1, 0, 0)).toBeLessThan(1e-9);
    expect(structureFactor(C('copper'), 1, 1, 0)).toBeLessThan(1e-9);
    expect(structureFactor(C('tungsten'), 1, 1, 1)).toBeLessThan(1e-9);
    expect(structureFactor(C('diamond'), 2, 0, 0)).toBeLessThan(1e-9);
    expect(structureFactor(C('diamond'), 2, 2, 2)).toBeLessThan(1e-9);
    expect(structureFactor(C('diamond'), 1, 1, 1)).toBeGreaterThan(1);
    expect(structureFactor(C('nacl'), 1, 1, 1)).toBeGreaterThan(1);
  });
  it('first allowed Cu reflection at 2θ = 43.3° for Cu Kα₁', () => {
    const r = reflections(C('copper')).filter((x) => x.allowed);
    expect(r[0].hkl).toEqual([1, 1, 1]);
    expect(r[0].twoTheta!).toBeCloseTo(43.30, 1);
    expect(CU_KA1).toBeCloseTo(1.5406, 4);
  });
  it('(111) plane in a cubic cell is a triangle; (100) a square', () => {
    expect(planePolygon(C('copper'), 1, 1, 1).length).toBe(3);
    expect(planePolygon(C('copper'), 1, 0, 0).length).toBe(4);
  });
});

describe('material property records', () => {
  const n = (id: string, um: number) => refractiveIndex(getMaterial(id)!.refractiveIndex!, um);
  it('refractive indices at the sodium/helium d-lines match standard values', () => {
    expect(n('fused-silica', 0.5876)!).toBeCloseTo(1.4585, 4);   // Malitson 1965: n_d = 1.4585
    // 20 °C: Daimon & Masumura (2007) give 1.33335; the commonly quoted n_D is 1.3330 — measurements differ at the 10⁻⁴ level
    expect(Math.abs(n('water', 0.5893)! - 1.3330)).toBeLessThan(5e-4);
    expect(Math.abs(n('diamond', 0.5893)! - 2.417)).toBeLessThan(3e-3);
    expect(Math.abs(n('nacl', 0.5893)! - 1.5443)).toBeLessThan(5e-4);
    expect(Math.abs(n('fluorite', 0.5876)! - 1.4338)).toBeLessThan(5e-4);
  });
  it('dispersion: n decreases with wavelength in the visible (normal dispersion), null outside range', () => {
    expect(n('fused-silica', 0.45)!).toBeGreaterThan(n('fused-silica', 0.65)!);
    expect(n('diamond', 5)).toBeNull();
  });
  it('JANAF heat capacities: Cu 24.442 J/(mol·K) at 298.15 K; Dulong–Petit ≈ 3R for metals', () => {
    const cu = getMaterial('copper')!.heatCapacity!;
    expect(interpT(cu.rows, 298.15, 'Cp')).toBe(24.442);
    const R = CONSTANTS.NA.value * CONSTANTS.kB.value;
    for (const id of ['copper', 'aluminium', 'tungsten', 'magnesium']) expect(Math.abs(interpT(getMaterial(id)!.heatCapacity!.rows, 298.15, 'Cp')! / (3 * R) - 1)).toBeLessThan(0.05);
    expect(interpT(getMaterial('graphite')!.heatCapacity!.rows, 298.15, 'Cp')!).toBeLessThan(10); // far below 3R (stiff bonds)
  });
  it('fluid sound speeds (NIST reference EOS) agree with the ideal-gas limit for argon and helium (< 0.5 %)', () => {
    const R = CONSTANTS.NA.value * CONSTANTS.kB.value;
    const ideal = (M: number, T: number) => Math.sqrt((5 / 3) * R * T / M);
    expect(Math.abs(soundSpeed(getMaterial('argon')!, 300)! / ideal(0.039948, 300) - 1)).toBeLessThan(0.005);
    expect(Math.abs(soundSpeed(getMaterial('helium')!, 300)! / ideal(0.0040026, 300) - 1)).toBeLessThan(0.005);
    expect(soundSpeed(getMaterial('water')!, 290)).toBeCloseTo(1472.25, 2);
    expect(soundSpeed(getMaterial('water')!, 500)).toBeNull();
  });
  it('water permittivity (Malmberg & Maryott 1956): 78.30 at 25 °C, 87.74 at 0 °C; null outside 0–100 °C', () => {
    const p = getMaterial('water')!.properties.find((x) => x.property === 'relative-permittivity')!;
    expect(pointValue(p, 298.15)!).toBeCloseTo(78.30, 2);
    expect(pointValue(p, 273.15)!).toBeCloseTo(87.74, 2);
    expect(pointValue(p, 400)).toBeNull();
  });
  it('every material record and property names its sources; condition tags are present', () => {
    for (const m of MATERIALS) {
      for (const t of [m.heatCapacity, m.refractiveIndex, m.fluid]) if (t) expect(t.sources.length, m.id).toBeGreaterThan(0);
      for (const p of m.properties) { expect(p.sources.length).toBeGreaterThan(0); expect(Object.keys(p.conditions).length).toBeGreaterThan(0); }
    }
  });
});
