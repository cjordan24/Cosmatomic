/**
 * Phase 7, Gate 7.4 — dark-matter evidence. SPARC accelerations; the Bullet Cluster (Clowe et al. 2006
 * Table 2); the Coma mass model of Łokas & Mamon (2003) recomputed from their equations and compared with
 * the numbers they print; the spherical Jeans equation against an analytic case; BBN baryons (Cooke et al.
 * 2018) against Planck 2018.
 */
import { describe, expect, it } from 'vitest';
import {
  G_KPC, accelFromV2, criticalDensity, enclosedMassFromV2, haloMass, haloRadii, jeansSigmaLos, massDiscrepancy, parseDec, parseRa, profileMass, skyOffsetArcsec,
} from '@/core/physics/darkMatter';
import { kpcPerArcsec } from '@/core/physics/cosmology';
import { UPSILON_DEFAULT, vBar2, type Sparc } from '@/modes/cosmic/galaxies/galaxies';
import {
  BBN, BULLET, COMA, coma, comaDispersion, comaFit, comaTotalVirialRadius, cosmicBudget, outerDiscrepancy, quantile, radialAccelerations,
} from '@/modes/cosmic/universe/darkmatter';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import { getSource } from '@/shared/sources/sources';
import { getEntity, relationshipsFrom, relationshipsTo } from '@/shared/scientific-relationships/registry';
import sparcJson from '@datasets/astronomical/sparc-galaxies.json';

const sparc = sparcJson as unknown as Sparc;

describe('accelerations and masses from circular speeds', () => {
  it('g = V²/R in m/s²: 200 km/s at 8 kpc is 1.62 × 10⁻¹⁰ m/s²; V²R/G for the same is 7.44 × 10¹⁰ M☉', () => {
    expect(accelFromV2(200 ** 2, 8)).toBeCloseTo(1.6203e-10, 13);
    expect(enclosedMassFromV2(200 ** 2, 8) / 1e10).toBeCloseTo(7.44, 2);
    expect(G_KPC).toBeCloseTo(4.3009e-6, 9);
    expect(massDiscrepancy(150, 100 ** 2)).toBeCloseTo(2.25, 12);
    expect(massDiscrepancy(150, -5)).toBeNull();
  });
  it('SPARC: every radius with V_bar² > 0, and most lie above g_obs = g_bar', () => {
    const pts = radialAccelerations(sparc, UPSILON_DEFAULT.disk, UPSILON_DEFAULT.bul);
    const positive = sparc.galaxies.flatMap((g) => sparc.curves[g.name].filter((p) => vBar2(p, 0.5, 0.7) > 0 && p[1] > 0)).length;
    expect(pts.length).toBe(positive);
    expect(pts.length).toBeGreaterThan(3300);
    expect(pts.filter((p) => p.gObs > p.gBar).length / pts.length).toBeGreaterThan(0.9);
    // at low acceleration the discrepancy grows: below 10⁻¹¹ m/s² of baryonic acceleration, g_obs is several times g_bar
    const low = pts.filter((p) => p.gBar < 1e-11);
    expect(quantile(low.map((p) => p.gObs / p.gBar), 0.5)).toBeGreaterThan(3);
  });
  it('outer mass discrepancy: NGC 3198 needs several times its visible mass; doubling Υ lowers but does not remove it', () => {
    const d = outerDiscrepancy(sparc.curves.NGC3198, 0.5, 0.7)!;
    expect(d).toBeGreaterThan(2);
    const d2 = outerDiscrepancy(sparc.curves.NGC3198, 1.0, 1.4)!;
    expect(d2).toBeLessThan(d);
    expect(d2).toBeGreaterThan(1.3);
    const all = sparc.galaxies.filter((g) => g.Q <= 2).map((g) => outerDiscrepancy(sparc.curves[g.name], 0.5, 0.7)).filter((x): x is number => x !== null);
    expect(quantile(all, 0.5)).toBeGreaterThan(2);
  });
});

