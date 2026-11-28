/**
 * Gates 14.5–14.6 — Einstein's 1916 perihelion and light-bending formulas against his printed results; the radial
 * acceleration relation refitted to the bundled SPARC curves with the paper's own selection.
 */
import { describe, expect, it } from 'vitest';
import { lightDeflectionArcsec, perihelionArcsecPerCentury, SUN_GM } from '@/core/physics/grTests';
import { G_DAGGER, fitGDagger, rarDarkPart, rarPredict, rarScatterDex, rowAccelerations } from '@/core/physics/rar';
import { CONSTANTS } from '@/core/constants/constants';
import elements from '@datasets/astronomical/planet-elements.json';
import sparc from '@datasets/astronomical/sparc-galaxies.json';

const merc = (elements as unknown as { elements: { id: string; a: number; e: number; LDot: number }[] }).elements.find((p) => p.id === 'mercury')!;
const S = sparc as unknown as { galaxies: { name: string; Q: number; inc: number }[]; curves: Record<string, number[][]> };
const gals = S.galaxies.filter((g) => g.Q < 3 && g.inc >= 30);
const rows = gals.flatMap((g) => S.curves[g.name] ?? []);
const pts = rows.filter((r) => r[1] > 0 && r[2] / r[1] < 0.1).map((r) => rowAccelerations(r)).filter((p): p is { gObs: number; gBar: number } => p !== null);

describe('Einstein 1916, p. 822', () => {
  it('eq. (75) with JPL’s elements for Mercury: 42.98″ per century (“43″ pro Jahrhundert”)', () => {
    expect(perihelionArcsecPerCentury(merc.a, merc.e, merc.LDot)).toBeCloseTo(42.98, 2);
  });
  it('eq. (74) at the solar limb: 1.751″ (printed “1,7″”)', () => {
    expect(lightDeflectionArcsec(SUN_GM, CONSTANTS.Rsun.value)).toBeCloseTo(1.751, 3);
  });
});

describe('radial acceleration relation (McGaugh, Lelli & Schombert 2016)', () => {
  it('their cuts (i ≥ 30°, the twelve asymmetric curves = SPARC Q = 3, 10 % velocity precision) leave 153 galaxies and 2696 points (paper: 2693)', () => {
    expect(gals.length).toBe(153);
    expect(pts.length).toBe(2696);
  });
  it('eq. (4) tends to Newton (g_obs → g_bar) at high acceleration and to √(g_bar g†) at low', () => {
    expect(rarPredict(1e-7) / 1e-7).toBeCloseTo(1, 6);
    expect(rarPredict(1e-14) / Math.sqrt(1e-14 * G_DAGGER)).toBeCloseTo(1, 2);
    expect(rarPredict(1e-11) - 1e-11).toBeCloseTo(rarDarkPart(1e-11), 20);
  });
  it('refitting g† to the bundled curves gives 1.16 × 10⁻¹⁰ m s⁻² (paper 1.20 ± 0.02 ± 0.24) with an rms scatter of 0.133 dex (paper 0.13)', () => {
    const g = fitGDagger(pts);
    expect(g / 1e-10).toBeCloseTo(1.1613, 3);
    expect(rarScatterDex(pts, g)).toBeCloseTo(0.1327, 3);
    expect(rarScatterDex(pts)).toBeCloseTo(0.1328, 3);
  });
});
