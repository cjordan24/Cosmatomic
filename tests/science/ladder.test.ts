/**
 * Phase 7, Gate 7.2 — the distance ladder. Transcription of SH0ES 2022 (Riess et al.), CCHP (Freedman
 * 2021; Freedman et al. 2025), the LMC (Pietrzyński et al. 2019) and NGC 4258 (Reid et al. 2019)
 * values; the distance-modulus, Leavitt-law, TRGB and H₀ relations; and cross-checks against numbers
 * the papers print themselves.
 */
import { describe, expect, it } from 'vitest';
import {
  aBLowZ, cepheidMu, h0FromMB, leavittAbsMag, mbForH0, mpcFromMu, muFromMpc, muFromPc, muOffsetForH0, pcFromMu, pcFromParallaxMas, quadrature, sigmaMuFromParallax, tensionSigma, trgbMu, weightedMean,
} from '@/core/physics/distanceLadder';
import { PLANCK18, decelerationParameter, luminosityDistanceMpc } from '@/core/physics/cosmology';
import { CONSTANTS } from '@/core/constants/constants';
import { ALL_H0, LADDER, PLANCK_H0, adoptedTrgb, anchor, anchorPc, h0Sigma } from '@/modes/cosmic/universe/ladder';
import { planckParam } from '@/modes/cosmic/universe/universe';
import { getSource } from '@/shared/sources/sources';
import { getEntity, relationshipsFrom, relationshipsTo } from '@/shared/scientific-relationships/registry';

const L = { MW1: LADDER.leavitt.MW1.value, bW: LADDER.leavitt.bW.value, ZW: LADDER.leavitt.ZW.value };
const SN = LADDER.sne;
const C_KMS = CONSTANTS.c.value / 1000;

describe('transcription', () => {
  it('SH0ES Table 6: 42 SNe Ia in 37 hosts; m⁰_B − µ_Ceph = M⁰_B,i in every row; spot rows', () => {
    expect(SN.calibrators.length).toBe(42);
    expect(new Set(SN.calibrators.map((c) => c.host)).size).toBe(37);
    for (const c of SN.calibrators) expect(Math.abs(c.mB - c.muCeph - c.MB), c.sn).toBeLessThanOrEqual(0.002);
    const fe = SN.calibrators.find((c) => c.sn === '2011fe')!;
    expect([fe.host, fe.mB, fe.eMB, fe.muCeph, fe.eMuCeph, fe.MB, fe.eMBabs, fe.muHost, fe.eMuHost, fe.R]).toEqual(['M101', 9.78, 0.115, 29.193, 0.039, -19.413, 0.122, 29.178, 0.041, 0.44]);
    const du = SN.calibrators.find((c) => c.n === 42)!;
    expect([du.host, du.sn, du.mB, du.muCeph, du.MB]).toEqual(['U9391', '2003du', 13.525, 32.849, -19.324]);
    expect(SN.calibrators.filter((c) => c.host === 'N3147').map((c) => c.sn)).toEqual(['2021hpr', '1997bq', '2008fv']);
  });
  it('SH0ES baseline (Table 5 row 1, §5): Leavitt law, M⁰_B, a_B, H₀; Hubble-flow sample', () => {
    expect([L.MW1, L.bW, L.ZW]).toEqual([-5.894, -3.299, -0.217]);
    expect([LADDER.leavitt.MW1.sigma, LADDER.leavitt.bW.sigma, LADDER.leavitt.ZW.sigma]).toEqual([0.017, 0.015, 0.046]);
    expect(LADDER.leavitt.periodRangeDays).toEqual([5, 120]);
    expect([SN.MB.value, SN.MB.sigma, SN.aB.value, SN.aB.sigma]).toEqual([-19.253, 0.027, 0.714158, null]);
    expect([SN.hubbleFlow.zMin, SN.hubbleFlow.zMax, SN.hubbleFlow.n, SN.hubbleFlow.q0]).toEqual([0.0233, 0.15, 277, -0.55]);
    const sh = LADDER.h0.find((h) => h.id === 'sh0es-2022')!;
    expect([sh.value, h0Sigma(sh)]).toEqual([73.04, 1.04]);
  });
  it('anchors: LMC 49.59 ± 0.09 ± 0.54 kpc (µ 18.477 ± 0.0263 adopted), NGC 4258 7.576 ± 0.082 ± 0.076 Mpc, MW mean ϖ 650 µas', () => {
    expect(anchor('lmc').distance).toEqual({ value: 49.59, stat: 0.09, sys: 0.54, unit: 'kpc' });
    expect(anchor('lmc').adoptedMu).toMatchObject({ value: 18.477, sigma: 0.0263 });
    expect(anchor('ngc4258').distance).toEqual({ value: 7.576, stat: 0.082, sys: 0.076, unit: 'Mpc' });
    expect(anchor('mw').meanParallaxUas).toBe(650);
  });
  it('CCHP: TRGB Table 3 (8 rows, adopted −4.049 ± 0.015 ± 0.035) and the H₀ values with their components', () => {
    expect(LADDER.trgb.calibrations.length).toBe(8);
    expect(adoptedTrgb()).toMatchObject({ M: -4.049, stat: 0.015, sys: 0.035 });
    const c21 = LADDER.h0.find((h) => h.id === 'cchp-2021')!, c25 = LADDER.h0.find((h) => h.id === 'cchp-2025')!;
    expect([c21.value, ...c21.parts.map((p) => p.sigma)]).toEqual([69.8, 0.6, 1.6]);
    expect([c25.value, ...c25.parts.map((p) => p.sigma)]).toEqual([70.39, 1.22, 1.33, 0.70]);
    expect(c25.erratum).toMatch(/erratum/i); // the unread erratum is flagged on the record
    expect(c21.erratum).toBeUndefined();
  });
  it('every value carries an interval type; every cited source is indexed; statements are attributed', () => {
    for (const h of ALL_H0) { expect(h.interval, h.id).toBeTruthy(); expect(getSource(h.source), h.source).toBeDefined(); }
    for (const a of LADDER.anchors) expect(getSource(a.source), a.id).toBeDefined();
    expect(LADDER.leavitt.interval).toMatch(/1σ/);
    expect(LADDER.trgb.interval).toMatch(/1σ/);
    expect(LADDER.statements.length).toBe(4);
    for (const s of LADDER.statements) { expect(getSource(s.source)).toBeDefined(); expect(s.text).not.toMatch(/ﬀ|ﬁ|-\s/); }
    expect(LADDER.statements.find((s) => s.source === 'riess-2022')!.text).toContain('5σ difference');
    expect(LADDER.statements.find((s) => s.source === 'freedman-2021')!.text).toContain('No statistically significant difference');
  });
  it('Planck reference values are read from the Planck dataset, not duplicated', () => {
    expect(PLANCK_H0[0].value).toBe(planckParam('H0').value);
    expect(PLANCK_H0[0].parts[0].sigma).toBe(planckParam('H0').sigma);
    expect(PLANCK_H0[1].value).toBe(67.36);
    expect(LADDER.planckReference.sh0esComparedWith).toMatchObject({ value: 67.4, sigma: 0.5 });
  });
});