describe('Bullet Cluster (Clowe et al. 2006, Table 2)', () => {
  it('Table 2 transcription and interval type', () => {
    expect(BULLET.components.map((c) => c.id)).toEqual(['main-bcg', 'main-plasma', 'sub-bcg', 'sub-plasma']);
    expect(BULLET.components.map((c) => c.MX[0])).toEqual([5.5, 6.6, 2.7, 5.8]);
    expect(BULLET.components.map((c) => c.Mstar[0])).toEqual([0.54, 0.23, 0.58, 0.12]);
    expect(BULLET.components.map((c) => c.kappa)).toEqual([[0.36, 0.06], [0.05, 0.06], [0.20, 0.05], [0.02, 0.06]]);
    expect(BULLET.interval).toMatch(/implied/);
  });
  it('the paper’s 4.413 kpc/″ at z = 0.296 is reproduced by the Expansion model with its cosmology', () => {
    const c = BULLET.cosmology;
    expect(kpcPerArcsec(BULLET.z, { name: 'Clowe', H0: c.H0, Om: c.Om, Ode: c.Ode })).toBeCloseTo(c.kpcPerArcsec, 3);
  });
  it('the two BCGs are 0.72 Mpc apart on the sky, as stated (§1)', () => {
    const o = skyOffsetArcsec(BULLET.components[0], BULLET.components[2]);
    expect(Math.hypot(o.east, o.north) * BULLET.cosmology.kpcPerArcsec / 1000).toBeCloseTo(BULLET.merger.separationMpc, 2);
    expect(o.east).toBeLessThan(0); // the subcluster lies to the west
  });
  it('“greater by a factor of 2 at the plasma peak than at the BCG” (subcluster visible mass), while κ̄ is ten times lower there', () => {
    const [mb, mp, sb, sp] = BULLET.components;
    const sub = (sp.MX[0] + sp.Mstar[0]) / (sb.MX[0] + sb.Mstar[0]);
    expect(sub).toBeGreaterThan(1.7);
    expect(sub).toBeLessThan(2.0);
    expect(sp.kappa[0] / sb.kappa[0]).toBeCloseTo(0.1, 6);
    expect(mp.MX[0] + mp.Mstar[0]).toBeGreaterThan(mb.MX[0] + mb.Mstar[0]);
    expect(mp.kappa[0]).toBeLessThan(mb.kappa[0]);
  });
  it('the gas dominates the visible mass in every aperture even at M/L_I = 3', () => {
    for (const c of BULLET.components) expect(c.MX[0]).toBeGreaterThan(c.Mstar[0] * (3 / BULLET.stellarMassToLight.value));
  });
  it('sexagesimal parsing and small-angle offsets', () => {
    expect(parseRa('06:58:16.0')).toBeCloseTo(104.5666667, 6);
    expect(parseDec('−55:56:35.1')).toBeCloseTo(-55.9430833, 6);
    expect(parseDec('+27:57:33')).toBeCloseTo(27.959167, 5);
    const o = skyOffsetArcsec({ ra: '00:00:00', dec: '+60:00:00' }, { ra: '00:00:01', dec: '+60:00:10' });
    expect(o.east).toBeCloseTo(7.5, 6);
    expect(o.north).toBeCloseTo(10, 6);
  });
});

describe('generalised halo profile (Łokas & Mamon eqs. 6–12)', () => {
  it('m(x) matches the closed forms for α = 0, 1/2, 1 and 3/2', () => {
    for (const x of [0.1, 1, 5, 30]) {
      expect(profileMass(x, 1)).toBeCloseTo(Math.log(1 + x) - x / (1 + x), 8);
      expect(profileMass(x, 0)).toBeCloseTo(Math.log(1 + x) - (x * (2 + 3 * x)) / (2 * (1 + x) ** 2), 8);
      expect(profileMass(x, 1.5)).toBeCloseTo(2 * Math.asinh(Math.sqrt(x)) - 2 * Math.sqrt(x / (1 + x)), 8);
      expect(profileMass(x, 0.5)).toBeCloseTo(2 * (Math.asinh(Math.sqrt(x)) - (Math.sqrt(x) * (3 + 4 * x)) / (3 * (1 + x) ** 1.5)), 8);
    }
  });
  it('M(r_v) = M_v and the mean density inside r_v is Δ_c ρ_crit', () => {
    const h = { Mv: 1.2e15, c: 9.4, alpha: 1, deltaC: 102, H0: 70 };
    const { rv, rs } = haloRadii(h);
    expect(haloMass(rv, h) / h.Mv).toBeCloseTo(1, 10);
    expect(h.Mv / ((4 / 3) * Math.PI * rv ** 3) / criticalDensity(70)).toBeCloseTo(102, 6);
    expect(rv / rs).toBeCloseTo(9.4, 10);
    expect(criticalDensity(70)).toBeCloseTo(136.0, 0); // M☉/kpc³ for h = 0.7 (2.775 × 10¹¹ h² M☉/Mpc³)
  });
});

