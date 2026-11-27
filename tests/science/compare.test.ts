/**
 * Phase 8, Gate 8.3 — integrated spectroscopy (#/spectral/compare). Axis conversions, the shared
 * continuum quantity λB_λ = νB_ν, the FIRAS conversion, the nebula → NIST line matching, the (1 + z)
 * transformation and the layer catalogue's provenance and sources.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import { peakFrequency, peakWavelength } from '@/core/physics/em/em';
import { firasPoints } from '@/core/physics/cmb';
import { getSource } from '@/shared/sources/sources';
import { getEntity } from '@/shared/scientific-relationships/registry';
import { getMaterial, refractiveIndex } from '@/modes/atomic/materials/materials';
import { DWARF_SEQUENCE } from '@/modes/cosmic/star-systems/stars';
import type { NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import {
  DEFAULT_LAYERS, NOT_BUNDLED, T_SUN_NOMINAL, axisPosition, axisValue, blackbodyPerLog, blackbodyPerLogNu, catalogue, decadeTicks, firasPerLog,
  labelNm, lambdaAtPosition, lambdaOfAxis, matchNebulaLine, nebulaBars, parseLayers, perLogPeakWavelength, redshifted, sampleBlackbody, sampleIndex,
} from '@/modes/spectral/compare/layers';
import nistJson from '@datasets/atomic/spectra-nist.json';
import cmb from '@datasets/astronomical/cmb.json';
import molecules from '@datasets/molecular/molecules.json';

const nist = nistJson as unknown as NistSpectra;
const C = CONSTANTS.c.value, H = CONSTANTS.h.value, E = CONSTANTS.e.value, KB = CONSTANTS.kB.value;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const CAT = catalogue(cmb.t0.value, cmb.t0.source);
const byId = (id: string) => CAT.find((l) => l.id === id)!;

describe('axis', () => {
  it('converts a vacuum wavelength to frequency and photon energy with exact SI constants, and back', () => {
    expect(rel(axisValue('frequency', 500e-9), C / 500e-9)).toBeLessThan(1e-15);
    expect(rel(axisValue('energy', 500e-9), (H * C) / (500e-9 * E))).toBeLessThan(1e-15);
    expect(axisValue('energy', 500e-9)).toBeCloseTo(2.479684, 5);
    for (const k of ['wavelength', 'frequency', 'energy'] as const) expect(rel(lambdaOfAxis(k, axisValue(k, 1.234e-5)), 1.234e-5)).toBeLessThan(1e-14);
  });
  it('draws wavelength increasing to the right and frequency/energy decreasing in λ', () => {
    const lo = -7, hi = -5;
    expect(axisPosition('wavelength', 1e-7, lo, hi)).toBeCloseTo(0, 12);
    expect(axisPosition('frequency', 1e-7, lo, hi)).toBeCloseTo(1, 12);
    expect(axisPosition('energy', 1e-5, lo, hi)).toBeCloseTo(0, 12);
    for (const k of ['wavelength', 'frequency', 'energy'] as const) expect(rel(lambdaAtPosition(k, axisPosition(k, 3.3e-6, lo, hi), lo, hi), 3.3e-6)).toBeLessThan(1e-12);
  });
  it('places decade ticks of the displayed quantity inside the range', () => {
    for (const k of ['wavelength', 'frequency', 'energy'] as const) {
      const t = decadeTicks(k, -7.3, -1.5);
      expect(t.length).toBeGreaterThan(3);
      for (const x of t) {
        expect(Math.log10(x.value) % 1).toBeCloseTo(0, 9);
        expect(x.lambda).toBeGreaterThanOrEqual(10 ** -7.3 * (1 - 1e-12));
        expect(x.lambda).toBeLessThanOrEqual(10 ** -1.5 * (1 + 1e-12));
      }
    }
  });
});

describe('continuum quantity λB_λ = νB_ν', () => {
  it('is the same number from the wavelength and frequency forms of Planck’s law', () => {
    for (const T of [2.72548, 300, 3000, T_SUN_NOMINAL, 30000]) for (const lam of [1e-7, 5e-7, 1e-5, 1e-3]) {
      const a = blackbodyPerLog(lam, T), b = blackbodyPerLogNu(C / lam, T);
      if (a > 1e-250) expect(rel(a, b)).toBeLessThan(1e-12);
    }
  });
  it('peaks at hc/(3.920690 kT), between the per-λ and per-ν Wien peaks', () => {
    const T = T_SUN_NOMINAL, peak = perLogPeakWavelength(T);
    expect(rel(peak, (H * C) / (3.920690395 * KB * T))).toBeLessThan(1e-8);
    expect(peak * 1e9).toBeCloseTo(635.75, 1);
    const pts = sampleBlackbody(T, peak / 3, peak * 3, 4001);
    const best = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
    expect(rel(best[0], peak)).toBeLessThan(1e-3);
    expect(peak).toBeGreaterThan(peakWavelength(T));
    expect(peak).toBeLessThan(C / peakFrequency(T));
  });
  it('drops underflowed samples instead of plotting zeros on a log axis', () => {
    const pts = sampleBlackbody(2.72548, 1e-8, 1e-6);
    expect(pts.every(([, y]) => y > 0)).toBe(true);
  });
});

describe('FIRAS on the shared axis', () => {
  const pts = firasPoints(cmb.firas.rows).map((p) => firasPerLog(p, cmb.firas.referenceT));
  it('converts all 43 points to λ = 1/(100 ν̃); νI_ν minus a 2.725 K blackbody is the published residual', () => {
    expect(pts).toHaveLength(43);
    cmb.firas.rows.forEach((r, i) => {
      expect(rel(pts[i].lambda, 1 / (100 * r[0]))).toBeLessThan(1e-12);
      const residKJy = ((pts[i].y - blackbodyPerLog(pts[i].lambda, cmb.firas.referenceT)) / pts[i].nu / 1e-20) * 1000;
      expect(residKJy).toBeCloseTo(r[2], 6);
      expect(rel(pts[i].sigma / pts[i].nu / 1e-20 * 1000, r[3])).toBeLessThan(1e-12);
    });
  });
  it('rebuilds the LAMBDA intensity column (MJy/sr) from residual + reference blackbody', () => {
    cmb.firas.rows.forEach((r, i) => expect(rel(pts[i].y / pts[i].nu / 1e-20, r[1])).toBeLessThan(2e-4));
  });
  it('has its largest νI_ν near the λB_λ peak of a 2.725 K blackbody (1.35 mm)', () => {
    const top = pts.reduce((a, b) => (b.y > a.y ? b : a));
    expect(Math.abs(Math.log(top.lambda / perLogPeakWavelength(2.725)))).toBeLessThan(0.08);
  });
});

describe('nebula lines at NIST rest wavelengths', () => {
  it('reads the wavelength quoted in a label', () => {
    expect(labelNm('Hα 656 nm')).toBe(656);
    expect(labelNm('[O III] 501 nm')).toBe(501);
    expect(labelNm('no number')).toBeNull();
  });
  it('matches Hα to the NIST H I 2 → 3 entry and the bracketed lines to forbidden transitions', () => {
    const ha = matchNebulaLine(nist.spectra['H I'].lines, 'Hα 656 nm')!;
    expect(ha.wl).toBeCloseTo(656.46, 2);
    expect(ha.lower).toBe('2');
    const n2 = matchNebulaLine(nist.spectra['N II'].lines, '[N II] 658 nm')!;
    expect(n2.wl).toBeCloseTo(658.527, 3);
    expect(n2.type).toBe('M1');
    const o3 = matchNebulaLine(nist.spectra['O III'].lines, '[O III] 501 nm')!;
    expect(o3.wl).toBeCloseTo(500.824, 3);
    expect(o3.type).toBe('M1');
  });
  it('places every line named in the nebula dataset (none left unmatched)', () => {
    for (const id of ['orion', 'ring']) {
      const { placed, unmatched } = nebulaBars(nist, id);
      expect(unmatched).toEqual([]);
      expect(placed.length).toBeGreaterThan(0);
    }
  });
});

describe('redshift transformation', () => {
  it('applies λ_obs = λ_rest(1 + z)', () => {
    expect(redshifted(656.46e-9, 1) * 1e9).toBeCloseTo(1312.92, 2);
    expect(redshifted(500e-9, 0)).toBe(500e-9);
  });
  it('applies only to line layers and stellar blackbodies, never to FIRAS, the CMB model or n(λ)', () => {
    expect(byId('a.H-I').shiftable).toBe(true);
    expect(byId('neb.ring').shiftable).toBe(true);
    expect(byId('bb.sun').shiftable).toBe(true);
    expect(byId('firas').shiftable).toBe(false);
    expect(byId('bb.cmb').shiftable).toBe(false);
    expect(CAT.filter((l) => l.group === 'index').every((l) => !l.shiftable)).toBe(true);
  });
});

describe('layer catalogue', () => {
  it('has unique ids, one layer per bundled NIST spectrum and the nebulae that have lines', () => {
    expect(new Set(CAT.map((l) => l.id)).size).toBe(CAT.length);
    expect(CAT.filter((l) => l.group === 'atomic')).toHaveLength(Object.keys(nist.spectra).length);
    expect(CAT.filter((l) => l.group === 'nebula').map((l) => l.id).sort()).toEqual(['neb.orion', 'neb.ring']);
  });
  it('labels measurements observed and laws or formulas model, with a matching provenance class', () => {
    for (const l of CAT) {
      if (l.group === 'atomic' || l.group === 'nebula' || l.group === 'cmb') { expect(l.nature).toBe('observed'); expect(l.provenance).toBe('observed'); }
      else { expect(l.nature).toBe('model'); expect(l.provenance).toBe('derived'); }
    }
  });
  it('cites only registered sources and links only to registered entities', () => {
    for (const l of CAT) {
      expect(l.sources.length).toBeGreaterThan(0);
      for (const s of l.sources) expect(getSource(s), `${l.id} → ${s}`).toBeTruthy();
      if (l.entity) expect(getEntity(l.entity), `${l.id} → ${l.entity}`).toBeTruthy();
    }
    expect(getEntity('instrument:spectral-compare')?.route).toBe('#/spectral/compare');
  });
  it('takes blackbody temperatures from their sources: IAU 5772 K, Fixsen 2009 T₀, the Pecaut & Mamajek dwarf sequence', () => {
    expect(byId('bb.sun').T).toBe(5772);
    expect(byId('bb.cmb').T).toBe(2.72548);
    for (const r of DWARF_SEQUENCE.filter((x) => x.Teff !== null)) expect(byId(`bb.${r.spt}`).T).toBe(r.Teff);
    expect(byId('bb.G2V').T).toBe(DWARF_SEQUENCE.find((r) => r.spt === 'G2V')!.Teff);
  });
  it('parses the URL layer list: defaults, unknown ids dropped, duplicates removed', () => {
    const known = new Set(CAT.map((l) => l.id));
    expect(parseLayers(null, known)).toEqual(DEFAULT_LAYERS);
    expect(parseLayers('a.H-I,bogus,a.H-I,n.water', known)).toEqual(['a.H-I', 'n.water']);
    expect(parseLayers('', known)).toEqual([]);
  });
});

describe('refractive index layers', () => {
  it('samples n(λ) only inside the cited range, with the same values as the materials module', () => {
    const w = getMaterial('water')!;
    const pts = sampleIndex(w, 1e-8, 1e-1);
    const [a, b] = w.refractiveIndex!.rangeUm!;
    expect(pts.length).toBeGreaterThan(10);
    for (const [lam] of pts) { expect(lam * 1e6).toBeGreaterThanOrEqual(a - 1e-9); expect(lam * 1e6).toBeLessThanOrEqual(b + 1e-9); }
    const mid = pts[Math.floor(pts.length / 2)];
    expect(mid[1]).toBe(refractiveIndex(w.refractiveIndex!, mid[0] * 1e6));
    expect(sampleIndex(w, 1e-3, 1e-2)).toEqual([]);
  });
});

describe('not bundled', () => {
  it('lists molecular IR as unavailable, and the molecule dataset indeed has no IR or vibrational data', () => {
    expect(NOT_BUNDLED.some((n) => /infrared/i.test(n.label))).toBe(true);
    const keys = new Set((molecules as unknown as Record<string, unknown>[]).flatMap((m) => Object.keys(m)));
    for (const k of keys) expect(k).not.toMatch(/^(ir|irSpectrum|vibrations?|frequencies)$/i);
  });
});