describe('relations', () => {
  it('distance modulus: 0 at 10 pc, µ = 5 log D[Mpc] + 25, inverses round-trip', () => {
    expect(muFromPc(10)).toBe(0);
    expect(muFromMpc(1)).toBeCloseTo(25, 12);
    expect(muFromPc(1e6)).toBeCloseTo(muFromMpc(1), 12);
    for (const mu of [-1, 18.477, 29.4, 34.5]) { expect(muFromPc(pcFromMu(mu))).toBeCloseTo(mu, 10); expect(muFromMpc(mpcFromMu(mu))).toBeCloseTo(mu, 10); }
  });
  it('anchors: the LMC distance reproduces the µ SH0ES adopts (18.477) and NGC 4258 gives 29.397', () => {
    expect(muFromPc(anchorPc(anchor('lmc'))!.pc)).toBeCloseTo(18.477, 3);
    expect(muFromMpc(7.576)).toBeCloseTo(29.397, 3);
    // the LMC σ in µ from 0.546 kpc is 0.024 mag; SH0ES carry 0.0263 (both are stated in the view)
    const d = anchorPc(anchor('lmc'))!;
    expect((5 / Math.LN10) * (d.sigmaPc / d.pc)).toBeCloseTo(0.0239, 3);
  });
  it('parallax: Proxima-like 768.07 mas → 1.302 pc; σ_µ = (5/ln10)σϖ/ϖ; MW Cepheids at 650 µas ≈ 1.54 kpc', () => {
    expect(pcFromParallaxMas(768.0665)).toBeCloseTo(1.30197, 4);
    expect(pcFromParallaxMas(0)).toBeNull();
    expect(sigmaMuFromParallax(100, 1)).toBeCloseTo(0.021715, 5);
    expect(pcFromParallaxMas(0.65)).toBeCloseTo(1538.5, 0);
  });
  it('Leavitt law: M = M_H,1^W at P = 10 d and solar [O/H]; slope b_W per dex; metallicity term; µ round-trip', () => {
    expect(leavittAbsMag(10, 0, L)).toBe(L.MW1);
    expect(leavittAbsMag(100, 0, L) - leavittAbsMag(10, 0, L)).toBeCloseTo(L.bW, 12);
    expect(leavittAbsMag(10, -0.29, L) - L.MW1).toBeCloseTo(-0.29 * L.ZW, 12); // LMC Cepheids are 0.063 mag fainter
    const M = leavittAbsMag(30, 0.1, L);
    expect(cepheidMu(M + 29.397, 30, 0.1, L)).toBeCloseTo(29.397, 12);
  });
  it('TRGB: µ = m_tip − M; the adopted zero point is the inverse-variance mean of its four geometric anchors (to 0.002 mag)', () => {
    expect(trgbMu(14.428, -4.049)).toBeCloseTo(18.477, 12);
    const four = LADDER.trgb.calibrations.filter((c) => ['NGC 4258', 'Milky Way globular clusters', 'LMC', 'SMC'].includes(c.object));
    expect(four.length).toBe(4);
    const wm = weightedMean(four.map((c) => c.M), four.map((c) => quadrature([c.stat, c.sys])));
    expect(Math.abs(wm.mean - adoptedTrgb().M)).toBeLessThan(0.002);
  });
  it('H₀ from eq. 5: the baseline M⁰_B and a_B give 73.04, and 5 log H₀ = 9.318 as printed in §5', () => {
    const H = h0FromMB(SN.MB.value, SN.aB.value);
    expect(H).toBeCloseTo(73.04, 2);
    expect(5 * Math.log10(H)).toBeCloseTo(9.318, 3);
    expect(mbForH0(H, SN.aB.value)).toBeCloseTo(SN.MB.value, 10);
    // Planck's lower H₀ needs a brighter (more negative) M⁰_B with the same intercept, by 5 log₁₀(H/H_Planck)
    expect(SN.MB.value - mbForH0(PLANCK18.H0, SN.aB.value)).toBeCloseTo(muOffsetForH0(H, PLANCK18.H0), 10);
    expect(muOffsetForH0(H, PLANCK18.H0)).toBeCloseTo(5 * Math.log10(73.04 / 67.66), 3);
  });
  it('a_B definition: synthetic low-z Hubble-law supernovae return the input H₀ through eq. 5', () => {
    for (const H of [60, 67.66, 73.04]) {
      const z = 0.001, cz = C_KMS * z, m = -19.3 + muFromMpc(cz / H);
      expect(h0FromMB(-19.3, aBLowZ(cz, m))).toBeCloseTo(H, 8);
    }
  });
  it('the Hubble-flow range in ΛCDM follows D_L ≈ (cz/H₀)(1 + (1 − q₀)z/2) at z = 0.0233 (to 0.05 %)', () => {
    const z = SN.hubbleFlow.zMin, c = { ...PLANCK18, H0: 73.04 };
    const q0 = decelerationParameter(0, c);
    const approx = (C_KMS * z / 73.04) * (1 + ((1 - q0) * z) / 2);
    expect(Math.abs(luminosityDistanceMpc(z, c) / approx - 1)).toBeLessThan(5e-4);
    expect(q0).toBeCloseTo(-0.53, 2); // close to the q₀ = −0.55 SH0ES adopt
  });
  it('tension: SH0ES vs Planck 67.4 ± 0.5 is 4.9σ with independent Gaussian errors, against the 5.0σ SH0ES quote in 5 log H₀', () => {
    const t = tensionSigma(73.04, 1.04, 67.4, 0.5);
    expect(t).toBeCloseTo(4.89, 2);
    expect(Math.abs(t - 5.0)).toBeLessThan(0.2);
    expect(muOffsetForH0(73.04, 67.4)).toBeCloseTo(0.176, 2);
    const c21 = LADDER.h0.find((h) => h.id === 'cchp-2021')!;
    expect(tensionSigma(c21.value, h0Sigma(c21), planckParam('H0').value, planckParam('H0').sigma!)).toBeLessThan(2); // “no statistically significant difference”
  });
  it('calibrators: weighted mean of M⁰_B,i (no covariance) is within 0.02 mag of the global-fit M⁰_B', () => {
    const wm = weightedMean(SN.calibrators.map((c) => c.MB), SN.calibrators.map((c) => c.eMBabs));
    expect(Math.abs(wm.mean - SN.MB.value)).toBeLessThan(0.02);
    expect(wm.sigma).toBeLessThan(0.03);
  });
});

describe('registry', () => {
  it('distance ladder explains cosmic expansion; the Milky Way is part of the ladder; both directions resolve', () => {
    expect(getEntity('context:distance-ladder')?.route).toBe('#/cosmic/ladder');
    expect(relationshipsFrom('context:distance-ladder').some((r) => r.to === 'context:cosmic-expansion' && r.source === 'riess-2022')).toBe(true);
    expect(relationshipsTo('context:cosmic-expansion').some((r) => r.from === 'context:distance-ladder')).toBe(true);
    expect(relationshipsTo('context:distance-ladder').some((r) => r.from === 'galaxy:milky-way')).toBe(true);
  });
});