describe('Coma cluster: Łokas & Mamon’s model recomputed against their printed numbers', () => {
  const m = coma(0);
  it('Table 1 transcription', () => {
    expect(COMA.dark.fits.map((f) => [f.alpha, f.Mv, f.beta, f.c, f.chi2])).toEqual([[0, 1.2, -0.13, 19, 6.1], [0.5, 1.2, -0.14, 14, 6.2], [1, 1.2, -0.16, 9.4, 6.4], [1.5, 1.2, -0.21, 4.9, 6.9]]);
    expect(COMA.dark.Mv).toMatchObject({ value: 1.2, sigma: 0.4, interval: '1σ (stated)' });
  });
  it('dark virial radius 2.7 Mpc (92′; recomputed 93′) at D = 101.3 Mpc', () => {
    expect(m.rv / 1000).toBeCloseTo(COMA.published.rvDarkMpc, 1);
    expect(Math.abs(m.rv / m.kpcPerArcmin - COMA.published.rvDarkArcmin)).toBeLessThan(1.5);
  });
  it('“total mass is 1.4 × 10¹⁵ M⊙ … galaxies 2 %, gas 13 %, dark matter 85 %” at r_v', () => {
    const t = m.total(m.rv);
    expect(t / 1e15).toBeCloseTo(1.4, 1);
    expect(100 * m.stars(m.rv) / t).toBeCloseTo(COMA.published.fractions.galaxies, 0);
    expect(100 * m.gas(m.rv) / t).toBeCloseTo(COMA.published.fractions.gas, 0);
    expect(100 * m.dark(m.rv) / t).toBeCloseTo(COMA.published.fractions.dark, 0);
    // “the galaxies thus represent less than one-seventh of the baryonic mass”
    expect(m.stars(m.rv) / m.baryons(m.rv)).toBeLessThan(1 / 7);
  });
  it('total-mass virial radius 2.9 Mpc; M/L_B ≈ 351 there (recomputed within 4 %); 1.6 ± 0.5 × 10¹⁵ inside 3.6 Mpc', () => {
    expect(comaTotalVirialRadius(m) / 1000).toBeCloseTo(COMA.published.rvTotalMpc, 1);
    const ml = m.total(2900) / m.light(2900);
    expect(Math.abs(ml / COMA.published.MtoL.value - 1)).toBeLessThan(0.04);
    expect(Math.abs(m.total(3600) - COMA.published.M36.value)).toBeLessThan(0.1e15);
  });
  it('the four Table 1 fits give the same mass at r_v and nearly the same dispersion beyond 100 kpc', () => {
    const Rs = [300, 1000, 2000];
    const ref = comaDispersion(0, Rs).total;
    for (const a of [0.5, 1, 1.5]) {
      const mm = coma(a);
      expect(mm.total(mm.rv) / m.total(m.rv)).toBeCloseTo(1, 5); // log-table interpolation
      comaDispersion(a, Rs).total.forEach((s, i) => expect(Math.abs(s / ref[i] - 1)).toBeLessThan(0.03));
    }
    expect(comaFit(1).c).toBe(9.4);
  });
  it('Jeans dispersions: ≈ 800–1050 km/s with dark matter, under 45 % of that from stars and gas alone', () => {
    const Rs = [100, 300, 1000, 2000];
    const d = comaDispersion(0, Rs);
    d.total.forEach((s) => { expect(s).toBeGreaterThan(780); expect(s).toBeLessThan(1100); });
    d.baryons.forEach((s, i) => expect(s / d.total[i]).toBeLessThan(0.45));
    expect(d.beta).toBe(-0.13);
  });
});

describe('spherical Jeans equation', () => {
  it('singular isothermal sphere (ν ∝ r⁻², M = 2σ²r/G, β = 0) returns σ_los = σ', () => {
    const sig = 800;
    const s = jeansSigmaLos([10, 100, 1000], (r) => (2 * sig * sig * r) / G_KPC, (r) => r ** -2, 0);
    for (const x of s) expect(Math.abs(x / sig - 1)).toBeLessThan(0.005);
  });
  it('dispersion scales as √M: four times the mass doubles σ_los, for any constant β', () => {
    const M = (r: number) => 1e14 * r / (r + 300), nu = (r: number) => 1 / ((r / 200) * (1 + r / 200) ** 2);
    for (const beta of [-0.3, 0, 0.4]) {
      const a = jeansSigmaLos([500], M, nu, beta)[0], b = jeansSigmaLos([500], (r) => 4 * M(r), nu, beta)[0];
      expect(b / a).toBeCloseTo(2, 6);
    }
  });
  it('radial orbits raise the central dispersion and lower the outer one relative to isotropy (projection weights)', () => {
    const M = (r: number) => 1e15 * (Math.log(1 + r / 300) - r / (r + 300)), nu = (r: number) => 1 / ((r / 200) * (1 + r / 200) ** 2);
    const iso = jeansSigmaLos([30, 2000], M, nu, 0), rad = jeansSigmaLos([30, 2000], M, nu, 0.5);
    expect(rad[0]).toBeGreaterThan(iso[0]);
    expect(rad[1]).toBeLessThan(iso[1]);
  });
});

