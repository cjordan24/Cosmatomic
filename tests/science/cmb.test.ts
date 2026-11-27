/**
 * Phase 7, Gate 7.3 — the cosmic microwave background. FIRAS Table 4 (Fixsen et al. 1996) against
 * Planck's law; T(z) measurements (Noterdaeme et al. 2011; Muller et al. 2013); the Planck 2018 TT power
 * spectrum (Planck Legacy Archive) and its best fit; cross-checks against numbers the papers print.
 */
import { describe, expect, it } from 'vitest';
import {
  bestFitT, blackbodyMJy, chi2About, clFromDl, cmbPeakGHz, cmbTemperature, firasIntensity, ghzFromWavenumber, localMaxima, pullSigma, redshiftAtTemperature, residualAbout,
} from '@/core/physics/cmb';
import { WIEN_B } from '@/core/physics/em/em';
import { CMB, FIRAS, bandAt, theoryDl } from '@/modes/cosmic/universe/cmb';
import { planckParam } from '@/modes/cosmic/universe/universe';
import { getSource } from '@/shared/sources/sources';
import { getEntity, relationshipsFrom, relationshipsTo } from '@/shared/scientific-relationships/registry';

const TREF = CMB.firas.referenceT, T0 = CMB.t0.value;

describe('FIRAS spectrum (Fixsen et al. 1996, Table 4)', () => {
  it('43 frequencies from 2.27 to 21.33 cm⁻¹; spot rows as printed', () => {
    expect(FIRAS.length).toBe(43);
    expect(CMB.firas.rows[0]).toEqual([2.27, 200.723, 5, 14, 4]);
    expect(CMB.firas.rows[42]).toEqual([21.33, 4.523, -432, 282, 573]);
    expect(CMB.firas.rows.find((r) => r[0] === 11.8)).toEqual([11.8, 128.835, 58, 23, 98]);
  });
  it('wavenumber → frequency: 2.27–21.33 cm⁻¹ is 68.1–639.5 GHz', () => {
    expect(ghzFromWavenumber(2.27)).toBeCloseTo(68.05, 2);
    expect(ghzFromWavenumber(21.33)).toBeCloseTo(639.46, 2);
  });
  it('LAMBDA column 2 = 2.725 K blackbody + residual, to within 7.6 kJy/sr with 2019 SI constants (well inside every 1σ)', () => {
    for (const [i, p] of FIRAS.entries()) {
      const d = Math.abs(firasIntensity(p, TREF) - CMB.firas.rows[i][1]) * 1000;
      expect(d, `ν = ${p.nu}`).toBeLessThan(7.7);
      expect(d).toBeLessThan(p.sigma);
    }
  });
  it('the spectrum peaks near 5.4 cm⁻¹ at ≈ 384 MJy/sr, and the residuals are < 50 ppm of the peak on average', () => {
    const peak = FIRAS.reduce((a, b) => (firasIntensity(b, TREF) > firasIntensity(a, TREF) ? b : a));
    expect(peak.nu).toBe(5.45);
    expect(firasIntensity(peak, TREF)).toBeCloseTo(383.5, 0);
    // weighted rms Σ(Δ/σ)²/Σ(1/σ²) as defined in §6.1, about the reference blackbody, in ppm of the peak
    const w = FIRAS.reduce((s, p) => s + 1 / p.sigma ** 2, 0);
    const rms = Math.sqrt(FIRAS.reduce((s, p) => s + (p.resid / p.sigma) ** 2, 0) / w) / 1000;
    expect(rms / firasIntensity(peak, TREF) * 1e6).toBeLessThan(CMB.firas.rmsPpm.value);
  });
  it('best-fit temperature recovers the 2.725 K reference scale with χ² ≈ 45 for 42 d.o.f. (published 46/40 with Galaxy and distortion terms)', () => {
    const T = bestFitT(FIRAS, TREF);
    expect(T).toBeCloseTo(2.725, 4);
    const chi2 = chi2About(FIRAS, TREF, T);
    expect(chi2).toBeGreaterThan(40);
    expect(chi2).toBeLessThan(52);
    expect(chi2About(FIRAS, TREF, T0)).toBeGreaterThan(1000); // absolute-scale offset: diagonal errors exclude it
  });
  it('a temperature offset ΔT adds ≈ ΔT·∂B/∂T to every residual', () => {
    const p = FIRAS[10], dT = 1e-4, dBdT = (blackbodyMJy(p.nu, TREF + 1e-6) - blackbodyMJy(p.nu, TREF - 1e-6)) / 2e-6;
    expect(residualAbout(p, TREF, TREF - dT) - residualAbout(p, TREF, TREF)).toBeCloseTo(dT * dBdT * 1000, 2);
  });
  it('distortion limits as published (95 % CL)', () => {
    expect(CMB.firas.distortions.map((d) => [d.key, d.limit])).toEqual([['mu', 9e-5], ['y', 15e-6]]);
    expect(CMB.firas.fit1996).toMatchObject({ T: 2.728, sigma: 0.004, interval: '95 % CL' });
  });
  it('Wien peaks at T₀ = 2.72548 K: B_ν at 160.2 GHz, B_λ at 1.063 mm', () => {
    expect(cmbPeakGHz(0, T0)).toBeCloseTo(160.2, 1);
    expect(WIEN_B / T0 * 1e3).toBeCloseTo(1.063, 3);
  });
});