describe('cosmic census: BBN and Planck', () => {
  it('Cooke et al. transcription: D/H, η₁₀ and 100 Ω_b h² (eqs. 10–12, 14)', () => {
    expect(BBN.dh).toMatchObject({ value: 2.527, sigma: 0.03 });
    expect(BBN.eta10).toMatchObject({ value: 5.931, sigma: 0.051 });
    expect(BBN.ombh2).toMatchObject({ value: 2.166, measurement: 0.015, theory: 0.011 });
    expect(BBN.ombh2Empirical).toMatchObject({ value: 2.235, measurement: 0.016, theory: 0.033 });
    // eq. 12 follows from eq. 11 with η₁₀ = 273.78 Ω_b h² (Steigman 2006)
    expect(100 * BBN.eta10.value / 273.78).toBeCloseTo(BBN.ombh2.value, 3);
  });
  it('Planck: Ω_c/Ω_b = 5.32 and Ω_b/Ω_m = 15.7 %; BBN baryons are 15.2 % of Planck’s matter', () => {
    const c = cosmicBudget();
    expect(c.darkToBaryon).toBeCloseTo(5.32, 2);
    expect(c.baryonFractionPlanck).toBeCloseTo(0.1574, 4);
    expect(c.baryonFractionBbn).toBeCloseTo(0.1521, 4);
    expect(c.bbn.sigma).toBeCloseTo(Math.hypot(0.015, 0.011) / 100, 8);
    // Coma’s baryon fraction inside r_v is close to the cosmic value (the argument of their §6)
    const m = coma(0);
    expect(Math.abs(m.baryons(m.rv) / m.total(m.rv) - c.baryonFractionPlanck)).toBeLessThan(0.02);
  });
  it('Cooke et al.’s 2σ is against Planck 2015 (2.226 ± 0.023); against Planck 2018 the same gap is > 3σ', () => {
    const vs2015 = (2.226 - 2.166) / Math.hypot(0.023, Math.hypot(0.015, 0.011));
    expect(vs2015).toBeGreaterThan(1.9);
    expect(vs2015).toBeLessThan(2.3);
    const c = cosmicBudget();
    expect((c.planck.ombh2.value - c.bbn.value) / Math.hypot(c.planck.ombh2.sigma!, c.bbn.sigma)).toBeGreaterThan(3);
  });
});

describe('Source index, module registry and relationships', () => {
  it('every source of the dark-matter dataset exists with a DOI, an arXiv link, a verified bio and the dataset id', () => {
    for (const id of ['clowe-2006', 'lokas-mamon-2003', 'cooke-2018']) {
      const s = getSource(id)!;
      expect(s, id).toBeTruthy();
      expect(s.doi).toBeTruthy();
      expect(s.url).toMatch(/^https:\/\/arxiv\.org\/abs\//);
      expect(s.authorBio).toMatch(/^As listed on the article/);
      expect(s.datasets).toContain('dark-matter');
    }
    expect(getSource(BULLET.source)).toBeTruthy();
    expect(getSource(COMA.source)).toBeTruthy();
    expect(getSource(BBN.source)).toBeTruthy();
  });
  it('the Cosmological module lists the dark-matter solvers and their validity limits', () => {
    const mod = PHYSICS_MODULES.find((x) => x.id === 'cosmological')!;
    expect(mod.version).toBe('1.3.0');
    expect(mod.solvers.some((s) => s.includes('Gate 7.4'))).toBe(true);
    expect(mod.validity.some((s) => s.startsWith('Dark matter: Newtonian gravity throughout'))).toBe(true);
  });
  it('context:dark-matter routes to the view and links lensing, the CMB, the Milky Way and expansion (both directions)', () => {
    expect(getEntity('context:dark-matter')?.route).toBe('#/cosmic/darkmatter');
    expect(relationshipsFrom('context:dark-matter').map((r) => r.to)).toEqual(expect.arrayContaining(['context:gravitational-lensing', 'context:cmb', 'galaxy:milky-way', 'context:cosmic-expansion']));
    for (const to of ['context:gravitational-lensing', 'context:cmb', 'galaxy:milky-way']) expect(relationshipsTo(to).map((r) => r.from)).toContain('context:dark-matter');
    for (const r of relationshipsFrom('context:dark-matter')) expect(getSource(r.source), r.source).toBeTruthy();
  });
});