describe('temperature–redshift relation', () => {
  it('T(z∗) = 2.72548 × 1090.8 ≈ 2973 K at Planck’s last scattering; inverse relation', () => {
    expect(cmbTemperature(planckParam('zstar').value, T0)).toBeCloseTo(2972.95, 1);
    expect(redshiftAtTemperature(cmbTemperature(1089.8, T0), T0)).toBeCloseTo(1089.8, 8);
    expect(cmbTemperature(2, T0, 0.5)).toBeCloseTo(T0 * Math.sqrt(3), 12);
  });
  it('Muller et al. (2013): 5.08 ± 0.10 K at z = 0.88582; the paper’s adiabatic 5.14 K is reproduced and lies within 1σ', () => {
    const m = CMB.tz.measurements.find((x) => x.source === 'muller-2013')!;
    expect([m.z, m.T, m.lo, m.hi, m.interval]).toEqual([0.88582, 5.08, 0.1, 0.1, '68 % CL']);
    const pred = cmbTemperature(m.z, T0);
    expect(pred).toBeCloseTo(5.14, 2);
    expect(Math.abs(pullSigma(m.T, m.lo, m.hi, pred))).toBeLessThan(1);
  });
  it('Noterdaeme et al. (2011) Table 1: five CO systems, all within 1.5σ of T₀(1+z)', () => {
    const n = CMB.tz.measurements.filter((x) => x.source === 'noterdaeme-2011');
    expect(n.map((x) => [x.z, x.T, x.hi, x.lo])).toEqual([[1.7293, 7.5, 1.6, 1.2], [1.7738, 7.8, 0.7, 0.6], [2.0377, 8.6, 1.1, 1.0], [2.4184, 9.15, 0.7, 0.7], [2.6896, 10.5, 0.8, 0.6]]);
    for (const x of n) expect(Math.abs(pullSigma(x.T, x.lo, x.hi, cmbTemperature(x.z, T0))), x.object).toBeLessThan(1.5);
    expect(CMB.tz.beta).toMatchObject({ value: -0.007, sigma: 0.027 });
  });
});

describe('Planck 2018 TT power spectrum', () => {
  it('coverage: ℓ = 2–29 unbinned, 83 bins from ℓ_b ≈ 47.7 to ≈ 2499, theory to ℓ = 2508', () => {
    expect(CMB.power.lowEll.rows.map((r) => r[0])).toEqual(Array.from({ length: 28 }, (_, i) => i + 2));
    expect(CMB.power.binned.rows.length).toBe(83);
    expect(CMB.power.binned.rows[0][0]).toBeCloseTo(47.711, 3);
    expect(CMB.power.binned.rows[82][0]).toBeCloseTo(2499.024, 3);
    expect(CMB.power.theory.rows.at(-1)![0]).toBe(2508);
  });
  it('the adapter’s integrity checks passed: ℓ_b and the binned best fit reproduce from the theory spectrum', () => {
    expect(CMB.power.checks.length).toBe(2);
    // first bin, ℓ = 30–59, weights ℓ(ℓ+1): mean multipole
    let sw = 0, swl = 0;
    for (let l = 30; l <= 59; l++) { sw += l * (l + 1); swl += l * l * (l + 1); }
    expect(swl / sw).toBeCloseTo(CMB.power.binned.rows[0][0], 3);
  });
  it('the measured spectrum peaks in the bin that contains the first peak of the best fit (derived ≈ 220)', () => {
    const peaks = localMaxima(CMB.power.theory.rows, 100);
    expect(peaks[0].l).toBeGreaterThan(200);
    expect(peaks[0].l).toBeLessThan(240);
    const maxBin = CMB.power.binned.rows.reduce((a, b) => (b[1] > a[1] ? b : a));
    expect(Math.abs(maxBin[0] - peaks[0].l)).toBeLessThan(30);
    expect(peaks.length).toBeGreaterThanOrEqual(6);
  });
  it('band lookup and C_ℓ conversion', () => {
    expect(bandAt(10)).toMatchObject({ kind: 'low', l: 10 });
    const b = bandAt(220);
    expect(b.kind).toBe('binned');
    expect(b.range).toEqual([210, 239]);
    expect(bandAt(2508).range).toEqual([2490, 2508]);
    expect(clFromDl(220, theoryDl(220)) * (220 * 221) / (2 * Math.PI)).toBeCloseTo(theoryDl(220), 9);
  });
  it('binned residuals about the best fit: χ² of 83 bins with diagonal errors is of order the number of bins', () => {
    const chi2 = CMB.power.binned.rows.reduce((s, r) => s + ((r[1] - r[3]) / r[2]) ** 2, 0);
    expect(chi2).toBeGreaterThan(40);
    expect(chi2).toBeLessThan(140);
  });
});

describe('Source index and registry', () => {
  it('every source cited by the CMB dataset exists, with a DOI or URL and a licence for the data', () => {
    for (const id of ['fixsen-1996', 'lambda-firas', 'planck-2018-v', 'planck-pla', 'noterdaeme-2011', 'muller-2013', 'fixsen-2009']) {
      const s = getSource(id);
      expect(s, id).toBeTruthy();
      expect(s!.datasets).toContain('cmb');
    }
    expect(getSource('planck-pla')!.license).toMatch(/CC BY-NC 3\.0 IGO/);
    for (const m of CMB.tz.measurements) expect(getSource(m.source)).toBeTruthy();
  });
  it('context:cmb is linked both ways to the expansion model and emits microwaves', () => {
    expect(getEntity('context:cmb')?.route).toBe('#/cosmic/cmb');
    expect(relationshipsFrom('context:cmb').map((r) => r.to)).toEqual(expect.arrayContaining(['context:cosmic-expansion', 'wave:em-microwave']));
    expect(relationshipsTo('context:cmb').map((r) => r.from)).toContain('context:cosmic-expansion');
  });
});
